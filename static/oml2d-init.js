/**
 * Live2D 看板娘初始化脚本
 * 此文件由 docusaurus.config.js 的 scripts 配置注入
 * 仅在 oh-my-live2d CDN 脚本加载完成后执行
 */
(function () {
  'use strict';

  // 防止热更新或 SPA 路由切换时重复初始化
  if (window.__OML2D_INITIALIZED__) return;
  window.__OML2D_INITIALIZED__ = true;

  // 轮询等待 OML2D 全局对象就绪（CDN 脚本可能还在加载中）
  function waitForOML2D(retries) {
    retries = retries || 0;

    if (window.OML2D) {
      window.OML2D.loadOml2d({
        models: [
          {
            // 仙狐さん (Senko) — 免费 Live2D 模型
            path: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json',
            scale: 0.09,
            position: [-20, 10],
          },
        ],
        dockedPosition: 'right',
        mobileDisplay: true,
        menus: {
          disable: false,
        },
      });
      console.log('[Live2D] 看板娘已就绪 ✅');
      return;
    }

    if (retries < 30) {
      setTimeout(function () {
        waitForOML2D(retries + 1);
      }, 500);
    } else {
      console.warn('[Live2D] 超时：OML2D 全局对象未就绪');
    }
  }

  waitForOML2D();
})();
