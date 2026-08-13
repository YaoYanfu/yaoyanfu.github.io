import {useEffect, useMemo, useRef, useState} from 'react';
import {
  prepareWithSegments,
  layoutNextLineRange,
  materializeLineRange,
} from '@chenglou/pretext';
import {usePluginData} from '@docusaurus/useGlobalData';
import {useLanguage} from '@site/src/context/LanguageContext';
import ChieWidgetStandalone from '@site/src/components/ChieWidgetStandalone';
import styles from './styles.module.css';

const COPY = {
  en: {title: 'Welcome to my blog', cta: 'Start Reading'},
  zh: {title: '欢迎来到我的博客', cta: '开始阅读'},
};

// canvas 测量字体必须与绘制字体、加载字体完全一致
const FONT = '19px "Inter", "Noto Sans SC", sans-serif';
const LINE_HEIGHT = 30; // 瀑布行距(正文连排后收紧,更密集)
const SIDE_GAP = 22; // 文字与 CHIE 轮廓的避让间距
const EDGE_PAD = 44; // 瀑布左右边距
const SCROLL_SPEED = 30; // 瀑布流速 px/s
const FADE_BAND = 70; // 瀑布顶部淡入/底部淡出的过渡带（px）
const MIN_COL = 60; // 走廊窄于该宽度时跳过该行
const MAX_ROWS = 2000; // 一轮语料排版行数安全上限
const PER_POST_MAX = 2400; // 单篇正文进入瀑布的字符上限
const TOTAL_MAX = 16000; // 语料总字符上限
const ALPHA_THRESHOLD = 24; // sprite 轮廓 alpha 判定阈值

// 左右两股水流的颜色（冷调冰蓝 / 暖调淡紫，拉出层次又不抢 CHIE 的戏）
const WATER_L = 'rgba(198, 218, 240, 0.92)';
const WATER_R = 'rgba(228, 212, 236, 0.88)';

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d).slice(0, 10);
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/**
 * /blog 全屏开场 Hero —— Pretext 文字瀑布：
 * - 语料 = 文章正文（构建期插件从 blog/*.md 提取、不分段连成连续文本，
 *   globalData 注入），每篇文章以「标题 · 日期」行开头，正文随后；
 *   由 Pretext 按走廊宽度逐行换行，行满而密，像一整股水流；
 * - 瀑布从天而降向下流动（匀速 + 取模循环，无接缝）；
 * - 左右两股独立水流（各自独立的排版游标与相位），奇偶行分属两股；
 * - 流经 CHIE 时按她的真实 sprite 轮廓逐行收窄走廊（Pretext 动态宽度
 *   排版:每行 maxWidth 随该行的轮廓边界变化），文字贴着身体绕流；
 * - 点击 CTA / 滚轮下滑 / 手指上滑 → 与列表 staggered 浮现同步退场。
 */
