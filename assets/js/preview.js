// 実行結果プレビュー：sandbox 付き iframe（srcdoc）でコードを実際に描画する
// 将来「コード編集＋リアルタイムプレビュー」に差し替えられるよう、srcdoc 生成を独立させている
//
// iframe は allow-scripts のみ許可（allow-same-origin は付けない）ので、親ページとは別オリジン扱いで隔離される。
// 中身の高さを postMessage で親に知らせ、画面幅が変わって折り返しが増えても切れないようにしている。
// JS のサンプルでは console.log などの出力も postMessage で受け取り、プレビュー下の「コンソール」欄に表示する。
// JS のサンプルだけ allow-forms も許可する（submit イベントを JS で受け取るため。HTML のフォーム例は送信させない）。
import { esc } from './util.js';

const BASE_STYLE =
  'body{margin:0;padding:20px 24px;font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;color:#1a1a1a;background:#fff;line-height:1.6;font-size:15px}';

// iframe 内で実行し、本文の高さを親に通知する
const RESIZE_SCRIPT =
  '<script>(function(){var b=document.body,last=0;function s(){var h=Math.ceil(Math.max(b.scrollHeight,b.getBoundingClientRect().height));if(h!==last){last=h;parent.postMessage({hcgPreviewHeight:h},"*")}}addEventListener("load",s);new ResizeObserver(s).observe(b)})()<\/script>';

// iframe 内で最初に実行し、console の出力とエラーを親に送る
const CONSOLE_SCRIPT = `<script>(function(){
function fmt(v,d){d=d||0;
if(typeof v==="string")return d?JSON.stringify(v):v;
if(v===undefined)return "undefined";
if(typeof v==="function")return "ƒ "+(v.name||"")+"()";
if(typeof Element!=="undefined"&&v instanceof Element){var c=typeof v.className==="string"&&v.className.trim()?"."+v.className.trim().split(/\\s+/).join("."):"";return "<"+v.tagName.toLowerCase()+(v.id?"#"+v.id:"")+c+">"}
if(v instanceof Error)return v.name+": "+v.message;
if(Array.isArray(v))return d>2?"[…]":"["+v.map(function(x){return fmt(x,d+1)}).join(", ")+"]";
if(v&&typeof v==="object"){if(d>2)return "{…}";var k=Object.keys(v);return k.length?"{ "+k.map(function(n){return n+": "+fmt(v[n],d+1)}).join(", ")+" }":"{}"}
return String(v)}
function send(l,a){parent.postMessage({hcgConsole:{level:l,text:[].map.call(a,function(x){return fmt(x)}).join(" ")}},"*")}
["log","info","warn","error"].forEach(function(l){var o=console[l];console[l]=function(){send(l,arguments);o.apply(console,arguments)}});
addEventListener("error",function(e){send("error",[e.message])});
addEventListener("unhandledrejection",function(e){send("error",["Uncaught (in promise) "+fmt(e.reason)])});
})()<\/script>`;

// サンプル内の画像ファイル名（photo.jpg など）を、ファイル名入りのプレースホルダー画像に置き換える
// 空白は srcset の区切りと誤認されるため %20 にする
const placeholderImg = (name) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><rect width='100%25' height='100%25' fill='%23d9d4cc'/><text x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23776f63' text-anchor='middle' dominant-baseline='middle'>${name}</text></svg>`.replace(/ /g, '%20');
const withPlaceholders = (src) => src.replace(/[\w-]+\.(?:jpe?g|png|webp|gif)\b/g, placeholderImg);

/**
 * コードから iframe 用の HTML 文書を組み立てる
 * fullDocument=true の場合は html をそのまま文書として使い、css は外部CSSを読み込んだ状態として head に差し込む
 * js がある場合は console の出力を親に送るスクリプトを先頭に入れ、js 本体は body の最後で実行する
 * @param {{ html?: string|null, css?: string|null, js?: string|null, fullDocument?: boolean }} code
 */
export function buildSrcdoc({ html, css, js, fullDocument = false }) {
  const body = withPlaceholders(html || '');
  css = withPlaceholders(css || '');
  const head = js ? CONSOLE_SCRIPT : '';
  const tail = (js ? `<script>${js}<\/script>` : '') + RESIZE_SCRIPT;
  if (fullDocument) {
    const style = `${head}<style>${BASE_STYLE}${css}</style>`;
    const doc = body.includes('</head>') ? body.replace('</head>', `${style}</head>`) : style + body;
    return doc.includes('</body>') ? doc.replace('</body>', `${tail}</body>`) : doc + tail;
  }
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">${head}<style>${BASE_STYLE}${css}</style></head><body>${body}${tail}</body></html>`;
}

const CONSOLE_EMPTY = '<li class="console__empty">console.log() の出力がここに表示されます</li>';

/**
 * プレビュー部品を生成
 * code.js がある場合はコンソール欄を付ける。html がなく js だけの場合は画面を隠し、コンソール欄だけを表示する
 * @param {{ html?: string|null, css?: string|null, js?: string|null }} code
 * @param {{ height?: number, note?: string|null, fullDocument?: boolean }} preview
 *   height は表示直後の高さ。読み込み後は中身の高さに合わせて自動で調整される
 */
export function createPreview(code, { height = 160, note = '', fullDocument = false } = {}) {
  const consoleOnly = !!code.js && !code.html;
  const el = document.createElement('div');
  el.className = `preview${consoleOnly ? ' preview--console-only' : ''}`;
  el.innerHTML = `
    ${consoleOnly && !note ? '' : `<div class="preview__head"><span class="preview__label">ブラウザでの表示</span><span>${esc(note || '')}</span></div>`}
    <iframe class="preview__frame" title="実行結果のプレビュー" sandbox="${code.js ? 'allow-scripts allow-forms' : 'allow-scripts'}" style="height:${Number(height) || 160}px"></iframe>
    ${code.js ? `
    <div class="console">
      <div class="console__head"><span>コンソール</span><button type="button" class="btn btn-ghost console__rerun">もう一度実行</button></div>
      <ol class="console__lines" aria-live="polite">${CONSOLE_EMPTY}</ol>
    </div>` : ''}`;
  const frame = el.querySelector('iframe');
  const srcdoc = buildSrcdoc({ ...code, fullDocument });
  frame.srcdoc = srcdoc;
  frames.set(frame, el.querySelector('.console__lines'));
  el.querySelector('.console__rerun')?.addEventListener('click', () => {
    el.querySelector('.console__lines').innerHTML = CONSOLE_EMPTY;
    frame.srcdoc = srcdoc;
  });
  return el;
}

/* ---------- iframe からのメッセージ（高さ・コンソール出力） ---------- */

const MIN_HEIGHT = 60;
/** @type {Map<HTMLIFrameElement, HTMLElement|null>} iframe → コンソール欄 */
const frames = new Map();

window.addEventListener('message', (e) => {
  const { hcgPreviewHeight: h, hcgConsole: log } = e.data || {};
  if (typeof h !== 'number' && !log) return;
  for (const [frame, lines] of frames) {
    if (!frame.isConnected) { frames.delete(frame); continue; }
    if (frame.contentWindow !== e.source) continue;
    if (typeof h === 'number') frame.style.height = `${Math.max(MIN_HEIGHT, h)}px`;
    if (log && lines) {
      lines.querySelector('.console__empty')?.remove();
      const li = document.createElement('li');
      li.className = `console__line console__line--${log.level}`;
      li.textContent = String(log.text);
      lines.append(li);
    }
  }
});
