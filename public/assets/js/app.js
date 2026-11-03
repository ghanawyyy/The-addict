// =========================================================
// The Addict — app entry
// =========================================================
import { money } from './data.js';
import { store } from './store.js';
import { hydrateIcons, scrollToEl, reducedMotion } from './ui.js';
import { applyStatic, setLang, getLang } from './i18n.js';
import { initBackground } from './background.js';
import { runIntro } from './intro.js';
import { initFlow } from './flow.js';
import { initCart, openCart } from './cart.js';
import { initMenu, initSpecialties, initSearch } from './menu.js';

hydrateIcons();
applyStatic(); // English or Arabic texts, before anything is drawn
const bg = initBackground();
initCart();
initFlow(bg); // created after the order sheet so it can open on top of it
initSpecialties(bg);
initMenu(bg);
initSearch();
runIntro();

// ---------- in-page navigation (smooth, no hash jumps) ----------
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-scroll]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  const target = id === 'top' ? document.body : document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  if (id === 'top') window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  else scrollToEl(target);
});

for (const b of document.querySelectorAll('[data-open-cart]')) b.addEventListener('click', openCart);

// ---------- top bar turns solid after the hero logo ----------
const topbar = document.getElementById('topbar');
const heroLogo = document.querySelector('.hero__logo');
if (topbar && heroLogo && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    topbar.classList.toggle('is-solid', !entry.isIntersecting);
  }, { rootMargin: '-60px 0px 0px 0px' }).observe(heroLogo);
}

// ---------- floating order bar + header count ----------
const cartbar = document.querySelector('[data-cartbar]');
const countEls = document.querySelectorAll('[data-cart-count]');
const barCount = document.querySelector('[data-bar-count]');
const barTotal = document.querySelector('[data-bar-total]');
const toTop = document.querySelector('[data-to-top]');
let lastCount = store.count();

function syncCart() {
  const c = store.count();
  for (const n of countEls) {
    n.textContent = String(c);
    n.classList.toggle('is-on', c > 0);
  }
  if (barCount) barCount.textContent = String(c);
  if (barTotal) barTotal.textContent = money(store.total());
  cartbar?.classList.toggle('is-on', c > 0);
  toTop?.classList.toggle('no-bar', c === 0);
  if (c > lastCount) {
    for (const node of [cartbar, document.querySelector('.cart-btn')]) {
      if (!node) continue;
      node.classList.remove('is-bump');
      void node.offsetWidth;
      node.classList.add('is-bump');
    }
  }
  lastCount = c;
}
store.subscribe(syncCart);
syncCart();

// ---------- back to top ----------
if (toTop) {
  const onScroll = () => toTop.classList.toggle('is-on', window.scrollY > window.innerHeight * 1.1);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }));
}

// ---------- language switch (English <-> Arabic) ----------
let switching = false;
for (const b of document.querySelectorAll('[data-lang]')) {
  b.addEventListener('click', () => {
    const next = b.dataset.lang;
    if (switching || next === getLang()) return;
    switching = true;
    document.body.classList.add('is-switching');   // soft fade out
    setTimeout(() => {
      setLang(next);                                // flips texts + direction, re-renders the menu
      requestAnimationFrame(() => {
        document.body.classList.remove('is-switching'); // fade back in
        switching = false;
      });
    }, reducedMotion() ? 0 : 180);
  });
}
