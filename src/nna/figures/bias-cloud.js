// FIGURE 4 — Bias as probability cloud.

import { animate } from 'animejs';
import { breathe } from '../../lib/ambient.js';
import { palette } from '../../lib/theme.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 900, H = 480;

export function mountBiasCloud(rootSel, spreadSlider, spreadVal) {
  const p = palette();
  const svg = document.querySelector(rootSel);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  const defs = el('defs');
  defs.innerHTML = `
    <radialGradient id="basin-bc" cx="0.62" cy="0.45" r="0.4">
      <stop offset="0%"  stop-color="${p.basinA}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${p.bg}"    stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cloud-bc" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"  stop-color="${p.accent}" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="${p.accent}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
  `;
  svg.appendChild(defs);

  const bg = el('rect');
  bg.setAttribute('width', W); bg.setAttribute('height', H);
  bg.setAttribute('fill', 'url(#basin-bc)');
  svg.appendChild(bg);

  const contoursG = el('g');
  svg.appendChild(contoursG);
  const peak = { x: 0.62 * W, y: 0.45 * H };
  for (const r of [80, 130, 180, 240]) {
    const c = el('ellipse');
    c.setAttribute('cx', peak.x); c.setAttribute('cy', peak.y);
    c.setAttribute('rx', r); c.setAttribute('ry', r * 0.78);
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke', p.rule);
    c.setAttribute('opacity', 0.4);
    contoursG.appendChild(c);
  }
  breathe(contoursG.querySelectorAll('ellipse'), { period: 5500, opacityRange: [0.25, 0.55] });

  const state = { cx: 280, cy: 280, spread: 80 };

  const halo = el('circle');
  halo.setAttribute('cx', state.cx); halo.setAttribute('cy', state.cy);
  halo.setAttribute('r', state.spread);
  halo.setAttribute('fill', 'url(#cloud-bc)');
  svg.appendChild(halo);

  const samplesG = el('g'); svg.appendChild(samplesG);
  for (let i = 0; i < 18; i++) spawnSample(samplesG, state, i * 110, p);

  const handleGlow = el('circle');
  handleGlow.setAttribute('r', 16);
  handleGlow.setAttribute('fill', p.accentWarm); handleGlow.setAttribute('opacity', 0.25);
  svg.appendChild(handleGlow);
  const handle = el('circle');
  handle.setAttribute('r', 8);
  handle.setAttribute('fill', p.accentWarm); handle.setAttribute('stroke', p.bg); handle.setAttribute('stroke-width', 2);
  handle.style.cursor = 'grab';
  svg.appendChild(handle);

  function setPos(cx, cy) {
    state.cx = Math.max(40, Math.min(W - 40, cx));
    state.cy = Math.max(40, Math.min(H - 40, cy));
    halo.setAttribute('cx', state.cx); halo.setAttribute('cy', state.cy);
    handle.setAttribute('cx', state.cx); handle.setAttribute('cy', state.cy);
    handleGlow.setAttribute('cx', state.cx); handleGlow.setAttribute('cy', state.cy);
  }
  setPos(state.cx, state.cy);

  let dragging = false;
  function svgPoint(e) {
    const r = svg.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  svg.addEventListener('pointerdown', (e) => {
    dragging = true; svg.setPointerCapture(e.pointerId);
    handle.style.cursor = 'grabbing';
    const q = svgPoint(e); setPos(q.x, q.y);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const q = svgPoint(e); setPos(q.x, q.y);
  });
  svg.addEventListener('pointerup', () => { dragging = false; handle.style.cursor = 'grab'; });

  if (spreadSlider) {
    const setSpread = (v) => {
      state.spread = v;
      animate(halo, { r: v, duration: 240, ease: 'outCubic' });
      if (spreadVal) spreadVal.textContent = String(Math.round(v));
    };
    spreadSlider.addEventListener('input', (e) => setSpread(parseFloat(e.target.value)));
    setSpread(parseFloat(spreadSlider.value));
  }

  svg.appendChild(text(W - 16, H - 16, 'drag the cloud · adjust spread →', 'end', p.inkFaint, 11));
}

function spawnSample(parent, state, delay, p) {
  const NS_ = 'http://www.w3.org/2000/svg';
  const d = document.createElementNS(NS_, 'circle');
  d.setAttribute('r', 2.5);
  d.setAttribute('fill', p.accent);
  parent.appendChild(d);

  function cycle() {
    const u1 = Math.random(), u2 = Math.random();
    const rad = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const angle = Math.random() * Math.PI * 2;
    const r = Math.abs(rad) * state.spread * 0.45;
    d.setAttribute('cx', state.cx + Math.cos(angle) * r);
    d.setAttribute('cy', state.cy + Math.sin(angle) * r);
    d.setAttribute('opacity', 0);
    animate(d, {
      opacity: [{ to: 0.8, duration: 400 }, { to: 0, duration: 900 }],
      delay, ease: 'inOutSine',
      onComplete: cycle,
    });
    delay = 200 + Math.random() * 600;
  }
  cycle();
}

function el(tag) { return document.createElementNS(NS, tag); }
function text(x, y, str, anchor = 'middle', fill = '#9aa0b0', size = 12) {
  const t = el('text');
  t.setAttribute('x', x); t.setAttribute('y', y);
  t.setAttribute('text-anchor', anchor); t.setAttribute('fill', fill);
  t.setAttribute('font-family', 'ui-sans-serif, system-ui');
  t.setAttribute('font-size', size);
  t.textContent = str;
  return t;
}
