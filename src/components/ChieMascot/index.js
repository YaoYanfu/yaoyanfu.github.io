import {useCallback, useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

const EMOTIONS = {
  idle: {
    label: '待机',
    tag: 'IDLE',
    sprite: 'chie-v2-idle.webp',
    line: '看什么看？系统监控一切正常……你该不会又在偷懒吧？',
  },
  annoyed: {
    label: '不耐烦',
    tag: 'ANNOYED',
    sprite: 'chie-v2-annoyed.webp',
    line: '哼。别误会，我只是在确认你有没有认真做事。',
  },
  shy: {
    label: '害羞',
    tag: 'FLUSTERED',
    sprite: 'chie-v2-shy.webp',
    line: '别一直盯着我看……很影响系统判断的，笨蛋。',
  },
  alert: {
    label: '警觉',
    tag: 'ALERT',
    sprite: 'chie-v2-alert.webp',
    line: '检测到可疑操作。你最好解释一下。',
  },
};

const EXPRESSION_KEYS = ['annoyed', 'shy', 'alert'];
const BLINK_SPRITE = 'chie-v2-blink.webp';

const REACTIONS = {
  head: {
    emotion: 'shy',
    line: '别乱摸啊！发型都被你弄乱了！',
  },
  face: {
    emotion: 'alert',
    line: '一直盯着我看干嘛，我脸上写着代码吗？',
  },
  figure: {
    emotion: 'annoyed',
    line: '别乱碰。再这样，我就把你的进程挂起。',
  },
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

export default function ChieMascot() {
  const assetRoot = useBaseUrl('img/chie/');
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const reactionTimerRef = useRef(null);
  const blinkTimerRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const [emotion, setEmotion] = useState('idle');
  const [line, setLine] = useState(EMOTIONS.idle.line);
  const [blinking, setBlinking] = useState(false);
  const [showZones, setShowZones] = useState(false);

  const clearReactionTimer = useCallback(() => {
    if (reactionTimerRef.current) {
      window.clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = null;
    }
  }, []);

  const selectEmotion = useCallback((nextEmotion) => {
    clearReactionTimer();
    setEmotion(nextEmotion);
    setLine(EMOTIONS[nextEmotion].line);
  }, [clearReactionTimer]);

  const reactTo = useCallback((zone) => {
    const reaction = REACTIONS[zone];
    clearReactionTimer();
    setEmotion(reaction.emotion);
    setLine(reaction.line);
    reactionTimerRef.current = window.setTimeout(() => {
      setEmotion('idle');
      setLine(EMOTIONS.idle.line);
    }, 3600);
  }, [clearReactionTimer]);

  useEffect(() => {
    if (reducedMotion) {
      setBlinking(false);
      return undefined;
    }

    let cancelled = false;

    const scheduleBlink = () => {
      const delay = 2600 + Math.random() * 3800;
      blinkTimerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        window.setTimeout(() => {
          if (cancelled) return;
          setBlinking(false);
          scheduleBlink();
        }, 145);
      }, delay);
    };

    scheduleBlink();

    return () => {
      cancelled = true;
      if (blinkTimerRef.current) window.clearTimeout(blinkTimerRef.current);
    };
  }, [reducedMotion]);

  useEffect(() => () => {
    clearReactionTimer();
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
  }, [clearReactionTimer]);

  const updateLook = useCallback((event) => {
    if (reducedMotion || !stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));

    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      stageRef.current?.style.setProperty('--chie-look-rotate', `${(x * 0.22).toFixed(3)}deg`);
      stageRef.current?.style.setProperty('--chie-floor-glint-x', `${(50 + x * 14).toFixed(2)}%`);
    });
  }, [reducedMotion]);

  const resetLook = useCallback(() => {
    if (!stageRef.current) return;
    stageRef.current.style.setProperty('--chie-look-rotate', '0deg');
    stageRef.current.style.setProperty('--chie-floor-glint-x', '50%');
  }, []);

  return (
    <div className={styles.experience}>
      <div
        ref={stageRef}
        className={styles.stage}
        data-emotion={emotion}
        data-show-zones={showZones ? 'true' : 'false'}
        onPointerMove={updateLook}
        onPointerLeave={resetLook}
      >
        <div className={styles.telemetry} aria-hidden="true">
          <span>EMOTION TAG</span>
          <strong>{EMOTIONS[emotion].tag}</strong>
        </div>

        <div className={styles.dialogue} aria-live="polite">
          <span className={styles.dialogueName}>千惠 / Chie</span>
          <p>{line}</p>
        </div>

        <div
          className={styles.modelFrame}
          role="img"
          aria-label="千惠，十五六岁外观、黑色短发、粉紫眼睛、穿香芋紫宽松上衣的 AI 看板娘"
        >
          <div className={styles.ambientGlow} aria-hidden="true" />
          <div className={styles.glassPlatform} aria-hidden="true" />
          <div className={`${styles.contactShadow} ${styles.rearFootShadow}`} aria-hidden="true" />
          <div className={`${styles.contactShadow} ${styles.frontFootShadow}`} aria-hidden="true" />

          <div className={styles.lookLayer}>
            <div className={styles.breathLayer}>
              <img
                className={`${styles.sprite} ${styles.baseSprite}`}
                src={`${assetRoot}${EMOTIONS.idle.sprite}`}
                alt=""
                draggable="false"
              />
              {EXPRESSION_KEYS.map((key) => (
                <img
                  key={key}
                  className={`${styles.sprite} ${styles.expressionLayer} ${
                    emotion === key ? styles.expressionLayerActive : ''
                  }`}
                  src={`${assetRoot}${EMOTIONS[key].sprite}`}
                  alt=""
                  draggable="false"
                  aria-hidden="true"
                />
              ))}
              <img
                className={`${styles.sprite} ${styles.expressionLayer} ${styles.blinkLayer} ${
                  blinking ? styles.expressionLayerActive : ''
                }`}
                src={`${assetRoot}${BLINK_SPRITE}`}
                alt=""
                draggable="false"
                aria-hidden="true"
              />
              <img
                className={`${styles.sprite} ${styles.hairLayer}`}
                src={`${assetRoot}${EMOTIONS.idle.sprite}`}
                alt=""
                draggable="false"
                aria-hidden="true"
              />
              <img
                className={`${styles.sprite} ${styles.shirtLayer}`}
                src={`${assetRoot}${EMOTIONS.idle.sprite}`}
                alt=""
                draggable="false"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className={styles.hitZones}>
            <button
              type="button"
              className={`${styles.hitZone} ${styles.headZone}`}
              aria-label="摸摸千惠的头发"
              onClick={() => reactTo('head')}
            >
              <span>头发</span>
            </button>
            <button
              type="button"
              className={`${styles.hitZone} ${styles.faceZone}`}
              aria-label="点击千惠的脸"
              onClick={() => reactTo('face')}
            >
              <span>脸</span>
            </button>
            <button
              type="button"
              className={`${styles.hitZone} ${styles.figureZone}`}
              aria-label="和千惠互动"
              onClick={() => reactTo('figure')}
            >
              <span>全身</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.controls} aria-label="情绪预览控制">
        <div className={styles.emotionButtons}>
          {Object.entries(EMOTIONS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={emotion === key ? styles.emotionButtonActive : styles.emotionButton}
              onClick={() => selectEmotion(key)}
            >
              <span>{item.label}</span>
              <small>{item.tag}</small>
            </button>
          ))}
        </div>

        <label className={styles.zoneToggle}>
          <input
            type="checkbox"
            checked={showZones}
            onChange={(event) => setShowZones(event.target.checked)}
          />
          <span>显示交互热区</span>
        </label>
      </div>
    </div>
  );
}
