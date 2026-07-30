# Yves' Notebook

我的个人知识站点，基于 [Docusaurus](https://docusaurus.io/) 构建。包含博客、笔记本和项目展示，主页右下角有 CHIE CSS 分层动画看板娘。

## 技术栈

- **框架**: Docusaurus 3.10 + React 19
- **构建**: Rspack（`@docusaurus/faster`）
- **看板娘**: React + CSS 分层动画 + 透明 WebP
- **回退方案**: 保留 oh-my-live2d，可通过环境变量手动切换

## 本地开发

```bash
npm install
npm start
```

浏览器访问 `http://localhost:3000`，改动实时热更新。

## 看板娘模式

默认使用新的 CHIE 模型。可在启动或构建前通过 `MASCOT_MODE` 切换：

| 值 | 效果 |
| --- | --- |
| `chie` | 新 CHIE 模型（默认） |
| `live2d` | 原 oh-my-live2d 模型 |
| `off` | 不加载任何看板娘 |

PowerShell 示例：

```powershell
$env:MASCOT_MODE = 'live2d'
npm run start
```

CHIE 的中英文对白集中在 `src/data/chieMascot.js`，可直接修改。内部预览页位于 `/chie-preview`，不出现在导航中，并已设置为不被搜索引擎收录。

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
│   ├── components/        可复用组件与 CHIE 看板娘
│   ├── css/custom.css     全局样式
│   └── data/              项目数据、翻译与 CHIE 对白
├── static/
│   └── img/chie/          CHIE 透明 WebP 素材
└── plugins/
    └── live2d-plugin/     看板娘注入插件
```
