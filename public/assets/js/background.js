// =========================================================
// Food-icon background that follows the visitor:
//  - vertical page scroll moves it up/down (parallax)
//  - horizontal swipes (menu, carousels) move it left/right
// One transform on one layer, eased with requestAnimationFrame,
// wrapped by the tile size so it never runs out (no jumps, no gaps).
// =========================================================
import { reducedMotion } from './ui.js';

const TILE = 440;
const KY = 0.35; // how strongly the pattern follows vertical scroll
const KX = 0.3;  // ... and horizontal swipes
const EASE = 0.16;

export function initBackground() {
  // one GPU layer: `translate` follows the visitor, the CSS `transform` animation drifts it
  const layer = document.querySelector('.bg__tile');
  const still = reducedMotion();
  let swipe = 0; // accumulated horizontal movement from all swipe areas
  const last = new WeakMap();
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let raf = 0;

  const wrap = (v) => (((v % TILE) + TILE) % TILE) - TILE;
  const apply = () => {
    if (layer) layer.style.translate = `${wrap(cx).toFixed(1)}px ${wrap(cy).toFixed(1)}px`;
  };
  const tick = () => {
    cx += (tx - cx) * EASE;
    cy += (ty - cy) * EASE;
    if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05) {
      cx = tx;
      cy = ty;
      raf = 0;
    } else {
      raf = requestAnimationFrame(tick);
    }
    apply();
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const onScroll = () => {
    if (still) return;
    ty = -window.scrollY * KY;
    kick();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  function addSource(node) {
    if (!node || last.has(node)) return;
    last.set(node, node.scrollLeft);
    node.addEventListener('scroll', () => {
      const prev = last.get(node);
      last.set(node, node.scrollLeft);
      if (still) return;
      swipe += node.scrollLeft - prev;
      tx = -swipe * KX;
      kick();
    }, { passive: true });
  }

  onScroll();
  cx = tx;
  cy = ty;
  apply();
  return { addSource };
}
