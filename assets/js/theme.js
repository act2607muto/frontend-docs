// テーマ切替（html[data-theme] / localStorage "hcg-theme"）
// 初期テーマは各HTMLの <head> 内インラインスクリプトでちらつき前に設定済み
import { icon } from './icons.js';

const KEY = 'hcg-theme';

export const getTheme = () => document.documentElement.dataset.theme || 'light';

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(KEY, theme); } catch (e) { /* 保存できない環境では無視 */ }
  document.querySelectorAll('[data-theme-toggle]').forEach(render);
}

/** ボタンの中身（アイコン・ラベル）を現在のテーマに合わせて描画 */
function render(btn) {
  const dark = getTheme() === 'dark';
  const label = dark ? 'ライトモード' : 'ダークモード';
  btn.setAttribute('aria-label', label);
  btn.innerHTML = icon(dark ? 'sun' : 'moon') + (btn.dataset.themeToggle === 'label' ? `<span>${label}</span>` : '');
}

/** [data-theme-toggle] ボタンを有効化（値 "label" でテキスト付き） */
export function initThemeToggles(root = document) {
  root.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    render(btn);
    btn.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
  });
}
