// 実行結果プレビュー：sandbox 付き iframe（srcdoc）でコードを実際に描画する
// 将来「コード編集＋リアルタイムプレビュー」に差し替えられるよう、srcdoc 生成を独立させている
//
// iframe は allow-scripts のみ許可（allow-same-origin は付けない）ので、親ページとは別オリジン扱いで隔離される。
// 中身の高さを postMessage で親に知らせ、画面幅が変わって折り返しが増えても切れないようにしている。
import { esc } from './util.js';

const BASE_STYLE =
  'body{margin:0;padding:20px 24px;font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;color:#1a1a1a;background:#fff;line-height:1.6;font-size:15px}';

// iframe 内で実行し、本文の高さを親に通知する
const RESIZE_SCRIPT =
  '<script>(function(){var b=document.body,last=0;function s(){var h=Math.ceil(Math.max(b.scrollHeight,b.getBoundingClientRect().height));if(h!==last){last=h;parent.postMessage({hcgPreviewHeight:h},"*")}}addEventListener("load",s);new ResizeObserver(s).observe(b)})()<\/script>';

// サンプル内の画像ファイル名（photo.jpg など）を、ファイル名入りのプレースホルダー画像に置き換える
// 空白は srcset の区切りと誤認されるため %20 にする
const placeholderImg = (name) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><rect width='100%25' height='100%25' fill='%23d9d4cc'/><text x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23776f63' text-anchor='middle' dominant-baseline='middle'>${name}</text></svg>`.replace(/ /g, '%20');
const withPlaceholders = (src) => src.replace(/[\w-]+\.(?:jpe?g|png|webp|gif)\b/g, placeholderImg);

/**
 * コードから iframe 用の HTML 文書を組み立てる
 * fullDocument=true の場合は html をそのまま文書として使い、css は外部CSSを読み込んだ状態として head に差し込む
 * @param {{ html?: string|null, css?: string|null, fullDocument?: boolean }} code
 */
export function buildSrcdoc({ html, css, fullDocument = false }) {
  const body = withPlaceholders(html || '');
  css = withPlaceholders(css || '');
  if (fullDocument) {
    const style = `<style>${BASE_STYLE}${css}</style>`;
    const doc = body.includes('</head>') ? body.replace('</head>', `${style}</head>`) : style + body;
    return doc.includes('</body>') ? doc.replace('</body>', `${RESIZE_SCRIPT}</body>`) : doc + RESIZE_SCRIPT;
  }
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>${BASE_STYLE}${css}</style></head><body>${body}${RESIZE_SCRIPT}</body></html>`;
}

/**
 * プレビュー部品を生成
 * @param {{ html?: string|null, css?: string|null }} code
 * @param {{ height?: number, note?: string|null, fullDocument?: boolean }} preview
 *   height は表示直後の高さ。読み込み後は中身の高さに合わせて自動で調整される
 */
export function createPreview(code, { height = 160, note = '', fullDocument = false } = {}) {
  const el = document.createElement('div');
  el.className = 'preview';
  el.innerHTML = `
    <div class="preview__head"><span class="preview__label">ブラウザでの表示</span><span>${esc(note || '')}</span></div>
    <iframe class="preview__frame" title="実行結果のプレビュー" sandbox="allow-scripts" style="height:${Number(height) || 160}px"></iframe>`;
  const frame = el.querySelector('iframe');
  frame.srcdoc = buildSrcdoc({ ...code, fullDocument });
  frames.add(frame);
  return el;
}

/* ---------- 高さの自動調整 ---------- */

const MIN_HEIGHT = 60;
const frames = new Set();

window.addEventListener('message', (e) => {
  const h = e.data?.hcgPreviewHeight;
  if (typeof h !== 'number') return;
  for (const frame of frames) {
    if (!frame.isConnected) { frames.delete(frame); continue; }
    if (frame.contentWindow === e.source) frame.style.height = `${Math.max(MIN_HEIGHT, h)}px`;
  }
});
