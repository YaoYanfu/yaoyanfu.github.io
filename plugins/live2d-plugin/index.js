/**
 * Live2D 看板娘 Docusaurus 插件
 *
 * 注入一段内联脚本:动态创建 oh-my-live2d 的 <script>,
 * 在 onload 回调里调用 loadOml2d() — 避免轮询等待全局对象。
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
            innerHTML: `
              (function () {
                if (window.__OML2D_INITIALIZED__) return;
                window.__OML2D_INITIALIZED__ = true;
                var s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/oh-my-live2d@0.19.3/dist/index.min.js';
                s.defer = true;
                s.onload = function () {
                  if (!window.OML2D) {
                    console.warn('[Live2D] OML2D global missing after load');
                    return;
                  }
                  window.OML2D.loadOml2d({
                    models: [{
                      path: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json',
                      scale: 0.09,
                      position: [-20, 10],
                    }],
                    dockedPosition: 'right',
                    mobileDisplay: true,
                    menus: { disable: false },
                  });
                };
                s.onerror = function () {
                  console.warn('[Live2D] failed to load oh-my-live2d CDN script');
                };
                document.head.appendChild(s);
              })();
            `,
          },
        ],
      };
    },
  };
}
