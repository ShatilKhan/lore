// FIGURE 5 — Single iteration step (scrub-bound).

import { stagger } from 'animejs';
import { scrubTimeline } from '../../lib/scrub.js';
import { jitter } from '../../lib/ambient.js';
import { palette } from '../../lib/theme.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 1100, H = 380;
const N = 6;
const LEFT_X = 130, RIGHT_X = W - 130;
const TOP_Y = 70, BOT_Y = H - 70;

export function mountSingleIter(svgSel, sectionSel) {
  const p = palette();
  const svg = document.querySelector(svgSel);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  svg.appendChild(text(LEFT_X, 36, 'parent Xₜ', 'middle', p.inkDim, 13));
  svg.appendChild(text(W / 2, 36, 'X′ = W · X', 'middle', p.accentWarm, 14));
  svg.appendChild(text(RIGHT_X, 36, 'child Xₜ₊₁', 'middle', p.inkDim, 13));

  const ys = Array.from({ length: N }, (_, i) =>
    TOP_Y + (BOT_Y - TOP_Y) * (i / (N - 1)));

  const Wmat = Array.from({ length: N }, () => {
    const r = Array.from({ length: N }, () => 0.05 + Math.random());
    const s = r.reduce((a, b) => a + b, 0);
    return r.map(v => v / s);
  });

  const edgesG = el('g'); svg.appendChild(edgesG);
  const edges = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const w = Wmat[i][j];
      if (w < 0.12) continue;
      const path = el('path');
      const cx1 = LEFT_X + (RIGHT_X - LEFT_X) * 0.4;
      const cx2 = LEFT_X + (RIGHT_X - LEFT_X) * 0.6;
      path.setAttribute('d', `M${LEFT_X},${ys[i]} C${cx1},${ys[i]} ${cx2},${ys[j]} ${RIGHT_X},${ys[j]}`);
      path.setAttribute('stroke', p.accent);
      path.setAttribute('stroke-width', 0.6 + w * 3);
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', 0.08);
      path.dataset.w = w;
      edgesG.appendChild(path);
      edges.push(path);
    }
  }

  const parents = [];
  for (let i = 0; i < N; i++) {
    const c = el('circle');
    c.setAttribute('cx', LEFT_X); c.setAttribute('cy', ys[i]);
    c.setAttribute('r', 9);
    c.setAttribute('fill', p.ink);
    c.setAttribute('stroke', p.bg); c.setAttribute('stroke-width', 2);
    svg.appendChild(c);
    parents.push(c);
  }

  const children = [];
  for (let j = 0; j < N; j++) {
    const c = el('circle');
    c.setAttribute('cx', RIGHT_X); c.setAttribute('cy', ys[j]);
    c.setAttribute('r', 0);
    c.setAttribute('fill', p.accentWarm);
    c.setAttribute('stroke', p.bg); c.setAttribute('stroke-width', 2);
    svg.appendChild(c);
    children.push(c);
  }

  jitter(parents, { amp: 1.4, period: 1400, attrs: ['cy'] });

  scrubTimeline(sectionSel, (tl) => {
    tl.add(edges, {
      opacity: (e) => 0.15 + parseFloat(e.dataset.w) * 0.85,
      strokeWidth: (e) => 0.8 + parseFloat(e.dataset.w) * 4,
      duration: 600,
      delay: stagger(8, { from: 'first' }),
    }, 0);
    tl.add(children, {
      r: [{ from: 0, to: 9, duration: 400 }],
      delay: stagger(50, { start: 400 }),
      ease: 'outBack',
    }, 0);
  }, { sync: 0.18 });
}

function el(tag) { return document.createElementNS(NS, tag); }
function text(x, y, str, anchor = 'middle', fill = '#9aa0b0', size = 12) {
  const t = el('text');
  t.setAttribute('x', x); t.setAttribute('y', y);
  t.setAttribute('text-anchor', anchor); t.setAttribute('fill', fill);
  t.setAttribute('font-family', 'ui-monospace, monospace');
  t.setAttribute('font-size', size); t.setAttribute('letter-spacing', 1.3);
  t.textContent = str;
  return t;
}
