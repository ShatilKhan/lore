// Scrub-bound timeline helper: scroll position drives timeline progress 1:1
// (with a touch of smoothing). Used for the "marquee" moments where the reader
// scrolling through a section literally drives an animation forward/backward.

import { createTimeline, onScroll } from 'animejs';

/**
 * Build a scrub-bound timeline over a section.
 *
 * @param {string|Element} target  the .scrub-figure container — its bounds
 *                                 determine the scrub range.
 * @param {(tl: Timeline) => void} build  populate the timeline with .add()s.
 *                                 All sub-anims should use ease: 'linear' for
 *                                 a clean scrub feel; the easing on the scroll
 *                                 binding itself does the smoothing.
 * @param {object} opts
 *   - sync: smoothing (0=instant, 1=full) — 0.12–0.2 feels natural on trackpads.
 *   - enter / leave: threshold strings, see anime.js docs.
 *   - debug: true shows the threshold band.
 */
export function scrubTimeline(target, build, opts = {}) {
  const {
    sync = 0.15,
    enter = 'top bottom',
    leave = 'bottom top',
    debug = false,
  } = opts;

  const tl = createTimeline({
    defaults: { ease: 'linear', duration: 1000 },
    autoplay: onScroll({
      target,
      enter,
      leave,
      sync,
      debug,
    }),
  });
  build(tl);
  return tl;
}
