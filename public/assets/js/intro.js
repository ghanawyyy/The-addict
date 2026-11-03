// =========================================================
// Opening animation, in the style of the logo:
//   1. flat red flames (the logo's own flame shape) rise and swing in a loop
//   2. the side flames sink, the big centre flame flies into the logo
//   3. it lands as the logo flame, then "The" and "ADDICT" appear
//
// Smoothness rules:
//   - every flame is a pre-drawn image (decoded once, then only moved)
//   - only transform / opacity are animated, so the graphics chip does the work
//   - nothing starts moving until the images are ready (no first-frame stutter)
// Plays once per visit (session); add ?intro=1 to replay.
// =========================================================
import { reducedMotion, lockScroll, unlockScroll } from './ui.js';

const SEEN_KEY = 'addict-intro-seen';

// Flame field: x = % from left, h = height in vh, c = colour, d = swing speed (s), delay (s),
// flip = mirrored, wide = only on bigger screens (phones need fewer to fill the screen)
const FIELD = [
  { x: 4, h: 40, c: '#6d0a0e', d: 1.15, delay: 0.0, flip: true },
  { x: 18, h: 54, c: '#930d13', d: 1.0, delay: 0.08 },
  { x: 33, h: 44, c: '#6d0a0e', d: 1.1, delay: 0.04, flip: true, wide: true },
  { x: 67, h: 46, c: '#6d0a0e', d: 1.08, delay: 0.06, wide: true },
  { x: 82, h: 56, c: '#930d13', d: 0.96, delay: 0.1, flip: true },
  { x: 96, h: 42, c: '#6d0a0e', d: 1.18, delay: 0.02 },
  { x: 11, h: 28, c: '#c3141a', d: 0.86, delay: 0.16 },
  { x: 42, h: 24, c: '#b01218', d: 0.92, delay: 0.2, flip: true },
  { x: 58, h: 26, c: '#b01218', d: 0.88, delay: 0.22 },
  { x: 89, h: 30, c: '#c3141a', d: 0.84, delay: 0.14, flip: true },
];
const HERO_COLOR = '#EC1F26';
const HERO_SWING = 0.95; // seconds per swing of the big flame
const LOOPS = 2;         // full swings before it flies to the logo
const FLIGHT = 750;      // ms

function shouldPlay() {
  try {
    if (new URLSearchParams(location.search).has('intro')) return true;
    return !sessionStorage.getItem(SEEN_KEY);
  } catch { return true; }
}
function markSeen() { try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ } }

// One small SVG image per colour, built from the logo's own flame path
function flameImageUrl(d, box, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.width} ${box.height}"><path fill="${color}" fill-rule="evenodd" d="${d}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function flameImg(src, aspect) {
  const img = new Image();
  img.alt = '';
  img.decoding = 'async';
  img.draggable = false;
  img.src = src;
  img.style.aspectRatio = aspect;
  return img;
}

