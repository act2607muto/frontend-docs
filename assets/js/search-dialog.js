// Ctrl + K（Mac は ⌘ + K）でどのページからでも開ける検索ウィンドウ
import { esc } from './util.js';
import { createSearchBox } from './search.js';

/** Mac かどうか（ショートカットの表示を ⌘ / Ctrl で切り替える） */
export const isMac = /mac|iphone|ipad/i.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);

/** ショートカットの表示用ラベル */
export const shortcutLabel = isMac ? '⌘K' : 'Ctrl K';

let dialog;
let box;

function build(data) {
  dialog = document.createElement('dialog');
  dialog.className = 'search-dialog';
  dialog.setAttribute('aria-label', 'サイト内検索');
  box = createSearchBox(data, {
    placeholder: 'タグ・プロパティ・やりたいことで検索',
    className: 'search-dialog__box',
    emptyText: '一致する項目は見つかりませんでした。別のキーワードをお試しください。',
  });
  const foot = document.createElement('div');
  foot.className = 'search-dialog__foot';
  foot.innerHTML = `
    <span><kbd>↑</kbd><kbd>↓</kbd> 選択</span>
    <span><kbd>Enter</kbd> 移動</span>
    <span><kbd>Esc</kbd> 閉じる</span>
    <span class="search-dialog__shortcut"><kbd>${esc(shortcutLabel)}</kbd> で開閉</span>`;
  dialog.append(box.el, foot);
  // 背景（ダイアログの外側）をクリックしたら閉じる
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);
}

export function openSearchDialog(data) {
  if (!dialog) build(data);
  if (dialog.open) return;
  dialog.showModal();
  box.input.focus();
  box.input.select();
  // 前回の語句が残っていれば候補を表示し直す
  if (box.input.value) box.input.dispatchEvent(new Event('input'));
}

/** キーボードショートカットを有効にする */
export function initSearchShortcut(data) {
  document.addEventListener('keydown', (e) => {
    if (e.isComposing || e.key.toLowerCase() !== 'k' || !(isMac ? e.metaKey : e.ctrlKey) || e.altKey || e.shiftKey) return;
    e.preventDefault(); // ブラウザ標準の Ctrl + K（アドレスバーでの検索など）を止める
    if (dialog?.open) dialog.close();
    else openSearchDialog(data);
  });
}
