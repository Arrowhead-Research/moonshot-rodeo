(() => {
  const board = document.querySelector('.hero-sketch');
  const sketch = rough.svg(board);
  const ink = '#23384a';
  const accent = '#315d81';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svgNS = 'http://www.w3.org/2000/svg';
  const strokes = document.createElementNS(svgNS, 'g');
  const animations = [];
  let delay = 160;

  board.append(strokes);

  function animate(element, frames, duration) {
    animations.push({ element, frames, start: delay, end: delay + duration });
    delay += duration;
  }

  function draw(path, duration, stroke = ink) {
    const group = sketch.path(path, { stroke, strokeWidth: 2.6, roughness: 1.2, seed: 27 });
    strokes.append(group);
    for (const line of group.querySelectorAll('path')) {
      const length = line.getTotalLength();
      animate(line, [
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDasharray: length, strokeDashoffset: 0 }
      ], duration);
    }
  }

  function drawVersion(x, y) {
    const element = document.createElementNS(svgNS, 'text');
    element.setAttribute('x', x);
    element.setAttribute('y', y);
    element.setAttribute('fill', accent);
    element.textContent = 'v2';
    strokes.append(element);
    animate(element, [{ opacity: 0 }, { opacity: 1 }], 300);
  }

  draw('M70 160 L154 160 L154 219 L70 219 Z M112 160 L112 114 M101 125 L112 114 L123 125', 700);
  draw('M91 117 Q112 94 133 117 M83 107 Q112 77 141 107', 260, accent);
  draw('M184 177 L248 139 L276 214 Z', 900, accent);
  draw('M184 169 A8 8 0 1 0 184 185 A8 8 0 1 0 184 169 M248 131 A8 8 0 1 0 248 147 A8 8 0 1 0 248 131 M276 206 A8 8 0 1 0 276 222 A8 8 0 1 0 276 206', 380);
  draw('M294 184 L357 184 M346 174 L358 184 L346 194', 470);
  draw('M393 162 L427 162 L437 181 L410 189 L383 181 Z M393 165 L371 143 L352 143 M427 165 L450 143 L470 143 M389 181 L370 199 L351 199 M432 181 L451 199 L470 199', 1100);
  draw('M435 220 Q408 287 260 286', 750);
  draw('M260 286 L166 286 M178 276 L166 286 L178 296', 430, accent);
  drawVersion(114, 293);
  draw('M107 307 C79 282 108 257 142 269 C170 282 158 313 122 313 Z', 650, accent);

  if (reducedMotion) return;

  // Shrink the visible area from right to left, like wiping the board.
  const clip = document.createElementNS(svgNS, 'clipPath');
  clip.id = 'hero-sketch-wipe';
  const wipe = document.createElementNS(svgNS, 'rect');
  wipe.setAttribute('width', '500');
  wipe.setAttribute('height', '340');
  clip.append(wipe);
  board.prepend(clip);
  strokes.setAttribute('clip-path', 'url(#hero-sketch-wipe)');

  const eraseStart = delay + 1800;
  const eraseEnd = eraseStart + 950;
  const cycle = eraseEnd + 650;
  const timing = { duration: cycle, iterations: Infinity };
  for (const { element, frames: [first, last], start, end } of animations) {
    element.animate([
      { ...first, offset: 0 },
      { ...first, offset: start / cycle, easing: 'ease-out' },
      { ...last, offset: end / cycle },
      { ...last, offset: 1 }
    ], timing);
  }
  wipe.animate([
    { transform: 'scaleX(1)', offset: 0 },
    { transform: 'scaleX(1)', offset: eraseStart / cycle },
    { transform: 'scaleX(0)', offset: eraseEnd / cycle },
    { transform: 'scaleX(0)', offset: 1 }
  ], timing);
})();
