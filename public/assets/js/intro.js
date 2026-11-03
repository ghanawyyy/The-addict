// =========================================================
// Opening animation, in the style of the logo:
//   1. flat red flames (the logo's own flame shape) rise and swing in a loop
//   2. the side flames sink, the big centre flame flies into the logo
//   3. it lands as the logo flame, then "The" and "ADDICT" appear
// Plays once per visit (session); add ?intro=1 to replay.
// =========================================================
import { reducedMotion, lockScroll, unlockScroll } from './ui.js';

const SEEN_KEY = 'addict-intro-seen';
const SVG_NS = 'http://www.w3.org/2000/svg';

// Flame field: x = % from left, h = height in vh, c = colour, d = swing speed (s), delay (s), flip = mirrored
const FIELD = [
  { x: 4, h: 40, c: '#6d0a0e', d: 1.3, delay: 0.0, flip: true },
  { x: 18, h: 54, c: '#930d13', d: 1.12, delay: 0.1 },
  { x: 33, h: 44, c: '#6d0a0e', d: 1.24, delay: 0.05, flip: true },
  { x: 67, h: 46, c: '#6d0a0e', d: 1.2, delay: 0.08 },
  { x: 82, h: 56, c: '#930d13', d: 1.08, delay: 0.14, flip: true },
  { x: 96, h: 42, c: '#6d0a0e', d: 1.34, delay: 0.03 },
  { x: 11, h: 28, c: '#c3141a', d: 0.96, delay: 0.22 },
  { x: 42, h: 24, c: '#b01218', d: 1.02, delay: 0.26, flip: true },
  { x: 58, h: 26, c: '#b01218', d: 0.98, delay: 0.3 },
  { x: 89, h: 30, c: '#c3141a', d: 0.94, delay: 0.2, flip: true },
];
const HERO_SWING = 1.1; // seconds per swing loop of the big flame
const LOOPS = 2;        // how many full swings before it flies to the logo

function shouldPlay() {
  try {
    if (new URLSearchParams(location.search).has('intro')) return true;
    return !sessionStorage.getItem(SEEN_KEY);
  } catch { return true; }
}
function markSeen() { try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ } }

function flameSvg(d, box, color) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.style.aspectRatio = `${box.width} / ${box.height}`;
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', color);
  path.setAttribute('fill-rule', 'evenodd');
  svg.append(path);
  return svg;
}

function flame(d, box, f, extraClass = '') {
  const wrap = document.createElement('div');
  wrap.className = `iflame ${extraClass}${f.flip ? ' iflame--flip' : ''}`;
  wrap.style.setProperty('--x', f.x);
  wrap.style.setProperty('--h', f.h);
  wrap.style.setProperty('--d', `${f.d}s`);
  wrap.style.setProperty('--delay', `${f.delay}s`);
  const rise = document.createElement('div');
  rise.className = 'iflame__rise';
  const mirror = document.createElement('div');
  mirror.className = 'iflame__mirror';
  mirror.append(flameSvg(d, box, f.c));
  rise.append(mirror);
  wrap.append(rise);
  return wrap;
}

function embers(stage) {
  const box = document.createElement('div');
  box.className = 'embers';
  stage.append(box);
  for (let i = 0; i < 12; i += 1) {
    const e = document.createElement('span');
    e.className = 'ember';
    e.style.setProperty('--x', (5 + Math.random() * 90).toFixed(1));
    e.style.setProperty('--s', `${(4 + Math.random() * 6).toFixed(1)}px`);
    e.style.setProperty('--d', `${(1.6 + Math.random() * 1.2).toFixed(2)}s`);
    e.style.setProperty('--delay', `${(0.3 + Math.random() * 1.4).toFixed(2)}s`);
    e.style.setProperty('--dx', `${(Math.random() * 60 - 30).toFixed(0)}px`);
    box.append(e);
  }
}

export function runIntro({ onDone } = {}) {
  const intro = document.getElementById('intro');
  const body = document.body;
  const logoFlame = document.querySelector('.hero__logo .logo-flame');
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
    const wait = Math.max(450, 1150 - (performance.now() - logoAt));
    setTimeout(() => { finishReady(); intro.remove(); }, wait);
  };
  skipBtn?.addEventListener('click', end);

  // Reduced motion: no flames, just a gentle logo fade.
  if (reducedMotion()) {
    later(showLogo, 100);
    later(end, 900);
    return;
  }

  // Build the flames from the logo's own flame shape
  const d = logoFlame.getAttribute('d');
  const box = logoFlame.getBBox();
  const field = FIELD.map((f) => flame(d, box, f, 'iflame--side'));
  stage.append(...field);
  embers(stage);

  const hero = flame(d, box, { x: 0, h: 0, c: '#EC1F26', d: HERO_SWING, delay: 0.15 }, 'iflame--hero');
  stage.append(hero);
  const heroSvg = hero.querySelector('svg');

  // size + centre the big flame in pixels (needed to fly it precisely)
  const place = () => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const h = Math.min(vh * 0.5, (vw * 0.78) * (box.height / box.width));
    const w = h * (box.width / box.height);
    hero.style.height = `${h}px`;
    hero.style.width = `${w}px`;
    hero.style.left = `${(vw - w) / 2}px`;
    hero.style.top = `${vh * 0.46 - h / 2}px`;
  };
  place();
  window.addEventListener('resize', place);

  // After a few swings: wait for the swing to reach its rest pose, then fly.
  const settle = () => {
    if (ended) return;
    let done = false;
    const go = () => {
      if (done || ended) return;
      done = true;
      heroSvg.style.animation = 'none'; // rest pose = start of the swing loop: no jump
      fly();
    };
    heroSvg.addEventListener('animationiteration', go, { once: true });
    later(go, HERO_SWING * 1000 + 150); // safety net
  };

  const fly = () => {
    window.removeEventListener('resize', place);
    intro.classList.add('is-settling');
    const from = hero.getBoundingClientRect();
    const to = logoFlame.getBoundingClientRect();
    const s = to.height / from.height;
    const dx = to.left - from.left;
    const dy = to.top - from.top;
    const anim = hero.animate([
      { transform: 'translate(0, 0) scale(1)' },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 30}px) scale(${(1 + s) / 2 + 0.05})`, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})` },
    ], { duration: 900, easing: 'cubic-bezier(0.6, 0, 0.3, 1)', fill: 'forwards' });
    anim.finished.then(() => {
      if (ended) return;
      body.classList.add('flame-flew');
      showLogo();     // logo flame takes over exactly where the big flame landed
      hero.remove();
      later(end, 250);
    }).catch(() => end());
  };

  later(settle, (0.15 + HERO_SWING * LOOPS) * 1000 - 300);
  // never trap the visitor in the intro
  later(end, 6500);
}
