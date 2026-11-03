// =========================================================
// Automatic questions after adding a sandwich / burger:
//   combo?  -> regular (4 fries) | special fries (8)  -> drink? -> drinks (8)
//   no combo (🚫) -> drink? -> no drink -> back to the menu
// Combos per sandwich line can never exceed the sandwich quantity.
// =========================================================
import { ITEM_BY_ID, COMBO_REGULAR, COMBO_SPECIAL, DRINKS, money } from './data.js';
import { store } from './store.js';
import { Sheet } from './sheet.js';
import { el, icon, stepper, updateStepper, toast } from './ui.js';

const PHASE = { combo: 0, comboType: 1, regular: 1, special: 1, drink: 2, drinks: 2 };

let sheet;
let bg;
let state = { id: null, step: 'combo', hist: [] };
let unsub = null;
let refreshers = [];

export function initFlow(background) {
  bg = background;
  sheet = new Sheet('flow', { label: 'Combo and drinks' });
  sheet.onBack = back;
  sheet.onClosed = () => {
    if (unsub) unsub();
    unsub = null;
    refreshers = [];
  };
}

export function openFlow(id, { fromCart = false } = {}) {
  const item = ITEM_BY_ID.get(id);
  if (!item || !item.combo) return;
  state = { id, step: 'combo', hist: [], fromCart };
  sheet.setTitle('Combo & drink');
  renderSub();
  render(1);
  sheet.open();
  if (unsub) unsub();
  unsub = store.subscribe(() => {
    if (!store.qty(state.id)) { sheet.requestClose(); return; }
    for (const fn of refreshers) fn();
  });
}

function go(step) {
  state.hist.push(state.step);
  state.step = step;
  render(1);
}

function back() {
  if (!state.hist.length) { sheet.requestClose(); return; }
  state.step = state.hist.pop();
  render(-1);
}

function finish() {
  sheet.requestClose();
  if (!state.fromCart) setTimeout(() => toast('Added to your order 🔥'), 250);
}

// ---------- header: item + its quantity ----------
function renderSub() {
  const item = ITEM_BY_ID.get(state.id);
  const label = item.name;
  const qtyCtl = stepper({
    value: store.qty(state.id), label, min: 1,
    canInc: store.qty(state.id) < store.maxQty(state.id),
    onDec: () => { if (store.qty(state.id) > 1) store.dec(state.id); },
    onInc: () => store.inc(state.id),
  });
  const row = el('div', { class: 'flow-item' },
    el('div', { class: 'flow-item__media', 'aria-hidden': 'true' }),
    el('div', {}, el('div', { class: 'flow-item__name' }, item.name), el('div', { class: 'flow-item__price' }, `${money(item.price)} each`)),
    qtyCtl);
  const dots = el('div', { class: 'dots', 'aria-hidden': 'true' }, el('span'), el('span'), el('span'));
  sheet.sub.replaceChildren(dots, row);
  sheet.subRefresh = () => {
    updateStepper(qtyCtl, { value: store.qty(state.id), min: 1, canInc: store.qty(state.id) < store.maxQty(state.id) });
    const phase = PHASE[state.step];
    [...dots.children].forEach((d, i) => {
      d.classList.toggle('is-on', i === phase);
      d.classList.toggle('is-done', i < phase);
    });
  };
}

// ---------- step rendering ----------
function render(dir) {
  refreshers = [() => sheet.subRefresh && sheet.subRefresh()];
  sheet.showBack(state.hist.length > 0);
  const steps = { combo: stepCombo, comboType: stepComboType, regular: () => stepOptions('regular'), special: () => stepOptions('special'), drink: stepDrink, drinks: stepDrinks };
  const { node, foot } = steps[state.step]();
  sheet.setStep(node, dir);
  sheet.setFoot(...(foot || []));
  for (const fn of refreshers) fn();
  requestAnimationFrame(() => {
    const first = node.querySelector('button:not([disabled])');
    if (first && sheet.root.contains(document.activeElement) === false) first.focus({ preventScroll: true });
  });
}

