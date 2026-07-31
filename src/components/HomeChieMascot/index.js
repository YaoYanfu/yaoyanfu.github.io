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
  seatedFailed: 'chie_widget_seated_failed_v1',
};

const EXPRESSION_ASSETS = [
  CHIE_ASSETS.blink,
  CHIE_ASSETS.annoyed,
  CHIE_ASSETS.shy,
  CHIE_ASSETS.alert,
];

const SEATED_REQUIRED_ASSETS = [
  CHIE_ASSETS.seatedA,
];

const EXPRESSION_TIMING = {
  enter: 320,
  hold: 2800,
  exit: 360,
};

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
  const idleTimerRef = useRef(null);
  const idleCycleCountRef = useRef(0);
  const seatedPreloadPromiseRef = useRef(null);
  const unavailableAssetsRef = useRef(new Set());

  const [viewportMode, setViewportMode] = useState(null);
  const [entryDelayElapsed, setEntryDelayElapsed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [seatedIdleDisabled, setSeatedIdleDisabled] = useState(false);
  const [seatedReady, setSeatedReady] = useState(false);
  const [idlePhase, setIdlePhase] = useState('standing');
  const [baseLoaded, setBaseLoaded] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [reaction, setReaction] = useState({
    name: 'idle',
    phase: 'idle',
    id: 0,
  });
  const [blinking, setBlinking] = useState(false);
  const [messageKey, setMessageKey] = useState('greeting');
  const [speaking, setSpeaking] = useState(false);

  const fullVisible =
    viewportMode === 'full' && !userCollapsed;
  const compactVisible =
    viewportMode === 'compact'
    || (viewportMode === 'full' && userCollapsed);
  const entryAssetReady = fullVisible ? baseLoaded : avatarLoaded;
  const entered = entryDelayElapsed && entryAssetReady;
  const canExpand = viewportMode === 'full';
  const emotion = reaction.name;

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

  const resetReaction = useCallback(() => {
    clearEmotionTimer();
    setReaction((current) => {
      if (current.phase === 'idle' && current.name === 'idle') return current;
      return {name: 'idle', phase: 'idle', id: current.id};
    });
  }, [clearEmotionTimer]);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
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

  const handleReactionAssetError = useCallback((asset, reactionId) => {
    unavailableAssetsRef.current.add(asset);
    setReaction((current) => (
      current.id === reactionId
        ? {name: 'idle', phase: 'idle', id: current.id}
        : current
    ));
  }, []);

  const disableSeatedIdle = useCallback(() => {
    clearIdleTimer();
    setBlinking(false);
    setIdlePhase('standing');
    setSeatedIdleDisabled(true);
    try {
      sessionStorage.setItem(STORAGE.seatedFailed, '1');
    } catch {}
  }, [clearIdleTimer]);

  const preloadSeatedAssets = useCallback(() => {
    if (seatedPreloadPromiseRef.current) {
      return seatedPreloadPromiseRef.current;
    }

    const loadImage = (asset, required) => new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.fetchPriority = 'low';
      image.onload = () => {
        const decoded = typeof image.decode === 'function'
          ? image.decode().catch(() => {})
          : Promise.resolve();
        decoded.then(() => resolve(true));
      };
      image.onerror = () => {
        unavailableAssetsRef.current.add(asset);
        if (required) reject(new Error(`Unable to load ${asset}`));
        else resolve(false);
      };
      image.src = `${assetRoot}${asset}`;
    });

    const required = Promise.all(
      SEATED_REQUIRED_ASSETS.map((asset) => loadImage(asset, true)),
    );
    loadImage(CHIE_ASSETS.seatedBlink, false);

    seatedPreloadPromiseRef.current = required
      .then(() => {
        setSeatedReady(true);
        return true;
      })
      .catch(() => false);

    return seatedPreloadPromiseRef.current;
  }, [assetRoot]);

  const interruptIdle = useCallback(() => {
    clearIdleTimer();
    idleCycleCountRef.current = Math.max(1, idleCycleCountRef.current);
    setBlinking(false);
    setIdlePhase('standing');
  }, [clearIdleTimer]);

  useEffect(() => {
    try {
      setFailed(sessionStorage.getItem(STORAGE.failed) === '1');
      setUserCollapsed(sessionStorage.getItem(STORAGE.collapsed) === '1');
      setSeatedIdleDisabled(
        sessionStorage.getItem(STORAGE.seatedFailed) === '1',
      );
    } catch {}

    let resizeFrame = null;
    const updateViewport = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        setViewportMode(getViewportMode());
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
    if (!fullVisible) {
      clearDialogueTimer();
      clearEmotionTimer();
      clearIdleTimer();
      setSpeaking(false);
      resetReaction();
      setBlinking(false);
      setIdlePhase('standing');
    }
  }, [
    clearDialogueTimer,
    clearEmotionTimer,
    clearIdleTimer,
    fullVisible,
    resetReaction,
  ]);

  useEffect(() => {
    if (
      !entered
      || failed
      || viewportMode !== 'full'
      || userCollapsed
    ) {
      return;
    }

    try {
      if (sessionStorage.getItem(STORAGE.greeted) === '1') return;
      sessionStorage.setItem(STORAGE.greeted, '1');
    } catch {}
    showMessage('greeting');
  }, [
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
    const eligible =
      fullVisible
      && entered
      && baseLoaded
      && !failed
      && !reducedMotion
      && !seatedIdleDisabled
      && reaction.phase === 'idle'
      && !speaking;

    if (!eligible) {
      clearIdleTimer();
      if (idlePhase !== 'standing') setIdlePhase('standing');
      return undefined;
    }

    let cancelled = false;
    const schedule = (callback, delay) => {
      idleTimerRef.current = window.setTimeout(callback, delay);
    };

    if (idlePhase === 'standing') {
      const firstCycle = idleCycleCountRef.current === 0;
      const delay = firstCycle
        ? 5000 + Math.random() * 3000
        : 12000 + Math.random() * 6000;
      schedule(async () => {
        const ready = await preloadSeatedAssets();
        if (cancelled) return;
        if (!ready) {
          disableSeatedIdle();
          return;
        }
        setIdlePhase('chair-in');
      }, delay);
    } else if (idlePhase === 'chair-in') {
      schedule(() => setIdlePhase('seated'), 720);
    } else if (idlePhase === 'seated') {
      schedule(() => setIdlePhase('chair-out'), 9000);
    } else if (idlePhase === 'chair-out') {
      schedule(() => {
        idleCycleCountRef.current += 1;
        setIdlePhase('standing');
      }, 720);
    }

    return () => {
      cancelled = true;
      clearIdleTimer();
    };
  }, [
    baseLoaded,
    clearIdleTimer,
    disableSeatedIdle,
    entered,
    failed,
    fullVisible,
    idlePhase,
    preloadSeatedAssets,
    reaction.phase,
    reducedMotion,
    seatedIdleDisabled,
    speaking,
  ]);

  useEffect(() => {
    if (
      !fullVisible
      || !baseLoaded
      || reducedMotion
      || failed
      || reaction.phase !== 'idle'
      || idlePhase === 'chair-in'
      || idlePhase === 'chair-out'
    ) {
      setBlinking(false);
      return undefined;
    }

    let cancelled = false;
    let blinkTimer = null;
    let blinkEndTimer = null;

    const schedule = () => {
      blinkTimer = window.setTimeout(() => {
        if (cancelled) return;
        const blinkAsset = idlePhase === 'seated'
          ? CHIE_ASSETS.seatedBlink
          : CHIE_ASSETS.blink;
        if (unavailableAssetsRef.current.has(blinkAsset)) return;
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
  }, [
    baseLoaded,
    failed,
    fullVisible,
    idlePhase,
    reaction.phase,
    reducedMotion,
  ]);

  useEffect(() => {
    if (reaction.phase === 'idle') return undefined;

    if (reducedMotion && reaction.phase !== 'hold') {
      setReaction((current) => {
        if (current.id !== reaction.id) return current;
        return reaction.phase === 'exit'
          ? {name: 'idle', phase: 'idle', id: current.id}
          : {...current, phase: 'hold'};
      });
      return undefined;
    }

    const duration = EXPRESSION_TIMING[reaction.phase];
    emotionTimerRef.current = window.setTimeout(() => {
      setReaction((current) => {
        if (
          current.id !== reaction.id
          || current.phase !== reaction.phase
        ) {
          return current;
        }
        if (current.phase === 'enter') return {...current, phase: 'hold'};
        if (current.phase === 'hold') {
          return reducedMotion
            ? {name: 'idle', phase: 'idle', id: current.id}
            : {...current, phase: 'exit'};
        }
        return {name: 'idle', phase: 'idle', id: current.id};
      });
      emotionTimerRef.current = null;
    }, duration);

    return clearEmotionTimer;
  }, [
    clearEmotionTimer,
    reaction.id,
    reaction.phase,
    reducedMotion,
  ]);

  useEffect(() => () => {
    clearDialogueTimer();
    clearEmotionTimer();
    clearIdleTimer();
    if (pointerFrameRef.current) {
      window.cancelAnimationFrame(pointerFrameRef.current);
    }
  }, [clearDialogueTimer, clearEmotionTimer, clearIdleTimer]);

  const reactTo = useCallback((zone) => {
    const nextReaction = CHIE_REACTIONS[zone];
    const reactionAsset = CHIE_ASSETS[nextReaction.emotion];
    interruptIdle();
    clearEmotionTimer();
    if (!unavailableAssetsRef.current.has(reactionAsset)) {
      setReaction((current) => ({
        name: nextReaction.emotion,
        phase: reducedMotion ? 'hold' : 'enter',
        id: current.id + 1,
      }));
    }
    showMessage(nextReaction.message);
  }, [
    clearEmotionTimer,
    interruptIdle,
    reducedMotion,
    showMessage,
  ]);

  const collapse = useCallback(() => {
    interruptIdle();
    clearDialogueTimer();
    resetReaction();
    setSpeaking(false);
    setUserCollapsed(true);
    try {
      sessionStorage.setItem(STORAGE.collapsed, '1');
    } catch {}
  }, [clearDialogueTimer, interruptIdle, resetReaction]);

  const openFromAvatar = useCallback(() => {
    if (canExpand) {
      setUserCollapsed(false);
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

  const reactionPhaseClass = {
    enter: styles.expressionEnter,
    hold: styles.expressionHold,
    exit: styles.expressionExit,
  }[reaction.phase] || '';

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
            data-idle-phase={idlePhase}
            data-reaction-phase={reaction.phase}
            data-reaction-name={reaction.name}
            data-reaction-id={reaction.id}
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
            <div
              className={`${styles.contactShadow} ${styles.chairContactShadow}`}
              aria-hidden="true"
            />

            <div className={styles.standingScene}>
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
                    <div
                      key={`${reaction.name}-${reaction.id}`}
                      className={`${styles.expressionGroup} ${reactionPhaseClass}`}
                      aria-hidden="true"
                    >
                      <img
                        className={`${styles.sprite} ${styles.expressionPart} ${styles.expressionToneLayer}`}
                        src={`${assetRoot}${CHIE_ASSETS[emotion]}`}
                        alt=""
                        draggable="false"
                        decoding="async"
                        onError={() => handleReactionAssetError(
                          CHIE_ASSETS[emotion],
                          reaction.id,
                        )}
                      />
                      <img
                        className={`${styles.sprite} ${styles.expressionPart} ${styles.expressionEyesLayer}`}
                        src={`${assetRoot}${CHIE_ASSETS[emotion]}`}
                        alt=""
                        draggable="false"
                        decoding="async"
                        onError={() => handleReactionAssetError(
                          CHIE_ASSETS[emotion],
                          reaction.id,
                        )}
                      />
                      <img
                        className={`${styles.sprite} ${styles.expressionPart} ${styles.expressionMouthLayer}`}
                        src={`${assetRoot}${CHIE_ASSETS[emotion]}`}
                        alt=""
                        draggable="false"
                        decoding="async"
                        onError={() => handleReactionAssetError(
                          CHIE_ASSETS[emotion],
                          reaction.id,
                        )}
                      />
                      <img
                        className={`${styles.sprite} ${styles.expressionPart} ${styles.expressionBridgeLayer}`}
                        src={`${assetRoot}${CHIE_ASSETS.blink}`}
                        alt=""
                        draggable="false"
                        decoding="async"
                        onError={() => {
                          unavailableAssetsRef.current.add(
                            CHIE_ASSETS.blink,
                          );
                        }}
                      />
                    </div>
                  )}

                  {blinking && idlePhase === 'standing' && (
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
            </div>

            {seatedReady && (
              <div className={styles.seatedScene} aria-hidden="true">
                <img
                  className={`${styles.sprite} ${styles.seatedFrame} ${styles.seatedChairStatic}`}
                  src={`${assetRoot}${CHIE_ASSETS.seatedA}`}
                  alt=""
                  draggable="false"
                  decoding="async"
                  onError={disableSeatedIdle}
                />
                <img
                  className={`${styles.sprite} ${styles.seatedFrame} ${styles.seatedLeg} ${styles.seatedLegLeft}`}
                  src={`${assetRoot}${CHIE_ASSETS.seatedA}`}
                  alt=""
                  draggable="false"
                  decoding="async"
                  onError={disableSeatedIdle}
                />
                <img
                  className={`${styles.sprite} ${styles.seatedFrame} ${styles.seatedLeg} ${styles.seatedLegRight}`}
                  src={`${assetRoot}${CHIE_ASSETS.seatedA}`}
                  alt=""
                  draggable="false"
                  decoding="async"
                  onError={disableSeatedIdle}
                />
                <img
                  className={`${styles.sprite} ${styles.seatedFrame} ${styles.seatedUpperStatic}`}
                  src={`${assetRoot}${CHIE_ASSETS.seatedA}`}
                  alt=""
                  draggable="false"
                  decoding="async"
                  onError={disableSeatedIdle}
                />
                <img
                  className={`${styles.sprite} ${styles.seatedFrame} ${styles.seatedKneeBridge}`}
                  src={`${assetRoot}${CHIE_ASSETS.seatedA}`}
                  alt=""
                  draggable="false"
                  decoding="async"
                  onError={disableSeatedIdle}
                />
                <img
                  className={`${styles.sprite} ${styles.seatedFrame} ${styles.seatedHemDetail}`}
                  src={`${assetRoot}${CHIE_ASSETS.seatedA}`}
                  alt=""
                  draggable="false"
                  decoding="async"
                  onError={disableSeatedIdle}
                />
                {blinking && idlePhase === 'seated' && (
                  <img
                    className={`${styles.sprite} ${styles.seatedBlinkLayer}`}
                    src={`${assetRoot}${CHIE_ASSETS.seatedBlink}`}
                    alt=""
                    draggable="false"
                    decoding="async"
                    onError={() => {
                      unavailableAssetsRef.current.add(
                        CHIE_ASSETS.seatedBlink,
                      );
                      setBlinking(false);
                    }}
                  />
                )}
              </div>
            )}

            <div className={styles.holoTransition} aria-hidden="true">
              <span />
            </div>

            {idlePhase === 'standing' ? (
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
            ) : (
              <button
                type="button"
                className={styles.seatedInterruptZone}
                aria-label={copy.actions.figure}
                onClick={() => reactTo('figure')}
                disabled={!entered || !baseLoaded}
              />
            )}
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
