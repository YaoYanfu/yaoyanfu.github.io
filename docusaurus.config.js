// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Yves\' Site',
  tagline: 'Welcome to my page!',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: 'https://yvesyao.com',
  baseUrl: '/',

  organizationName: 'facebook',
  projectName: 'docusaurus',

  onBrokenLinks: 'throw',

  plugins: [
    './plugins/live2d-plugin',
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
          toc: true,
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
      disableSwitch: true,
    },
    navbar: {
      items: [
        {to: '/', label: 'Home', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/project', label: 'Project', position: 'left'},
        {to: '/dashboard', label: 'Dashboard', position: 'left'},
        {
          href: 'https://github.com/YaoYanfu',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
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
