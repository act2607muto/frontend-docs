// アコーディオン（<button aria-expanded aria-controls> ＋ hidden パネル）
// 複数同時展開が既定。single:true で1つずつ開く。
import { CONFIG } from './config.js';

const panelOf = (btn) => document.getElementById(btn.getAttribute('aria-controls'));

export function setOpen(btn, open) {
  btn.setAttribute('aria-expanded', String(open));
  const panel = panelOf(btn);
  if (panel) panel.hidden = !open;
}

/**
 * container 内の .acc__trigger をまとめて制御する
 * @returns {{ openAll: () => void, closeAll: () => void }}
 */
export function initAccordion(container, { single = CONFIG.accordionSingle } = {}) {
  const triggers = () => [...container.querySelectorAll('.acc__trigger')];
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.acc__trigger');
    if (!btn || !container.contains(btn)) return;
    const open = btn.getAttribute('aria-expanded') !== 'true';
    if (single && open) triggers().forEach((b) => b !== btn && setOpen(b, false));
    setOpen(btn, open);
  });
  return {
    openAll: () => triggers().forEach((b) => setOpen(b, true)),
    closeAll: () => triggers().forEach((b) => setOpen(b, false)),
  };
}
