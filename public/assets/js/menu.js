// =========================================================
// Specialties carousel, search, and the swipeable menu.
// Everything re-renders when the language changes (English <-> Arabic).
// Horizontal scrolling works in both directions (LTR and RTL).
// =========================================================
import { BRAND, CATEGORIES, ITEMS, ITEM_BY_ID, LIMITS, money } from './data.js';
import { store } from './store.js';
import { openFlow } from './flow.js';
import { t, L, dirSign, onLangChange } from './i18n.js';
import { el, icon, stepper, updateStepper, scrollToEl, reducedMotion } from './ui.js';

const smooth = () => (reducedMotion() ? 'auto' : 'smooth');

// Scroll a horizontal container so that `child` is at its start (works LTR + RTL)
function scrollChildToStart(container, child, behavior) {
  const c = container.getBoundingClientRect();
  const r = child.getBoundingClientRect();
  const delta = dirSign() > 0 ? r.left - c.left : r.right - c.right;
  container.scrollBy({ left: delta, behavior });
}
// Centre `child` inside a horizontal container (works LTR + RTL)
function scrollChildToCenter(container, child, behavior) {
  const c = container.getBoundingClientRect();
  const r = child.getBoundingClientRect();
  container.scrollBy({ left: (r.left + r.width / 2) - (c.left + c.width / 2), behavior });
}

// itemId -> Set of qty containers on the page (same item can show in several places)
const controls = new Map();

function renderQty(box, id, force = false) {
  const q = store.qty(id);
  const name = L(ITEM_BY_ID.get(id).name);
  if (q === 0) {
    if (box.dataset.mode !== 'add' || force) {
      box.replaceChildren(el('button', { type: 'button', class: 'add-btn', 'aria-label': t('card.addName', { name }), onclick: () => onAdd(id) }, icon('plus'), t('card.add')));
      box.dataset.mode = 'add';
    }
    return;
  }
  const canInc = q < store.maxQty(id);
  if (box.dataset.mode !== 'step' || force) {
    box.replaceChildren(stepper({ value: q, label: name, canInc, onDec: () => store.dec(id), onInc: () => store.inc(id) }));
    box.dataset.mode = 'step';
  } else {
    updateStepper(box.firstElementChild, { value: q, canInc });
  }
}

function onAdd(id) {
  store.inc(id);
  if (ITEM_BY_ID.get(id).combo) openFlow(id); // automatic combo / drink questions
}

store.subscribe((e) => {
  const ids = e.type === 'clear' ? [...controls.keys()] : [e.id];
  for (const id of ids) {
    const set = controls.get(id);
    if (!set) continue;
    for (const box of set) {
      if (!box.isConnected) { set.delete(box); continue; }
      renderQty(box, id);
    }
  }
});

export function card(item, { showBadge = true } = {}) {
  const qty = el('div', { class: 'qty' });
  if (!controls.has(item.id)) controls.set(item.id, new Set());
  controls.get(item.id).add(qty);
  renderQty(qty, item.id, true);
  const tag = showBadge && item.tags[0];
  return el('article', { class: 'card' },
    el('div', { class: 'card__media', 'aria-hidden': 'true' },
      tag ? el('span', { class: `badge badge--${tag}` }, t(`tag.${tag}`)) : null),
    el('div', { class: 'card__body' },
      el('h3', { class: 'card__title' }, L(item.name)),
      el('p', { class: 'card__desc' }, L(item.desc))),
    el('div', { class: 'card__foot' },
      el('span', { class: 'price' }, money(item.price)),
      qty));
}

// Contact "frame" cards (same style as the footer, compact size)
export function contactCards() {
  const mini = (cls, href, iconName, label, value, ltr) => el('a', { class: `fcard fcard--mini ${cls}`, href, target: '_blank', rel: 'noopener noreferrer' },
    el('span', { class: 'fcard__badge' }, icon(iconName)),
    el('span', { class: 'fcard__k' }, label),
    el('span', { class: 'fcard__mv', dir: ltr ? 'ltr' : null }, ...value.split('.').flatMap((part, i) => (i ? [el('wbr'), `.${part}`] : [part]))));
  return el('div', { class: 'fcards fcards--mini' },
    mini('fcard--red', `https://wa.me/${BRAND.whatsapp}`, 'whatsapp', t('contact.waMini'), '71 181 987', true),
    mini('fcard--white', BRAND.instagram, 'instagram', t('contact.igK'), '@theaddict.lb', true),
    mini('fcard--gray', BRAND.facebook, 'facebook', t('contact.fbK'), t('contact.fbV')));
}

