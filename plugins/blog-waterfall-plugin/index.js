/**
 * blog-waterfall-corpus 插件
 *
 * 从 blog 源文件(*.md / *.mdx)中提取正文纯文本,通过 globalData 注入客户端,
 * 供 /blog Hero 的 Pretext 文字瀑布使用:
 *   const {posts} = usePluginData('blog-waterfall-corpus', 'default');
 *
 * 为什么需要它:
 * 博客列表页运行时拿到的 items[i].content 是 MDX 编译后的 JSX(不是 markdown
 * 原文),无法从中可靠还原「文章里面的具体文字」。正文只能在构建期从源文件提取。
 *
 * @returns {import('@docusaurus/types').Plugin}
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const FRONT_MATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const MAX_LINES_PER_POST = 400; // 单篇正文行数上限(防异常长文撑爆循环)

/** markdown → 纯文本(保留段落换行),只做「可读文字」级别的清洗 */
function extractPlainText(raw) {
  const body = raw
    .replace(FRONT_MATTER_RE, '')
    .replace(/<!--[\s\S]*?-->/g, '') // HTML 注释(含 <!-- truncate -->)
    .replace(/```[\s\S]*?```/g, '') // 围栏代码块
    .replace(/`([^`]*)`/g, '$1') // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 图片
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // 链接 → 保留文字
    .replace(/<(?!br\s*\/?>)[^>]+>/g, '') // HTML 标签(保留 <br>)
    .replace(/<br\s*\/?>/gi, '\n');

  const lines = [];
  for (let line of body.split(/\r?\n/)) {
    line = line.trim();
    if (!line) {
      lines.push('');
      continue;
    }
    if (/^(import|export)\s/.test(line)) continue; // MDX 导入/导出语句
    if (/^[\s\-:|]+$/.test(line) && line.includes('-')) continue; // 表格分隔行 / 水平线
    line = line
      .replace(/^#{1,6}\s+/, '') // 标题
      .replace(/^\s*>\s?/, '') // 引用
      .replace(/^\s*[-*+]\s+/, '') // 无序列表
      .replace(/^\s*\d+[.)]\s+/, '') // 有序列表
      .replace(/\*\*([^*]+)\*\*/g, '$1') // 加粗
      .replace(/__([^_]+)__/g, '$1')
      .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1$2') // 斜体
      .replace(/~~([^~]+)~~/g, '$1') // 删除线
      .replace(/\|/g, ' ') // 表格竖线 → 空格
      .trim();
    lines.push(line || '');
  }

  // 折叠连续空行,去掉首尾空行
  const out = [];
  for (const line of lines) {
    if (!line && out[out.length - 1] === '') continue;
    out.push(line);
  }
  while (out.length && !out[out.length - 1]) out.pop();
  while (out.length && !out[0]) out.shift();
  // 不分段:段落间只留一个空格,连成连续文本,由 Pretext 按宽度逐行换行
  // —— 瀑布更密集、行更长,像一整股水流而不是一段段短文
  return out.slice(0, MAX_LINES_PER_POST).join(' ');
}

function extractTitle(raw) {
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return '';
  const m = fm[1].match(/^title:\s*(.+)$/m);
  return m ? m[1].replace(/^['"]|['"]$/g, '').trim() : '';
}

export default function blogWaterfallPlugin(context, options) {
  const siteDir = context.siteDir;
  const contentRelDir = (options?.path ?? 'blog').replace(/^\.?\/+/, '');
  const contentDir = path.resolve(siteDir, contentRelDir);

  return {
    name: 'blog-waterfall-corpus',

    async loadContent() {
      const posts = [];
      let names = [];
      try {
        const entries = await fs.readdir(contentDir, {withFileTypes: true});
        names = entries
          .filter((e) => e.isFile() && /\.mdx?$/i.test(e.name))
          .map((e) => e.name);
      } catch {
        return {posts}; // blog 目录缺失/不可读 → 空语料,客户端回退标题模式
      }

      for (const name of names) {
        try {
          const raw = await fs.readFile(path.join(contentDir, name), 'utf8');
          const text = extractPlainText(raw);
          if (!text.trim()) continue;
          posts.push({
            // 与 metadata.source 同构的别名路径,便于运行时按 source 匹配
            source: `@site/${path.posix.join(contentRelDir, name)}`,
            title: extractTitle(raw),
            text,
          });
        } catch {
          // 单个文件读取失败不影响其他文章
        }
      }
      return {posts};
    },

    contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
}
