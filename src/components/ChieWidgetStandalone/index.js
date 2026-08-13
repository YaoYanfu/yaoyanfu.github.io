import {useEffect, useRef} from 'react';

import {useLanguage} from '@site/src/context/LanguageContext';

/**
 * CHIE Standalone Widget — React 包装器
 *
 * 动态加载 static/js/chie-widget.js（IIFE，无框架依赖），
 * 在首页挂载时初始化看板娘，离开首页时销毁。
 * 语言切换时自动重建（widget 的对白文案烘焙在 bundle 内）。
 */
const SCRIPT_ID = 'chie-widget-script';

function loadChieScript() {
  return new Promise((resolve, reject) => {
    if (window.ChieWidget) {
      resolve();
      return;
    }
    if (document.getElementById(SCRIPT_ID)) {
      // 脚本已注入但可能未加载完 —— 轮询等待全局对象
      const poll = () => {
        if (window.ChieWidget) resolve();
        else setTimeout(poll, 50);
      };
      poll();
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = '/js/chie-widget.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load /js/chie-widget.js'));
    document.head.appendChild(script);
  });
}

export default function ChieWidgetStandalone({position = 'bottom-right'}) {
  const {lang} = useLanguage();
  const initializedLangRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    loadChieScript()
      .then(() => {
        if (cancelled) return;
        if (initializedLangRef.current !== lang) {
          window.ChieWidget?.destroy?.();
          window.ChieWidget.init({
            assetsPath: '/img/chie/',
            lang,
            position,
          });
          initializedLangRef.current = lang;
        }
      })
      .catch((err) => {
        console.warn('[CHIE]', err.message);
      });

    return () => {
      cancelled = true;
      if (initializedLangRef.current !== null) {
        window.ChieWidget?.destroy?.();
        initializedLangRef.current = null;
      }
    };
  }, [lang, position]);

  return null;
}
