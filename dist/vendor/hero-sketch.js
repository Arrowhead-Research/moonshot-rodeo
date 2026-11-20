(() => {
  const board = document.querySelector('.hero-sketch');
  const sketch = rough.svg(board);
  const ink = '#23384a';
  const accent = '#315d81';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let delay = 160;

  function animate(element, frames, duration) {
    if (!reducedMotion) {
      element.animate(frames, { duration, delay, fill: 'backwards', easing: 'ease-out' });
    }
    delay += duration;
  }

  function draw(path, duration, stroke = ink) {
    const group = sketch.path(path, { stroke, strokeWidth: 2.6, roughness: 1.2, seed: 27 });
    board.append(group);
    for (const line of group.querySelectorAll('path')) {
      const length = line.getTotalLength();
      animate(line, [
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDasharray: length, strokeDashoffset: 0 }
      ], duration);
    }
  }

  function label(x, y, value, color = ink) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    element.setAttribute('x', x);
    element.setAttribute('y', y);
    element.setAttribute('fill', color);
    element.textContent = value;
    board.append(element);
    animate(element, [{ opacity: 0 }, { opacity: 1 }], 300);
  }

  draw('M70 160 L154 160 L154 219 L70 219 Z M112 160 L112 114 M101 125 L112 114 L123 125', 520);
  draw('M91 117 Q112 94 133 117 M83 107 Q112 77 141 107', 260, accent);
  label(72, 249, 'field node');
  draw('M184 177 L248 139 L276 214 Z', 650, accent);
  draw('M184 169 A8 8 0 1 0 184 185 A8 8 0 1 0 184 169 M248 131 A8 8 0 1 0 248 147 A8 8 0 1 0 248 131 M276 206 A8 8 0 1 0 276 222 A8 8 0 1 0 276 206', 380);
  label(198, 117, 'LoRa mesh', accent);
  draw('M294 184 L357 184 M346 174 L358 184 L346 194', 470);
  draw('M393 162 L427 162 L437 181 L410 189 L383 181 Z M393 165 L371 143 L352 143 M427 165 L450 143 L470 143 M389 181 L370 199 L351 199 M432 181 L451 199 L470 199', 850);
  label(372, 230, 'field test');
  draw('M435 249 Q405 290 341 288 M354 278 L339 288 L353 298', 540);
  label(229, 294, 'feedback', accent);
  draw('M217 286 L166 286 M178 276 L166 286 L178 296', 430, accent);
  label(114, 293, 'v2', accent);
  draw('M107 307 C79 282 108 257 142 269 C170 282 158 313 122 313 Z', 480, accent);
})();
