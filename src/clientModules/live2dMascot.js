/**
 * Live2D 看板娘 — Docusaurus 客户端模块
 * 通过 CDN 加载 oh-my-live2d，自动在右下角显示动态角色
 *
 * 依赖：无 npm 依赖，CDN 自包含（内置 Cubism SDK）
 */

const CDN_URL = 'https://cdn.jsdelivr.net/npm/oh-my-live2d@0.19.3/dist/index.min.js';

// 可选模型列表（你可以随时替换喜欢的模型）
const MODEL_URLS = {
  // 仙狐さん (Senko-san) — 默认
  senko:
    'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json',
  // 备选：HK416（战术人形）
  hk416:
    'https://model.hacxy.cn/HK416-1-normal/model.json',
};

function initLive2D() {
  // 防止热更新或 SPA 路由切换时重复初始化
  if (window.__OML2D_INITIALIZED__) return;
  window.__OML2D_INITIALIZED__ = true;

  const script = document.createElement('script');
  script.src = CDN_URL;
  script.async = true;

  script.onload = () => {
    const OML2D = window.OML2D;
    if (!OML2D) {
      console.warn('[Live2D] OML2D 全局对象未找到');
      return;
    }

    OML2D.loadOml2d({
      models: [
        {
          path: MODEL_URLS.senko,
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
  };

  script.onerror = () => {
    console.warn('[Live2D] CDN 加载失败，请检查网络');
    window.__OML2D_INITIALIZED__ = false; // 允许后续重试
  };

  document.head.appendChild(script);
}

// 仅在浏览器端执行
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLive2D);
  } else {
    initLive2D();
  }
}
