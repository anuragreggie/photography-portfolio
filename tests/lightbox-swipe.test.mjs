import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await fs.readFile(
  new URL('../app/components/Lightbox/swipe.ts', import.meta.url),
  'utf8'
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
});
const { SwipeGesture } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
const touch = (x, y = 100, identifier = 1) => ({
  identifier,
  clientX: x,
  clientY: y,
});

function gesture(end, duration = 200) {
  const swipe = new SwipeGesture();
  swipe.start([touch(150)], 0);
  return swipe.end([end], 0, duration);
}

test('horizontal swipes navigate once in either direction', () => {
  assert.equal(gesture(touch(50)), 'next');
  assert.equal(gesture(touch(250)), 'previous');
  const swipe = new SwipeGesture();
  swipe.start([touch(150)], 0);
  assert.equal(swipe.end([touch(50)], 0, 200), 'next');
  assert.equal(swipe.end([touch(50)], 0, 200), null);
});

test('taps, small movements, diagonals and long presses do not navigate', () => {
  for (const point of [touch(150), touch(120), touch(50, 200)]) {
    assert.equal(gesture(point), null);
  }
  assert.equal(gesture(touch(50), 1000), null);
});

test('a vertical gesture stays cancelled even if it ends horizontally', () => {
  const swipe = new SwipeGesture();
  swipe.start([touch(150)], 0);
  swipe.move([touch(150, 140)]);
  assert.equal(swipe.end([touch(50)], 0, 200), null);
});

test('pinches and cancelled touches cannot turn into navigation', () => {
  const swipe = new SwipeGesture();
  swipe.start([touch(150)], 0);
  swipe.move([touch(150), touch(180, 100, 2)]);
  assert.equal(swipe.end([touch(50)], 0, 200), null);
  swipe.start([touch(150), touch(180, 100, 2)], 0);
  assert.equal(swipe.end([touch(50)], 0, 200), null);
  swipe.start([touch(150)], 0);
  assert.equal(swipe.end([touch(50)], 1, 200), null);
  swipe.start([touch(150)], 0);
  swipe.cancel();
  assert.equal(swipe.end([touch(50)], 0, 200), null);
});

test('zoomed panning and mismatched fingers do not navigate', () => {
  const swipe = new SwipeGesture();
  swipe.start([touch(150)], 0, 2);
  assert.equal(swipe.end([touch(50)], 0, 200), null);
  swipe.start([touch(150)], 0);
  assert.equal(swipe.end([touch(50)], 0, 200, 2), null);
  swipe.start([touch(150)], 0);
  assert.equal(swipe.end([touch(50, 100, 2)], 0, 200), null);
});

test('touch coordinates can be inherited DOM getters', () => {
  const point = Object.create({ identifier: 1, clientX: 150, clientY: 100 });
  const swipe = new SwipeGesture();
  swipe.start([point], 0);
  assert.equal(swipe.end([touch(50)], 0, 200), 'next');
});
