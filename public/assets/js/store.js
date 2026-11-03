// =========================================================
// Cart store: one line per menu item.
// Rule enforced here: combos on a line can never exceed its quantity.
// The cart is kept in sessionStorage only (no personal data stored).
// =========================================================
import { ITEM_BY_ID, COMBO_BY_ID, LIMITS } from './data.js';

const KEY = 'addict-cart-v1';
const listeners = new Set();
let lines = []; // [{ id, qty, note, combos: { [optId]: n } }]

const clampInt = (n, lo, hi) => Math.min(hi, Math.max(lo, Math.floor(Number(n) || 0)));

// Strip control characters (keeps letters, emoji, Arabic, symbols, new lines).
export function cleanText(value, max) {
  return String(value ?? '')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '')
    .slice(0, max);
}

function maxQtyFor(id) {
  return ITEM_BY_ID.get(id)?.drink ? LIMITS.maxDrinkQty : LIMITS.maxQty;
}

function load() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw || raw.length > 50000) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return;
    lines = data
      .filter((l) => l && ITEM_BY_ID.has(l.id))
      .map((l) => {
        const qty = clampInt(l.qty, 1, maxQtyFor(l.id));
        const combos = {};
        let used = 0;
        if (ITEM_BY_ID.get(l.id).combo && l.combos && typeof l.combos === 'object') {
          for (const [cid, n] of Object.entries(l.combos)) {
            if (!COMBO_BY_ID.has(cid)) continue;
            const v = clampInt(n, 0, qty - used);
            if (v > 0) { combos[cid] = v; used += v; }
          }
        }
        return { id: l.id, qty, note: cleanText(l.note, LIMITS.noteLen), combos };
      });
  } catch { lines = []; }
}

function save() {
  try { sessionStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* storage unavailable: cart still works in memory */ }
}

function emit(detail) {
  save();
  for (const fn of listeners) fn(detail);
}

export const store = {
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  lines() { return lines; },
  line(id) { return lines.find((l) => l.id === id) || null; },
  qty(id) { return this.line(id)?.qty || 0; },

  setQty(id, n) {
    const item = ITEM_BY_ID.get(id);
    if (!item) return;
    const qty = clampInt(n, 0, maxQtyFor(id));
    let line = this.line(id);
    if (qty === 0) {
      if (!line) return;
      lines = lines.filter((l) => l.id !== id);
      emit({ type: 'qty', id, qty: 0 });
      return;
    }
    if (!line) {
      line = { id, qty, note: '', combos: {} };
      lines = [...lines, line];
    } else {
      line.qty = qty;
      trimCombos(line);
    }
    emit({ type: 'qty', id, qty });
  },
  inc(id) { this.setQty(id, this.qty(id) + 1); },
  dec(id) { this.setQty(id, this.qty(id) - 1); },
  maxQty(id) { return maxQtyFor(id); },

  setNote(id, text) {
    const line = this.line(id);
    if (!line) return;
    line.note = cleanText(text, LIMITS.noteLen);
    save(); // silent: typing should not re-render the list
  },

  combosUsed(id) {
    const line = this.line(id);
    if (!line) return 0;
    return Object.values(line.combos).reduce((a, b) => a + b, 0);
  },
  comboQty(id, optId) { return this.line(id)?.combos[optId] || 0; },
  setCombo(id, optId, n) {
    const line = this.line(id);
    if (!line || !COMBO_BY_ID.has(optId) || !ITEM_BY_ID.get(id)?.combo) return;
    const others = this.combosUsed(id) - (line.combos[optId] || 0);
    const v = clampInt(n, 0, line.qty - others); // cut-off: never more combos than sandwiches
    if (v === 0) delete line.combos[optId];
    else line.combos[optId] = v;
    emit({ type: 'combo', id, optId });
  },

  lineTotal(line) {
    const item = ITEM_BY_ID.get(line.id);
    let t = item.price * line.qty;
    for (const [cid, n] of Object.entries(line.combos)) t += COMBO_BY_ID.get(cid).price * n;
    return t;
  },
  count() { return lines.reduce((a, l) => a + l.qty, 0); },
  total() { return lines.reduce((a, l) => a + this.lineTotal(l), 0); },
  clear() { lines = []; emit({ type: 'clear' }); },
};

function trimCombos(line) {
  let used = Object.values(line.combos).reduce((a, b) => a + b, 0);
  const keys = Object.keys(line.combos).reverse();
  for (const k of keys) {
    if (used <= line.qty) break;
    const cut = Math.min(line.combos[k], used - line.qty);
    line.combos[k] -= cut;
    used -= cut;
    if (line.combos[k] === 0) delete line.combos[k];
  }
}

load();
