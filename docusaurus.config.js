// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Yves Yao',
  tagline: 'Writing code, exploring AI, documenting life.',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: 'https://yvesyao.com',
  baseUrl: '/MyWebSite/',

  organizationName: 'YaoYanfu',
  projectName: 'MyWebSite',

  onBrokenLinks: 'throw',

  plugins: [
    './plugins/live2d-plugin',
    [
      '@docusaurus/plugin-ideal-image',
      { quality: 80, max: 1440, steps: 3, disableInDev: true },
    ],
    [
      '@easyops-cn/docusaurus-search-local',
      { indexDocs: false, indexBlog: true, indexPages: true, language: ['en', 'zh'], hashed: true },
    ],
  ],

  headTags: [
    { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
    { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' } },
    { tagName: 'link', attributes: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&family=Fraunces:opsz,wght,SOFT@9..144,400..700,0..100&family=Noto+Sans+SC:wght@400;500;600;700&display=swap' } },
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: {
          showReadingTime: true,
          blogSidebarCount: 10,
          blogSidebarTitle: 'Recent Posts',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
      disableSwitch: false,
    },
    navbar: {
      title: 'Yves Yao',
      items: [
        {to: '/', label: 'Home', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/project', label: 'Project', position: 'left'},
        {to: '/dashboard', label: 'Dashboard', position: 'left'},
        { type: 'custom-languageToggle', position: 'right' },
      ],
    },
    footer: {
      links: [
        {
          title: 'Nav',
          items: [
            { label: 'Blog', to: '/blog' },
            { label: 'Project', to: '/project' },
            { label: 'Dashboard', to: '/dashboard' },
          ],
        },
        {
          title: 'About',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/YaoYanfu',
            },
          ],
        },
      ],
      copyright: 'Copyright (c) Yves Yao',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