export default function BlogHero({items = [], onEnter}) {
  const {lang} = useLanguage();
  const copy = COPY[lang] ?? COPY.en;
  const canvasRef = useRef(null);
  const titleWrapRef = useRef(null);
  const ctaRef = useRef(null);
  const enteredRef = useRef(false);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);

  // 构建期插件注入的正文语料（blog-waterfall-corpus）
  const corpus = usePluginData('blog-waterfall-corpus', 'default');
  const corpusPosts = corpus?.posts ?? [];

  // 瀑布文本：每篇「标题 · 日期」一行 + 正文（连续文本,Pretext 按行消费）。
  // 按 metadata.source 与语料对齐；语料缺失时回退为「标题 — 摘要」。
  const {text} = useMemo(() => {
    const bySource = new Map(corpusPosts.map((p) => [p.source, p.text]));
    const byTitle = new Map(corpusPosts.map((p) => [p.title, p.text]));
    const blocks = [];
    let total = 0;
    for (const it of items) {
      const md = it.content?.metadata ?? {};
      const title = md.title ?? it.title;
      if (!title) continue;
      const date = md.date ?? it.date;
      let body = bySource.get(md.source) ?? '';
      if (!body) body = byTitle.get(title) ?? '';
      let block = `${title} · ${formatDate(date)}`;
      if (body) {
        const cut =
          body.length > PER_POST_MAX ? `${body.slice(0, PER_POST_MAX)}…` : body;
        block += `\n${cut}`;
      } else {
        const excerpt = (md.description ?? '').replace(/\s+/g, ' ').trim();
        if (excerpt) block += ` — ${excerpt}`;
      }
      blocks.push(block);
      total += block.length;
      if (total > TOTAL_MAX) break;
    }
    if (!blocks.length) return {text: copy.title};
    return {text: blocks.join('\n')};
  }, [items, corpusPosts, copy.title]);

  // CHIE 中央站位模式：body 标记，custom.css 据此把 widget 从右下角搬到 Hero 中央
  useEffect(() => {
    document.body.classList.add('blog-hero-active');
    return () => document.body.classList.remove('blog-hero-active');
  }, []);

  // 退场：Hero 与 widget 同步淡出（custom.css 的 blog-hero-exiting 规则），
  // 过渡结束后卸载，CHIE 由 ChieWidgetStandalone 的 cleanup 自动 destroy
  useEffect(() => {
    if (!exiting) return undefined;
    document.body.classList.add('blog-hero-exiting');
    const timer = setTimeout(() => setMounted(false), 950);
    return () => {
      clearTimeout(timer);
      document.body.classList.remove('blog-hero-exiting');
    };
  }, [exiting]);

  const handleEnter = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    setExiting(true);
    onEnter?.();
  };

  // 滚轮下滑 / 手指上滑 → 进入阅读（与 CTA 等价）
  useEffect(() => {
    if (exiting) return undefined;
    const onWheel = (e) => {
      if (e.deltaY > 24) handleEnter();
    };
    let touchY = null;
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e) => {
      if (touchY == null) return;
      const dy = (e.changedTouches[0]?.clientY ?? touchY) - touchY;
      touchY = null;
      if (dy < -40) handleEnter(); // 上滑
    };
    window.addEventListener('wheel', onWheel, {passive: true});
    window.addEventListener('touchstart', onTouchStart, {passive: true});
    window.addEventListener('touchend', onTouchEnd, {passive: true});
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [exiting]);

  // Pretext 瀑布主循环
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let cancelled = false;
    let prepared = null;
    let width = 0;
    let height = 0;
    let offset = 0;
    let last = 0;
    // 一轮语料在全宽下排版的行数（= 循环周期），以及右股水流的相位游标
    let cycleRows = 0;
    let seedR = {segmentIndex: 0, graphemeIndex: 0};

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (prepared) recomputeCycle(); // 全宽变了,循环周期与相位要跟着重算
    };
    resize();
    window.addEventListener('resize', resize);

    // ── CHIE 轮廓 ────────────────────────────────────────────────
    // 从 widget 当前相位的 sprite 图（standing→idle / seated→seatedA）逐行
    // 扫描 alpha,得到每行 [左缘, 右缘]（相对 sprite 归一化）。文字瀑布据此
    // 收窄走廊,贴着 CHIE 的真实身体轮廓流,而不是躲开整个 widget 方盒子。
    let profile = null; // {src, data, h}
    let profileBuilding = null;
    const model = {frame: null, profile: null}; // frame() 每帧读取

    function currentSprite() {
      const root = document.getElementById('chie-widget-root');
      if (!root) return null;
      const phase = root.dataset.idlePhase || 'standing';
      const sel =
        phase === 'standing' ? 'img.chie-base-sprite' : 'img.chie-seated-frame';
      return root.querySelector(sel);
    }

    async function buildProfile(img) {
      try {
        await img.decode();
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return;
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const offCtx = off.getContext('2d', {willReadFrequently: true});
        offCtx.drawImage(img, 0, 0);
        const px = offCtx.getImageData(0, 0, w, h).data;
        const data = new Float32Array(h * 2);
        for (let y = 0; y < h; y++) {
          const base = y * w * 4;
          let l = -1;
          let r = -1;
          for (let x = 0; x < w; x++) {
            if (px[base + x * 4 + 3] > ALPHA_THRESHOLD) {
              l = x;
              break;
            }
          }
          if (l >= 0) {
            for (let x = w - 1; x >= l; x--) {
              if (px[base + x * 4 + 3] > ALPHA_THRESHOLD) {
                r = x;
                break;
              }
            }
          }
          data[y * 2] = l / w;
          data[y * 2 + 1] = r >= 0 ? r / w : -1;
        }
        profile = {src: img.src, data, h};
      } catch {
        // 轮廓读取失败 → 保持 null,回退到整个 frame 盒子避让
      }
    }

    // 每帧调用:定位当前 sprite 与 model-frame,必要时(相位切换)重建轮廓
    function syncModel() {
      const img = currentSprite();
      const frameEl = img?.closest('.chie-model-frame') ?? null;
      model.frame = frameEl ? frameEl.getBoundingClientRect() : null;
      if (img?.complete && img.naturalWidth > 0) {
        if (profile?.src !== img.src && profileBuilding !== img.src) {
          profileBuilding = img.src;
          buildProfile(img).then(() => {
            if (img.src === profileBuilding) profileBuilding = null;
          });
        }
        model.profile = profile;
      } else {
        model.profile = null;
      }
    }

    // 行 y(屏幕坐标)→ 该行 CHIE 轮廓的左右屏幕边界;
    // 返回 null = 该行在 frame 之外(全宽),l/r 为 null = 该行 sprite 透明(全宽)
    function edgesAt(y) {
      const frame = model.frame;
      if (!frame) return null;
      const p = model.profile;
      if (!p) return {l: frame.left, r: frame.right}; // 轮廓未就绪:躲开整个盒子
      const t = (y - frame.top) / frame.height;
      if (t < 0 || t >= 1) return null;
      const idx = Math.min(p.h - 1, Math.max(0, Math.round(t * p.h)));
      const ln = p.data[idx * 2];
      if (ln < 0) return {l: null, r: null};
      return {l: frame.left + ln * frame.width, r: frame.left + p.data[idx * 2 + 1] * frame.width};
    }

    // 重算一轮语料的行数与右股相位(全宽参考排版),resize 后也要重算
    function recomputeCycle() {
      if (!prepared || width < 1) return;
      const fullW = width - EDGE_PAD * 2;
      let cursor = {segmentIndex: 0, graphemeIndex: 0};
      let count = 0;
      const positions = [cursor];
      for (;;) {
        const range = layoutNextLineRange(prepared, cursor, fullW);
        if (!range || count >= MAX_ROWS) break;
        cursor = range.end;
        positions.push(cursor);
        count += 1;
      }
      cycleRows = count;
      seedR = positions[Math.floor(count / 2)] ?? positions[0];
    }

    // 字体就绪后再 prepare —— canvas 测量依赖真实字体,否则会量出 fallback 的宽度。
    // pre-wrap:保留 \n 硬换行(默认 normal 会折叠,瀑布就退化成一行循环)
    document.fonts.ready.then(() => {
      if (cancelled) return;
      prepared = prepareWithSegments(text, FONT, {whiteSpace: 'pre-wrap'});
      recomputeCycle();
    });

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!prepared || cycleRows < 1) return; // 字体未就绪:背景渐变已由 CSS 呈现
      const now = performance.now();
      if (last) {
        offset =
          (offset + ((now - last) / 1000) * SCROLL_SPEED) %
          (cycleRows * LINE_HEIGHT);
      }
      last = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.font = FONT;

      syncModel();

      // 起排/收尾位置跟随真实布局(标题与 CTA 的包围盒),移动端自动适配
      const titleRect = titleWrapRef.current?.getBoundingClientRect();
      const ctaRect = ctaRef.current?.getBoundingClientRect();
      const topY = titleRect ? titleRect.bottom + 26 : 120;
      const bottomY = ctaRect ? ctaRect.top - 24 : height - 104;
      const fullW = width - EDGE_PAD * 2;

      // 从天而降:整列行从 topY-cycleH 起步,随 offset 增大向下流动;
      // offset 对 cycleH 取模 → 回卷瞬间内容一致,循环无接缝
      const START = {segmentIndex: 0, graphemeIndex: 0};
      let curL = START; // 左股(偶行)
      let curR = seedR; // 右股(奇行,相位错开半轮)
      let i = 0;
      for (
        let y = topY - cycleRows * LINE_HEIGHT + offset;
        y < bottomY + LINE_HEIGHT;
        y += LINE_HEIGHT, i += 1
      ) {
        const isL = i % 2 === 0;
        const edges = edgesAt(y);
        let x;
        let maxW;
        if (edges && edges.l != null && edges.r != null) {
          // 流经 CHIE 的身体:走廊收窄到她的轮廓边缘,贴着身体流过
          if (isL) {
            x = EDGE_PAD;
            maxW = edges.l - EDGE_PAD - SIDE_GAP;
          } else {
            x = width - EDGE_PAD;
            maxW = width - EDGE_PAD - edges.r - SIDE_GAP;
          }
        } else {
          // 头顶/脚下/透明行:全宽,左右两股各自贴边
          x = isL ? EDGE_PAD : width - EDGE_PAD;
          maxW = fullW;
        }

        if (maxW < MIN_COL) continue;

        let cur = isL ? curL : curR;
        let range = layoutNextLineRange(prepared, cur, maxW);
        if (!range) {
          // 该股读完一轮 → 回到自己的相位起点,瀑布循环
          cur = isL ? START : seedR;
          range = layoutNextLineRange(prepared, cur, maxW);
        }
        if (range) {
          const line = materializeLineRange(prepared, range);
          // 瀑布淡入淡出:顶部渐显、底部渐隐
          let alpha = 1;
          if (y < topY + FADE_BAND) alpha = Math.max(0, (y - topY) / FADE_BAND);
          else if (y > bottomY - FADE_BAND)
            alpha = Math.max(0, (bottomY - y) / FADE_BAND);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = isL ? WATER_L : WATER_R;
          ctx.textAlign = isL ? 'left' : 'right';
          ctx.fillText(line.text, x, y);
          ctx.globalAlpha = 1;
          cur = range.end;
        }
        if (isL) curL = cur;
        else curR = cur;
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [text]);

  if (!mounted) return null;

  return (
    <div className={`${styles.hero} ${exiting ? styles.exiting : ''}`}>
      <div className={styles.bg} />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.titleWrap} ref={titleWrapRef}>
        <span className={styles.kicker} aria-hidden="true">
          ✦
        </span>
        <h2 className={styles.title}>{copy.title}</h2>
      </div>
      <button
        type="button"
        className={styles.cta}
        onClick={handleEnter}
        ref={ctaRef}
      >
        {copy.cta}
      </button>
      <ChieWidgetStandalone position="center" />
    </div>
  );
}
