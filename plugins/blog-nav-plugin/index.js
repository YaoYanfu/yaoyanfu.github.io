/**
 * 博客侧边栏导航插件
 *
 * 在 allContentLoaded 阶段读取 @docusaurus/plugin-content-blog 已经产出的文章元数据，
 * 按 front matter 的 section / column 归类，生成侧边栏导航数据交给前端
 * （src/theme/BlogSidebar）。标题、日期与 permalink 全部复用博客插件的解析结果，
 * 因此不需要手写文章链接，也不会重复解析 Markdown。
 *
 * 归类规则：
 * - section: essay（随笔，缺省值）/ article（文章）/ column（专栏）
 * - section 为 column 时，必须用 column: <id> 指向 src/data/blogColumns.js 中登记的专栏
 * - 未知 section、专栏文章缺失 column、引用未登记的专栏都会抛出明确的构建错误
 *
 * 可见性沿用博客插件的行为：草稿在构建期已被丢弃；unlisted 文章仍会进入导航数据并带上
 * unlisted 标记，由前端按「当前是否正在阅读该文章」过滤，与框架侧边栏规则一致。
 */

import blogColumns from '../../src/data/blogColumns.js';

const PLUGIN_NAME = 'blog-nav-plugin';
const BLOG_PLUGIN_NAME = 'docusaurus-plugin-content-blog';
const COLUMNS_FILE = 'src/data/blogColumns.js';

/** 受支持的板块；essay / article 会各自渲染成一个侧边栏板块。 */
const SECTIONS = ['essay', 'article', 'column'];
const DEFAULT_SECTION = 'essay';
const COLUMN_SECTION = 'column';
const COLUMN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SECTION_HINT = 'essay（随笔）、article（文章）、column（专栏）';
const COLUMN_EXAMPLE = [
  '  在 src/data/blogColumns.js 中登记专栏后，在文章 front matter 里写：',
  '    section: column',
  '    column: <专栏 id>',
].join('\n');

function relativeSource(source) {
  if (typeof source !== 'string') {
    return '(未知文件)';
  }
  return source.startsWith('@site/') ? source.slice('@site/'.length) : source;
}

function buildSectionError(source, value) {
  return new Error(
    [
      `博客 front matter 校验失败：${source} 的 section 取值不可用。`,
      `  实际取值：${JSON.stringify(value)}`,
      `  允许取值：${SECTION_HINT}`,
      `  省略 section 时默认按随笔（${DEFAULT_SECTION}）处理。`,
    ].join('\n'),
  );
}

function buildMissingColumnError(source) {
  return new Error(
    [
      `博客 front matter 校验失败：${source} 的 section 是 column，但没有填写 column。`,
      COLUMN_EXAMPLE,
    ].join('\n'),
  );
}

function buildUnknownColumnError(source, columnId, columnsById) {
  const registered = [...columnsById.keys()];
  return new Error(
    [
      `博客 front matter 校验失败：${source} 引用了未登记的专栏 "${columnId}"。`,
      `  已登记的专栏：${registered.length ? registered.join('、') : '（无）'}`,
      `  专栏登记表：${COLUMNS_FILE}`,
    ].join('\n'),
  );
}

function buildStrayColumnError(source, section, columnId) {
  return new Error(
    [
      `博客 front matter 校验失败：${source} 的 section 是 ${section}，却同时写了 column: ${columnId}。`,
      '  一篇文章只能归入一个板块，只有专栏文章才需要写 column。',
      `  若这篇文章确实属于专栏，请把 section 改成 ${COLUMN_SECTION}；否则删掉 column。`,
    ].join('\n'),
  );
}

function buildColumnFieldError(index, field, lang, value) {
  return new Error(
    [
      `专栏登记失败：${COLUMNS_FILE} 第 ${index + 1} 项的 ${field}.${lang} 不可用（实际：${JSON.stringify(value)}）。`,
      `  name 与 description 都需要完整的中英文，例如：`,
      `    ${field}: {zh: '中文', en: 'English'}`,
    ].join('\n'),
  );
}

/**
 * 校验并归一化专栏登记表，返回带空 posts 数组的可变副本。
 * @param {unknown} columns
 */
