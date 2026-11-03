// =========================================================
// "Your order": review items (+ a note per item), then name +
// address, then one tap sends the full order to WhatsApp.
// =========================================================
import { BRAND, ITEM_BY_ID, COMBO_BY_ID, LIMITS, money } from './data.js';
import { store, cleanText } from './store.js';
import { Sheet } from './sheet.js';
import { openFlow } from './flow.js';
import { el, icon, stepper, updateStepper, scrollToEl } from './ui.js';

let sheet;
let step = 'review';
let unsub = null;
let refreshers = [];
const draft = { name: '', address: '', note: '' }; // kept in memory only

export function initCart() {
  sheet = new Sheet('cart', { label: 'Your order' });
  sheet.onBack = () => { if (step === 'details') render('review', -1); else sheet.requestClose(); };
  sheet.onClosed = () => { if (unsub) unsub(); unsub = null; };
}

export function openCart() {
  sheet.sub.replaceChildren();
  render('review', 1);
  sheet.open();
  if (unsub) unsub();
  unsub = store.subscribe(() => { if (sheet.isOpen) for (const fn of refreshers) fn(); });
}

function render(next, dir) {
  step = next;
  refreshers = [];
  const map = { review: stepReview, details: stepDetails, sent: stepSent };
  const titles = { review: 'Your order', details: 'Delivery details', sent: 'Order sent' };
  sheet.setTitle(titles[next]);
  sheet.showBack(next === 'details');
  const { node, foot } = map[next]();
  sheet.setStep(node, dir);
  sheet.setFoot(...(foot || []));
  for (const fn of refreshers) fn();
}

const spacer = () => el('div', { class: 'spacer' });

// ---------- helpers ----------
function comboLabel(cid) {
  const opt = COMBO_BY_ID.get(cid);
  return cid.startsWith('cr-') ? `Regular combo · ${opt.name}` : `Special fries · ${opt.name}`;
}

