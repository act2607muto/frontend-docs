// 共通ユーティリティ

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** HTML エスケープ */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** 2桁ゼロ埋め */
export const pad2 = (n) => String(n).padStart(2, '0');

/** サイトルートへの相対パス（各HTMLの <html data-root> で指定） */
export const ROOT = document.documentElement.dataset.root || '';

/** 辞典の種類（表示順） */
export const TYPES = ['html', 'css', 'js'];

/** 種類ごとの表示名 */
export const TYPE_INFO = {
  html: { dict: 'HTML辞典', tag: 'HTML', kicker: 'HTML要素', unit: 'タグ' },
  css: { dict: 'CSS辞典', tag: 'CSS', kicker: 'CSS', unit: 'プロパティ' },
  js: { dict: 'JS辞典', tag: 'JS', kicker: 'JavaScript', unit: '構文・メソッド' },
};

export const url = {
  top: () => `${ROOT}index.html`,
  dict: (type) => `${ROOT}${type}/index.html`,
  learn: () => `${ROOT}learn/index.html`,
  item: (item) => `${ROOT}${item.type}/${item.slug}.html`,
  data: (name) => `${ROOT}data/${name}.json`,
};

/** 文字列からDOM要素を1つ生成 */
export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** 表示用ラベル（HTMLタグは <name> 表記） */
export const titleOf = (item) => (item.type === 'html' ? `<${item.name}>` : item.name);

/** `バッククォート` 部分をインラインコードにした HTML を返す */
export const inlineCode = (text) =>
  String(text)
    .split(/`([^`]+)`/)
    .map((t, i) => (i % 2 ? `<code class="icode">${esc(t)}</code>` : esc(t)))
    .join('');
