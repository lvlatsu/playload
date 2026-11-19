// @title STAR FLOW
// Three layers of stars, with a palette that slowly drifts from day to night.
// Try changing the star counts, speeds, or the colors below.

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

const skyColors = [
  [[100, 105, 100], [18, 20, 48]],
  [[80, 140, 215], [50, 65, 145]],
  [[220, 245, 255], [150, 175, 235]],
];
let phase = 1;

function blend(day, night, amount) {
  return day.map((value, i) => Math.round(value + (night[i] - value) * amount));
}

function flow(layer, stars) {
  for (const star of stars) {
    star.x -= star.speed;
    if (star.x < -8) star.x = 160 + Math.random() * 24;
    layer.spr(star.x, star.y, star.glyph, star.color);
  }
}

function tick() {
  phase += 0.006;
  const night = (1 - Math.cos(phase)) / 2;
  ucpl
    .set(2, ...blend(skyColors[0][0], skyColors[0][1], night))
    .set(4, ...blend(skyColors[1][0], skyColors[1][1], night))
    .set(7, ...blend(skyColors[2][0], skyColors[2][1], night));

  flow(BG, bg);
  flow(MG, mg);
  flow(FG, fg);
}
