// Generate the hand-drawn track sketches in assets/tracks/ with rough.js.
// Run: node tools/make-sketches.js
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const ctx = { window: {}, self: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'vendor/rough.min.js'), 'utf8'), ctx);
const g = ctx.rough.generator();

const W = 640, H = 400;
const BG = '#14201b', GRID = '#22312a', INK = '#eef2ef', AMBER = '#f2b705', GREEN = '#43b06e', MUTED = '#a3b1a9';
const base = { roughness: 1.15, bowing: 1, strokeWidth: 2.3, stroke: INK };

function sketch(seed) {
  const parts = [];
  let n = 0;
  const add = (drawable) => {
    for (const p of g.toPaths(drawable)) {
      const fill = p.fill && p.fill !== 'none' ? p.fill : 'none';
      parts.push(`<path d="${p.d.replace(/(\d+\.\d{2})\d+/g, '$1')}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${fill}"/>`);
    }
  };
  const o = (extra = {}) => ({ ...base, seed: seed + (n += 7), ...extra });
  return {
    parts,
    line: (x1, y1, x2, y2, e) => add(g.line(x1, y1, x2, y2, o(e))),
    rect: (x, y, w, h, e) => add(g.rectangle(x, y, w, h, o(e))),
    circle: (x, y, d, e) => add(g.circle(x, y, d, o(e))),
    ellipse: (x, y, w, h, e) => add(g.ellipse(x, y, w, h, o(e))),
    poly: (pts, e) => add(g.polygon(pts, o(e))),
    lines: (pts, e) => add(g.linearPath(pts, o(e))),
    curve: (pts, e) => add(g.curve(pts, o(e))),
    path: (d, e) => add(g.path(d, o(e))),
    dashed: (d, color = AMBER) => parts.push(`<path d="${d}" stroke="${color}" stroke-width="2.2" fill="none" stroke-dasharray="7 8" stroke-linecap="round"/>`),
    text: (x, y, str, color = MUTED, size = 15, extra = '') => parts.push(`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" ${extra}>${str}</text>`),
  };
}

function svg(title, s) {
  let grid = '';
  for (let x = 32; x < W; x += 32) grid += `M${x} 0V${H}`;
  for (let y = 32; y < H; y += 32) grid += `M0 ${y}H${W}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title}">
<rect width="${W}" height="${H}" fill="${BG}"/>
<path d="${grid}" stroke="${GRID}" stroke-width="1"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace" letter-spacing="1.5">
${s.parts.join('\n')}
</g>
</svg>
`;
}

// 01 Build Sprint: 3D printer building a drone frame from a sketched plan
function buildSprint() {
  const s = sketch(101);
  // printer frame
  s.rect(150, 300, 260, 28);
  s.line(176, 300, 176, 70); s.line(384, 300, 384, 70);
  s.line(166, 74, 394, 74);
  s.line(176, 150, 384, 150, { strokeWidth: 2 });
  s.rect(255, 132, 50, 34);
  s.poly([[268, 166], [292, 166], [280, 190]]);
  // print bed and the half-printed frame
  s.rect(200, 262, 160, 10);
  s.poly([[222, 262], [338, 262], [326, 222], [234, 222]], { stroke: AMBER });
  for (let y = 230; y < 262; y += 8) s.line(232 - (y - 230) * 0.2, y, 328 + (y - 230) * 0.2, y, { stroke: AMBER, strokeWidth: 1.4, roughness: 0.8 });
  // nozzle glow
  s.line(280, 196, 280, 214, { stroke: AMBER, strokeWidth: 1.6 });
  s.line(268, 200, 260, 210, { stroke: AMBER, strokeWidth: 1.6 });
  s.line(292, 200, 300, 210, { stroke: AMBER, strokeWidth: 1.6 });
  // plan: drone top view
  const cx = 520, cy = 150;
  s.rect(cx - 18, cy - 18, 36, 36, { stroke: AMBER });
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    s.line(cx + dx * 18, cy + dy * 18, cx + dx * 52, cy + dy * 52, { stroke: AMBER });
    s.circle(cx + dx * 60, cy + dy * 60, 44, { stroke: INK, strokeWidth: 1.8 });
  }
  s.line(452, 248, 588, 248, { strokeWidth: 1.4 });
  s.line(452, 240, 452, 256, { strokeWidth: 1.4 }); s.line(588, 240, 588, 256, { strokeWidth: 1.4 });
  s.text(488, 274, '220 MM');
  s.dashed('M470 205 C 430 230, 410 250, 345 245');
  // sprint note
  s.rect(38, 60, 92, 70, { stroke: AMBER, strokeWidth: 1.8 });
  s.text(50, 90, '2 WEEK', AMBER, 14);
  s.text(50, 112, 'SPRINT', AMBER, 14);
  s.text(40, 362, 'BUILD SPRINT / V1', MUTED, 14);
  return svg('Hand-drawn sketch of a 3D printer building a drone frame from a plan', s);
}

