import assert from 'node:assert/strict';
import test from 'node:test';
import {SeatedCycle} from './seated.js';

function setup(t) {
  let now = 0;
  let id = 0;
  const timers = new Map();
  const frames = new Map();
  t.mock.method(performance, 'now', () => now);
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    timers.set(++id, {callback, due: now + delay});
    return id;
  });
  t.mock.method(globalThis, 'clearTimeout', key => timers.delete(key));
  t.mock.method(globalThis, 'requestAnimationFrame', callback => {
    frames.set(++id, callback);
    return id;
  });
  t.mock.method(globalThis, 'cancelAnimationFrame', key => frames.delete(key));
  const values = new Map();
  const root = {dataset: {}, style: {setProperty: (key, value) => values.set(key, value)}};
  const cycle = new SeatedCycle(root);
  return {
    cycle, root, values,
    pending: () => timers.size + frames.size,
    tick(ms) {
      now += ms;
      for (const [key, timer] of timers) {
        if (timer.due <= now) {
          timers.delete(key);
          timer.callback();
        }
      }
      const ready = [...frames.values()];
      frames.clear();
      ready.forEach(callback => callback(now));
    },
  };
}

// Node does not provide animation frames; mock them with the same clock as timers.
globalThis.requestAnimationFrame = () => {};
globalThis.cancelAnimationFrame = () => {};

test('sitting and rising finish on their final rendered pose, including a late frame', t => {
  const {cycle, root, values, tick} = setup(t);
  cycle.start();
  tick(8000);
  assert.equal(root.dataset.idlePhase, 'chair-in');
  tick(450);
  assert.equal(cycle.progress, 0.5);
  assert.equal(root.dataset.idlePhase, 'chair-in');
  tick(449);
  assert.ok(cycle.progress < 1);
  assert.equal(root.dataset.idlePhase, 'chair-in');
  tick(1);
  assert.equal(root.dataset.idlePhase, 'seated');
  assert.equal(cycle.progress, 1);
  assert.equal(values.get('--chie-standing-opacity'), 0);
  assert.equal(values.get('--chie-seated-opacity'), 1);
  tick(15000);
  assert.equal(root.dataset.idlePhase, 'chair-out');
  tick(450);
  assert.equal(cycle.progress, 0.5);
  tick(2000); // A stalled frame must settle exactly, without overshoot or a jump.
  assert.equal(root.dataset.idlePhase, 'standing');
  assert.equal(cycle.progress, 0);
  assert.equal(values.get('--chie-head-offset'), '0%');
  assert.equal(values.get('--chie-standing-opacity'), 1);
  tick(18000);
  assert.equal(root.dataset.idlePhase, 'chair-in');
});

test('facial interaction keeps the seated pose and does not interrupt a transition', t => {
  const {cycle, root, tick} = setup(t);
  cycle.start();
  tick(8000);
  tick(450);
  cycle.interact();
  assert.equal(cycle.progress, 0.5);
  assert.equal(root.dataset.idlePhase, 'chair-in');
  tick(450);
  tick(14000);
  cycle.interact();
  tick(1000);
  assert.equal(root.dataset.idlePhase, 'seated');
  assert.equal(cycle.progress, 1);
  tick(14000);
  assert.equal(root.dataset.idlePhase, 'chair-out');
});

test('unmount cancels a transition and its next cycle', t => {
  const {cycle, pending, tick} = setup(t);
  cycle.start();
  tick(8000);
  tick(300);
  const previous = cycle.progress;
  cycle.destroy();
  assert.equal(pending(), 0);
  tick(60000);
  assert.equal(cycle.progress, previous);
  assert.equal(pending(), 0);
});
