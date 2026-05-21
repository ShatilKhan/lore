// FIGURE 7 — NNA vs Genetic Algorithm side-by-side.

import { animate, stagger } from 'animejs';
import { breathe, pulse } from '../../lib/ambient.js';
import { palette } from '../../lib/theme.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 500, H = 380;
const POP = 16;

export function mountVsGa({ leftSel, rightSel }) {
  const p = palette();
  buildPanel(leftSel, 'NNA', p.accent, p, updateNNA);
  buildPanel(rightSel, 'Genetic algorithm', p.accentHot, p, updateGA);
}

function buildPanel(sel, label, color, p, stepper) {
  const svg = document.querySelector(sel);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  const gid = 'basin-' + label.replace(/[^a-z0-9]+/gi, '');
  const defs = el('defs');
  defs.innerHTML = `
    <radialGradient id="${gid}" cx="0.5" cy="0.55" r="0.42">
      <stop offset="0%"  stop-color="${p.basinA}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${p.bg}"    stop-opacity="0"/>
    </radialGradient>
  `;
  svg.appendChild(defs);
  const bg = el('rect');
  bg.setAttribute('width', W); bg.setAttribute('height', H);
  bg.setAttribute('fill', `url(#${gid})`);
  svg.appendChild(bg);

  const target = { x: 0.5 * W, y: 0.55 * H };
  const cg = el('g');
  cg.setAttribute('fill', 'none'); cg.setAttribute('stroke', p.rule);
  for (const r of [40, 80, 130, 180]) {
    const c = el('ellipse');
    c.setAttribute('cx', target.x); c.setAttribute('cy', target.y);
    c.setAttribute('rx', r); c.setAttribute('ry', r * 0.78);
    c.setAttribute('opacity', 0.35);
    cg.appendChild(c);
  }
  svg.appendChild(cg);
  breathe(cg.querySelectorAll('ellipse'), { period: 6000, opacityRange: [0.2, 0.5] });

  const lbl = el('text');
  lbl.setAttribute('x', 18); lbl.setAttribute('y', 30);
  lbl.setAttribute('fill', color);
  lbl.setAttribute('font-family', 'ui-monospace, monospace');
  lbl.setAttribute('font-size', 12); lbl.setAttribute('letter-spacing', 1.4);
  lbl.textContent = label.toUpperCase();
  svg.appendChild(lbl);

  const glow = el('circle');
  glow.setAttribute('cx', target.x); glow.setAttribute('cy', target.y);
  glow.setAttribute('r', 6); glow.setAttribute('fill', p.accentWarm);
  svg.appendChild(glow);
  pulse(glow, { period: 2400, scaleRange: [1, 1.4] });

  const dots = [];
  for (let i = 0; i < POP; i++) {
    const d = el('circle');
    d.setAttribute('cx', 40 + Math.random() * (W - 80));
    d.setAttribute('cy', 60 + Math.random() * (H - 120));
    d.setAttribute('r', 4);
    d.setAttribute('fill', color);
    d.setAttribute('opacity', 0.85);
    svg.appendChild(d);
    dots.push(d);
  }

  let iter = 0;
  function tick() {
    iter++;
    if (iter > 12) {
      iter = 0;
      animate(dots, {
        cx: () => 40 + Math.random() * (W - 80),
        cy: () => 60 + Math.random() * (H - 120),
        duration: 700,
        delay: stagger(20),
        ease: 'inOutQuad',
        onComplete: () => setTimeout(tick, 600),
      });
      return;
    }
    stepper(dots, target, iter);
    setTimeout(tick, 900);
  }
  setTimeout(tick, 400 + Math.random() * 400);
}

function updateNNA(dots, target, iter) {
  const decay = Math.pow(0.85, iter);
  const pull = 0.35 + iter * 0.04;
  dots.forEach((d) => {
    const x = parseFloat(d.getAttribute('cx'));
    const y = parseFloat(d.getAttribute('cy'));
    const jx = (Math.random() - 0.5) * 30 * decay;
    const jy = (Math.random() - 0.5) * 30 * decay;
    animate(d, {
      cx: x + (target.x - x) * pull + jx,
      cy: y + (target.y - y) * pull + jy,
      duration: 700,
      ease: 'inOutCubic',
    });
  });
}

function updateGA(dots, target, iter) {
  let best = dots[0]; let bestD = Infinity;
  dots.forEach(d => {
    const x = parseFloat(d.getAttribute('cx'));
    const y = parseFloat(d.getAttribute('cy'));
    const dd = (x - target.x) ** 2 + (y - target.y) ** 2;
    if (dd < bestD) { bestD = dd; best = d; }
  });
  const bx = parseFloat(best.getAttribute('cx'));
  const by = parseFloat(best.getAttribute('cy'));

  dots.forEach((d) => {
    if (d === best) {
      animate(d, { r: [{ to: 6, duration: 300 }, { to: 4, duration: 300 }] });
      return;
    }
    const partner = dots[Math.floor(Math.random() * dots.length)];
    const px = parseFloat(partner.getAttribute('cx'));
    const py = parseFloat(partner.getAttribute('cy'));
    const mx = (Math.random() - 0.5) * 80;
    const my = (Math.random() - 0.5) * 80;
    const nx = (px + bx) / 2 + mx;
    const ny = (py + by) / 2 + my;
    animate(d, {
      cx: Math.max(10, Math.min(W - 10, nx)),
      cy: Math.max(10, Math.min(H - 10, ny)),
      duration: 700,
      ease: 'outBack',
    });
  });
}

function el(tag) { return document.createElementNS(NS, tag); }
