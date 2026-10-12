// 共通レイアウト：ヘッダー・フッター（WordPress移行時は template-parts/header, footer に相当）
import { url } from './util.js';
import { icon } from './icons.js';
import { createSearchBox } from './search.js';
import { initThemeToggles } from './theme.js';

const NAV = [
  ['learn', '学習する', () => url.learn()],
  ['html', 'HTML辞典', () => url.dict('html')],
  ['css', 'CSS辞典', () => url.dict('css')],
];

const navLinks = (current) =>
  NAV.map(([key, label, href]) => `<a href="${href()}"${key === current ? ' aria-current="page"' : ''}>${label}</a>`).join('');

/**
 * @param {object} data
 * @param {{ current: 'learn'|'html'|'css', menu?: boolean }} opts menu=true でSP用のサイドバー開閉ボタンを表示
 */
export function renderHeader(data, { current, menu = false }) {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="site-header__inner">
      <div class="site-header__brand">
        ${menu ? `<button type="button" class="btn btn-icon site-header__menu" aria-label="カテゴリメニュー" aria-controls="sidebar" aria-expanded="false" data-drawer-open>${icon('menu')}</button>` : ''}
        <a class="logo" href="${url.top()}">HTML &amp; CSS GUIDE</a>
      </div>
      <nav class="gnav gnav--desktop" aria-label="メイン">${navLinks(current)}</nav>
      <div class="site-header__spacer"></div>
      <div class="site-header__actions">
        <button type="button" class="btn btn-icon site-header__search-toggle" aria-label="検索" aria-expanded="false">${icon('search')}</button>
        <button type="button" class="btn btn-icon" data-theme-toggle></button>
      </div>
    </div>
    <nav class="gnav gnav--mobile" aria-label="メイン">${navLinks(current)}</nav>`;

  const box = createSearchBox(data, { placeholder: '検索（flex、余白…）', className: 'hdr-search', emptyText: '一致する項目は見つかりませんでした。' });
  header.querySelector('.site-header__spacer').after(box.el);

  const toggle = header.querySelector('.site-header__search-toggle');
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('is-search-open');
    toggle.setAttribute('aria-expanded', String(open));
    if (open) box.input.focus();
  });

  initThemeToggles(header);
  return header;
}

export function renderFooter(data, left = 'HTML & CSS GUIDE — 学ぶ・調べる・理解する') {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `<span>${left.replace(/&/g, '&amp;')}</span><span>HTML ${data.order.html.length}項目 ・ CSS ${data.order.css.length}項目を収録</span>`;
  return footer;
}
