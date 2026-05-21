// FIGURE 6 — Marquee: full NNA convergence on a 2D fitness landscape.

import { animate, stagger } from 'animejs';
import { scrubTimeline } from '../../lib/scrub.js';
import { breathe, pulse, jitter } from '../../lib/ambient.js';
import { palette } from '../../lib/theme.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 1100, H = 720;
const ITERS = 6;

export function mountConvergence({ stageSel, sectionSel, controls }) {
  const p = palette();
  const stage = document.querySelector(stageSel);
  stage.innerHTML = '';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  stage.appendChild(svg);

  const defs = el('defs');
  defs.innerHTML = `
    <radialGradient id="basin-c-a" cx="0.32" cy="0.6" r="0.35">
      <stop offset="0%"  stop-color="${p.basinA}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${p.bg}"    stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="basin-c-b" cx="0.72" cy="0.32" r="0.28">
      <stop offset="0%"  stop-color="${p.basinB}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${p.bg}"    stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="best-c" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"  stop-color="${p.accentWarm}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${p.accentWarm}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="halo-c" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"  stop-color="${p.accent}" stop-opacity="0"/>
      <stop offset="60%" stop-color="${p.accent}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
  `;
  svg.appendChild(defs);

  const bgA = el('rect'); bgA.setAttribute('width', W); bgA.setAttribute('height', H);
  bgA.setAttribute('fill', p.bg); svg.appendChild(bgA);
  const bgB = el('rect'); bgB.setAttribute('width', W); bgB.setAttribute('height', H);
  bgB.setAttribute('fill', 'url(#basin-c-a)'); svg.appendChild(bgB);
  const bgC = el('rect'); bgC.setAttribute('width', W); bgC.setAttribute('height', H);
  bgC.setAttribute('fill', 'url(#basin-c-b)'); svg.appendChild(bgC);

  const state = {
    target: { x: 0.32 * W, y: 0.6 * H },
    decoy:  { x: 0.72 * W, y: 0.32 * H },
    pop: parseInt(controls?.pop?.value) || 22,
    decay: parseFloat(controls?.decay?.value) || 0.82,
  };

  const contoursG = el('g');
  contoursG.setAttribute('fill', 'none');
  contoursG.setAttribute('stroke', p.rule);
  svg.appendChild(contoursG);
  function drawContours() {
    contoursG.innerHTML = '';
    for (const r of [60, 110, 170, 230, 300]) {
      const c = el('ellipse');
      c.setAttribute('cx', state.target.x); c.setAttribute('cy', state.target.y);
      c.setAttribute('rx', r); c.setAttribute('ry', r * 0.78);
      c.setAttribute('opacity', 0.35);
      contoursG.appendChild(c);
    }
    for (const r of [40, 80, 130, 190]) {
      const c = el('ellipse');
      c.setAttribute('cx', state.decoy.x); c.setAttribute('cy', state.decoy.y);
      c.setAttribute('rx', r); c.setAttribute('ry', r * 0.78);
      c.setAttribute('opacity', 0.25);
      contoursG.appendChild(c);
    }
    breathe(contoursG.querySelectorAll('ellipse'), { period: 6000, opacityRange: [0.18, 0.45] });
  }
  drawContours();

  const arrowsG = el('g');
  arrowsG.setAttribute('stroke', p.accentHot); arrowsG.setAttribute('stroke-width', 1.2);
  arrowsG.setAttribute('fill', 'none'); arrowsG.setAttribute('opacity', 0);
  svg.appendChild(arrowsG);

  const halosG = el('g'); svg.appendChild(halosG);
  const particlesG = el('g'); svg.appendChild(particlesG);

  const targetGlow = el('circle');
  targetGlow.setAttribute('r', 50);
  targetGlow.setAttribute('fill', 'url(#best-c)');
  svg.appendChild(targetGlow);
  const targetDot = el('circle');
  targetDot.setAttribute('r', 8);
  targetDot.setAttribute('fill', p.accentWarm);
  targetDot.setAttribute('stroke', p.bg); targetDot.setAttribute('stroke-width', 2);
  targetDot.style.cursor = 'grab';
  svg.appendChild(targetDot);

  function setTarget(x, y) {
    state.target.x = Math.max(50, Math.min(W - 50, x));
    state.target.y = Math.max(50, Math.min(H - 50, y));
    targetGlow.setAttribute('cx', state.target.x);
    targetGlow.setAttribute('cy', state.target.y);
    targetDot.setAttribute('cx', state.target.x);
    targetDot.setAttribute('cy', state.target.y);
    drawContours();
  }
  setTarget(state.target.x, state.target.y);
  pulse(targetGlow, { period: 2200, scaleRange: [0.92, 1.08] });
  pulse(targetDot, { period: 2200, scaleRange: [1, 1.18] });

  // HUD
  const hud = el('g');
  hud.innerHTML = `
    <text x="32" y="40" fill="${p.inkDim}" font-family="ui-monospace,monospace" font-size="12" letter-spacing="1.4">ITERATION</text>
    <text id="cv-iter" x="32" y="78" fill="${p.accent}" font-family="ui-monospace,monospace" font-size="34">0</text>
    <text x="32" y="${H - 24}" fill="${p.inkFaint}" font-family="ui-monospace,monospace" font-size="11">drag the orange target · tune below</text>
  `;
  svg.appendChild(hud);
  const iterText = svg.querySelector('#cv-iter');

  let population = [];

  function buildSim() {
    population = Array.from({ length: state.pop }, () => ({
      x0: 80 + Math.random() * (W - 160),
      y0: 60 + Math.random() * (H - 120),
      trail: [],
    }));
    population.forEach(pp => {
      let x = pp.x0, y = pp.y0;
      pp.trail.push({ x, y, halo: 80 });
      for (let it = 1; it <= ITERS; it++) {
        const biasR = 80 * Math.pow(state.decay, it);
        const jx = (Math.random() - 0.5) * biasR * 0.5;
        const jy = (Math.random() - 0.5) * biasR * 0.5;
        const pull = 0.32 + it * 0.07;
        x = x + (state.target.x - x) * pull + jx;
        y = y + (state.target.y - y) * pull + jy;
        pp.trail.push({ x, y, halo: Math.max(8, biasR * 0.55) });
      }
    });
  }

  function buildDom() {
    halosG.innerHTML = '';
    particlesG.innerHTML = '';
    arrowsG.innerHTML = '';
    population.forEach((pp) => {
      const halo = el('circle');
      halo.setAttribute('cx', pp.x0); halo.setAttribute('cy', pp.y0);
      halo.setAttribute('r', 80); halo.setAttribute('fill', 'url(#halo-c)');
      halosG.appendChild(halo);

      const dot = el('circle');
      dot.setAttribute('cx', pp.x0); dot.setAttribute('cy', pp.y0);
      dot.setAttribute('r', 5); dot.setAttribute('fill', p.ink);
      particlesG.appendChild(dot);

      const arrow = el('line');
      arrow.setAttribute('x1', pp.x0); arrow.setAttribute('y1', pp.y0);
      arrow.setAttribute('x2', state.target.x); arrow.setAttribute('y2', state.target.y);
      arrow.setAttribute('stroke-dasharray', '3 4');
      arrowsG.appendChild(arrow);
    });
  }

  function buildScrub() {
    const dots  = Array.from(particlesG.querySelectorAll('circle'));
    const halos = Array.from(halosG.querySelectorAll('circle'));

    scrubTimeline(sectionSel, (tl) => {
      for (let it = 1; it <= ITERS; it++) {
        const snapshot = population.map(pp => pp.trail[it]);
        tl.add(dots, {
          cx: (_e, i) => snapshot[i].x,
          cy: (_e, i) => snapshot[i].y,
          duration: 800, delay: stagger(6),
        }, '+=0');
        tl.add(halos, {
          cx: (_e, i) => snapshot[i].x,
          cy: (_e, i) => snapshot[i].y,
          r:  (_e, i) => snapshot[i].halo,
          duration: 800, delay: stagger(6),
        }, '<<');
        const obj = { v: it - 1 };
        tl.add(obj, {
          v: it, duration: 800,
          onUpdate: () => { iterText.textContent = Math.round(obj.v); },
        }, '<<');
        if (it === 1)     tl.add(arrowsG, { opacity: [0, 0.5], duration: 400 }, '<<');
        if (it === ITERS) tl.add(arrowsG, { opacity: [0.5, 0], duration: 700 }, '<<');
      }
      // Final dwell so the timeline keeps running until the section exits viewport
      // (prevents the "iter 6 reached, now nothing happens" dead-scroll gap).
      tl.add({ v: 0 }, { v: 1, duration: 1400 }, '+=0');
    }, { sync: 0.18 });

    jitter(dots, { amp: 0.9, period: 1100, attrs: ['cx', 'cy'] });
  }

  function rebuild() {
    buildSim(); buildDom(); buildScrub();
  }
  rebuild();

  // interactions
  let dragging = false;
  function svgPoint(e) {
    const r = svg.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  targetDot.addEventListener('pointerdown', (e) => {
    dragging = true; e.stopPropagation();
    svg.setPointerCapture(e.pointerId);
    targetDot.style.cursor = 'grabbing';
  });
  svg.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const q = svgPoint(e); setTarget(q.x, q.y);
  });
  svg.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    targetDot.style.cursor = 'grab';
    rebuild();
  });

  if (controls) {
    controls.pop?.addEventListener('input', (e) => {
      state.pop = parseInt(e.target.value);
      controls.popVal && (controls.popVal.textContent = state.pop);
    });
    controls.pop?.addEventListener('change', () => rebuild());

    controls.decay?.addEventListener('input', (e) => {
      state.decay = parseFloat(e.target.value);
      controls.decayVal && (controls.decayVal.textContent = state.decay.toFixed(2));
    });
    controls.decay?.addEventListener('change', () => rebuild());

    controls.rerun?.addEventListener('click', () => rebuild());
  }
}

function el(tag) { return document.createElementNS(NS, tag); }
