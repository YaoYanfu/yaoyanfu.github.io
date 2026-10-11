/**
 * 博客专栏登记表（Blog Columns）
 *
 * 侧边栏「专栏」板块按本文件数组的登记顺序渲染。文章通过 front matter 引用这里
 * 登记的专栏，而不是直接写专栏名：
 *
 *   ---
 *   title: 我的文章
 *   section: column
 *   column: embodied-intelligence
 *   ---
 *
 * 字段说明：
 * - id          稳定标识，只允许小写字母、数字和中划线；文章靠它引用专栏，
 *               登记后不要随意改动
 * - name        {zh, en} 专栏名称，随界面语言切换
 * - description {zh, en} 专栏简介
 *
 * 已登记但还没有文章的专栏，展开后会显示「暂无文章」；引用未登记的专栏 id
 * 会在构建时直接报错（校验逻辑见 plugins/blog-nav-plugin/index.js）。
 */
const blogColumns = [
  // {
  //   id: 'embodied-intelligence',
  //   name: {zh: '具身智能', en: 'Embodied Intelligence'},
  //   description: {
  //     zh: '围绕具身智能与 AI 伙伴的持续记录。',
  //     en: 'Ongoing notes on embodied intelligence and AI companions.',
  //   },
  // },
];

export default blogColumns;