function choice({ iconName, label, sub, no = false, onPick }) {
  return el('button', { type: 'button', class: `choice${no ? ' choice--no' : ''}`, onclick: onPick },
    el('span', { class: 'choice__icon' }, icon(iconName)),
    el('span', { class: 'choice__label' }, label),
    el('span', { class: 'choice__sub' }, sub));
}

function backBtn() {
  return el('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: back }, icon('left', 'arrow arrow--l'), 'Back');
}
function nextBtn(label, onclick, primary = true) {
  return el('button', { type: 'button', class: `btn ${primary ? 'btn--primary' : 'btn--ghost'} btn--sm`, onclick }, label, icon('right', 'arrow arrow--r'));
}
const spacer = () => el('div', { class: 'spacer' });

function stepCombo() {
  const item = ITEM_BY_ID.get(state.id);
  const node = el('div', {},
    el('h3', { class: 'step__q' }, 'Make it a combo?'),
    el('p', { class: 'step__hint' }, `Add fries to your ${item.name}.`),
    el('div', { class: 'choices' },
      choice({ iconName: 'fries', label: 'Yes, combo', sub: 'Regular or special fries', onPick: () => go('comboType') }),
      choice({ iconName: 'no', label: 'No combo', sub: 'Just the sandwich', no: true, onPick: () => go('drink') })));
  return { node, foot: [el('button', { type: 'button', class: 'btn btn--quiet btn--sm', onclick: () => sheet.requestClose() }, 'Back to menu'), spacer(), nextBtn('Skip', () => go('drink'), false)] };
}

function meter() {
  const used = el('strong');
  const fill = el('div', { class: 'meter__fill' });
  const note = el('div', { class: 'meter__note' });
  const node = el('div', { class: 'meter' },
    el('div', { class: 'meter__row' }, el('span', {}, 'Combos chosen'), el('span', {}, used)),
    el('div', { class: 'meter__bar' }, fill),
    note);
  refreshers.push(() => {
    const q = store.qty(state.id);
    const u = store.combosUsed(state.id);
    used.textContent = `${u} / ${q}`;
    fill.style.width = `${q ? Math.round((u / q) * 100) : 0}%`;
    node.classList.toggle('is-full', u >= q);
    note.textContent = u >= q ? `All ${q} sandwich${q > 1 ? 'es' : ''} matched ✓` : '';
  });
  return node;
}

function stepComboType() {
  const node = el('div', {},
    el('h3', { class: 'step__q' }, 'Pick your combo'),
    el('p', { class: 'step__hint' }, 'One combo per sandwich. You can mix both types.'),
    meter(),
    el('div', { class: 'choices' },
      choice({ iconName: 'fries', label: 'Regular combo', sub: 'Small, large, wedges or curly fries', onPick: () => go('regular') }),
      choice({ iconName: 'star', label: 'Special fries', sub: '8 loaded fries to choose from', onPick: () => go('special') })));
  return { node, foot: [backBtn(), spacer(), nextBtn('Drinks', () => go('drink'))] };
}

function optionBox({ name, price, priceLabel, getQty, canAdd, addAmount, onAdd, onDec, onInc, canInc }) {
  const ctl = el('div', { class: 'opt__ctl' });
  const box = el('div', { class: 'opt' },
    el('div', { class: 'opt__media', 'aria-hidden': 'true' }),
    el('div', { class: 'opt__name' }, name),
    el('div', { class: 'opt__price' }, priceLabel || money(price)),
    ctl);
  let mode = null;
  let addBtn;
  let step;
  const refresh = () => {
    const n = getQty();
    box.classList.toggle('is-picked', n > 0);
    if (n === 0) {
      if (mode !== 'add') {
        addBtn = el('button', { type: 'button', class: 'add-btn', onclick: onAdd });
        ctl.replaceChildren(addBtn);
        mode = 'add';
      }
      const amt = addAmount();
      addBtn.replaceChildren(icon('plus'), amt > 1 ? `Add ×${amt}` : 'Add');
      addBtn.setAttribute('aria-label', amt > 1 ? `Add ${amt} ${name}` : `Add ${name}`);
      addBtn.disabled = !canAdd();
    } else {
      if (mode !== 'step') {
        step = stepper({ value: n, label: name, onDec, onInc, canInc: canInc() });
        ctl.replaceChildren(step);
        mode = 'step';
      }
      updateStepper(step, { value: n, canInc: canInc() });
    }
  };
  refreshers.push(refresh);
  return box;
}

function scrollDots(scroller) {
  const dots = el('div', { class: 'scroll-dots', 'aria-hidden': 'true' });
  const update = () => {
    const pages = Math.max(1, Math.round(scroller.scrollWidth / Math.max(1, scroller.clientWidth)));
    if (dots.children.length !== pages) dots.replaceChildren(...Array.from({ length: pages }, () => el('span')));
    const idx = Math.round(scroller.scrollLeft / Math.max(1, scroller.clientWidth));
    [...dots.children].forEach((d, i) => d.classList.toggle('is-on', i === idx));
  };
  scroller.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  requestAnimationFrame(update);
  return dots;
}

function stepOptions(kind) {
  const list = kind === 'regular' ? COMBO_REGULAR : COMBO_SPECIAL;
  const id = state.id;
  const remaining = () => store.qty(id) - store.combosUsed(id);
  const boxes = list.map((opt) => optionBox({
    name: opt.name,
    price: opt.price,
    priceLabel: `+${money(opt.price)}`,
    getQty: () => store.comboQty(id, opt.id),
    addAmount: () => Math.max(1, remaining()),
    canAdd: () => remaining() > 0,
    // auto add: fills the combos up to the number of sandwiches
    onAdd: () => store.setCombo(id, opt.id, remaining()),
    onDec: () => store.setCombo(id, opt.id, store.comboQty(id, opt.id) - 1),
    onInc: () => store.setCombo(id, opt.id, store.comboQty(id, opt.id) + 1),
    canInc: () => remaining() > 0,
  }));
  boxes.forEach((b, i) => { b.style.animationDelay = `${i * 40}ms`; });
  const grid = el('div', { class: `opts${list.length > 4 ? ' opts--scroll' : ''}` }, boxes);
  const node = el('div', {},
    el('h3', { class: 'step__q' }, kind === 'regular' ? 'Regular combo' : 'Special fries'),
    el('p', { class: 'step__hint' }, kind === 'regular' ? 'Choose the fries for each sandwich.' : `Swipe to see all ${COMBO_SPECIAL.length}: loaded and saucy.`),
    meter(),
    grid,
    list.length > 4 ? scrollDots(grid) : null);
  if (list.length > 4 && bg) bg.addSource(grid);
  return { node, foot: [backBtn(), spacer(), nextBtn('Next: drinks', () => go('drink'))] };
}

function stepDrink() {
  const node = el('div', {},
    el('h3', { class: 'step__q' }, 'Add a drink?'),
    el('p', { class: 'step__hint' }, 'Something cold on the side.'),
    el('div', { class: 'choices' },
      choice({ iconName: 'drink', label: 'Yes, a drink', sub: `${DRINKS.length} drinks to pick from`, onPick: () => go('drinks') }),
      choice({ iconName: 'no', label: 'No drink', sub: 'Back to the menu', no: true, onPick: finish })));
  return { node, foot: [backBtn(), spacer()] };
}

function stepDrinks() {
  const boxes = DRINKS.map((d) => optionBox({
    name: d.name,
    price: d.price,
    getQty: () => store.qty(d.id),
    addAmount: () => 1,
    canAdd: () => true,
    onAdd: () => store.inc(d.id),
    onDec: () => store.dec(d.id),
    onInc: () => store.inc(d.id),
    canInc: () => store.qty(d.id) < store.maxQty(d.id),
  }));
  boxes.forEach((b, i) => { b.style.animationDelay = `${i * 40}ms`; });
  const grid = el('div', { class: 'opts opts--scroll' }, boxes);
  if (bg) bg.addSource(grid);
  const node = el('div', {},
    el('h3', { class: 'step__q' }, 'Pick your drinks'),
    el('p', { class: 'step__hint' }, 'Swipe for more.'),
    grid,
    scrollDots(grid));
  return { node, foot: [backBtn(), spacer(), el('button', { type: 'button', class: 'btn btn--primary btn--sm', onclick: finish }, icon('check'), 'Done')] };
}
