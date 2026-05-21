// Ambient motion helpers — small idle loops that make figures feel alive.
// All helpers animate SVG attributes directly (r, cx, cy, opacity,
// fill-opacity) rather than CSS transforms. CSS `scale` on SVG circles
// is unreliable because transform-origin doesn't default to the element's
// own bounding box in all browsers, which causes positional drift.

import { animate } from 'animejs';

/**
 * Oscillate cx/cy around the element's original position.
 * Each element gets its own absolute keyframe pair so there's no random walk.
 */
export function jitter(targets, { amp = 1.5, period = 900, attrs = ['cx', 'cy'] } = {}) {
  const list = toArr(targets);
  const handles = [];
  list.forEach((el, i) => {
    attrs.forEach((attr) => {
      const orig = parseFloat(el.getAttribute(attr)) || 0;
      const d1 = (Math.random() - 0.5) * amp * 2;
      const d2 = (Math.random() - 0.5) * amp * 2;
      handles.push(animate(el, {
        [attr]: [
          { to: orig + d1, duration: period },
          { to: orig + d2, duration: period },
          { to: orig,       duration: period },
        ],
        loop: true,
        ease: 'inOutSine',
        delay: (i * 80 + Math.random() * 200) % period,
      }));
    });
  });
  return handles;
}

/**
 * Slow opacity breath on decorative strokes (contour rings).
 */
export function breathe(targets, { period = 5000, opacityRange = [0.25, 0.55] } = {}) {
  const list = toArr(targets);
  return list.map((el, i) => animate(el, {
    opacity: [
      { to: opacityRange[1], duration: period / 2 },
      { to: opacityRange[0], duration: period / 2 },
    ],
    loop: true,
    ease: 'inOutSine',
    delay: (i * period / 12) % period,
  }));
}

/**
 * Radial pulse — animates SVG `r` directly, capturing each element's base r.
 * Works for individual elements or NodeLists.
 */
export function pulse(target, { period = 1800, scaleRange = [1, 1.12] } = {}) {
  const list = toArr(target);
  return list.map((el, i) => {
    const baseR = parseFloat(el.getAttribute('r')) || 8;
    return animate(el, {
      r: [
        { to: baseR * scaleRange[1], duration: period / 2 },
        { to: baseR * scaleRange[0], duration: period / 2 },
      ],
      loop: true,
      ease: 'inOutSine',
      delay: (i * 120) % period,
    });
  });
}

/**
 * Tiny fillOpacity shimmer on a group of cells — "live values" feel.
 */
export function shimmer(targets, { period = 2400, baseGetter } = {}) {
  const list = toArr(targets);
  return list.map((el, i) => {
    const base = baseGetter
      ? baseGetter(el)
      : parseFloat(el.getAttribute('fill-opacity') || '1');
    return animate(el, {
      fillOpacity: [
        { to: Math.max(0.05, base - 0.06), duration: period / 2 },
        { to: base, duration: period / 2 },
      ],
      loop: true,
      ease: 'inOutSine',
      delay: (i * (period / 10)) % period,
    });
  });
}

/**
 * Slow rotation on a wrapping <g>. Use for orbiting glyphs.
 */
export function spin(target, { period = 18000, dir = 1 } = {}) {
  return animate(target, {
    rotate: dir * 360,
    transformOrigin: 'center',
    duration: period,
    loop: true,
    ease: 'linear',
  });
}

function toArr(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (x.length != null && typeof x !== 'string') return Array.from(x);
  return [x];
}
