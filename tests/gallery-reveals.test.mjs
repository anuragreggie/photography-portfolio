import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await fs.readFile(
  new URL('../app/utils/gallery-reveals.ts', import.meta.url),
  'utf8'
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
});
const { observeGalleryReveals } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

function browser(t, { reducedMotion = false } = {}) {
  const observers = [];
  const mutations = [];
  const listeners = new Map();
  class Element {
    animations = [];
    isConnected = true;
    image = null;
    top = 500;
    querySelector() {
      return this.image;
    }
    getBoundingClientRect() {
      return { top: this.top, bottom: this.top + 300 };
    }
    contains(node) {
      return node === this;
    }
    animate(keyframes, options) {
      const animation = {
        keyframes,
        options,
        cancelled: false,
        cancel() {
          this.cancelled = true;
          this.oncancel?.();
        },
      };
      this.animations.push(animation);
      return animation;
    }
  }
  class Observer {
    observed = new Set();
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe(element) {
      this.observed.add(element);
    }
    unobserve(element) {
      this.observed.delete(element);
    }
    disconnect() {
      this.observed.clear();
      this.disconnected = true;
    }
    deliver(...entries) {
      this.callback(entries);
    }
  }
  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
      mutations.push(this);
    }
    observe() {}
    disconnect() {
      this.disconnected = true;
    }
    deliver() {
      this.callback([]);
    }
  }
  const document = {
    activeElement: null,
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name) => listeners.delete(name),
  };
  const globals = {
    Element,
    Node: Element,
    IntersectionObserver: Observer,
    MutationObserver,
    document,
    window: {
      innerHeight: 900,
      matchMedia: () => ({ matches: reducedMotion }),
    },
  };
  for (const [key, value] of Object.entries(globals)) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value,
      writable: true,
    });
    t.after(() => {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    });
  }
  return { Element, observers, mutations, listeners, document };
}
const entry = (target, top, isIntersecting = false) => ({
  target,
  boundingClientRect: { top },
  isIntersecting,
});

test('initial and restored content stay still; incoming photos reveal once', (t) => {
  const env = browser(t);
  const visible = new env.Element();
  const above = new env.Element();
  const incoming = new env.Element();
  const stop = observeGalleryReveals([visible, above, incoming]);
  const observer = env.observers[0];
  observer.deliver(
    entry(visible, 100, true),
    entry(above, -1200),
    entry(incoming, 1200)
  );
  assert.equal(visible.animations.length, 0);
  assert.equal(above.animations.length, 0);
  assert.deepEqual([...observer.observed], [incoming]);
  observer.deliver(entry(incoming, 840, true));
  observer.deliver(entry(incoming, 500, true));
  assert.equal(incoming.animations.length, 1);
  const animation = incoming.animations[0];
  assert.deepEqual(Object.keys(animation.keyframes[0]).sort(), [
    'opacity',
    'transform',
  ]);
  animation.onfinish();
  assert.equal(animation.cancelled, true);
  stop();
  assert.equal(env.listeners.size, 0);
  assert.equal(observer.disconnected, true);
});

test('fast jumps and keyboard-focused content do not animate', (t) => {
  const env = browser(t);
  const jumped = new env.Element();
  const focused = new env.Element();
  const stop = observeGalleryReveals([jumped, focused]);
  const observer = env.observers[0];
  observer.deliver(entry(jumped, 1200), entry(focused, 1500));
  env.document.activeElement = focused;
  observer.deliver(entry(jumped, -50, true), entry(focused, 300, true));
  assert.equal(jumped.animations.length, 0);
  assert.equal(focused.animations.length, 0);
  stop();
});

test('focus and teardown cancel active animations and ignore queued observer entries', (t) => {
  const env = browser(t);
  const one = new env.Element();
  const two = new env.Element();
  const stop = observeGalleryReveals([one, two]);
  const observer = env.observers[0];
  observer.deliver(entry(one, 1200), entry(two, 1500));
  observer.deliver(entry(one, 700, true), entry(two, 850, true));
  env.listeners.get('focusin')({ target: one });
  assert.equal(one.animations[0].cancelled, true);
  stop();
  assert.equal(two.animations[0].cancelled, true);
  observer.deliver(entry(two, 600, true));
  assert.equal(two.animations.length, 1);
});

test('reduced motion and missing browser APIs leave content untouched', (t) => {
  const env = browser(t, { reducedMotion: true });
  const element = new env.Element();
  observeGalleryReveals([element])();
  assert.equal(env.observers.length, 0);
  assert.equal(element.animations.length, 0);
  globalThis.IntersectionObserver = undefined;
  observeGalleryReveals([element])();
  assert.equal(env.listeners.size, 0);
});

function unloadedImage() {
  const listeners = new Map();
  return {
    complete: false,
    naturalWidth: 0,
    listeners,
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
}

test('lazy photos reveal after loading, rather than animating empty space', (t) => {
  const env = browser(t);
  const element = new env.Element();
  element.image = unloadedImage();
  const stop = observeGalleryReveals([element]);
  const observer = env.observers[0];
  observer.deliver(entry(element, 1200));
  observer.deliver(entry(element, 800, true));
  assert.equal(element.animations.length, 0);
  element.image.listeners.get('load')();
  assert.equal(element.animations.length, 1);
  assert.equal(element.image.listeners.size, 0);
  stop();
});

test('late images outside the viewport and disposed listeners never animate', (t) => {
  const env = browser(t);
  const one = new env.Element();
  const two = new env.Element();
  one.image = unloadedImage();
  two.image = unloadedImage();
  const stop = observeGalleryReveals([one, two]);
  const observer = env.observers[0];
  observer.deliver(entry(one, 1200), entry(two, 1500));
  observer.deliver(entry(one, 700, true), entry(two, 800, true));
  one.top = -500;
  one.image.listeners.get('load')();
  assert.equal(one.animations.length, 0);
  const late = two.image.listeners.get('load');
  stop();
  assert.equal(two.image.listeners.size, 0);
  late();
  assert.equal(two.animations.length, 0);
});

test('photo buttons added by responsive layout are registered after initial mount', (t) => {
  const env = browser(t);
  const root = new env.Element();
  let children = [];
  root.querySelectorAll = () => children;
  const stop = observeGalleryReveals([], root);
  const photo = new env.Element();
  children = [photo];
  env.mutations[0].deliver();
  assert.ok(env.observers[0].observed.has(photo));
  env.observers[0].deliver(entry(photo, 1200));
  env.observers[0].deliver(entry(photo, 800, true));
  assert.equal(photo.animations.length, 1);
  env.mutations[0].deliver();
  assert.equal(env.observers[0].observed.size, 0);
  stop();
  assert.equal(env.mutations[0].disconnected, true);
});
