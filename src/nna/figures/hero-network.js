// FIGURE 1 — Hero: literal neural-network shape that the algorithm borrows.
// Input candidates (left) → weight matrix as edges (middle) → output children (right).

import { animate, stagger } from 'animejs';
import { jitter, pulse } from '../../lib/ambient.js';
import { palette } from '../../lib/theme.js';

const NS = 'http://www.w3.org/2000/svg';
const N = 8;
const W = 1100, H = 460;
const LEFT = 160, RIGHT = W - 160;
const TOP = 50, BOT = H - 50;

export function mountHero(rootSel) {
  const p = palette();
  const svg = document.querySelector(rootSel);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  const defs = el('defs');
  defs.innerHTML = `
    <radialGradient id="neuron-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"  stop-color="${p.accent}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
  `;
  svg.appendChild(defs);

  svg.appendChild(text(LEFT, 28, 'parent generation Xₜ', 'start', p.inkDim));
  svg.appendChild(text(W / 2, 28, 'weight matrix  W', 'middle', p.inkDim));
  svg.appendChild(text(RIGHT, 28, 'child generation Xₜ₊₁', 'end', p.inkDim));

  const ys = Array.from({ length: N }, (_, i) =>
    TOP + (BOT - TOP) * (i / (N - 1)));

  const edgesG = el('g');
  svg.appendChild(edgesG);

  const Wmat = [];
  for (let i = 0; i < N; i++) {
    const row = [];
    for (let j = 0; j < N; j++) {
      const w = Math.exp(-((i - j) ** 2) / 4) * (0.4 + Math.random() * 0.6);
      row.push(w);
    }
    Wmat.push(row);
  }
  const maxW = Math.max(...Wmat.flat());

  const edges = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const w = Wmat[i][j] / maxW;
      if (w < 0.18) continue;
      const path = el('path');
      const x1 = LEFT, y1 = ys[i], x2 = RIGHT, y2 = ys[j];
      const cx1 = LEFT + (RIGHT - LEFT) * 0.4;
      const cx2 = LEFT + (RIGHT - LEFT) * 0.6;
      path.setAttribute('d', `M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`);
      path.setAttribute('stroke', p.edge);
      path.setAttribute('stroke-width', 0.7 + w * 2.4);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.dataset.weight = w;
      edgesG.appendChild(path);
      edges.push(path);
    }
  }

  const pulsesG = el('g');
  svg.appendChild(pulsesG);
  const pulses = edges.map((path) => {
    const d = el('circle');
    d.setAttribute('r', 2.4);
    d.setAttribute('fill', p.accent);
    d.setAttribute('opacity', 0.85);
    pulsesG.appendChild(d);
    return { node: d, path, len: path.getTotalLength() };
  });
  pulses.forEach((pp) => {
    const obj = { t: Math.random() };
    animate(obj, {
      t: 1,
      duration: 1800 + Math.random() * 1200,
      loop: true,
      ease: 'linear',
      delay: -(Math.random() * 1800),
      onUpdate: () => {
        const pt = pp.path.getPointAtLength((obj.t % 1) * pp.len);
        pp.node.setAttribute('cx', pt.x);
        pp.node.setAttribute('cy', pt.y);
        pp.node.setAttribute('opacity', (Math.sin((obj.t % 1) * Math.PI) * 0.9).toFixed(3));
      },
    });
  });

  const neuronsG = el('g');
  svg.appendChild(neuronsG);
  const neurons = [];
  for (const side of ['L', 'R']) {
    const x = side === 'L' ? LEFT : RIGHT;
    for (let i = 0; i < N; i++) {
      const glow = el('circle');
      glow.setAttribute('cx', x); glow.setAttribute('cy', ys[i]);
      glow.setAttribute('r', 22); glow.setAttribute('fill', 'url(#neuron-glow)');
      neuronsG.appendChild(glow);
      const core = el('circle');
      core.setAttribute('cx', x); core.setAttribute('cy', ys[i]);
      core.setAttribute('r', 7);
      core.setAttribute('fill', side === 'L' ? p.ink : p.accentWarm);
      core.setAttribute('stroke', p.bg); core.setAttribute('stroke-width', 2);
      neuronsG.appendChild(core);
      neurons.push(core);
    }
  }

  neurons.forEach((n, i) => pulse(n, { period: 2400 + (i % 4) * 240, scaleRange: [1, 1.18] }));
  animate(edges, {
    opacity: [{ to: 0.55, duration: 1700 }, { to: 0.95, duration: 1700 }],
    loop: true, ease: 'inOutSine', delay: stagger(80),
  });
  jitter(neurons.slice(N), { amp: 1.6, period: 1400, attrs: ['cy'] });
}

function el(tag) { return document.createElementNS(NS, tag); }
function text(x, y, str, anchor = 'middle', fill = '#9aa0b0') {
  const t = el('text');
  t.setAttribute('x', x); t.setAttribute('y', y);
  t.setAttribute('text-anchor', anchor); t.setAttribute('fill', fill);
  t.setAttribute('font-family', 'ui-monospace, monospace');
  t.setAttribute('font-size', 12); t.setAttribute('letter-spacing', 1.4);
  t.textContent = str;
  return t;
}
