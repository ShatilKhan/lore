// FIGURE 3 — Transfer-function tug-of-war.

import { animate } from 'animejs';
import { pulse } from '../../lib/ambient.js';
import { palette } from '../../lib/theme.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 900, H = 280;
const AXIS_Y = 160;
const ANCHOR_L = 120, ANCHOR_R = W - 120;

export function mountTransferTug(rootSel, sliderEl, valEl) {
  const p = palette();
  const svg = document.querySelector(rootSel);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  const axis = el('line');
  axis.setAttribute('x1', ANCHOR_L); axis.setAttribute('x2', ANCHOR_R);
  axis.setAttribute('y1', AXIS_Y); axis.setAttribute('y2', AXIS_Y);
  axis.setAttribute('stroke', p.ruleStrong); axis.setAttribute('stroke-width', 1);
  svg.appendChild(axis);

  for (let k = 0; k <= 10; k++) {
    const x = ANCHOR_L + (ANCHOR_R - ANCHOR_L) * (k / 10);
    const tick = el('line');
    tick.setAttribute('x1', x); tick.setAttribute('x2', x);
    tick.setAttribute('y1', AXIS_Y - 4); tick.setAttribute('y2', AXIS_Y + 4);
    tick.setAttribute('stroke', p.ruleStrong);
    svg.appendChild(tick);
  }

  const anchorL = el('circle');
  anchorL.setAttribute('cx', ANCHOR_L); anchorL.setAttribute('cy', AXIS_Y);
  anchorL.setAttribute('r', 13); anchorL.setAttribute('fill', p.accent);
  svg.appendChild(anchorL);
  svg.appendChild(text(ANCHOR_L, AXIS_Y + 38, 'best so far', 'middle', p.accent));
  svg.appendChild(text(ANCHOR_L, AXIS_Y - 24, 'target', 'middle', p.inkDim, 11));

  const anchorR = el('circle');
  anchorR.setAttribute('cx', ANCHOR_R); anchorR.setAttribute('cy', AXIS_Y);
  anchorR.setAttribute('r', 13); anchorR.setAttribute('fill', p.accentHot);
  svg.appendChild(anchorR);
  svg.appendChild(text(ANCHOR_R, AXIS_Y + 38, 'this candidate', 'middle', p.accentHot));
  svg.appendChild(text(ANCHOR_R, AXIS_Y - 24, 'current x', 'middle', p.inkDim, 11));

  const ropeL = el('line');
  const ropeR = el('line');
  [ropeL, ropeR].forEach(r => {
    r.setAttribute('y1', AXIS_Y); r.setAttribute('y2', AXIS_Y);
    r.setAttribute('stroke-dasharray', '3 4');
    svg.appendChild(r);
  });
  ropeL.setAttribute('stroke', p.accent); ropeR.setAttribute('stroke', p.accentHot);

  const particle = el('circle');
  particle.setAttribute('cy', AXIS_Y); particle.setAttribute('r', 9);
  particle.setAttribute('fill', p.accentWarm);
  particle.setAttribute('stroke', p.bg); particle.setAttribute('stroke-width', 2);
  svg.appendChild(particle);

  const wLText = text(ANCHOR_L, AXIS_Y - 60, 'w = 0.50', 'middle', p.accent, 12);
  wLText.style.fontFamily = 'ui-monospace, monospace';
  svg.appendChild(wLText);
  const wRText = text(ANCHOR_R, AXIS_Y - 60, 'w = 0.50', 'middle', p.accentHot, 12);
  wRText.style.fontFamily = 'ui-monospace, monospace';
  svg.appendChild(wRText);

  pulse(anchorL, { period: 2200 });
  pulse(anchorR, { period: 2200 });

  function update(wL) {
    const wR = 1 - wL;
    const px = ANCHOR_L * wL + ANCHOR_R * wR;
    animate(particle, { cx: px, duration: 400, ease: 'outCubic' });
    ropeL.setAttribute('x1', ANCHOR_L); ropeL.setAttribute('x2', px);
    ropeR.setAttribute('x1', ANCHOR_R); ropeR.setAttribute('x2', px);
    ropeL.setAttribute('stroke-width', 0.5 + wL * 3);
    ropeR.setAttribute('stroke-width', 0.5 + wR * 3);
    wLText.textContent = `w = ${wL.toFixed(2)}`;
    wRText.textContent = `w = ${wR.toFixed(2)}`;
    if (valEl) valEl.textContent = wL.toFixed(2);
  }

  if (sliderEl) {
    sliderEl.addEventListener('input', (e) => update(parseFloat(e.target.value)));
    update(parseFloat(sliderEl.value));
  } else {
    update(0.5);
  }
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
