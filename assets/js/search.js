// 検索（items.json の name / slug / keywords / summary / カテゴリ名が対象）
import { CONFIG } from './config.js';
import { esc, url } from './util.js';
import { icon } from './icons.js';

/**
 * スコア：完全一致100 > 前方一致70 > 部分一致50 > キーワード40 > 説明30 > カテゴリ15
 * 解説済み項目は +1。`<` `>` は無視する（`<h1>` でもヒット）。
 */
export function search(data, query, limit = CONFIG.searchLimit) {
  const q = query.trim().toLowerCase().replace(/[<>]/g, '');
  if (!q) return [];
  const hits = [];
  for (const it of data.items) {
    const name = it.name.toLowerCase();
    let s = 0;
    if (name === q || it.slug === q) s = 100;
    else if (name.startsWith(q)) s = 70;
    else if (name.includes(q)) s = 50;
    if (it.keywords.some((k) => k.toLowerCase().includes(q))) s = Math.max(s, 40);
    if (it.summary.toLowerCase().includes(q)) s = Math.max(s, 30);
    if (it.categoryName.toLowerCase().includes(q)) s = Math.max(s, 15);
    if (s) hits.push([s + (it.hasDetail ? 1 : 0), it]);
  }
  // 同点は元の並び順を保つ（Array.prototype.sort は安定ソート）
  return hits.sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1]);
}

let uid = 0;

/**
 * 検索ボックス部品を生成する
 * @param {object} data loadData() の結果
 * @param {{ placeholder: string, className?: string, emptyText: string }} opts
 * @returns {{ el: HTMLElement, input: HTMLInputElement, setQuery: (q: string) => void }}
 */
export function createSearchBox(data, { placeholder, className = '', emptyText }) {
  const id = `search-list-${++uid}`;
  const el = document.createElement('div');
  el.className = `search ${className}`;
  el.innerHTML = `
    ${icon('search', 'search__icon')}
    <input class="input" type="search" placeholder="${esc(placeholder)}" aria-label="検索"
      role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}" autocomplete="off">
    <div class="search__dropdown" id="${id}" hidden></div>`;
  const input = el.querySelector('input');
  const drop = el.querySelector('.search__dropdown');
  let results = [];
  let active = 0;

  const close = () => {
    drop.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  };

  const render = () => {
    const q = input.value.trim();
    if (!q) return close();
    results = search(data, q);
    active = Math.min(active, Math.max(results.length - 1, 0));
    drop.innerHTML = `
      <div class="search__label">「${esc(q)}」の検索結果 ${results.length}件</div>
      <div role="listbox" aria-label="検索結果">
        ${results.map((it, i) => `
          <a class="search__result" role="option" id="${id}-${i}" href="${url.item(it)}" aria-selected="${i === active}">
            <span class="tag">${it.type.toUpperCase()}</span>
            <span class="search__body">
              <span class="search__head"><span class="search__name">${esc(it.name)}</span><span class="search__cat">${esc(it.categoryName)}</span></span>
              <span class="search__summary">${esc(it.summary)}</span>
            </span>
          </a>`).join('')}
      </div>
      ${results.length ? '' : `<div class="search__empty">${esc(emptyText)}</div>`}`;
    drop.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    if (results.length) input.setAttribute('aria-activedescendant', `${id}-${active}`);
    else input.removeAttribute('aria-activedescendant');
  };

  const move = (d) => {
    if (!results.length) return;
    active = Math.max(0, Math.min(active + d, results.length - 1));
    drop.querySelectorAll('.search__result').forEach((a, i) => a.setAttribute('aria-selected', String(i === active)));
    input.setAttribute('aria-activedescendant', `${id}-${active}`);
    drop.querySelector(`#${id}-${active}`)?.scrollIntoView({ block: 'nearest' });
  };

  input.addEventListener('input', () => { active = 0; render(); });
  input.addEventListener('focus', render);
  input.addEventListener('keydown', (e) => {
    if (e.isComposing) return; // 日本語変換中のEnterは無視
    if (e.key === 'ArrowDown') { e.preventDefault(); if (drop.hidden) render(); else move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter' && !drop.hidden && results[active]) { e.preventDefault(); location.href = url.item(results[active]); }
    else if (e.key === 'Escape') close();
  });
  // クリック時に入力欄のフォーカスを外さない（Safari ではリンクにフォーカスが移らないため）
  drop.addEventListener('mousedown', (e) => e.preventDefault());
  el.addEventListener('focusout', (e) => { if (!el.contains(e.relatedTarget)) close(); });

  return {
    el,
    input,
    setQuery(q) { input.value = q; active = 0; input.focus(); render(); },
  };
}