// 02 Bring Your Own: a field-tested prototype on the demo table, annotated
function bringYourOwn() {
  const s = sketch(202);
  // table
  s.line(50, 306, 590, 306);
  s.line(80, 306, 80, 360); s.line(560, 306, 560, 360);
  // laptop
  s.poly([[70, 300], [190, 300], [172, 282], [88, 282]]);
  s.poly([[92, 282], [170, 282], [178, 210], [100, 210]]);
  s.circle(140, 246, 10, { stroke: AMBER, fill: AMBER, fillStyle: 'solid' });
  s.curve([[108, 262], [124, 240], [140, 246], [160, 228]], { stroke: AMBER, strokeWidth: 1.6 });
  // main prototype box
  s.rect(230, 196, 190, 110);
  s.rect(250, 214, 96, 58);
  s.lines([[256, 248], [270, 248], [278, 228], [288, 262], [298, 236], [308, 248], [340, 248]], { stroke: AMBER, strokeWidth: 1.8 });
  s.circle(378, 228, 22); s.circle(378, 270, 22);
  s.line(398, 196, 432, 92);
  s.circle(433, 88, 10, { stroke: AMBER });
  for (const r of [26, 44]) s.path(`M${433 + r * 0.7} ${88 - r * 0.7} A ${r} ${r} 0 0 1 ${433 + r * 0.7} ${88 + r * 0.7}`, { stroke: AMBER, strokeWidth: 1.6 });
  // handheld node
  s.rect(468, 252, 52, 54);
  s.line(508, 252, 516, 214);
  s.circle(494, 280, 14, { stroke: AMBER });
  // annotations
  s.dashed('M300 196 C 300 160, 250 140, 214 130', MUTED);
  s.text(120, 128, 'TELEMETRY', MUTED, 14);
  s.text(486, 72, 'MESH LINK', AMBER, 14);
  s.circle(560, 196, 54, { stroke: AMBER });
  s.text(546, 202, 'v2', AMBER, 20, 'font-style="italic" letter-spacing="0"');
  s.dashed('M533 200 C 520 210, 515 225, 512 240', AMBER);
  s.text(40, 386, 'BRING YOUR OWN / FIELD-TESTED', MUTED, 14);
  return svg('Hand-drawn sketch of an annotated field prototype with an antenna, display, and laptop on a demo table', s);
}

// 03 Field Solutions: field notebook with a checklist and a marked route
function fieldSolutions() {
  const s = sketch(303);
  // notebook
  s.poly([[96, 76], [318, 62], [320, 336], [104, 346]]);
  s.poly([[320, 62], [548, 78], [540, 344], [320, 336]]);
  s.line(320, 62, 320, 336, { strokeWidth: 2.6 });
  // checklist
  s.text(124, 108, 'WORKAROUND', AMBER, 14);
  for (let i = 0; i < 5; i++) {
    const y = 140 + i * 38;
    s.rect(126, y - 12, 16, 16, { strokeWidth: 1.8 });
    s.line(156, y - 4, 280 - (i % 2) * 34, y - 6, { strokeWidth: 1.8, stroke: MUTED });
    if (i < 3) s.lines([[124, y - 6], [132, y + 3], [148, y - 18]], { stroke: AMBER, strokeWidth: 2.2 });
  }
  // map contours
  s.ellipse(430, 200, 170, 110, { stroke: GREEN, strokeWidth: 1.5 });
  s.ellipse(436, 196, 110, 64, { stroke: GREEN, strokeWidth: 1.5 });
  s.ellipse(440, 192, 48, 26, { stroke: GREEN, strokeWidth: 1.5 });
  s.curve([[332, 300], [380, 280], [420, 300], [470, 286], [530, 300]], { stroke: GREEN, strokeWidth: 1.5 });
  // route
  s.dashed('M350 312 C 380 290, 360 250, 395 236 S 470 250, 488 196 S 500 130, 516 112');
  for (const [x, y] of [[350, 312], [395, 236], [488, 196]]) s.circle(x, y, 12, { stroke: AMBER, fill: BG, fillStyle: 'solid' });
  s.line(506, 102, 526, 122, { stroke: AMBER, strokeWidth: 3 });
  s.line(526, 102, 506, 122, { stroke: AMBER, strokeWidth: 3 });
  // compass
  s.circle(362, 112, 40, { strokeWidth: 1.6 });
  s.poly([[362, 88], [368, 112], [362, 108], [356, 112]], { stroke: AMBER, fill: AMBER, fillStyle: 'solid', strokeWidth: 1.4 });
  s.text(356, 82, 'N', INK, 13);
  // pencil
  s.poly([[452, 372], [600, 300], [610, 318], [462, 390]]);
  s.poly([[452, 372], [462, 390], [436, 392]], { stroke: AMBER });
  s.line(586, 307, 596, 325, { strokeWidth: 1.6 });
  return svg('Hand-drawn field notebook with a workaround checklist and a map marking a route', s);
}

const out = path.join(root, 'assets/tracks');
fs.writeFileSync(path.join(out, 'sketch-build-sprint.svg'), buildSprint());
fs.writeFileSync(path.join(out, 'sketch-bring-your-own.svg'), bringYourOwn());
fs.writeFileSync(path.join(out, 'sketch-field-solutions.svg'), fieldSolutions());
console.log('wrote sketches to', out);
