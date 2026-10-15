// ④ / ⑤ 詳細ページ（HTML・CSS共通）
import { esc, inlineCode, pad2, titleOf, TYPES, TYPE_INFO, url } from '../util.js';
import { icon } from '../icons.js';
import { initAccordion } from '../accordion.js';
import { createCodeBlocks } from '../code.js';
import { createPreview } from '../preview.js';
import { renderHeader, renderFooter } from '../layout.js';

const secHead = (num, title) =>
  `<div class="sec__head"><span class="sec__num">${num}</span><h2>${title}</h2></div>`;

/* ---------- サイドバー（template-parts/sidebar 相当） ---------- */

function sidebarCats(data, type, item) {
  return data.cats[type].map((c) => {
    const has = c.items.some((x) => x.id === item.id);
    const pid = `side-${type}-${c.id}`;
    return `
      <div class="side-cat${has ? ' is-current' : ''}">
        <button type="button" class="side-cat__head acc__trigger" aria-expanded="${has}" aria-controls="${pid}">
          <span class="side-cat__name">${esc(c.name)}</span>
          <span class="side-cat__count">${c.items.length}</span>
          ${icon('chevron-down', 'acc__chevron')}
        </button>
        <ul class="side-cat__list" id="${pid}"${has ? '' : ' hidden'}>
          ${c.items.map((it) => `
            <li><a class="side-item" href="${url.item(it)}"${it.id === item.id ? ' aria-current="page"' : ''}>
              <code>${esc(it.name)}</code><span>${esc(it.summary)}</span>
            </a></li>`).join('')}
        </ul>
      </div>`;
  }).join('');
}

function renderSidebar(data, item) {
  const aside = document.createElement('aside');
  aside.className = 'sidebar';
  aside.id = 'sidebar';
  aside.setAttribute('aria-label', 'カテゴリ');
  aside.innerHTML = `
    <div class="sidebar__head"><span>カテゴリ</span><button type="button" class="btn btn-icon" aria-label="閉じる" data-drawer-close>${icon('x')}</button></div>
    <div class="seg" role="radiogroup" aria-label="辞典の種類">
      ${TYPES.map((t) => `
        <label class="seg-opt"><input type="radio" name="sbtype" value="${t}"${t === item.type ? ' checked' : ''}>${t.toUpperCase()}</label>`).join('')}
    </div>
    <div class="sidebar__cats">${sidebarCats(data, item.type, item)}</div>`;

  const cats = aside.querySelector('.sidebar__cats');
  initAccordion(cats);
  aside.querySelectorAll('input[name="sbtype"]').forEach((r) =>
    r.addEventListener('change', () => { cats.innerHTML = sidebarCats(data, r.value, item); }),
  );
  return aside;
}

/** SP：左からのドロワー */
function initDrawer(root, aside) {
  const openBtn = root.querySelector('[data-drawer-open]');
  const backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';
  backdrop.hidden = true;
  aside.before(backdrop);

  const set = (open) => {
    aside.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    openBtn?.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) aside.querySelector('[data-drawer-close]')?.focus();
    else openBtn?.focus();
  };
  openBtn?.addEventListener('click', () => set(true));
  backdrop.addEventListener('click', () => set(false));
  aside.querySelector('[data-drawer-close]').addEventListener('click', () => set(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aside.classList.contains('is-open')) set(false); });
  // PC幅に戻ったら状態を解除
  matchMedia('(min-width: 760px)').addEventListener('change', (e) => { if (e.matches && aside.classList.contains('is-open')) set(false); });
}

/* ---------- 本文 ---------- */

function relatedIds(data, item, d) {
  const ids = d
    ? d.related
    : data.order[item.type].filter((id) => id !== item.id && data.index[id].category === item.category).slice(0, 4);
  return ids.filter((id) => data.index[id]);
}

