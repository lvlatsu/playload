import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createEngine } from '../src/engine/engine.js';
import { glyphs } from '../src/engine/glyphs.js';
import { compileScore } from '../src/engine/sound.js';
import { encode } from '../src/payload.js';

test('STAR FLOW uses the PLU math API, animates all three layers and shifts its palette', async () => {
  const source = await readFile(new URL('../examples/star-flow.js', import.meta.url), 'utf8');
  const engine = createEngine(glyphs, compileScore);
  const game = new Function(
    ...Object.keys(engine.api),
    source + '\nreturn { tick, state: () => ({ bg, mg, fg }) };',
  )(...Object.values(engine.api));

  assert.equal(game.state().bg.length, 36);
  assert.equal(game.state().mg.length, 18);
  assert.equal(game.state().fg.length, 7);
  assert(game.state().bg.every((star) => star.speed >= 0.12 && star.speed < 0.24));
  assert(game.state().mg.every((star) => star.speed >= 0.35 && star.speed < 0.55));
  assert(game.state().fg.every((star) => star.speed >= 0.9 && star.speed < 1.4));

  const before = structuredClone(game.state());
  const standard = engine.palette;
  engine.step(game.tick);
  const after = game.state();
  assert(after.bg[0].x < before.bg[0].x);
  assert(after.mg[0].x < before.mg[0].x);
  assert(after.fg[0].x < before.fg[0].x);
  assert(engine.pixels.includes(2));
  assert(engine.pixels.includes(4));
  assert(engine.pixels.includes(7));
  assert.notDeepEqual(engine.palette[2], standard[2]);
  assert.notDeepEqual(engine.palette[4], standard[4]);
  assert.notDeepEqual(engine.palette[7], standard[7]);

  after.bg[0].x = -9;
  engine.step(game.tick);
  assert(after.bg[0].x > 160, 'Stars re-enter from the right edge after leaving the screen.');

  const payload = await encode(source);
  assert(payload.bytes <= 3000);
});
