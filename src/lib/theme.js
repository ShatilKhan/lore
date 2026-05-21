// Theme: dark (default) / light. Persisted in localStorage.
// SVG figures read colors from `palette()` so they can be re-mounted on toggle.

const STORAGE_KEY = 'lore-theme';

function currentTheme() {
  const explicit = document.documentElement.getAttribute('data-theme');
  return explicit === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
  if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
  localStorage.setItem(STORAGE_KEY, theme);
}

// IMPORTANT: apply the stored theme synchronously on module import, so that
// any palette() reads from CSS vars later in the same tick see the right
// theme. Otherwise figures mount with dark-mode palette while data-theme is
// flipped to light afterward, leaving text colors mismatched to the actual bg.
(function restoreThemeOnLoad() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light') applyTheme('light');
  } catch (e) { /* ignore — private mode etc. */ }
})();

/** Read the current palette from CSS custom properties. */
export function palette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name, fallback) => {
    const val = cs.getPropertyValue(name).trim();
    return val || fallback;
  };
  return {
    bg:         v('--bg',         '#0a0c12'),
    bgElev:     v('--bg-elev',    '#11141d'),
    bgFig:      v('--bg-fig',     '#0d1018'),
    ink:        v('--ink',        '#e8eaf0'),
    inkDim:     v('--ink-dim',    '#9aa0b0'),
    inkFaint:   v('--ink-faint',  '#5a6072'),
    accent:     v('--accent',     '#7cc4ff'),
    accentWarm: v('--accent-warm','#ffb74d'),
    accentHot:  v('--accent-hot', '#ff5e7e'),
    accentCool: v('--accent-cool','#8affd0'),
    rule:       v('--rule',       '#1f2433'),
    ruleStrong: v('--rule-strong','#2a3147'),
    // edge stroke for SVG "wires" and connectors — needs to stay visible on
    // both bg-fig values, so it's a separate token from --rule.
    edge:       v('--edge',       '#3a4257'),
    edgeMuted:  v('--edge-muted', '#2a3147'),
    // text colors that should always have strong contrast on the figure bg,
    // independent of the L/R-cell pattern in weight-matrix.
    fgOnAccent: v('--fg-on-accent', '#ffffff'),  // text on saturated accent
    fgOnFig:    v('--fg-on-fig',    '#e8eaf0'),  // text on plain figure bg
    // semantic helpers used inside SVG gradients
    basinA:     v('--basin-a',    '#1a3a5a'),
    basinB:     v('--basin-b',    '#3a1a4a'),
    theme:      currentTheme(),
  };
}

/** Add the floating toggle button (top-right). Calls onChange after switching. */
export function mountThemeToggle(onChange) {
  // Theme is already restored at module import (see restoreThemeOnLoad above).
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.setAttribute('aria-label', 'Toggle light / dark mode');
  paintIcon(btn);

  btn.addEventListener('click', () => {
    const next = currentTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next);
    paintIcon(btn);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
    if (onChange) onChange(next);
  });

  document.body.appendChild(btn);
  return btn;
}

function paintIcon(btn) {
  const t = currentTheme();
  btn.innerHTML = t === 'light' ? moonSvg() : sunSvg();
  btn.title = t === 'light' ? 'switch to dark' : 'switch to light';
}

function sunSvg() {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2"  x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2"  y1="12" x2="5"  y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.9"  y1="4.9"  x2="7"  y2="7"/><line x1="17" y1="17" x2="19.1" y2="19.1"/><line x1="4.9"  y1="19.1" x2="7"  y2="17"/><line x1="17" y1="7" x2="19.1" y2="4.9"/></svg>`;
}
function moonSvg() {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>`;
}
