import { animate, stagger, utils } from 'animejs';
import { mountPauseToggle } from './pause.js';
import { mountThemeToggle } from './theme.js';

utils.set('.hero .eyebrow, .hero h1, .hero .lede, .topic-card', { opacity: 0, translateY: 14 });

animate('.hero .eyebrow, .hero h1, .hero .lede', {
  opacity: 1,
  translateY: 0,
  duration: 700,
  delay: stagger(120),
  ease: 'outQuad',
});

animate('.topic-card', {
  opacity: [0, 1],
  translateY: [14, 0],
  duration: 600,
  delay: stagger(90, { start: 500 }),
  ease: 'outQuad',
});

mountPauseToggle();
mountThemeToggle();
