// =========================================================
// Specialties carousel, search, and the swipeable menu.
// =========================================================
import { BRAND, CATEGORIES, ITEMS, TAGS, LIMITS, money } from './data.js';
import { store } from './store.js';
import { openFlow } from './flow.js';
import { el, icon, stepper, updateStepper, scrollToEl, reducedMotion } from './ui.js';

// itemId -> Set of qty containers on the page (same item can show in several places)
const controls = new Map();

function renderQty(box, id) {
  const q = store.qty(id);
  const name = box.dataset.name;
  if (q === 0) {
    if (box.dataset.mode !== 'add') {
      box.replaceChildren(el('button', { type: 'button', class: 'add-btn', 'aria-label': `Add ${name}`, onclick: () => onAdd(id) }, icon('plus'), 'Add'));
      box.dataset.mode = 'add';
    }
    return;
  }
  const canInc = q < store.maxQty(id);
  if (box.dataset.mode !== 'step') {
    box.replaceChildren(stepper({ value: q, label: name, canInc, onDec: () => store.dec(id), onInc: () => store.inc(id) }));
    box.dataset.mode = 'step';
  } else {
    updateStepper(box.firstElementChild, { value: q, canInc });
  }
}

function onAdd(id) {
  const item = ITEMS.find((i) => i.id === id);
  store.inc(id);
  if (item.combo) openFlow(id); // automatic combo / drink questions
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
  const qty = el('div', { class: 'qty', dataset: { name: item.name } });
  if (!controls.has(item.id)) controls.set(item.id, new Set());
  controls.get(item.id).add(qty);
  renderQty(qty, item.id);
  const tag = showBadge && item.tags[0];
  return el('article', { class: 'card' },
    el('div', { class: 'card__media', 'aria-hidden': 'true' },
      tag ? el('span', { class: `badge badge--${tag}` }, TAGS[tag]) : null),
    el('div', { class: 'card__body' },
      el('h3', { class: 'card__title' }, item.name),
      el('p', { class: 'card__desc' }, item.desc)),
    el('div', { class: 'card__foot' },
      el('span', { class: 'price' }, money(item.price)),
      qty));
}

