# Yves' Notebook

我的个人知识站点，基于 [Docusaurus](https://docusaurus.io/) 构建：首页个人档案、项目展示、博客，
以及一个纯前端实现的 CHIE 看板娘。站点为全静态产物，部署在 GitHub Pages。

- 在线地址：<https://yaoyanfu.github.io/>

## 技术栈

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 站点框架 | Docusaurus 3.10.1 | 路由、SSG、博客、主题、SEO，启用 `future.v4` |
| UI | React 19 | 所有自定义页面与组件 |
| 构建 | Rspack（`@docusaurus/faster`） | 加速打包 |
| 内容 | Docusaurus Blog + MDX | `blog/` 下的 Markdown 自动生成列表、归档、标签、作者页与 RSS/Atom |
| 搜索 | `@easyops-cn/docusaurus-search-local` | 构建期索引博客与页面（不含文档） |
| 代码高亮 | prism-react-renderer | GitHub / Dracula 明暗双主题 |
| 字体 | Google Fonts | Inter（正文）、Fraunces（标题）、Noto Sans SC（中文） |
| 看板娘 | 自研 React 组件 | CSS 精灵图分层 + JavaScript 弹簧动画，不依赖第三方 CDN |
| 留言板（可选） | Supabase REST | 浏览器直连 PostgREST，路由为 `/dashboard` |

## 本地开发

```bash
npm install
npm start
```

浏览器访问 <http://localhost:3000>，改动实时热更新。需要 Node `>=20`。

### 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm start` | 启动开发服务器 |
| `npm run build` | 生成生产静态站点到 `build/` |
| `npm run serve` | 本地预览已生成的生产构建 |
| `npm run clear` | 清理 Docusaurus 缓存 |
| `npm run swizzle` | 复制/包装 Docusaurus 主题组件 |
| `npm run write-translations` | 导出 Docusaurus 原生文案模板 |
| `npm run write-heading-ids` | 为 Markdown 标题补全锚点 id |

看板娘坐姿状态机带有单元测试，可直接用 Node 内置 test runner 运行（需 Node 20+）：

```bash
node --test --test-isolation=none src/components/ChieWidgetStandalone/seated.test.mjs
```

共 3 个用例，覆盖坐姿过渡的收尾帧、点击互动不打断过渡、以及卸载时取消定时器与动画帧。

## 页面路由

| 路由 | 内容 |
| --- | --- |
| `/` | 首页：About、Experience、Projects、Awards、Recent 与状态面板，右下角挂载 CHIE |
| `/blog` | 博客列表，含归档、标签、作者页与 RSS/Atom |
| `/project` | 完整项目列表，数据源为 `src/data/projects.js` |
| `/dashboard` | Supabase 留言板。路由仍会构建，但导航入口已隐藏 |
| `/chie-preview` | CHIE 内部预览原型页，不在导航中，带 `noindex,nofollow` |
| `/search` | 本地搜索，由插件提供 |

## 双语与主题

站点是单 locale（`en`）构建，界面中英文切换由 `src/context/LanguageContext.js` 在浏览器中完成：
状态保存在 `localStorage.site_language`，导航栏右侧 `EN / 中文` 按钮由
`src/theme/NavbarItem/ComponentTypes.js` 注册的 `custom-languageToggle` 渲染。
因此切换语言只影响显式使用 `t()` 的自定义 UI，不会改变 URL、博客正文或 `<html lang>`。

明暗主题由 Docusaurus color mode 管理，默认亮色、不跟随系统；`data-theme` 同时被看板娘读取以同步配色。
全站设计令牌定义在 `src/css/custom.css`（`--site-*`、`--accent-*` 等）。

## CHIE 看板娘

默认在首页右下角展示。由 `src/components/ChieWidgetStandalone/` 提供，是一个普通 React 组件，
通过 portal 挂载到 `document.body`，素材为 `static/img/chie/` 下的透明 WebP 精灵图。

- **动画**：`requestAnimationFrame` 循环驱动身体摇摆，鼠标横向移动改变目标角度，滚动施加瞬时外力；
  静止时叠加约 6.2 秒周期的呼吸摆动。
- **表情**：`shy` / `alert` / `annoyed` 三层叠图按命中区域切换，3.12 秒后自动回到 `idle`；眨眼按
  2.6–6.4 秒随机间隔调度，首次表情变化前会先 decode 头部图片，避免闪白。
- **对白**：进入首页 0.8 秒后问候，对白显示 5 秒。
- **坐姿状态机**（`seated.js`）：`standing` →（首次 8 秒 / 之后 18 秒）→ `chair-in` →（900 ms）→
  `seated` →（15 秒）→ `chair-out` →（900 ms）→ `standing`。过渡以缓动进度驱动 CSS 变量，
  头部与站姿/坐姿身体共用同一进度，避免换姿时头部闪动；点击互动会重置当前姿态的计时，但不会打断过渡。
- **降级**：`prefers-reduced-motion: reduce` 下不启动物理循环与坐姿切换；视口宽度 ≤ 1023 px 时整体隐藏。
- **命中区域**：头、脸、全身三个按钮，带 `aria-label`，点击触发对应表情与台词。

修改素材文件名或命中区域映射：`src/data/chieMascot.js`。
修改物理参数、台词与时间：`src/components/ChieWidgetStandalone/index.js` 与 `seated.js`
（对白字典是组件内的 `COPY`；`data/chieMascot.js` 里的 `CHIE_COPY` 已不被首页使用）。

### 看板娘模式

可在启动或构建前通过环境变量 `MASCOT_MODE` 切换：

| 值 | 效果 |
| --- | --- |
| `chie` | 默认。首页渲染自研 CHIE 组件 |
| `live2d` | 启用 `plugins/live2d-plugin`，从 jsDelivr 加载 oh-my-live2d（0.19.3）+ Senko 模型；首页不加载 CHIE |
| `off` | 不加载任何看板娘 |

```powershell
$env:MASCOT_MODE = 'live2d'
npm run start
```

这是构建期选择，不是发布后可动态修改的设置，切换后必须重新构建。未知值会静默回退到 `chie`。

> `/chie-preview` 使用的是另一套独立的 React 原型（`src/components/ChieMascot/`），带情绪调试按钮，
> 与首页生产实现互不影响。`src/components/HomeChieMascot/` 为已不再引用的历史实现。

## 内容维护

**首页文案与经历**：`src/data/translations.js`。经历条目按 `home.experience.{i}.*` 的数字索引连续读取，
遇到缺失的 key 即停止渲染，因此新增经历必须保证索引连续，且 `en`、`zh` 两份字典都要补齐。

**项目列表**：完整列表改 `src/data/projects.js`（字段 `id / title / description / tags / github / demo / status`，
`status` 支持 `Active`、`WIP`、`Archived`）；首页精选的三个项目另在 `translations.js` 的
`home.projects.0..2.*` 中维护，两处需同步修改。

**博客**：在 `blog/` 新增 Markdown/MDX，front matter 中的 `authors` 与 `tags` 需已在
`blog/authors.yml`、`blog/tags.yml` 中声明（未声明只会告警，不影响构建）。图片放在
`static/img/blog/` 并以 `/img/blog/...` 引用。

**新增页面**：在 `src/pages/<name>.js` 创建即可映射到 `/<name>`；使用 `@theme/Layout` 获得统一导航与页脚，
局部样式放在相邻的 `*.module.css`，全局令牌才写入 `src/css/custom.css`。

## 构建与部署

```bash
npm run build
```

产物输出到 `build/`。仓库通过 `.github/workflows/deploy.yml` 自动发布：push 到 `master`
（或手动 `workflow_dispatch`）后，GitHub Actions 用 Node 20 执行 `npm ci` + `npm run build`，
再经 Pages Artifact 部署到 GitHub Pages。构建开启了 `onBrokenLinks: 'throw'`，内部断链会导致构建失败。

## 项目结构

```
mypage/
├── docusaurus.config.js              站点装配：导航、主题、插件、MASCOT_MODE
├── ARCHITECTURE.md                   架构说明与已知技术债（本地分析文档，已被 .gitignore 忽略）
├── blog/                             博客文章、authors.yml、tags.yml
├── plugins/live2d-plugin/            构建期注入 Live2D CDN 加载脚本
├── src/
│   ├── components/
│   │   ├── ChieWidgetStandalone/     首页 CHIE 看板娘（含 seated.js 坐姿状态机与单测）
│   │   ├── ChieMascot/               /chie-preview 使用的原型实现
│   │   ├── HomeChieMascot/           历史实现，当前未被引用
│   │   └── LanguageToggle/           导航栏 EN / 中文切换
│   ├── context/LanguageContext.js    语言状态与 t() 翻译函数
│   ├── css/custom.css                全局设计令牌与主题覆盖
│   ├── data/                         translations / projects / chieMascot 数据
│   ├── lib/supabase.js               留言板 REST 客户端
│   ├── pages/                        index、project、dashboard、chie-preview
│   └── theme/                        Root 与 NavbarItem 扩展点
└── static/
    └── img/                          头像、经历/获奖 Logo、博客配图、chie/ 精灵图
```
