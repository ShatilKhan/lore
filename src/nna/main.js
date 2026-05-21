// NNA page orchestrator. Re-mounts all figures on theme change.

import { mountHero } from './figures/hero-network.js';
import { mountWeightMatrix } from './figures/weight-matrix.js';
import { mountTransferTug } from './figures/transfer-tug.js';
import { mountBiasCloud } from './figures/bias-cloud.js';
import { mountSingleIter } from './figures/single-iter.js';
import { mountConvergence } from './figures/convergence.js';
import { mountVsGa } from './figures/vs-ga.js';
import { mountPauseToggle } from '../lib/pause.js';
import { mountThemeToggle } from '../lib/theme.js';

// Replace an element with a clone of itself to drop previously-attached listeners.
// We use this on form controls before re-binding inside each figure's mount fn.
function freshen(id) {
  const el = document.getElementById(id);
  if (!el || !el.parentNode) return el;
  const c = el.cloneNode(true);
  el.parentNode.replaceChild(c, el);
  return c;
}

function mountAll() {
  mountHero('#fig-hero');
  mountWeightMatrix('#fig-matrix');
  mountTransferTug(
    '#fig-tug',
    freshen('tug-w'),
    document.getElementById('tug-w-val'),
  );
  mountBiasCloud(
    '#fig-bias',
    freshen('bias-spread'),
    document.getElementById('bias-spread-val'),
  );
  mountSingleIter('#fig-single', '#fig-single-section');
  mountConvergence({
    stageSel: '#fig-converge-stage',
    sectionSel: '#fig-converge-section',
    controls: {
      pop:      freshen('cv-pop'),
      popVal:   document.getElementById('cv-pop-val'),
      decay:    freshen('cv-decay'),
      decayVal: document.getElementById('cv-decay-val'),
      rerun:    freshen('cv-rerun'),
    },
  });
  mountVsGa({ leftSel: '#fig-vs-left', rightSel: '#fig-vs-right' });
}

mountAll();
mountPauseToggle();
mountThemeToggle();

// Re-mount all SVG figures whenever the theme flips, so palette-derived
// colors and gradient stops are rebuilt for the new theme.
window.addEventListener('themechange', () => {
  requestAnimationFrame(() => mountAll());
});
