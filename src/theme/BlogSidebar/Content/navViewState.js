/**
 * 博客侧边栏的纯计算部分
 *
 * 这里只做「给定导航数据 + 当前地址 + 用户显式做过的展开选择，算出每个板块该渲染什么」，
 * 不碰 React、不碰浏览器 API，因此可以在 Node 里直接覆盖各种状态组合做验证
 * （见项目根目录沙箱验证脚本与 README 的说明）。渲染在 ./index.js。
 */

/** 随笔、文章板块默认展示的篇数。 */
export const PREVIEW_COUNT = 5;

export const EMPTY_NAV_DATA = {sections: {essay: [], article: []}, columns: []};

export function normalizePath(pathname) {
  const stripped = String(pathname ?? '').replace(/\/+$/, '');
  return stripped === '' ? '/' : stripped;
}

export function isCurrentPost(post, currentPath) {
  return normalizePath(post?.permalink) === normalizePath(currentPath);
}

/** 与框架侧边栏一致：unlisted 文章只在正在阅读它时才出现。 */
export function visiblePosts(posts, currentPath) {
  return (posts ?? []).filter(
    (post) => !post.unlisted || isCurrentPost(post, currentPath),
  );
}

/** 当前文章在列表中的下标，且它落在预览篇数之外时返回该下标，否则返回 -1。 */
export function overflowIndex(posts, currentPath) {
  const index = posts.findIndex((post) => isCurrentPost(post, currentPath));
  return index >= PREVIEW_COUNT ? index : -1;
}

export function columnDisplayName(column, lang) {
  return (
    column?.name?.[lang] ?? column?.name?.en ?? column?.name?.zh ?? column?.id ?? ''
  );
}

function buildSection(posts, expanded, previewCount) {
  const overflowing = posts.length > previewCount;
  return {
    posts,
    expanded,
    overflowing,
    visible: overflowing && !expanded ? posts.slice(0, previewCount) : posts,
  };
}

/**
 * @param {object} params
 * @param {{sections?: object, columns?: Array}} params.navData 插件产出的导航数据
 * @param {string} params.pathname 当前地址
 * @param {object} params.overrides 用户显式做过的展开选择（其余部分按当前文章位置推导）
 * @param {object} [params.overrides.columnExpanded] 各专栏的展开状态
 * @returns 侧边栏的完整渲染状态
 */
export function buildNavView({navData, pathname, overrides = {}, previewCount = PREVIEW_COUNT}) {
  const data = navData ?? EMPTY_NAV_DATA;
  const currentPath = normalizePath(pathname);

  const essayPosts = visiblePosts(data.sections?.essay, currentPath);
  const articlePosts = visiblePosts(data.sections?.article, currentPath);
  const columns = (data.columns ?? []).map((column) => ({
    ...column,
    posts: visiblePosts(column.posts, currentPath),
  }));

  const currentColumnId =
    columns.find((column) => column.posts.some((post) => isCurrentPost(post, currentPath)))
      ?.id ?? null;

  // 默认值的作用：直接打开某篇文章时，让当前文章和它所在的专栏自动可见；
  // 用户一旦手动展开或收起，就以 overrides 为准（同一标签页内由 sessionStorage 保留）。
  const essayExpanded =
    overrides.essayExpanded ?? overflowIndex(essayPosts, currentPath) >= 0;
  const articleExpanded =
    overrides.articleExpanded ?? overflowIndex(articlePosts, currentPath) >= 0;
  const columnsExpanded = overrides.columnsExpanded ?? currentColumnId !== null;

  return {
    currentPath,
    currentColumnId,
    essay: buildSection(essayPosts, essayExpanded, previewCount),
    article: buildSection(articlePosts, articleExpanded, previewCount),
    columns: {
      expanded: columnsExpanded,
      empty: columns.length === 0,
      items: columns.map((column) => ({
        ...column,
        expanded:
          overrides.columnExpanded?.[column.id] ?? column.id === currentColumnId,
      })),
    },
  };
}