// ---------------------------------------------------------
// Addict Specialties: offers, combos, new items, bestsellers
// ---------------------------------------------------------
export function initSpecialties(bg) {
  const filters = document.querySelector('[data-spec-filters]');
  const track = document.querySelector('[data-spec-track]');
  const prev = document.querySelector('[data-spec-prev]');
  const next = document.querySelector('[data-spec-next]');
  if (!filters || !track) return;
  const special = ITEMS.filter((i) => i.tags.length);
  const keys = ['all', 'offer', 'combo', 'new', 'best'];
  let current = 'all';

  const updateArrows = () => {
    if (!prev || !next) return;
    const pos = Math.abs(track.scrollLeft);
    prev.disabled = pos < 4;
    next.disabled = pos + track.clientWidth >= track.scrollWidth - 4;
  };
  const draw = () => {
    const list = current === 'all' ? special : special.filter((i) => i.tags.includes(current));
    track.replaceChildren(...list.map((i) => card(i)));
    track.scrollTo({ left: 0 });
    updateArrows();
  };
  const drawFilters = () => {
    filters.replaceChildren(...keys.map((key) => el('button', {
      type: 'button', class: 'chip', role: 'tab', 'aria-selected': String(key === current),
      onclick: (e) => {
        current = key;
        for (const b of filters.children) b.setAttribute('aria-selected', String(b === e.currentTarget));
        draw();
      },
    }, t(`spec.${key}`))));
  };

  const stepPx = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 14 : track.clientWidth);
  // "next" always means toward the end of the list, whatever the reading direction
  prev?.addEventListener('click', () => track.scrollBy({ left: -stepPx() * dirSign(), behavior: smooth() }));
  next?.addEventListener('click', () => track.scrollBy({ left: stepPx() * dirSign(), behavior: smooth() }));
  track.addEventListener('scroll', () => requestAnimationFrame(updateArrows), { passive: true });
  window.addEventListener('resize', updateArrows);
  bg.addSource(track);
  drawFilters();
  draw();
  onLangChange(() => { drawFilters(); draw(); });
}

