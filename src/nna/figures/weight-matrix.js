// FIGURE 2 — Editable weight matrix.

import { animate } from 'animejs';
import { shimmer } from '../../lib/ambient.js';
import { palette } from '../../lib/theme.js';

const NS = 'http://www.w3.org/2000/svg';
const SIZE = 5;
const CELL = 64;
const PAD = 4;
const ORIGIN = { x: 80, y: 50 };

export function mountWeightMatrix(rootSel) {
  const p = palette();
  const svg = document.querySelector(rootSel);
  const W = ORIGIN.x + SIZE * (CELL + PAD) + 130;     // room for Σ label
  const H = ORIGIN.y + SIZE * (CELL + PAD) + 60;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  const rows = Array.from({ length: SIZE }, () => {
    const r = Array.from({ length: SIZE }, () => 0.1 + Math.random());
    const s = r.reduce((a, b) => a + b, 0);
    return r.map(v => v / s);
  });

  for (let i = 0; i < SIZE; i++) {
    svg.appendChild(text(ORIGIN.x - 18, ORIGIN.y + i * (CELL + PAD) + CELL / 2 + 4, `${i}`, 'middle', p.inkFaint));
    svg.appendChild(text(ORIGIN.x + i * (CELL + PAD) + CELL / 2, ORIGIN.y - 14, `${i}`, 'middle', p.inkFaint));
  }
  svg.appendChild(text(ORIGIN.x, ORIGIN.y - 30, 'click any cell to bump its weight', 'start', p.inkDim, 11));

  const cells = [];
  const cellValTexts = [];
  const sumTexts = [];

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const x = ORIGIN.x + j * (CELL + PAD);
      const y = ORIGIN.y + i * (CELL + PAD);

      const rect = el('rect');
      rect.setAttribute('x', x); rect.setAttribute('y', y);
      rect.setAttribute('width', CELL); rect.setAttribute('height', CELL);
      rect.setAttribute('rx', 4);
      rect.setAttribute('fill', p.accent);
      rect.setAttribute('fill-opacity', rows[i][j].toFixed(3));
      rect.setAttribute('stroke', p.rule);
      rect.style.cursor = 'pointer';
      svg.appendChild(rect);
      cells.push(rect);

      const val = text(x + CELL / 2, y + CELL / 2 + 4, rows[i][j].toFixed(2), 'middle',
                       rows[i][j] > 0.4 ? p.fgOnAccent : p.fgOnFig, 12);
      val.style.pointerEvents = 'none';
      val.style.fontFamily = 'ui-monospace, monospace';
      svg.appendChild(val);
      cellValTexts.push(val);

      rect.addEventListener('click', () => bumpCell(i, j));
    }
    const s = text(ORIGIN.x + SIZE * (CELL + PAD) + 16,
                   ORIGIN.y + i * (CELL + PAD) + CELL / 2 + 5,
                   'Σ = 1.00', 'start', p.accentWarm, 13);
    s.style.fontFamily = 'ui-monospace, monospace';
    svg.appendChild(s);
    sumTexts.push(s);
  }

  function cellRect(i, j) { return cells[i * SIZE + j]; }
  function cellText(i, j) { return cellValTexts[i * SIZE + j]; }

  function bumpCell(i, j) {
    const old = rows[i][j];
    const target = Math.min(0.95, old + Math.max(0.05, (1 - old) * 0.35));
    const delta = target - old;
    const othersSum = 1 - old;
    rows[i][j] = target;
    for (let k = 0; k < SIZE; k++) {
      if (k === j) continue;
      const share = othersSum > 0 ? rows[i][k] / othersSum : 1 / (SIZE - 1);
      rows[i][k] = Math.max(0.001, rows[i][k] - delta * share);
    }
    const s = rows[i].reduce((a, b) => a + b, 0);
    rows[i] = rows[i].map(v => v / s);

    for (let k = 0; k < SIZE; k++) {
      animate(cellRect(i, k), { fillOpacity: rows[i][k], duration: 420, ease: 'outCubic' });
      const tnode = cellText(i, k);
      const start = parseFloat(tnode.textContent);
      const end = rows[i][k];
      const obj = { v: start };
      animate(obj, {
        v: end, duration: 420, ease: 'outCubic',
        onUpdate: () => {
          tnode.textContent = obj.v.toFixed(2);
          tnode.setAttribute('fill', obj.v > 0.4 ? p.fgOnAccent : p.fgOnFig);
        },
      });
    }
    sumTexts[i].textContent = `Σ = ${rows[i].reduce((a, b) => a + b, 0).toFixed(2)}`;
    animate(sumTexts[i], {
      opacity: [{ to: 0.4, duration: 100 }, { to: 1, duration: 400 }],
      ease: 'outQuad',
    });
  }

  shimmer(cells, { period: 2800, baseGetter: el => parseFloat(el.getAttribute('fill-opacity')) });
}

function el(tag) { return document.createElementNS(NS, tag); }
function text(x, y, str, anchor = 'middle', fill = '#9aa0b0', size = 12) {
  const t = el('text');
  t.setAttribute('x', x); t.setAttribute('y', y);
  t.setAttribute('text-anchor', anchor); t.setAttribute('fill', fill);
  t.setAttribute('font-family', 'ui-monospace, monospace');
  t.setAttribute('font-size', size);
  t.textContent = str;
  return t;
}
