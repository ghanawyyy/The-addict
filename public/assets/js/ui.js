// =========================================================
// Small DOM helpers, icons, toasts and an overlay manager.
// All user text goes through textContent (never innerHTML) => XSS-safe.
// =========================================================

const SVG_NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, String(v));
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

// Icons: [d, mode] where mode 'f' = filled, default = stroked
const ICONS = {
  plus: [['M12 5v14M5 12h14']],
  minus: [['M5 12h14']],
  bag: [['M5 8h14l-1 12.5H6Z'], ['M9 8V6.5a3 3 0 0 1 6 0V8']],
  left: [['M15 5l-7 7 7 7']],
  right: [['M9 5l7 7-7 7']],
  down: [['M6 9l6 6 6-6']],
  up: [['M6 15l6-6 6 6']],
  close: [['M6 6l12 12M18 6L6 18']],
  search: [['M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z'], ['M15.5 15.5 20 20']],
  check: [['M5 12.5l4.5 4.5L19 7.5']],
  fries: [['M6.5 10l1.6 11h7.8L17.5 10Z'], ['M9 10V4.5M12 10V3M15 10V5.5']],
  no: [['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z'], ['M5.6 5.6l12.8 12.8']],
  drink: [['M6 8.5h12L16.6 21H7.4Z'], ['M4.5 8.5h15'], ['M12.5 8.5 14.5 2.5H18']],
  star: [['M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z']],
  swipe: [['M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4']],
  whatsapp: [
    ['M12 2.6a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.7-1.3A9.4 9.4 0 1 0 12 2.6Z'],
    ['M8.7 7.4c.3-.5.6-.5.9-.5h.6c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.5.7c-.1.2-.2.4 0 .6.4.8 1 1.5 1.7 2.1.7.6 1.4 1 2.2 1.3.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.4 0 .5-.1 1.1-.5 1.5-.5.5-1.2.8-2 .8-1 0-2.4-.4-4.1-1.7-1.6-1.2-2.8-2.9-3.2-3.8-.4-.9-.5-1.7-.4-2.4.1-.7.4-1.1.6-1.3Z', 'f'],
  ],
  instagram: [
    ['M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Z'],
    ['M12 7.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Z'],
    ['M17.3 5.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z', 'f'],
  ],
  facebook: [
    ['M14 8.6V6.9c0-.8.5-1 1-1h2.1V2.6h-2.9c-3.2 0-4 2.1-4 3.9v2.1H8v3.4h2.2v9.5H14v-9.5h2.8l.4-3.4Z', 'f'],
  ],
};

export function icon(name, cls = '') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  if (cls) svg.setAttribute('class', cls);
  for (const [d, mode] of ICONS[name] || []) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    if (mode === 'f') {
      p.setAttribute('fill', 'currentColor');
    } else {
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', 'currentColor');
      p.setAttribute('stroke-width', '2');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
    }
    svg.append(p);
  }
  return svg;
}

// Replace every <i data-icon="name"> placeholder in static HTML.
export function hydrateIcons(root = document) {
  for (const ph of root.querySelectorAll('i[data-icon]')) {
    ph.replaceWith(icon(ph.dataset.icon, ph.className));
  }
}

// ---------- stepper (− n +) ----------
export function stepper({ value, label, onDec, onInc, canInc = true, min = 0 }) {
  const dec = el('button', { type: 'button', class: 'is-minus', 'aria-label': `Remove one ${label}`, onclick: onDec }, icon('minus'));
  const out = el('output', { 'aria-live': 'polite', 'aria-label': `${label} quantity` }, String(value));
  const inc = el('button', { type: 'button', class: 'is-plus', 'aria-label': `Add one more ${label}`, onclick: onInc }, icon('plus'));
  if (!canInc) inc.disabled = true;
  if (value <= min) dec.disabled = true;
  return el('div', { class: 'stepper' }, dec, out, inc);
}

export function updateStepper(node, { value, canInc = true, min = 0 }) {
  const out = node.querySelector('output');
  const [dec, , inc] = node.children;
  if (out.textContent !== String(value)) out.textContent = String(value);
  inc.disabled = !canInc;
  dec.disabled = value <= min;
}

// ---------- toast ----------
let toastBox;
export function toast(message, ms = 2200) {
  toastBox ||= document.querySelector('[data-toasts]');
  if (!toastBox) return;
  const t = el('div', { class: 'toast', role: 'status' }, message);
  toastBox.append(t);
  while (toastBox.children.length > 2) toastBox.firstElementChild.remove();
  setTimeout(() => {
    t.classList.add('is-out');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, ms);
}

// ---------- scroll lock (stackable) ----------
let locks = 0;
export function lockScroll() {
  locks += 1;
  document.documentElement.classList.add('is-locked');
}
export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (!locks) document.documentElement.classList.remove('is-locked');
}

// ---------- overlays + browser back button ----------
// Opening a sheet pushes a history entry, so the phone's back button
// closes the sheet instead of leaving the website.
const stack = [];
export const overlays = {
  open(name, close) {
    stack.push({ name, close });
    try { history.pushState({ addictOverlay: name, depth: stack.length }, ''); } catch { /* ignore */ }
  },
  // Called by UI close buttons: go back one history step; popstate does the closing.
  requestClose(name) {
    const top = stack[stack.length - 1];
    if (!top || top.name !== name) return;
    if (history.state && history.state.addictOverlay === name) history.back();
    else { stack.pop(); top.close(); }
  },
  isOpen(name) { return stack.some((s) => s.name === name); },
  top() { return stack[stack.length - 1]?.name || null; },
};
window.addEventListener('popstate', () => {
  const depth = history.state?.depth || 0;
  while (stack.length > depth) stack.pop().close();
});

// ---------- focus trap ----------
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
export function trapFocus(container, e) {
  if (e.key !== 'Tab') return;
  const items = [...container.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth scroll to a section (respects reduced motion)
export function scrollToEl(target) {
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 0);
  window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? 'auto' : 'smooth' });
}
