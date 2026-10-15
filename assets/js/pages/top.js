// ① トップ
import { CONFIG } from '../config.js';
import { esc, url } from '../util.js';
import { icon } from '../icons.js';
import { createSearchBox } from '../search.js';
import { shortcutLabel } from '../search-dialog.js';
import { fetchPopularKeywords } from '../search-log.js';

const QUICK_COUNT = 5;
const wordButtons = (words) =>
  words.map((w) => `<button type="button" class="btn btn-ghost" data-word="${esc(w)}">${esc(w)}</button>`).join('');
import { initThemeToggles } from '../theme.js';
import { renderFooter } from '../layout.js';

export function renderTop(app, data) {
  const entries = [
    ['01', 'ROADMAP', '学習する', '初心者・中級者・上級者の3段階で、学ぶ順番に沿って進めます。', url.learn()],
    ['02', 'HTML', 'HTML辞典', `${data.order.html.length}のタグを、基本構造からメディアまでカテゴリ別に。`, url.dict('html')],
    ['03', 'CSS', 'CSS辞典', `${data.order.css.length}のプロパティを、文字からレスポンシブまでカテゴリ別に。`, url.dict('css')],
    ['04', 'JavaScript', 'JS辞典', `${data.order.js.length}の構文・メソッドを、基本からDOM操作・イベントまで。`, url.dict('js')],
  ];

  const page = document.createElement('div');
  page.className = 'top';
  page.innerHTML = `
    <div class="top__bar"><button type="button" class="btn btn-secondary" data-theme-toggle="label"></button></div>
    <main class="top__main">
      <div class="top__kicker">学ぶ・調べる・理解する</div>
      <h1 class="top__title">FRONTEND-DOCS</h1>
      <p class="top__lead">HTMLタグ・CSSプロパティ・JavaScriptを網羅した辞典と、段階的に学べるロードマップ。<br class="pc-only">すべての項目で、コードと実際の表示結果をあわせて確認できます。</p>
      <div data-slot="search"></div>
      <div class="top__quick">
        <span class="top__quick-label">よく調べるキーワード</span>
        <span class="top__quick-words">${wordButtons(CONFIG.quickWords.slice(0, QUICK_COUNT))}</span>
      </div>
      <nav class="top__entries" aria-label="入口">
        ${entries.map(([num, sub, title, desc, href]) => `
          <a class="entry" href="${href}">
            <span class="entry__sub"><span>${num} — ${sub}</span>${icon('arrow-right')}</span>
            <span class="entry__title">${title}</span>
            <span class="entry__desc">${desc}</span>
          </a>`).join('')}
      </nav>
    </main>`;

  const box = createSearchBox(data, {
    placeholder: 'タグ・プロパティ・やりたいことで検索（例：flex、中央寄せ）',
    className: 'top__search',
    hint: shortcutLabel,
    emptyText: '一致する項目は見つかりませんでした。別のキーワードをお試しください。',
  });
  page.querySelector('[data-slot="search"]').replaceWith(box.el);
  page.querySelector('.top__quick').addEventListener('click', (e) => {
    const b = e.target.closest('[data-word]');
    if (b) box.setQuery(b.dataset.word);
  });

  // 実際の検索履歴（Supabase）からよく調べられている語句を取得し、足りない分は既定の語句で補う
  fetchPopularKeywords(QUICK_COUNT).then((popular) => {
    if (!popular.length) return;
    const words = [...new Set([...popular, ...CONFIG.quickWords])].slice(0, QUICK_COUNT);
    page.querySelector('.top__quick-words').innerHTML = wordButtons(words);
  });

  page.append(renderFooter(data, 'FRONTEND-DOCS'));
  initThemeToggles(page);
  app.append(page);
}
