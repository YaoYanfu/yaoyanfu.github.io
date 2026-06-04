# Yves' Notebook

我的个人知识站点，基于 [Docusaurus](https://docusaurus.io/) 构建。包含博客、笔记本、项目展示和留言板，右下角有 Live2D 看板娘。

## 技术栈

- **框架**: Docusaurus 3.10 + React 19
- **构建**: Rspack（`@docusaurus/faster`）
- **看板娘**: oh-my-live2d（CDN 引入，零 npm 依赖）

## 本地开发

```bash
npm install
npm start
```

浏览器访问 `http://localhost:3000`，改动实时热更新。

## 构建

```bash
npm run build
```

产物输出到 `build/` 目录，可直接部署到 Vercel、GitHub Pages 等静态托管平台。

## 项目结构

```
my-notebook/
├── docusaurus.config.js   站点配置（导航、主题、插件）
├── sidebars.js            文档侧边栏
├── docs/                  笔记本（Markdown/MDX）
├── blog/                  博客文章
├── src/
│   ├── pages/             页面组件（首页、Project、Dashboard）
│   ├── components/        可复用组件
│   ├── css/custom.css     全局样式
│   └── data/projects.js   项目数据
├── static/                静态资源
│   └── oml2d-init.js      Live2D 看板娘初始化
└── plugins/
    └── live2d-plugin/     看板娘注入插件
```
