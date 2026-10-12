// 実行結果プレビュー：sandbox 付き iframe（srcdoc）でコードを実際に描画する
// 将来「コード編集＋リアルタイムプレビュー」に差し替えられるよう、srcdoc 生成を独立させている
import { esc } from './util.js';

const BASE_STYLE =
  'body{margin:0;padding:20px 24px;font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;color:#1a1a1a;background:#fff;line-height:1.6;font-size:15px}';

// サンプル内の画像ファイル名をプレースホルダー画像に置き換える
const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><rect width='100%25' height='100%25' fill='%23d9d4cc'/><text x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23776f63' text-anchor='middle' dominant-baseline='middle'>photo.jpg</text></svg>";
const withPlaceholders = (html) => html.replace(/photo\.jpg/g, PLACEHOLDER_IMG);

/**
 * コードから iframe 用の HTML 文書を組み立てる
 * @param {{ html?: string|null, css?: string|null, fullDocument?: boolean }} code
 */
export function buildSrcdoc({ html, css, fullDocument = false }) {
  const body = withPlaceholders(html || '');
  if (fullDocument) {
    const style = `<style>${BASE_STYLE}</style>`;
    return body.includes('</head>') ? body.replace('</head>', `${style}</head>`) : style + body;
  }
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>${BASE_STYLE}${css || ''}</style></head><body>${body}</body></html>`;
}

/**
 * プレビュー部品を生成
 * @param {{ html?: string|null, css?: string|null }} code
 * @param {{ height?: number, note?: string|null, fullDocument?: boolean }} preview
 */
export function createPreview(code, { height = 160, note = '', fullDocument = false } = {}) {
  const el = document.createElement('div');
  el.className = 'preview';
  el.innerHTML = `
    <div class="preview__head"><span class="preview__label">ブラウザでの表示</span><span>${esc(note || '')}</span></div>
    <iframe class="preview__frame" title="実行結果のプレビュー" sandbox="" style="height:${Number(height) || 160}px"></iframe>`;
  el.querySelector('iframe').srcdoc = buildSrcdoc({ ...code, fullDocument });
  return el;
}