// Customer text goes on one line and without WhatsApp formatting marks,
// so nobody can fake extra lines (e.g. a different "Total") inside a note.
function oneLine(text) {
  return cleanText(text, 2000).replace(/\s*[\r\n]+\s*/g, ' / ').replace(/[*_~`]/g, '').replace(/[ \t]{2,}/g, ' ').trim();
}

export function buildMessage({ name, address, note }) {
  const out = ['Hello Addict, how are you? 👋', '', '🧾 *My order:*'];
  store.lines().forEach((line, i) => {
    const item = ITEM_BY_ID.get(line.id);
    out.push(`${i + 1}. ${item.name} × ${line.qty} — ${money(item.price * line.qty)}`);
    for (const [cid, n] of Object.entries(line.combos)) {
      out.push(`   + ${comboLabel(cid)} × ${n} — ${money(COMBO_BY_ID.get(cid).price * n)}`);
    }
    if (line.note.trim()) out.push(`   📝 Note: ${oneLine(line.note)}`);
  });
  out.push('');
  if (note.trim()) { out.push(`🗒️ Order notes: ${oneLine(note)}`); out.push(''); }
  out.push(`💵 *Total: ${money(store.total())}*`);
  out.push('');
  out.push(`👤 Name: ${oneLine(name)}`);
  out.push(`📍 Address: ${oneLine(address)}`);
  out.push('');
  out.push('Thank you!');
  return out.join('\n');
}

export function whatsappLink(message) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
}

function summary() {
  const count = el('span');
  const total = el('span');
  refreshers.push(() => {
    const c = store.count();
    count.textContent = `${c} item${c === 1 ? '' : 's'}`;
    total.textContent = money(store.total());
  });
  return el('div', { class: 'summary' },
    el('div', { class: 'summary__row' }, el('span', {}, 'Items'), count),
    el('div', { class: 'summary__row summary__row--total' }, el('span', {}, 'Total'), total));
}

// ---------- step 1: review ----------
function lineView(line) {
  const item = ITEM_BY_ID.get(line.id);
  const total = el('div', { class: 'line__total' });
  const extras = el('ul', { class: 'line__extras' });
  const qty = stepper({
    value: line.qty, label: item.name,
    canInc: line.qty < store.maxQty(line.id),
    onDec: () => store.dec(line.id),
    onInc: () => store.inc(line.id),
  });
  const noteId = `note-${line.id}`;
  const note = el('textarea', { id: noteId, rows: '2', maxlength: String(LIMITS.noteLen), placeholder: 'e.g. no onions, extra sauce, well done…', autocomplete: 'off' });
  note.value = line.note;
  const counter = el('span', { class: 'field__count' });
  const setCount = () => { counter.textContent = note.value.length > LIMITS.noteLen - 80 ? `${note.value.length}/${LIMITS.noteLen}` : ''; };
  note.addEventListener('input', () => { store.setNote(line.id, note.value); setCount(); });
  setCount();
  const node = el('article', { class: 'line' },
    el('div', { class: 'line__top' },
      el('div', { class: 'line__media', 'aria-hidden': 'true' }),
      el('div', {},
        el('h3', { class: 'line__name' }, item.name),
        el('div', { class: 'line__each' }, `${money(item.price)} each`),
        item.combo ? el('button', { type: 'button', class: 'line__edit', onclick: () => openFlow(line.id, { fromCart: true }) }, 'Combo & drinks ›') : null),
      el('div', { class: 'line__side' }, total, qty)),
    extras,
    el('label', { class: 'field', for: noteId },
      el('span', { class: 'field__label' }, 'Note for this item ', el('em', {}, '(optional)'), counter),
      note));
  node.update = () => {
    const l = store.line(line.id);
    if (!l) return;
    total.textContent = money(store.lineTotal(l));
    updateStepper(qty, { value: l.qty, canInc: l.qty < store.maxQty(l.id) });
    extras.replaceChildren(...Object.entries(l.combos).map(([cid, n]) =>
      el('li', {}, el('span', {}, `+ ${comboLabel(cid)} × ${n}`), el('span', {}, money(COMBO_BY_ID.get(cid).price * n)))));
  };
  return node;
}

function stepReview() {
  const list = el('div', { class: 'lines' });
  const views = new Map();
  const empty = el('div', { class: 'empty' },
    el('strong', {}, 'Your order is empty'),
    'Pick something tasty from the menu.',
    el('div', {}, el('button', { type: 'button', class: 'btn btn--primary btn--sm', onclick: () => { sheet.requestClose(); setTimeout(() => scrollToEl(document.getElementById('menu')), 300); } }, 'Browse the menu')));
  const sum = summary();
  const cont = el('button', { type: 'button', class: 'btn btn--primary btn--sm', onclick: () => render('details', 1) }, 'Continue', icon('right', 'arrow arrow--r'));

  refreshers.push(() => {
    const current = store.lines();
    const ids = new Set(current.map((l) => l.id));
    for (const [id, v] of views) {
      if (!ids.has(id)) {
        views.delete(id);
        v.classList.add('is-leaving');
        setTimeout(() => v.remove(), 260);
      }
    }
    for (const l of current) {
      if (!views.has(l.id)) {
        const v = lineView(l);
        views.set(l.id, v);
        list.append(v);
      }
      views.get(l.id).update();
    }
    const isEmpty = current.length === 0;
    empty.hidden = !isEmpty;
    sum.hidden = isEmpty;
    cont.disabled = isEmpty;
  });

  const node = el('div', {}, empty, list, sum);
  return {
    node,
    foot: [el('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: () => sheet.requestClose() }, icon('left', 'arrow arrow--l'), 'Keep ordering'), spacer(), cont],
  };
}

// ---------- step 2: name + address ----------
function field({ id, label, optional, multiline, max, autocomplete, placeholder, value, onInput, error }) {
  const input = multiline
    ? el('textarea', { id, rows: '3', maxlength: String(max), placeholder, autocomplete })
    : el('input', { id, type: 'text', maxlength: String(max), placeholder, autocomplete, enterkeyhint: 'next' });
  input.value = value;
  const wrap = el('label', { class: 'field', for: id },
    el('span', { class: 'field__label' }, label, optional ? el('em', {}, ' (optional)') : null),
    input,
    el('span', { class: 'field__error', id: `${id}-err` }, error));
  input.setAttribute('aria-describedby', `${id}-err`);
  input.addEventListener('input', () => {
    onInput(input.value);
    if (wrap.classList.contains('is-invalid')) validateField(wrap, input);
  });
  wrap.input = input;
  return wrap;
}

function validateField(wrap, input) {
  const min = Number(wrap.dataset.min || 0);
  const ok = input.value.trim().length >= min;
  wrap.classList.toggle('is-invalid', !ok);
  input.setAttribute('aria-invalid', String(!ok));
  return ok;
}

function stepDetails() {
  if (!store.count()) return stepReview();
  const preview = el('pre');
  const send = el('a', { class: 'btn btn--primary btn--sm', href: '#', target: '_blank', rel: 'noopener noreferrer' }, icon('whatsapp'), 'Send on WhatsApp');
  const update = () => {
    const msg = buildMessage(draft);
    preview.textContent = msg;
    send.href = whatsappLink(msg);
  };
  const name = field({ id: 'f-name', label: 'Your name', max: LIMITS.nameMax, autocomplete: 'name', placeholder: 'e.g. Rami', value: draft.name, error: 'Please write your name.', onInput: (v) => { draft.name = cleanText(v, LIMITS.nameMax); update(); } });
  name.dataset.min = String(LIMITS.nameMin);
  const address = field({ id: 'f-address', label: 'Delivery address', multiline: true, max: LIMITS.addressMax, autocomplete: 'street-address', placeholder: 'Area, street, building, floor, landmark…', value: draft.address, error: 'Please write your full delivery address.', onInput: (v) => { draft.address = cleanText(v, LIMITS.addressMax); update(); } });
  address.dataset.min = String(LIMITS.addressMin);
  const note = field({ id: 'f-note', label: 'Notes for the whole order', optional: true, multiline: true, max: LIMITS.orderNoteLen, autocomplete: 'off', placeholder: 'e.g. ring the bell, extra napkins…', value: draft.note, onInput: (v) => { draft.note = cleanText(v, LIMITS.orderNoteLen); update(); } });

  send.addEventListener('click', (e) => {
    update();
    const okName = validateField(name, name.input);
    const okAddr = validateField(address, address.input);
    if (!okName || !okAddr || !store.count()) {
      e.preventDefault();
      (okName ? address.input : name.input).focus();
      return;
    }
    // let the link open WhatsApp, then show the thank-you step
    setTimeout(() => render('sent', 1), 400);
  });

  refreshers.push(update);
  const node = el('div', {},
    el('p', { class: 'step__hint' }, 'Almost done! Tell us where to deliver.'),
    name, address, note,
    summary(),
    el('details', { class: 'preview' }, el('summary', {}, 'Preview the WhatsApp message'), preview),
    el('p', { class: 'fineprint' }, `Your order opens in WhatsApp, ready to send to ${BRAND.whatsappDisplay}. Our team confirms the final total with you.`));
  return { node, foot: [el('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: () => render('review', -1) }, icon('left', 'arrow arrow--l'), 'Back'), spacer(), send] };
}

// ---------- step 3: thank you ----------
function stepSent() {
  const msg = buildMessage(draft);
  const node = el('div', { class: 'done-state' },
    el('div', { class: 'done-state__icon' }, icon('check')),
    el('h3', {}, 'Almost there!'),
    el('p', {}, 'Your order is ready in WhatsApp — just press send. We will confirm it with you shortly.'),
    el('div', { class: 'stack' },
      el('a', { class: 'btn btn--ghost', href: whatsappLink(msg), target: '_blank', rel: 'noopener noreferrer' }, icon('whatsapp'), 'WhatsApp did not open? Tap here'),
      el('button', { type: 'button', class: 'btn btn--primary', onclick: () => { store.clear(); draft.note = ''; sheet.requestClose(); setTimeout(() => scrollToEl(document.getElementById('menu')), 300); } }, 'Start a new order'),
      el('button', { type: 'button', class: 'btn btn--quiet', onclick: () => sheet.requestClose() }, 'Close')));
  return { node, foot: [] };
}
