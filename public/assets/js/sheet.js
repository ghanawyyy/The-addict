// =========================================================
// Bottom sheet (phone) / centered panel (desktop) with
// back + close buttons, step transitions and focus handling.
// =========================================================
import { el, icon, overlays, lockScroll, unlockScroll, trapFocus } from './ui.js';

export class Sheet {
  constructor(name, { label }) {
    this.name = name;
    this.isOpen = false;
    this.onBack = null;
    this.onClosed = null;

    this.backBtn = el('button', { type: 'button', class: 'icon-btn is-hidden', 'aria-label': 'Back', onclick: () => this.onBack && this.onBack() }, icon('left'));
    this.titleEl = el('h2', { class: 'sheet__title', id: `${name}-title` });
    this.closeBtn = el('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Close', onclick: () => this.requestClose() }, icon('close'));
    this.sub = el('div', { class: 'sheet__sub' });
    this.body = el('div', { class: 'sheet__body' });
    this.foot = el('div', { class: 'sheet__foot' });
    this.panel = el('div', { class: 'sheet__panel' },
      el('div', { class: 'sheet__grab', 'aria-hidden': 'true' }),
      el('div', { class: 'sheet__head' }, this.backBtn, this.titleEl, this.closeBtn),
      this.sub, this.body, this.foot);
    this.root = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': `${name}-title`, 'aria-label': label, hidden: true },
      el('div', { class: 'sheet__scrim', onclick: () => this.requestClose() }),
      this.panel);
    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); this.requestClose(); }
      trapFocus(this.panel, e);
    });
    document.body.append(this.root);
  }

  setTitle(text) { this.titleEl.textContent = text; }
  showBack(visible) { this.backBtn.classList.toggle('is-hidden', !visible); this.backBtn.tabIndex = visible ? 0 : -1; }

  setStep(node, dir = 1) {
    node.classList.add('step');
    if (dir < 0) node.classList.add('from-left');
    this.body.replaceChildren(node);
    this.body.scrollTop = 0;
  }

  setFoot(...nodes) { this.foot.replaceChildren(...nodes); this.foot.hidden = nodes.length === 0; }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.returnFocus = document.activeElement;
    clearTimeout(this.hideTimer);
    // stack above any sheet that is already open (e.g. combo editor over the order)
    this.root.style.zIndex = String(40 + document.querySelectorAll('.sheet.is-open').length);
    this.root.hidden = false;
    // force layout so the opening transition runs
    void this.root.offsetHeight;
    this.root.classList.add('is-open');
    lockScroll();
    document.body.classList.add('has-sheet');
    overlays.open(this.name, () => this.close());
    requestAnimationFrame(() => {
      const first = this.panel.querySelector('.sheet__body button, .sheet__body input, .sheet__body a[href]');
      (first || this.closeBtn).focus({ preventScroll: true });
    });
  }

  requestClose() {
    if (!this.isOpen) return;
    overlays.requestClose(this.name);
  }

  // Do not call directly: use requestClose() so history stays in sync.
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.root.classList.remove('is-open');
    unlockScroll();
    if (!document.querySelector('.sheet.is-open')) document.body.classList.remove('has-sheet');
    this.hideTimer = setTimeout(() => {
      this.root.hidden = true;
      this.body.replaceChildren();
    }, 450);
    if (this.returnFocus && document.contains(this.returnFocus)) this.returnFocus.focus({ preventScroll: true });
    if (this.onClosed) this.onClosed();
  }
}