function normalizeColumns(columns) {
  if (!Array.isArray(columns)) {
    throw new Error(
      `专栏登记失败：${COLUMNS_FILE} 必须默认导出一个专栏数组。`,
    );
  }

  const indexById = new Map();

  return columns.map((column, index) => {
    const at = `${COLUMNS_FILE} 第 ${index + 1} 项`;

    if (!column || typeof column !== 'object') {
      throw new Error(`专栏登记失败：${at} 不是对象。`);
    }

    const {id, name, description} = column;

    if (typeof id !== 'string' || !COLUMN_ID_PATTERN.test(id)) {
      throw new Error(
        [
          `专栏登记失败：${at} 的 id 不合法（实际：${JSON.stringify(id)}）。`,
          '  id 只允许小写字母、数字和中划线，且不能以中划线开头或结尾，例如 embodied-intelligence。',
        ].join('\n'),
      );
    }

    if (indexById.has(id)) {
      throw new Error(
        `专栏登记失败：${at} 的 id "${id}" 与第 ${indexById.get(id) + 1} 项重复，专栏 id 必须唯一。`,
      );
    }
    indexById.set(id, index);

    const normalizedFields = {};
    for (const field of ['name', 'description']) {
      const value = column[field];
      if (!value || typeof value !== 'object') {
        throw buildColumnFieldError(index, field, 'zh', value);
      }
      normalizedFields[field] = {};
      for (const lang of ['zh', 'en']) {
        const text = value[lang];
        if (typeof text !== 'string' || !text.trim()) {
          throw buildColumnFieldError(index, field, lang, text);
        }
        normalizedFields[field][lang] = text.trim();
      }
    }

    return {
      id,
      name: normalizedFields.name,
      description: normalizedFields.description,
      posts: [],
    };
  });
}

/** 从 allContent 中收集所有博客插件实例产出的文章。 */
function collectBlogPosts(allContent) {
  if (!allContent || typeof allContent !== 'object') {
    return [];
  }
  return Object.entries(allContent)
    .filter(
      ([pluginName]) =>
        pluginName === BLOG_PLUGIN_NAME ||
        pluginName.startsWith(`${BLOG_PLUGIN_NAME}-`),
    )
    .flatMap(([, contentById]) => Object.values(contentById ?? {}))
    .flatMap((content) => (Array.isArray(content?.blogPosts) ? content.blogPosts : []));
}

function toTimestamp(date) {
  const value = date instanceof Date ? date.getTime() : Date.parse(date);
  return Number.isNaN(value) ? 0 : value;
}

/** 把一篇博客文章解析成导航条目，顺带完成 front matter 校验。 */
function toNavPost(post, columnsById) {
  const metadata = post?.metadata ?? {};
  const frontMatter = metadata.frontMatter ?? {};
  const source = relativeSource(metadata.source);

  const rawSection = frontMatter.section;
  let section = DEFAULT_SECTION;
  if (rawSection !== undefined && rawSection !== null && rawSection !== '') {
    if (typeof rawSection !== 'string' || !SECTIONS.includes(rawSection.trim())) {
      throw buildSectionError(source, rawSection);
    }
    section = rawSection.trim();
  }

  const rawColumn = frontMatter.column;
  const columnId =
    rawColumn === undefined || rawColumn === null ? '' : String(rawColumn).trim();

  if (section === COLUMN_SECTION) {
    if (!columnId) {
      throw buildMissingColumnError(source);
    }
    if (!columnsById.has(columnId)) {
      throw buildUnknownColumnError(source, columnId, columnsById);
    }
  } else if (columnId) {
    throw buildStrayColumnError(source, section, columnId);
  }

  return {
    section,
    columnId: section === COLUMN_SECTION ? columnId : null,
    timestamp: toTimestamp(metadata.date),
    item: {
      title: metadata.title ?? source,
      permalink: metadata.permalink,
      unlisted: Boolean(metadata.unlisted),
      date: metadata.date,
      description: metadata.description,
    },
  };
}

/**
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function blogNavPlugin() {
  return {
    name: PLUGIN_NAME,

    async allContentLoaded({allContent, actions: {setGlobalData}}) {
      const columns = normalizeColumns(blogColumns);
      const columnsById = new Map(columns.map((column) => [column.id, column]));

      const navPosts = collectBlogPosts(allContent)
        .map((post) => toNavPost(post, columnsById))
        .sort((a, b) => {
          const diff = b.timestamp - a.timestamp;
          return diff !== 0
            ? diff
            : String(a.item.permalink).localeCompare(String(b.item.permalink));
        });

      const sections = {essay: [], article: []};
      navPosts.forEach((navPost) => {
        if (navPost.section === COLUMN_SECTION) {
          columnsById.get(navPost.columnId).posts.push(navPost.item);
        } else {
          sections[navPost.section].push(navPost.item);
        }
      });

      setGlobalData({
        sections,
        latestPost: navPosts.find((post) => !post.item.unlisted)?.item ?? null,
        columns: columns.map(({id, name, description, posts}) => ({
          id,
          name,
          description,
          posts,
        })),
      });
    },
  };
}
