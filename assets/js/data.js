// data/*.json を読み込み、描画しやすい形に整える
import { url } from './util.js';

const load = (name) =>
  fetch(url.data(name)).then((r) => {
    if (!r.ok) throw new Error(`${name}.json の読み込みに失敗しました (${r.status})`);
    return r.json();
  });

let cache;

/**
 * @returns {Promise<{
 *   items: object[], index: Record<string, object>, details: Record<string, object>,
 *   cats: {html: object[], css: object[]}, order: {html: string[], css: string[]}, roadmap: object[]
 * }>}
 */
export function loadData() {
  cache ??= Promise.all(['categories', 'items', 'details', 'roadmap'].map(load)).then(
    ([categories, items, detailList, roadmap]) => {
      const details = Object.fromEntries(detailList.map((d) => [d.id, d]));
      const cats = {};
      const order = {};
      for (const type of ['html', 'css']) {
        cats[type] = categories[type].map((c) => ({
          ...c,
          items: items.filter((it) => it.type === type && it.category === c.id),
        }));
        order[type] = cats[type].flatMap((c) => c.items.map((it) => it.id));
      }
      const catName = {};
      for (const type of ['html', 'css']) for (const c of categories[type]) catName[`${type}:${c.id}`] = c.name;
      const index = {};
      for (const it of items) {
        it.categoryName = catName[`${it.type}:${it.category}`] || '';
        it.hasDetail = !!details[it.id];
        index[it.id] = it;
      }
      return { items, index, details, cats, order, roadmap };
    },
  );
  return cache;
}