function renderArticle(data, item, d) {
  const info = TYPE_INFO[item.type];
  const ord = data.order[item.type];
  const pos = ord.indexOf(item.id);
  const prev = data.index[ord[pos - 1]];
  const next = data.index[ord[pos + 1]];
  const related = relatedIds(data, item, d).map((id) => data.index[id]);

  const art = document.createElement('article');
  art.className = 'article';
  art.innerHTML = `
    <nav class="crumbs" aria-label="パンくず">
      <a href="${url.dict(item.type)}">${info.dict}</a><span>/</span>
      <span>${esc(item.categoryName)}</span><span>/</span>
      <code>${esc(item.name)}</code>
    </nav>
    <div class="kicker article__kicker">${info.kicker} ・ ${esc(item.categoryName)}</div>
    <h1 class="article__title">${esc(d?.title || titleOf(item))}</h1>
    <p class="article__ja">${esc(d ? d.ja : item.summary)}</p>
    <p class="article__lead">${esc(d ? d.lead : `${item.summary}を指定・表現するための${info.unit}です。`)}</p>
    ${d ? `<dl class="meta">${d.meta.map((m) => `<div><dt>${esc(m.label)}</dt><dd>${esc(m.value)}</dd></div>`).join('')}</dl>` : ''}

    ${d ? `
      <section class="sec sec--code">${secHead('01', 'サンプルコード')}<div data-slot="code"></div></section>
      <section class="sec sec--preview">${secHead('02', '実行結果')}<div data-slot="preview"></div></section>
      <section class="sec prose">${secHead('03', '解説')}${d.explain.map((p) => `<p>${inlineCode(p)}</p>`).join('')}</section>
      <section class="sec">
        ${secHead('04', '応用例・注意点')}
        <h3 class="sub-title">${esc(d.values.label)}</h3>
        <div class="values">
          <table class="table">
            <thead><tr><th>${esc(d.values.head)}</th><th>説明</th></tr></thead>
            <tbody>${d.values.rows.map((r) => `<tr><td><code>${esc(r.key)}</code></td><td>${esc(r.desc)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
        ${d.usages.map((u, i) => `
          <div class="usage">
            <h3 class="sub-title">${esc(u.title)}</h3>
            <p>${inlineCode(u.desc)}</p>
            <div data-slot="usage-${i}"></div>
          </div>`).join('')}
        <h3 class="sub-title">注意点</h3>
        <ol class="notes">${d.notes.map((n, i) => `<li><span class="num">${pad2(i + 1)}</span><span>${inlineCode(n)}</span></li>`).join('')}</ol>
      </section>` : `
      <div class="pending">
        <div class="pending__kicker">準備中</div>
        <div class="pending__title">サンプルコードと解説を準備しています</div>
        <p class="pending__body">この項目の詳細ページは、辞典データの追加にあわせて公開されます。下の関連項目から、同じカテゴリの解説済みページをご覧いただけます。</p>
      </div>`}

    <section class="sec sec--related">
      ${secHead(d ? '05' : '01', '関連項目')}
      <ul class="related">
        ${related.map((r) => `
          <li><a href="${url.item(r)}">
            <span class="tag">${r.type.toUpperCase()}</span><code>${esc(r.name)}</code><span>${esc(r.summary)}</span>
          </a></li>`).join('')}
      </ul>
    </section>

    <nav class="pager" aria-label="前後の項目">
      ${prev ? `<a href="${url.item(prev)}" rel="prev"><span class="pager__label">← 前の項目</span><code>${esc(prev.name)}</code></a>` : ''}
      ${next ? `<a class="pager__next" href="${url.item(next)}" rel="next"><span class="pager__label">次の項目 →</span><code>${esc(next.name)}</code></a>` : ''}
    </nav>`;

  if (d) {
    art.querySelector('[data-slot="code"]').replaceWith(createCodeBlocks(d.code));
    art.querySelector('[data-slot="preview"]').replaceWith(createPreview(d.code, d.preview));
    d.usages.forEach((u, i) => art.querySelector(`[data-slot="usage-${i}"]`).replaceWith(createCodeBlocks(u, { small: true })));
  }
  return art;
}

export function renderDetail(app, data, id) {
  const item = data.index[id];
  if (!item) {
    app.innerHTML = '<p style="padding:40px">項目が見つかりませんでした。</p>';
    return;
  }
  const d = data.details[id];
  document.title = `${d?.title || titleOf(item)} ${d ? d.ja : item.summary} | FRONTEND-DOCS`;

  const header = renderHeader(data, { current: item.type, menu: true });
  const wrap = document.createElement('div');
  wrap.className = 'detail';
  const aside = renderSidebar(data, item);
  wrap.append(aside, renderArticle(data, item, d));
  app.append(header, wrap, renderFooter(data));
  initDrawer(app, aside);
}