export function socialLinks() {
  return el('div', { class: 'reach__links' },
    el('a', { class: 'social', href: BRAND.facebook, target: '_blank', rel: 'noopener noreferrer' }, icon('facebook'), 'Facebook'),
    el('a', { class: 'social', href: BRAND.instagram, target: '_blank', rel: 'noopener noreferrer' }, icon('instagram'), 'Instagram'),
    el('a', { class: 'social', href: `https://wa.me/${BRAND.whatsapp}`, target: '_blank', rel: 'noopener noreferrer' }, icon('whatsapp'), BRAND.whatsappDisplay));
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
  const opts = [['all', 'All'], ['offer', 'Offers'], ['combo', 'Combos'], ['new', 'New'], ['best', 'Bestsellers']];
  let current = 'all';

  const draw = () => {
    const list = current === 'all' ? special : special.filter((i) => i.tags.includes(current));
    track.replaceChildren(...list.map((i) => card(i)));
    track.scrollTo({ left: 0 });
    updateArrows();
  };
  const buttons = opts.map(([key, label]) => el('button', {
    type: 'button', class: 'chip', role: 'tab', 'aria-selected': String(key === current),
    onclick: () => {
      current = key;
      for (const b of buttons) b.setAttribute('aria-selected', String(b === buttons[opts.findIndex((o) => o[0] === key)]));
      draw();
    },
  }, label));
  filters.replaceChildren(...buttons);

  const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 14 : track.clientWidth);
  const updateArrows = () => {
    if (!prev || !next) return;
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  };
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reducedMotion() ? 'auto' : 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reducedMotion() ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', () => requestAnimationFrame(updateArrows), { passive: true });
  window.addEventListener('resize', updateArrows);
  bg.addSource(track);
  draw();
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
  if (!bar || !track) return;

  let active = 0;
  const chips = CATEGORIES.map((c, i) => el('button', {
    type: 'button', class: 'chip', role: 'tab', id: `tab-${c.id}`, 'aria-controls': `panel-${c.id}`, 'aria-selected': String(i === 0),
    onclick: () => goTo(i, true),
  }, c.name));
  bar.replaceChildren(...chips);

  const panels = CATEGORIES.map((c, i) => {
    const items = ITEMS.filter((it) => it.cat === c.id);
    const nextCat = CATEGORIES[i + 1];
    return el('section', { class: 'panel', id: `panel-${c.id}`, role: 'tabpanel', 'aria-labelledby': `tab-${c.id}` },
      el('div', { class: 'panel__head' }, el('h3', {}, c.name), el('span', {}, `${items.length} items`)),
      el('div', { class: 'grid' }, items.map((it) => card(it, { showBadge: c.id === 'specialties' }))),
      el('div', { class: 'reach' },
        el('h4', {}, `That's all in ${c.name}`),
        el('p', {}, 'Questions or special requests? Reach The Addict directly:'),
        socialLinks(),
        nextCat
          ? el('div', { class: 'reach__next' }, el('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: () => goTo(i + 1, true) }, `Next: ${nextCat.name}`, icon('right', 'arrow arrow--r')))
          : el('div', { class: 'reach__next' }, el('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: () => goTo(0, true) }, icon('left', 'arrow arrow--l'), `Back to ${CATEGORIES[0].name}`))));
  });
  track.replaceChildren(...panels);

  const fitHeight = () => {
    const p = panels[active];
    if (p) track.style.height = `${p.offsetHeight}px`;
  };
  const ro = new ResizeObserver(fitHeight);
  panels.forEach((p) => ro.observe(p));

  const setActive = (i) => {
    if (i === active) return;
    active = i;
    chips.forEach((c, k) => c.setAttribute('aria-selected', String(k === i)));
    const chip = chips[i];
    bar.scrollTo({ left: chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2, behavior: reducedMotion() ? 'auto' : 'smooth' });
    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) nextBtn.disabled = i === panels.length - 1;
    fitHeight();
  };

  // bring the start of the category into view if the visitor is further down
  const alignTop = () => {
    if (!menuTop) return;
    const y = menuTop.getBoundingClientRect().top;
    const offset = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 0;
    if (y < offset - 2) scrollToEl(menuTop);
  };

  let lockTo = null;   // set while a button-triggered scroll is animating
  let settled = 0;     // category index after the last swipe finished

  function goTo(i, fromButton) {
    const idx = Math.max(0, Math.min(panels.length - 1, i));
    lockTo = idx;
    track.scrollTo({ left: idx * track.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
    setActive(idx);
    settled = idx;
    if (fromButton) alignTop();
  }

  let settleTimer;
  track.addEventListener('scroll', () => {
    const w = Math.max(1, track.clientWidth);
    const idx = Math.round(track.scrollLeft / w);
    if (lockTo === null) setActive(idx);
    else if (Math.abs(track.scrollLeft - lockTo * w) < 2) lockTo = null;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      lockTo = null;
      const now = Math.round(track.scrollLeft / w);
      setActive(now);
      // only move the page when the visitor actually switched category
      if (now !== settled) { settled = now; alignTop(); }
    }, 160);
  }, { passive: true });

  prevBtn?.addEventListener('click', () => goTo(active - 1, true));
  nextBtn?.addEventListener('click', () => goTo(active + 1, true));
  if (prevBtn) prevBtn.disabled = true;

  // keyboard: left/right arrows on the chips
  bar.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = active + (e.key === 'ArrowRight' ? 1 : -1);
    goTo(i, false);
    chips[Math.max(0, Math.min(chips.length - 1, i))].focus();
  });

  window.addEventListener('resize', () => {
    track.scrollTo({ left: active * track.clientWidth });
    fitHeight();
  });

  bg.addSource(track);
  requestAnimationFrame(fitHeight);
  return { goTo };
}

// ---------------------------------------------------------
// Search (above the menu)
// ---------------------------------------------------------
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function initSearch() {
  const input = document.querySelector('[data-search]');
  const clear = document.querySelector('[data-search-clear]');
  const results = document.querySelector('[data-results]');
  const menuArea = document.querySelector('[data-menu-area]');
  if (!input || !results || !menuArea) return;
  input.maxLength = LIMITS.searchLen;
  let t;

  const run = () => {
    const q = norm(input.value.trim()).slice(0, LIMITS.searchLen);
    clear.hidden = !input.value;
    if (!q) {
      results.hidden = true;
      results.replaceChildren();
      menuArea.hidden = false;
      return;
    }
    const words = q.split(/\s+/).filter(Boolean);
    const found = ITEMS.filter((it) => {
      const hay = norm(`${it.name} ${it.desc} ${it.tags.map((x) => TAGS[x]).join(' ')}`);
      return words.every((w) => hay.includes(w));
    });
    menuArea.hidden = true;
    results.hidden = false;
    const info = el('p', { class: 'results__info', 'aria-live': 'polite' },
      found.length ? `${found.length} result${found.length === 1 ? '' : 's'} for “${input.value.trim()}”` : '');
    if (!found.length) {
      results.replaceChildren(info, el('div', { class: 'empty' },
        el('strong', {}, 'Nothing found'),
        `We couldn't find “${input.value.trim()}”. Try another word.`,
        el('div', {}, el('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: reset }, 'Show the full menu'))));
      return;
    }
    results.replaceChildren(info, el('div', { class: 'grid' }, found.map((it) => card(it))));
  };
  const reset = () => { input.value = ''; run(); input.focus(); };

  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 120); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { input.value = ''; run(); }
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
  });
  clear.addEventListener('click', reset);
  run();
}
