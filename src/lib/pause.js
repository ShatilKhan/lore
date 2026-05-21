// Global "pause all animations" toggle — Ciechanowski convention.
// Uses anime.js v4 engine.suspend() / engine.resume().

import { engine } from 'animejs';

export function mountPauseToggle() {
  const btn = document.createElement('button');
  btn.className = 'pause-toggle';
  btn.setAttribute('aria-label', 'Pause all animations');
  btn.dataset.state = 'playing';
  btn.innerHTML = playIcon(false);

  btn.addEventListener('click', () => {
    if (btn.dataset.state === 'playing') {
      engine.pause();
      btn.dataset.state = 'paused';
      btn.innerHTML = playIcon(true);
      btn.setAttribute('aria-label', 'Resume all animations');
    } else {
      engine.resume();
      btn.dataset.state = 'playing';
      btn.innerHTML = playIcon(false);
      btn.setAttribute('aria-label', 'Pause all animations');
    }
  });

  document.body.appendChild(btn);
  return btn;
}

function playIcon(isPaused) {
  return isPaused
    ? `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
    : `<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>`;
}
