const TRANSITION_MS = 900;
const ease = value => value * value * (3 - 2 * value);

// The head and both bodies use the same progress, including the final frame.
export class SeatedCycle {
  constructor(root) {
    this.root = root;
    this.progress = 0;
    this.phase = 'standing';
    this.timer = null;
    this.frame = null;
    this.active = false;
    this.render();
    this.root.dataset.idlePhase = this.phase;
  }

  start() {
    this.active = true;
    this.schedule(8000, 1);
  }

  schedule(delay, target) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.transition(target), delay);
  }

  transition(target) {
    if (!this.active) return;
    clearTimeout(this.timer);
    cancelAnimationFrame(this.frame);
    const from = this.progress;
    const started = performance.now();
    this.phase = target ? 'chair-in' : 'chair-out';
    this.root.dataset.idlePhase = this.phase;
    const step = now => {
      const time = Math.min(1, (now - started) / TRANSITION_MS);
      this.progress = from + (target - from) * ease(time);
      this.render();
      if (time < 1) {
        this.frame = requestAnimationFrame(step);
      } else {
        this.frame = null;
        this.phase = target ? 'seated' : 'standing';
        this.root.dataset.idlePhase = this.phase;
        this.schedule(target ? 15000 : 18000, target ? 0 : 1);
      }
    };
    this.frame = requestAnimationFrame(step);
  }

  render() {
    const progress = this.progress;
    // Keep the dissolve short; the head never participates in the dissolve.
    const blend = ease(Math.max(0, Math.min(1, (progress - 0.28) / 0.44)));
    const style = this.root.style;
    style.setProperty('--chie-seat-progress', progress);
    style.setProperty('--chie-head-offset', `${progress * 2.65}%`);
    style.setProperty('--chie-seated-offset', `${(progress - 1) * 2.65}%`);
    style.setProperty('--chie-standing-opacity', 1 - blend);
    style.setProperty('--chie-seated-opacity', blend);
  }

  interact() {
    if (!this.active) return;
    // React in the current pose. Never teleport to standing during a blink/click.
    if (this.phase === 'standing') this.schedule(18000, 1);
    if (this.phase === 'seated') this.schedule(15000, 0);
  }

  destroy() {
    this.active = false;
    clearTimeout(this.timer);
    cancelAnimationFrame(this.frame);
  }
}
