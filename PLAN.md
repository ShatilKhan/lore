# Lore — Animated AI/ML Explainers

A Ciechanowski-style scrollytelling site that visualizes AI/ML concepts with anime.js. Long-form articles with embedded animated SVG/DOM visuals that react to scroll.

## Goals
- Teach AI concepts visually, dynamically (moving, not static)
- One topic per page, Ciechanowski-style scrollytelling
- Reusable visual vocabulary across topics (neurons, weights, particles, landscapes)
- Inline learning references at the end of each page
- Static-image deck export for presentations (interactive only on the site)

## Stack
- **Vite** (vanilla JS, ESM, hot reload) — keeps the site as plain HTML/JS, just adds dev ergonomics
- **anime.js v4** (`animate`, `createTimeline`, `onScroll`, `stagger`, SVG draw/morph) — modular imports, ~5–25 KB
- **SVG + DOM** for visuals (deliberately diverging from Ciechanowski's hand-rolled `<canvas>` — declarative timelines scale better for a library of topics)
- **KaTeX** for inline math (when needed)
- Deploy: GitHub Pages or Vercel (static build)

## Information architecture
```
/                 → landing: topic grid + intro
/nna              → Neural Network Algorithm (Sadollah 2018)
/morlet-wnn       → Morlet Wavelet Neural Network
/pso              → Particle Swarm Optimization
/neuron           → (later) perceptron / single neuron primer
/feedforward      → (later) forward pass through layers
/backprop         → (later) gradient descent + backprop
/transformers     → (later) LLM architecture
/gpu-cpu          → (later) hardware visualization
```

Shared:
- `/src/lib/scroll.js` — anime.js ScrollObserver wrappers, scrub/pin helpers
- `/src/lib/viz/` — reusable visual primitives (neuron, weight-matrix, landscape, particle)
- `/src/styles/base.css` — typography, layout, dark theme

## Topic roadmap (current focus)

### 1. Neural Network Algorithm (NNA) — IN PROGRESS
Sadollah, Sayyaadi & Yadav, *Applied Soft Computing* 71 (2018). A metaheuristic optimizer that uses ANN structure (weight matrix + bias + transfer operator) to evolve a population of candidate solutions toward an optimum.

Scrolly sections:
1. Hook — "what if a neural network optimized itself?" (single particle wanders a 2D fitness landscape)
2. The population — N candidate solutions appear as dots on the landscape
3. The weight matrix — animated heatmap; rows sum to 1; `X_new = W · X`
4. Bias operator — exploration halo around each particle, shrinks over iterations
5. Transfer operator — exploitation: non-best candidates pulled partway toward target
6. Full loop — run several iterations, swarm collapses to optimum
7. References (Sadollah paper, author page, related metaheuristics)

### 2. Morlet Wavelet Neural Network (MWNN) — NEXT
ψ(t) = exp(−t²/2)·cos(ω₀t) as hidden-layer activation. Each neuron learns scale `a` and translation `b`.

Scrolly hook: noisy target curve appears; individual Morlet ripples slide/stretch into place and sum live to reconstruct it.

### 3. Particle Swarm Optimization (PSO) — AFTER MWNN
Velocity update: `v ← w·v + c₁r₁(p − x) + c₂r₂(g − x)`. The most visually obvious of the three — swarm trails on a contour map.

## Reference vocabulary (steal from)
- **Ciechanowski** — Mechanical Watch, GPS, Internal Combustion Engine (scroll-pinned interactives, sequential reveals)
- **distill.pub** — annotation-as-you-scroll, layered reveals
- **3Blue1Brown** — color-coded weights, connection lighting
- **TensorFlow Playground** — live parameter updates
- **anime.js docs site** — for our own scroll-driven section transitions

## Presentation export
Each topic page exposes "frame" stops — at each scroll keyframe, a clean SVG snapshot can be exported as a static slide. We'll add this once the first topic looks good (not a v0 concern).

## Open decisions
- Routing: file-based static pages first; consider a tiny router later if topics share much chrome.
- Math rendering: defer KaTeX until a page actually needs it.
- Mobile: design for desktop first; scrollytelling adapts but interactivity may degrade.

## Status
- [x] Plan
- [x] Project scaffold (Vite + anime.js v4.4.1)
- [x] Landing page (`/`)
- [x] NNA v0 — **rejected**: too static, no ambient motion, no scrub-binding, no direct manipulation, one-sticky-figure pattern wrong for the topic
- [x] **NNA v1 rebuild** — 7 inline figures, ambient motion everywhere, scrub-bound convergence, draggable + slider controls, scrub-track tightened to remove post-marquee gap
- [x] **Light / dark mode** — `src/lib/theme.js` exposes `palette()` and `mountThemeToggle()`; figures read colors from palette and re-mount on `themechange`; toggle persisted in localStorage
- [x] **Light-mode contrast pass** — stored theme is now applied at module import (was after `mountAll()`, causing figures to render with dark palette on a light page); added `--edge` / `--fg-on-accent` / `--fg-on-fig` tokens for SVG connectors and on-cell text so contrast is correct in both themes
- [x] **Wide text** — prose container widened to match figure width (1180px); paragraphs no longer constrained to a narrow centered measure
- [x] **Basic NN primer** — new theory section between the hero and the weight-matrix figure: neuron anatomy, weights/biases, activation functions, layers, feedforward, loss/backprop/gradient descent, and how NNA re-uses this shape without learning

### Design principles (locked in after research, 2026-05-21)
Three concurrent motion layers (Ciechanowski / Distill / Setosa pattern):
1. **Ambient layer** — every figure has something always moving (dot jitter, contour breathing, halo pulse). Subdued amplitudes, slow periods, never stops.
2. **Direct manipulation** — drag handles, sliders, editable matrices. The reader's *hand* drives the figure, not just scroll.
3. **Scroll as camera + occasional scrub** — scroll moves you between many inline figures; on 2–3 marquee moments scroll position is locked 1:1 to a timeline via `onScroll({ sync: 0.15 })`.

Figures are **full-bleed** (or wide), not 50/50 with prose. Prose flows above/below as captions, not beside.

### NNA v1 figure list
1. Hero — literal NN diagram (input candidates → weight matrix → output candidates) with ambient signal pulse along edges
2. Weight matrix editor — 4×4 cells, click to edit, row auto-renormalizes to sum=1 (Setosa Markov pattern)
3. Transfer tug-of-war — 1D toy: two attractors, particle pulled by both, drag the weights
4. Bias as probability cloud — Gaussian disc over mini-landscape, draggable center + spread slider
5. Single iteration step — scrub-bound: parent gen → W multiply → child gen
6. **Full convergence (marquee)** — scrub-bound iter 0 → 6, draggable target, population/decay sliders, re-run button, ambient pulse
7. NNA vs GA side-by-side — both running ambient loops on same landscape/seed
8. Global "pause all" toggle bottom-left (Ciechanowski convention)

### Shared infra
- `src/lib/ambient.js` — jitter/pulse/breathe helpers built on anime.js loops
- `src/lib/scrub.js` — `scrubTimeline(target, build)` wrapper for `onScroll({ sync })`
- `src/lib/pause.js` — global engine pause/resume toggle