// ---------------------------------------------------------
// Menu: category chips + swipeable panels
// ---------------------------------------------------------
export function initMenu(bg) {
  const bar = document.querySelector('[data-cat-chips]');
  const track = document.querySelector('[data-menu-track]');
  const prevBtn = document.querySelector('[data-cat-prev]');
  const nextBtn = document.querySelector('[data-cat-next]');
  const menuTop = document.getElementById('menu-start');
  if (!bar || !track) return null;

  let active = 0;
  let chips = [];
  let panels = [];
  let lockTo = null;   // set while a button-triggered scroll is animating
  let settled = 0;     // category index after the last swipe finished
  let scrolling = false;
  const ro = new ResizeObserver(() => { if (!scrolling) fitHeight(); });

  const indexFromScroll = () => Math.round(Math.abs(track.scrollLeft) / Math.max(1, track.clientWidth));

  function fitHeight() {
    const p = panels[active];
    if (p) track.style.height = `${p.offsetHeight}px`;
  }

  function markActive() {
    chips.forEach((c, k) => c.setAttribute('aria-selected', String(k === active)));
    if (prevBtn) prevBtn.disabled = active === 0;
    if (nextBtn) nextBtn.disabled = active === panels.length - 1;
  }

  // Note: the track height is only adjusted once scrolling has finished.
  // Changing it mid-scroll makes the browser re-snap and stop halfway.
  function setActive(i) {
    if (i === active) return;
    active = i;
    markActive();
    scrollChildToCenter(bar, chips[i], smooth());
  }

  // bring the start of the category into view if the visitor is further down
  function alignTop() {
    if (!menuTop) return;
    const y = menuTop.getBoundingClientRect().top;
    const offset = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 0;
    if (y < offset - 2) scrollToEl(menuTop);
  }

  function goTo(i, fromButton) {
    const idx = Math.max(0, Math.min(panels.length - 1, i));
    const already = idx === indexFromScroll();
    lockTo = already ? null : idx;
    // allow the programmatic scroll to pass over categories (scroll-snap-stop would halt it after one)
    if (!already) track.classList.add('is-jumping');
    scrollChildToStart(track, panels[idx], smooth());
    setActive(idx);
    settled = idx;
    if (already) fitHeight();
    if (fromButton) alignTop();
  }

  function build() {
    ro.disconnect();
    chips = CATEGORIES.map((c, i) => el('button', {
      type: 'button', class: 'chip', role: 'tab', id: `tab-${c.id}`, 'aria-controls': `panel-${c.id}`, 'aria-selected': String(i === active),
      onclick: () => goTo(i, true),
    }, L(c.name)));
    bar.replaceChildren(...chips);

    panels = CATEGORIES.map((c, i) => {
      const items = ITEMS.filter((it) => it.cat === c.id);
      const nextCat = CATEGORIES[i + 1];
      return el('section', { class: 'panel', id: `panel-${c.id}`, role: 'tabpanel', 'aria-labelledby': `tab-${c.id}` },
        el('div', { class: 'panel__head' }, el('h3', {}, L(c.name)), el('span', {}, t('menu.count', { n: items.length }))),
        el('div', { class: 'grid' }, items.map((it) => card(it, { showBadge: c.id === 'specialties' }))),
        el('div', { class: 'reach' },
          el('h4', {}, t('menu.endTitle', { cat: L(c.name) })),
          el('p', {}, t('menu.endText')),
          contactCards(),
          nextCat
            ? el('div', { class: 'reach__next' }, el('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: () => goTo(i + 1, true) }, t('menu.next', { cat: L(nextCat.name) }), icon('right', 'arrow arrow--r')))
            : el('div', { class: 'reach__next' }, el('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: () => goTo(0, true) }, icon('left', 'arrow arrow--l'), t('menu.backTo', { cat: L(CATEGORIES[0].name) })))));
    });
    track.replaceChildren(...panels);
    panels.forEach((p) => ro.observe(p));
    markActive();
    // keep the same category on screen (also after switching language/direction)
    lockTo = active;
    requestAnimationFrame(() => {
      track.classList.add('is-jumping');
      scrollChildToStart(track, panels[active], 'auto');
      requestAnimationFrame(() => { if (!scrolling) track.classList.remove('is-jumping'); });
      scrollChildToCenter(bar, chips[active], 'auto');
      fitHeight();
    });
  }

  let settleTimer;
  track.addEventListener('scroll', () => {
    scrolling = true;
    const idx = indexFromScroll();
    if (lockTo === null) setActive(idx);
    else if (idx === lockTo && Math.abs(Math.abs(track.scrollLeft) - lockTo * track.clientWidth) < 2) lockTo = null;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      scrolling = false;
      track.classList.remove('is-jumping');
      lockTo = null;
      const now = indexFromScroll();
      setActive(now);
      fitHeight();
      // only move the page when the visitor actually switched category
      if (now !== settled) { settled = now; alignTop(); }
    }, 160);
  }, { passive: true });

  // "previous"/"next" follow the reading direction; the arrow icons flip in Arabic
  prevBtn?.addEventListener('click', () => goTo(active - 1, true));
  nextBtn?.addEventListener('click', () => goTo(active + 1, true));

  // keyboard: arrow keys on the chips follow the reading direction
  bar.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const forward = (e.key === 'ArrowRight') === (dirSign() > 0);
    const i = Math.max(0, Math.min(chips.length - 1, active + (forward ? 1 : -1)));
    goTo(i, false);
    chips[i].focus();
  });

  window.addEventListener('resize', () => {
    lockTo = active;
    track.classList.add('is-jumping');
    scrollChildToStart(track, panels[active], 'auto');
    requestAnimationFrame(() => { if (!scrolling) track.classList.remove('is-jumping'); });
    fitHeight();
  });

  bg.addSource(track);
  build();
  onLangChange(build);
  return { goTo };
}

// ---------------------------------------------------------
// Search (above the menu) — finds items in English or Arabic
// ---------------------------------------------------------
function norm(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')       // é -> e
    .replace(/[ً-ٰٟـ]/g, '')               // Arabic diacritics + tatweel
    .replace(/[آأإ]/g, 'ا')                // آ أ إ -> ا
    .replace(/ة/g, 'ه')                              // ة -> ه
    .replace(/ى/g, 'ي');                             // ى -> ي
}
const TAG_WORDS = { offer: 'offer offers deal عرض عروض', combo: 'combo combos كومبو', new: 'new جديد', best: 'bestseller bestsellers الأكثر طلبا' };
const HAY = new Map(ITEMS.map((it) => [it.id, norm([it.name.en, it.name.ar, it.desc.en, it.desc.ar, ...it.tags.map((x) => TAG_WORDS[x])].join(' '))]));

export function initSearch() {
  const input = document.querySelector('[data-search]');
  const clear = document.querySelector('[data-search-clear]');
  const results = document.querySelector('[data-results]');
  const menuArea = document.querySelector('[data-menu-area]');
  if (!input || !results || !menuArea) return;
  input.maxLength = LIMITS.searchLen;
  let timer;

  const run = () => {
    const raw = input.value.trim().slice(0, LIMITS.searchLen);
    const q = norm(raw);
    clear.hidden = !input.value;
    if (!q) {
      results.hidden = true;
      results.replaceChildren();
      menuArea.hidden = false;
      return;
    }
    const words = q.split(/\s+/).filter(Boolean);
    const found = ITEMS.filter((it) => words.every((w) => HAY.get(it.id).includes(w)));
    menuArea.hidden = true;
    results.hidden = false;
    const info = el('p', { class: 'results__info', 'aria-live': 'polite' },
      found.length ? t('search.results', { n: found.length, q: raw }) : '');
    if (!found.length) {
      results.replaceChildren(info, el('div', { class: 'empty' },
        el('strong', {}, t('search.none')),
        t('search.noneText', { q: raw }),
        el('div', {}, el('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: reset }, t('search.showAll')))));
      return;
    }
    results.replaceChildren(info, el('div', { class: 'grid' }, found.map((it) => card(it))));
  };
  const reset = () => { input.value = ''; run(); input.focus(); };

  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 120); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { input.value = ''; run(); }
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
  });
  clear.addEventListener('click', reset);
  run();
  onLangChange(run);
}
