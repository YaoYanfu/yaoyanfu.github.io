import {useCallback, useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

import {useLanguage} from '@site/src/context/LanguageContext';
import {
  CHIE_ASSETS,
  CHIE_COPY,
  CHIE_REACTIONS,
} from '@site/src/data/chieMascot';

import styles from './styles.module.css';

const STORAGE = {
  collapsed: 'chie_widget_collapsed_v1',
  failed: 'chie_widget_failed_v1',
  greeted: 'chie_widget_greeted_v1',
};

const EXPRESSION_ASSETS = [
  CHIE_ASSETS.blink,
  CHIE_ASSETS.annoyed,
  CHIE_ASSETS.shy,
  CHIE_ASSETS.alert,
];

function getViewportMode() {
  if (window.innerWidth <= 1023) return 'hidden';
  if (window.innerWidth <= 1365) return 'compact';
  return 'full';
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

export default function HomeChieMascot() {
  const assetRoot = useBaseUrl('img/chie/');
  const {lang} = useLanguage();
  const copy = CHIE_COPY[lang] || CHIE_COPY.en;
  const reducedMotion = useReducedMotion();

  const dockRef = useRef(null);
  const pointerFrameRef = useRef(null);
  const dialogueTimerRef = useRef(null);
  const emotionTimerRef = useRef(null);
  const manualOpenRef = useRef(false);
  const unavailableAssetsRef = useRef(new Set());

  const [viewportMode, setViewportMode] = useState(null);
  const [entryDelayElapsed, setEntryDelayElapsed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [scrollCollapsed, setScrollCollapsed] = useState(false);
  const [collisionCollapsed, setCollisionCollapsed] = useState(false);
  const [footerCollapsed, setFooterCollapsed] = useState(false);
  const [baseLoaded, setBaseLoaded] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [emotion, setEmotion] = useState('idle');
  const [blinking, setBlinking] = useState(false);
  const [messageKey, setMessageKey] = useState('greeting');
  const [speaking, setSpeaking] = useState(false);

  const autoCollapsed =
    viewportMode === 'full'
    && (scrollCollapsed || collisionCollapsed || footerCollapsed);
  const fullVisible =
    viewportMode === 'full' && !userCollapsed && !autoCollapsed;
  const compactVisible =
    viewportMode === 'compact'
    || (viewportMode === 'full' && !fullVisible);
  const entryAssetReady = fullVisible ? baseLoaded : avatarLoaded;
  const entered = entryDelayElapsed && entryAssetReady;
  const canExpand =
    viewportMode === 'full' && !collisionCollapsed && !footerCollapsed;

  const clearDialogueTimer = useCallback(() => {
    if (dialogueTimerRef.current) {
      window.clearTimeout(dialogueTimerRef.current);
      dialogueTimerRef.current = null;
    }
  }, []);

  const clearEmotionTimer = useCallback(() => {
    if (emotionTimerRef.current) {
      window.clearTimeout(emotionTimerRef.current);
      emotionTimerRef.current = null;
    }
  }, []);

  const showMessage = useCallback((nextMessage, duration = 5000) => {
    clearDialogueTimer();
    setMessageKey(nextMessage);
    setSpeaking(true);
    dialogueTimerRef.current = window.setTimeout(() => {
      setSpeaking(false);
      dialogueTimerRef.current = null;
    }, duration);
  }, [clearDialogueTimer]);

  const hideForSession = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE.failed, '1');
    } catch {}
    setFailed(true);
  }, []);

  useEffect(() => {
    try {
      setFailed(sessionStorage.getItem(STORAGE.failed) === '1');
      setUserCollapsed(sessionStorage.getItem(STORAGE.collapsed) === '1');
    } catch {}

    let resizeFrame = null;
    const updateViewport = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        const nextMode = getViewportMode();
        setViewportMode(nextMode);
        if (nextMode === 'full' && !manualOpenRef.current) {
          setScrollCollapsed(window.scrollY > window.innerHeight);
        } else if (nextMode !== 'full') {
          setScrollCollapsed(false);
        }
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport, {passive: true});
    return () => {
      window.removeEventListener('resize', updateViewport);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    };
  }, []);

  useEffect(() => {
    if (
      entryDelayElapsed
      || failed
      || !viewportMode
      || viewportMode === 'hidden'
    ) {
      return undefined;
    }
    const timer = window.setTimeout(() => setEntryDelayElapsed(true), 800);
    return () => window.clearTimeout(timer);
  }, [entryDelayElapsed, failed, viewportMode]);

  useEffect(() => {
    if (viewportMode !== 'full') {
      setScrollCollapsed(false);
      return undefined;
    }

    let frame = null;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        setScrollCollapsed(
          !manualOpenRef.current && window.scrollY > window.innerHeight,
        );
      });
    };

    update();
    window.addEventListener('scroll', update, {passive: true});
    return () => {
      window.removeEventListener('scroll', update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [viewportMode]);

  useEffect(() => {
    if (viewportMode !== 'full') {
      setCollisionCollapsed(false);
      return undefined;
    }

    const content = document.querySelector('[data-chie-safe-content]');
    if (!content) return undefined;

    let frame = null;
    const measure = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const dock = dockRef.current;
        if (!dock) return;
        const contentRight = content.getBoundingClientRect().right;
        const dockLeft = dock.getBoundingClientRect().left;
        setCollisionCollapsed(contentRight > dockLeft - 8);
      });
    };

    measure();
    window.addEventListener('resize', measure, {passive: true});
    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(measure);
    observer?.observe(content);

    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [entered, viewportMode]);

  useEffect(() => {
    if (viewportMode !== 'full' || typeof IntersectionObserver === 'undefined') {
      setFooterCollapsed(false);
      return undefined;
    }

    const footer = document.querySelector('footer');
    if (!footer) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterCollapsed(entry.isIntersecting),
      {threshold: 0.02},
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [viewportMode]);

  useEffect(() => {
    if (userCollapsed || autoCollapsed) {
      clearDialogueTimer();
      clearEmotionTimer();
      setSpeaking(false);
      setEmotion('idle');
      setBlinking(false);
    }
  }, [
    autoCollapsed,
    clearDialogueTimer,
    clearEmotionTimer,
    userCollapsed,
  ]);

  useEffect(() => {
    if (
      !entered
      || failed
      || viewportMode !== 'full'
      || userCollapsed
      || autoCollapsed
    ) {
      return;
    }

    try {
      if (sessionStorage.getItem(STORAGE.greeted) === '1') return;
      sessionStorage.setItem(STORAGE.greeted, '1');
    } catch {}
    showMessage('greeting');
  }, [
    autoCollapsed,
    entered,
    failed,
    showMessage,
    userCollapsed,
    viewportMode,
  ]);

  useEffect(() => {
    if (!fullVisible || !baseLoaded || failed) return undefined;

    let cancelled = false;
    let idleId = null;
    let timeoutId = null;
    const preloads = [];

    const preload = () => {
      EXPRESSION_ASSETS.forEach((asset) => {
        const image = new Image();
        image.decoding = 'async';
        image.fetchPriority = 'low';
        image.onerror = () => {
          if (!cancelled) unavailableAssetsRef.current.add(asset);
        };
        image.src = `${assetRoot}${asset}`;
        preloads.push(image);
      });
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(preload, {timeout: 1500});
    } else {
      timeoutId = window.setTimeout(preload, 250);
    }

    return () => {
      cancelled = true;
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      preloads.forEach((image) => {
        image.onerror = null;
      });
    };
  }, [assetRoot, baseLoaded, failed, fullVisible]);

  useEffect(() => {
    if (!fullVisible || !baseLoaded || reducedMotion || failed) {
      setBlinking(false);
      return undefined;
    }

    let cancelled = false;
    let blinkTimer = null;
    let blinkEndTimer = null;

    const schedule = () => {
      blinkTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (unavailableAssetsRef.current.has(CHIE_ASSETS.blink)) return;
        setBlinking(true);
        blinkEndTimer = window.setTimeout(() => {
          if (cancelled) return;
          setBlinking(false);
          schedule();
        }, 145);
      }, 2600 + Math.random() * 3800);
    };

    schedule();
    return () => {
      cancelled = true;
      if (blinkTimer) window.clearTimeout(blinkTimer);
      if (blinkEndTimer) window.clearTimeout(blinkEndTimer);
      setBlinking(false);
    };
  }, [baseLoaded, failed, fullVisible, reducedMotion]);

  useEffect(() => () => {
    clearDialogueTimer();
    clearEmotionTimer();
    if (pointerFrameRef.current) {
      window.cancelAnimationFrame(pointerFrameRef.current);
    }
  }, [clearDialogueTimer, clearEmotionTimer]);

  const reactTo = useCallback((zone) => {
    const reaction = CHIE_REACTIONS[zone];
    const reactionAsset = CHIE_ASSETS[reaction.emotion];
    clearEmotionTimer();
    setEmotion(
      unavailableAssetsRef.current.has(reactionAsset)
        ? 'idle'
        : reaction.emotion,
    );
    showMessage(reaction.message);
    emotionTimerRef.current = window.setTimeout(() => {
      setEmotion('idle');
      emotionTimerRef.current = null;
    }, 3600);
  }, [clearEmotionTimer, showMessage]);

  const collapse = useCallback(() => {
    manualOpenRef.current = false;
    clearDialogueTimer();
    setSpeaking(false);
    setUserCollapsed(true);
    try {
      sessionStorage.setItem(STORAGE.collapsed, '1');
    } catch {}
  }, [clearDialogueTimer]);

  const openFromAvatar = useCallback(() => {
    if (canExpand) {
      manualOpenRef.current = true;
      setUserCollapsed(false);
      setScrollCollapsed(false);
      try {
        sessionStorage.removeItem(STORAGE.collapsed);
      } catch {}
    }
    showMessage('greeting');
  }, [canExpand, showMessage]);

  const updateLook = useCallback((event) => {
    if (reducedMotion || !dockRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(
      -1,
      Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2),
    );

    if (pointerFrameRef.current) {
      window.cancelAnimationFrame(pointerFrameRef.current);
    }
    pointerFrameRef.current = window.requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      dockRef.current?.style.setProperty(
        '--chie-look-rotate',
        `${(x * 0.28).toFixed(3)}deg`,
      );
      dockRef.current?.style.setProperty(
        '--chie-floor-glint-x',
        `${(50 + x * 13).toFixed(2)}%`,
      );
    });
  }, [reducedMotion]);

  const resetLook = useCallback(() => {
    if (!dockRef.current) return;
    if (pointerFrameRef.current) {
      window.cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = null;
    }
    dockRef.current.style.setProperty('--chie-look-rotate', '0deg');
    dockRef.current.style.setProperty('--chie-floor-glint-x', '50%');
  }, []);

  if (!viewportMode || viewportMode === 'hidden' || failed) return null;

  return (
    <aside
      ref={dockRef}
      className={styles.dock}
      data-compact={compactVisible ? 'true' : 'false'}
      data-entered={entered ? 'true' : 'false'}
      data-speaking={speaking ? 'true' : 'false'}
      aria-label={copy.name}
    >
      <div
        className={`${styles.dialogue} ${
          speaking ? styles.dialogueVisible : ''
        }`}
        role="status"
        aria-live="polite"
        aria-hidden={speaking ? undefined : 'true'}
      >
        <span className={styles.dialogueName}>{copy.name}</span>
        <p>{copy.messages[messageKey]}</p>
      </div>

      {fullVisible && (
        <>
          <div
            className={styles.model}
            data-ready={baseLoaded ? 'true' : 'false'}
            onPointerMove={updateLook}
            onPointerLeave={resetLook}
          >
            <div className={styles.ambientGlow} aria-hidden="true" />
            <div className={styles.glassPlatform} aria-hidden="true" />
            <div
              className={`${styles.contactShadow} ${styles.rearFootShadow}`}
              aria-hidden="true"
            />
            <div
              className={`${styles.contactShadow} ${styles.frontFootShadow}`}
              aria-hidden="true"
            />

            <div className={styles.lookLayer}>
              <div className={styles.breathLayer}>
                <img
                  className={`${styles.sprite} ${styles.baseSprite}`}
                  src={`${assetRoot}${CHIE_ASSETS.idle}`}
                  alt={copy.alt}
                  draggable="false"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() => setBaseLoaded(true)}
                  onError={hideForSession}
                />

                {emotion !== 'idle' && (
                  <img
                    className={`${styles.sprite} ${styles.expressionLayer} ${styles.expressionLayerActive}`}
                    src={`${assetRoot}${CHIE_ASSETS[emotion]}`}
                    alt=""
                    draggable="false"
                    decoding="async"
                    onError={() => {
                      unavailableAssetsRef.current.add(
                        CHIE_ASSETS[emotion],
                      );
                      setEmotion('idle');
                    }}
                    aria-hidden="true"
                  />
                )}

                {blinking && (
                  <img
                    className={`${styles.sprite} ${styles.expressionLayer} ${styles.blinkLayer} ${styles.expressionLayerActive}`}
                    src={`${assetRoot}${CHIE_ASSETS.blink}`}
                    alt=""
                    draggable="false"
                    decoding="async"
                    onError={() => {
                      unavailableAssetsRef.current.add(CHIE_ASSETS.blink);
                      setBlinking(false);
                    }}
                    aria-hidden="true"
                  />
                )}

                <img
                  className={`${styles.sprite} ${styles.hairLayer}`}
                  src={`${assetRoot}${CHIE_ASSETS.idle}`}
                  alt=""
                  draggable="false"
                  aria-hidden="true"
                />
                <img
                  className={`${styles.sprite} ${styles.shirtLayer}`}
                  src={`${assetRoot}${CHIE_ASSETS.idle}`}
                  alt=""
                  draggable="false"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className={styles.hitZones}>
              <button
                type="button"
                className={`${styles.hitZone} ${styles.figureZone}`}
                aria-label={copy.actions.figure}
                onClick={() => reactTo('figure')}
                disabled={!entered || !baseLoaded}
              />
              <button
                type="button"
                className={`${styles.hitZone} ${styles.headZone}`}
                aria-label={copy.actions.head}
                onClick={() => reactTo('head')}
                disabled={!entered || !baseLoaded}
              />
              <button
                type="button"
                className={`${styles.hitZone} ${styles.faceZone}`}
                aria-label={copy.actions.face}
                onClick={() => reactTo('face')}
                disabled={!entered || !baseLoaded}
              />
            </div>
          </div>

          <button
            type="button"
            className={styles.collapseButton}
            aria-label={copy.actions.collapse}
            title={copy.actions.collapse}
            onClick={collapse}
            disabled={!entered}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 10l5 5 5-5" />
            </svg>
          </button>
        </>
      )}

      {compactVisible && (
        <button
          type="button"
          className={styles.avatarButton}
          aria-label={
            canExpand
              ? copy.actions.expand
              : copy.actions.greet
          }
          title={
            canExpand
              ? copy.actions.expand
              : copy.actions.greet
          }
          onClick={openFromAvatar}
          disabled={!entered}
        >
          <span className={styles.avatarOrbit} aria-hidden="true" />
          <img
            src={`${assetRoot}${CHIE_ASSETS.avatar}`}
            alt=""
            width="48"
            height="48"
            draggable="false"
            decoding="async"
            onLoad={() => setAvatarLoaded(true)}
            onError={hideForSession}
          />
          <span className={styles.statusMark} aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