export function runIntro({ onDone } = {}) {
  const intro = document.getElementById('intro');
  const body = document.body;
  const logoFlame = document.querySelector('.hero__logo .logo-flame-path');
  const finishReady = () => {
    body.classList.remove('is-intro', 'logo-in', 'flame-flew');
    body.classList.add('is-ready');
    if (onDone) onDone();
  };

  if (!intro || !logoFlame || !shouldPlay()) {
    intro?.remove();
    finishReady();
    return;
  }
  markSeen();
  try { history.scrollRestoration = 'manual'; } catch { /* ignore */ }
  window.scrollTo(0, 0);
  lockScroll();

  const stage = intro.querySelector('[data-intro-stage]');
  const skipBtn = intro.querySelector('.intro__skip');
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  let ended = false;
  let logoAt = 0;

  const showLogo = () => {
    if (logoAt) return;
    logoAt = performance.now();
    body.classList.add('logo-in');
  };

  const end = () => {
    if (ended) return;
    ended = true;
    timers.forEach(clearTimeout);
    showLogo();
    intro.classList.add('is-done');
    unlockScroll();
    const wait = Math.max(350, 800 - (performance.now() - logoAt));
    setTimeout(() => { finishReady(); intro.remove(); }, wait);
  };
  skipBtn?.addEventListener('click', end);

  // Reduced motion: no flames, just a gentle logo fade.
  if (reducedMotion()) {
    later(showLogo, 100);
    later(end, 800);
    return;
  }

  // ---- build the scene (nothing moves yet) ----
  const d = logoFlame.getAttribute('d');
  const box = logoFlame.getBBox();
  const aspect = `${box.width} / ${box.height}`;
  const urls = new Map();
  const urlFor = (c) => { if (!urls.has(c)) urls.set(c, flameImageUrl(d, box, c)); return urls.get(c); };

  const wide = window.innerWidth >= 600;
  const field = document.createElement('div');
  field.className = 'iflame-field';
  const imgs = [];
  for (const f of FIELD) {
    if (f.wide && !wide) continue;
    const img = flameImg(urlFor(f.c), aspect);
    img.className = `iflame${f.flip ? ' iflame--flip' : ''}`;
    img.style.setProperty('--x', f.x);
    img.style.setProperty('--h', f.h);
    img.style.setProperty('--d', `${f.d}s`);
    img.style.setProperty('--delay', `${f.delay}s`);
    field.append(img);
    imgs.push(img);
  }

  const embers = document.createElement('div');
  embers.className = 'embers';
  for (let i = 0; i < 8; i += 1) {
    const e = document.createElement('span');
    e.className = 'ember';
    e.style.setProperty('--x', (5 + Math.random() * 90).toFixed(1));
    e.style.setProperty('--s', `${(4 + Math.random() * 5).toFixed(1)}px`);
    e.style.setProperty('--d', `${(1.5 + Math.random() * 1).toFixed(2)}s`);
    e.style.setProperty('--delay', `${(0.2 + Math.random() * 1).toFixed(2)}s`);
    e.style.setProperty('--dx', `${(Math.random() * 50 - 25).toFixed(0)}px`);
    embers.append(e);
  }

  const hero = document.createElement('div');
  hero.className = 'iflame-hero';
  hero.style.setProperty('--hd', `${HERO_SWING}s`);
  const heroImg = flameImg(urlFor(HERO_COLOR), aspect);
  hero.append(heroImg);
  imgs.push(heroImg);
  stage.append(field, embers, hero);

  // size + centre the big flame in pixels (needed to fly it precisely)
  const place = () => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const h = Math.min(vh * 0.5, (vw * 0.78) * (box.height / box.width));
    const w = h * (box.width / box.height);
    hero.style.width = `${w}px`;
    hero.style.height = `${h}px`;
    hero.style.left = `${(vw - w) / 2}px`;
    hero.style.top = `${vh * 0.46 - h / 2}px`;
  };
  place();
  window.addEventListener('resize', place);

  // ---- fly the big flame into the logo ----
  const fly = () => {
    if (ended) return;
    window.removeEventListener('resize', place);
    intro.classList.add('is-settling'); // side flames sink, embers fade
    const from = hero.getBoundingClientRect();
    const to = logoFlame.getBoundingClientRect();
    const s = to.height / from.height;
    const dx = to.left - from.left;
    const dy = to.top - from.top;
    const anim = hero.animate([
      { transform: 'translate(0px, 0px) scale(1)' },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 30}px) scale(${(1 + s) / 2 + 0.05})`, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})` },
    ], { duration: FLIGHT, easing: 'cubic-bezier(0.6, 0, 0.3, 1)', fill: 'forwards' });
    anim.finished.then(() => {
      if (ended) return;
      // swap in the same frame: the logo flame appears exactly where the big flame landed
      body.classList.add('flame-flew');
      showLogo();
      hero.remove();
      later(end, 200);
    }).catch(() => end());
  };

  // wait for the swing to reach its rest pose (end of a loop), then fly: no jump
  const settle = () => {
    if (ended) return;
    let done = false;
    const go = (e) => {
      if (done || ended || (e && e.animationName !== 'iflame-swing')) return;
      done = true;
      heroImg.removeEventListener('animationiteration', go);
      hero.classList.add('is-flying'); // swing stops at its rest pose, flame stays fully visible
      fly();
    };
    heroImg.addEventListener('animationiteration', go);
    later(() => go(), HERO_SWING * 1000 + 150); // safety net
  };

  // ---- start only when every flame image is decoded ----
  let started = false;
  const start = () => {
    if (started || ended) return;
    started = true;
    requestAnimationFrame(() => {
      intro.classList.add('is-running');
      later(settle, (0.1 + HERO_SWING * LOOPS) * 1000 - 250);
      later(end, 6000); // never trap the visitor in the intro
    });
  };
  Promise.all(imgs.map((img) => img.decode().catch(() => null))).then(start);
  later(start, 600); // don't wait forever on a slow phone
}
