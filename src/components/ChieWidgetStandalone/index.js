import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import {useLanguage} from '@site/src/context/LanguageContext';
import {CHIE_ASSETS, CHIE_REACTIONS} from '@site/src/data/chieMascot';
import {SeatedCycle} from './seated';
import './styles.css';

const COPY = {
  zh: {
    name: '千惠',
    alt: '千惠，黑色短发、粉紫色眼睛、穿香芋紫宽松上衣的 AI 看板娘',
    greeting: '你好啊，欢迎光临我主人的blog，我是千惠。',
    head: '别乱摸啊！发型都被你弄乱了！',
    face: '一直盯着我看干嘛，我脸上写着代码吗？',
    figure: '别乱碰！',
    labels: {head: '摸摸千惠的头发', face: '点击千惠的脸', figure: '和千惠互动'},
  },
  en: {
    name: 'CHIE',
    alt: 'Chie, an AI site companion with short black hair, pink-lilac eyes, and an oversized lilac top',
    greeting: "Hi, welcome to my master's blog page. My name is Chie.",
    head: "Hey—don't touch my hair! You messed it up.",
    face: 'Why are you staring? Is there code written on my face?',
    figure: 'Hands off!',
    labels: {head: "Pat Chie's hair", face: "Tap Chie's face", figure: 'Interact with Chie'},
  },
};

const EXPRESSIONS = ['shy', 'alert', 'annoyed'];
const SEATED_PARTS = ['chair', 'leg-left', 'leg-right', 'upper', 'knee'];

function Sprite({asset, className}) {
  return (
    <img
      className={`chie-sprite ${className}`}
      src={`/img/chie/${CHIE_ASSETS[asset]}`}
      alt=""
      draggable="false"
      decoding="async"
    />
  );
}

export default function ChieWidgetStandalone() {
  const {lang} = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [faceReady, setFaceReady] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [reaction, setReaction] = useState({name: 'idle', id: 0});
  const [message, setMessage] = useState(null);
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const cycleRef = useRef(null);
  const pointerRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncTheme = () => setTheme(
      document.documentElement.dataset.theme || (dark.matches ? 'dark' : 'light'),
    );
    const syncMotion = () => setReducedMotion(reduced.matches);
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
    dark.addEventListener('change', syncTheme);
    reduced.addEventListener('change', syncMotion);
    syncTheme();
    syncMotion();
    return () => {
      observer.disconnect();
      dark.removeEventListener('change', syncTheme);
      reduced.removeEventListener('change', syncMotion);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;
    let cancelled = false;
    const images = frameRef.current.querySelectorAll('.chie-shared-head img');
    // Decode before allowing a facial change; no empty frame on the first blink.
    Promise.all(Array.from(images, image => image.decode())).then(() => {
      if (!cancelled) setFaceReady(true);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return undefined;
    const cycle = new SeatedCycle(rootRef.current);
    cycleRef.current = cycle;
    let cancelled = false;
    if (!reducedMotion) {
      frameRef.current.querySelector('.chie-seated-upper').decode().then(() => {
        if (!cancelled && faceReady) cycle.start();
      }).catch(() => {}); // Keep standing if the seated asset cannot be decoded.
    }
    return () => {
      cancelled = true;
      cycle.destroy();
      cycleRef.current = null;
    };
  }, [mounted, reducedMotion, faceReady]);

  useEffect(() => {
    if (!mounted || reducedMotion) return undefined;
    const frameElement = frameRef.current;
    let frame;
    let previous = performance.now();
    let elapsed = 0;
    let value = 0;
    let velocity = 0;
    let gaze = 0;
    let gazeTarget = 0;
    const pickGaze = () => { gazeTarget = (Math.random() - 0.5) * 2.2; };
    pickGaze();
    const gazeTimer = setInterval(pickGaze, 6000);
    const scroll = () => { velocity += 0.5; };
    window.addEventListener('scroll', scroll, {passive: true});
    const loop = now => {
      const dt = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      elapsed += dt;
      velocity += (-0.08 * (value - pointerRef.current) - 0.35 * velocity) * dt;
      value = Math.max(-1, Math.min(1, value + velocity * dt));
      gaze += (gazeTarget - gaze) * Math.min(1, dt * 1.8);
      const sway = Math.sin(elapsed * Math.PI * 2 / 6.2) * 0.35;
      const strength = 1 - (cycleRef.current?.progress || 0) * 0.75;
      frameElement.style.setProperty('--chie-body-rotate', `${(value * 0.28 + sway + gaze * 0.35) * strength}deg`);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(gazeTimer);
      window.removeEventListener('scroll', scroll);
      frameElement.style.removeProperty('--chie-body-rotate');
    };
  }, [mounted, reducedMotion]);

  useEffect(() => {
    if (!faceReady) return undefined;
    let next;
    let end;
    const schedule = () => {
      next = setTimeout(() => {
        setBlinking(true);
        end = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 145);
      }, 2600 + Math.random() * 3800);
    };
    schedule();
    return () => {
      clearTimeout(next);
      clearTimeout(end);
    };
  }, [faceReady]);

  useEffect(() => {
    if (reaction.name === 'idle') return undefined;
    const timer = setTimeout(() => setReaction(current => ({...current, name: 'idle'})), 3120);
    return () => clearTimeout(timer);
  }, [reaction]);

  useEffect(() => {
    if (!mounted) return undefined;
    const timer = setTimeout(() => setMessage({key: 'greeting'}), 800);
    return () => clearTimeout(timer);
  }, [mounted, lang]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const react = zone => {
    cycleRef.current?.interact();
    if (faceReady) setReaction(current => ({name: CHIE_REACTIONS[zone].emotion, id: current.id + 1}));
    setMessage({key: zone});
  };

  if (!mounted) return null;

  return createPortal(
    <div id="chie-widget-root" className="chie-widget" data-theme={theme} ref={rootRef}>
      <div className={`chie-dialogue${message ? ' chie-dialogue-visible' : ''}`} role="status" aria-live="polite">
        <span className="chie-dialogue-name">{copy.name}</span>
        <p>{message ? copy[message.key] : ''}</p>
      </div>
      <div
        className="chie-model-frame"
        ref={frameRef}
        role="group"
        aria-label={copy.alt}
        onPointerMove={event => {
          const rect = event.currentTarget.getBoundingClientRect();
          pointerRef.current = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        }}
        onPointerLeave={() => { pointerRef.current = 0; }}
      >
        <div className="chie-character" aria-hidden="true">
          <div className="chie-bodies">
            <div className="chie-standing-body">
              <Sprite asset="idle" className="chie-standing-sprite" />
            </div>
            <div className="chie-seated-body">
              {SEATED_PARTS.map(part => (
                <Sprite key={part} asset="seatedA" className={`chie-seated-part chie-seated-${part}`} />
              ))}
            </div>
          </div>
          {/* One head stays opaque throughout both poses and their transitions. */}
          <div className="chie-shared-head" data-emotion={reaction.name} data-blinking={blinking}>
            <Sprite asset="idle" className="chie-head-base" />
            {EXPRESSIONS.map(emotion => (
              <Sprite key={emotion} asset={emotion} className={`chie-expression${reaction.name === emotion ? ' chie-expression-active' : ''}`} />
            ))}
            <Sprite asset="blink" className="chie-blink" />
          </div>
        </div>
        <div className="chie-hit-zones">
          {['head', 'face', 'figure'].map(zone => (
            <button key={zone} type="button" className={`chie-hit-zone chie-zone-${zone}`} aria-label={copy.labels[zone]} onClick={() => react(zone)} />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
