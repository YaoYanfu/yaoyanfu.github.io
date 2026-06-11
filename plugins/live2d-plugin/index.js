/**
 * Live2D 看板娘 Docusaurus 插件
 *
 * 通过 injectHtmlTags 生命周期在 HTML head 中注入
 * oh-my-live2d CDN 脚本和初始化脚本
 *
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function live2dPlugin() {
  return {
    name: 'live2d-plugin',

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            attributes: {
              src: 'https://cdn.jsdelivr.net/npm/oh-my-live2d@0.19.3/dist/index.min.js',
              defer: true,
              integrity: 'sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb',
              crossorigin: 'anonymous',
            },
          },
          {
            tagName: 'script',
            attributes: {
              src: '/oml2d-init.js',
              defer: true,
            },
          },
        ],
      };
    },
  };
}
