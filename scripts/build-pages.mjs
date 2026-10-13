// data/*.json から各ページの HTML を生成する
//   node scripts/build-pages.mjs
// 生成物：index.html / {html,css,js}/index.html / learn/index.html / {html,css,js}/{slug}.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => JSON.parse(readFileSync(join(ROOT, 'data', `${name}.json`), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SITE = 'HTML & CSS GUIDE';
const DESCRIPTION = 'HTMLタグ・CSSプロパティ・JavaScriptを、サンプルコードと実際の表示結果で学べる辞典・学習サイトです。';

function page({ root, title, description = DESCRIPTION, body }) {
  const attrs = Object.entries(body).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');
  return `<!doctype html>
<html lang="ja" data-root="${root}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <script>
    // テーマをちらつき前に適用（保存値 → OS設定の順）
    (function () {
      var t; try { t = localStorage.getItem('hcg-theme'); } catch (e) {}
      if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = t;
    })();
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap">
  <link rel="stylesheet" href="${root}assets/css/tokens.css">
  <link rel="stylesheet" href="${root}assets/css/base.css">
  <link rel="stylesheet" href="${root}assets/css/components.css">
  <script type="module" src="${root}assets/js/main.js"></script>
</head>
<body${attrs}>
  <div id="app"><noscript>このサイトの表示には JavaScript が必要です。</noscript></div>
</body>
</html>
`;
}

function write(rel, html) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const items = read('items');
const details = Object.fromEntries(read('details').map((d) => [d.id, d]));

write('index.html', page({ root: '', title: SITE, body: { page: 'top' } }));
write('html/index.html', page({ root: '../', title: `HTML辞典 | ${SITE}`, body: { page: 'dict', type: 'html' } }));
write('css/index.html', page({ root: '../', title: `CSS辞典 | ${SITE}`, body: { page: 'dict', type: 'css' } }));
write('js/index.html', page({ root: '../', title: `JS辞典 | ${SITE}`, body: { page: 'dict', type: 'js' } }));
write('learn/index.html', page({ root: '../', title: `学習ロードマップ | ${SITE}`, body: { page: 'learn' } }));

for (const it of items) {
  if (it.slug === 'index') throw new Error(`slug "index" は一覧ページと衝突します: ${it.id}`);
  const d = details[it.id];
  const label = d?.title || (it.type === 'html' ? `<${it.name}>` : it.name);
  write(`${it.type}/${it.slug}.html`, page({
    root: '../',
    title: `${label} ${d ? d.ja : it.summary} | ${SITE}`,
    description: d ? d.lead : it.summary,
    body: { page: 'detail', id: it.id },
  }));
}

console.log(`生成しました：一覧5ページ ＋ 詳細${items.length}ページ`);
