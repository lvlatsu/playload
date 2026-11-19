// @title STAR FLOW
// A quiet three-layer journey through space.

function makeStars(count, minSpeed, maxSpeed, glyph, color) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 160,
    y: Math.random() * 144,
    speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
    glyph,
    color,
  }));
}

const bg = makeStars(36, 0.12, 0.24, '.', 2);
const mg = makeStars(18, 0.35, 0.55, '*', 4);
const fg = makeStars(7, 0.9, 1.4, '+', 7);

function flow(layer, stars) {
  for (const star of stars) {
    star.x -= star.speed;
    if (star.x < -8) star.x = 160 + Math.random() * 24;
    layer.spr(star.x, star.y, star.glyph, star.color);
  }
}

function tick() {
  flow(BG, bg);
  flow(MG, mg);
  flow(FG, fg);
}
