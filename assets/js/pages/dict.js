// ② / ③ HTML辞典・CSS辞典一覧
import { CONFIG } from '../config.js';
import { esc, pad2, url } from '../util.js';
import { icon } from '../icons.js';
import { initAccordion } from '../accordion.js';
import { renderHeader, renderFooter } from '../layout.js';

const TEXT = {
  html: {
    kicker: 'DICTIONARY — HTML', title: 'HTML辞典',
    lead: 'HTMLタグをカテゴリ別にまとめた一覧です。カテゴリを開いてタグを選ぶと、サンプルコードと実際の表示結果、詳しい解説を確認できます。',
  },
  css: {
    kicker: 'DICTIONARY — CSS', title: 'CSS辞典',
    lead: 'CSSプロパティをカテゴリ別にまとめた一覧です。カテゴリを開いてプロパティを選ぶと、サンプルコードと実際の表示結果、詳しい解説を確認できます。',
  },
  js: {
    kicker: 'DICTIONARY — JavaScript', title: 'JS辞典',
    lead: 'JavaScriptの構文やメソッドをカテゴリ別にまとめた一覧です。項目を選ぶと、サンプルコードと実際の動き（画面とコンソールの出力）、詳しい解説を確認できます。',
  },
};

export function renderDict(app, data, type) {
  const t = TEXT[type];
  const cats = data.cats[type];
  const initial = CONFIG.dictInitialOpen[type] || [];

  const main = document.createElement('main');
  main.className = 'page';
  main.innerHTML = `
    <div class="kicker">${t.kicker}</div>
    <h1 class="page-title">${t.title}</h1>
    <p class="page-lead">${t.lead}</p>
    <div class="dict__toolbar">
      <span class="dict__count">${cats.length}カテゴリ ・ ${data.order[type].length}項目</span>
      <div class="dict__tools">
        <button type="button" class="btn btn-ghost" data-act="open">すべて開く</button>
        <button type="button" class="btn btn-ghost" data-act="close">すべて閉じる</button>
      </div>
    </div>
    <div class="dict__cats">
      ${cats.map((c, k) => {
        const open = initial.includes(c.id);
        const pid = `cat-${type}-${c.id}`;
        return `
        <section class="dict-cat">
          <h2 class="dict-cat__h">
            <button type="button" class="dict-cat__head acc__trigger" aria-expanded="${open}" aria-controls="${pid}">
              <span class="dict-cat__num">${pad2(k + 1)}</span>
              <span class="dict-cat__name">${esc(c.name)}</span>
              <span class="dict-cat__count">${c.items.length}項目</span>
              ${icon('chevron-down', 'acc__chevron')}
            </button>
          </h2>
          <ul class="dict-cat__list" id="${pid}"${open ? '' : ' hidden'}>
            ${c.items.map((it) => `
              <li><a class="dict-row" href="${url.item(it)}">
                <code class="dict-row__code">${esc(it.name)}</code>
                <span class="dict-row__desc">${esc(it.summary)}</span>
                ${icon('chevron-right')}
              </a></li>`).join('')}
          </ul>
        </section>`;
      }).join('')}
    </div>`;

  const acc = initAccordion(main.querySelector('.dict__cats'));
  main.querySelector('[data-act="open"]').addEventListener('click', acc.openAll);
  main.querySelector('[data-act="close"]').addEventListener('click', acc.closeAll);

  app.append(renderHeader(data, { current: type }), main, renderFooter(data));
}
