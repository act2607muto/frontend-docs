// コードブロック：シンタックスハイライト（VS Code Light+ / Dark+ 配色）・行番号・コピー
import { CONFIG } from './config.js';
import { esc } from './util.js';
import { icon } from './icons.js';

/* ---------- トークナイザ ---------- */

export function tokHTML(src) {
  const out = [];
  const push = (t, c) => t && out.push({ t, c });
  const n = src.length;
  let i = 0;
  while (i < n) {
    if (src.startsWith('<!--', i)) {
      const e = src.indexOf('-->', i);
      const j = e < 0 ? n : e + 3;
      push(src.slice(i, j), 'cmt'); i = j; continue;
    }
    if (src[i] === '<') {
      let j = i + 1;
      if (src[j] === '/' || src[j] === '!') j++;
      push(src.slice(i, j), 'punct'); i = j;
      const m = /^[A-Za-z][\w-]*/.exec(src.slice(i));
      if (m) { push(m[0], 'tag'); i += m[0].length; }
      while (i < n && src[i] !== '>') {
        const rest = src.slice(i);
        let mm;
        if ((mm = /^\s+/.exec(rest))) push(mm[0], 'text');
        else if ((mm = /^\/(?=>)/.exec(rest))) push(mm[0], 'punct');
        else if ((mm = /^("[^"]*"|'[^']*')/.exec(rest))) push(mm[0], 'val');
        else if ((mm = /^[^\s=>/"']+/.exec(rest))) push(mm[0], 'attr');
        else { mm = [rest[0]]; push(rest[0], 'text'); }
        i += mm[0].length;
      }
      if (i < n) { push('>', 'punct'); i++; }
      continue;
    }
    let j = src.indexOf('<', i);
    if (j < 0) j = n;
    push(src.slice(i, j), 'text'); i = j;
  }
  return out;
}

function tokVal(s, push) {
  const re = /(#[0-9a-fA-F]{3,8}\b)|("[^"]*"|'[^']*')|([\w-]+(?=\())|(-?\d*\.?\d+(?:px|em|rem|%|fr|s|ms|deg|vh|vw)?)/g;
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    push(s.slice(last, m.index), 'cval');
    push(m[0], m[1] ? 'num' : m[2] ? 'cval' : m[3] ? 'fn' : 'num');
    last = re.lastIndex;
  }
  push(s.slice(last), 'cval');
}

export function tokCSS(src) {
  const out = [];
  const push = (t, c) => t && out.push({ t, c });
  const n = src.length;
  let i = 0;
  while (i < n) {
    const ch = src[i];
    if (src.startsWith('/*', i)) {
      let e = src.indexOf('*/', i + 2);
      e = e < 0 ? n : e + 2;
      push(src.slice(i, e), 'cmt'); i = e; continue;
    }
    if (/\s/.test(ch)) {
      let j = i;
      while (j < n && /\s/.test(src[j])) j++;
      push(src.slice(i, j), 'text'); i = j; continue;
    }
    if ('{};'.includes(ch)) { push(ch, 'punct'); i++; continue; }
    let j = i;
    while (j < n && !';{}'.includes(src[j]) && !src.startsWith('/*', j)) j++;
    const chunk = src.slice(i, j);
    if (src[j] === '{') {
      if (chunk[0] === '@') {
        const m = /^@[\w-]+/.exec(chunk);
        push(m[0], 'kw');
        tokVal(chunk.slice(m[0].length), push);
      } else push(chunk, 'sel');
    } else {
      const k = chunk.indexOf(':');
      if (k < 0) push(chunk, 'text');
      else { push(chunk.slice(0, k), 'prop'); push(':', 'text'); tokVal(chunk.slice(k + 1), push); }
    }
    i = j;
  }
  return out;
}

// JavaScript：宣言・値のキーワード（青）と制御構文のキーワード（紫）を色分けする
const JS_STORAGE = new Set([
  'const', 'let', 'var', 'function', 'class', 'new', 'this', 'true', 'false', 'null', 'undefined',
  'typeof', 'instanceof', 'async', 'extends', 'static', 'get', 'set',
]);
const JS_CONTROL = new Set([
  'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue', 'switch', 'case', 'default',
  'try', 'catch', 'finally', 'throw', 'await', 'of', 'in', 'import', 'export', 'from',
]);

export function tokJS(src) {
  const out = [];
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(\s*\()?|(\s+)|([\s\S])/g;
  let m;
  while ((m = re.exec(src))) {
    const [, cmt, str, num, ident, call, ws, other] = m;
    if (cmt) out.push({ t: cmt, c: 'cmt' });
    else if (str) out.push({ t: str, c: 'str' });
    else if (num) out.push({ t: num, c: 'num' });
    else if (ident) {
      const c = JS_CONTROL.has(ident) ? 'kw' : JS_STORAGE.has(ident) ? 'stor' : call ? 'fn' : 'var';
      out.push({ t: ident, c });
      if (call) out.push({ t: call, c: 'text' });
    } else out.push({ t: ws || other, c: 'text' });
  }
  return out;
}

const TOKENIZERS = { HTML: tokHTML, CSS: tokCSS, JS: tokJS };

/** トークン列を行ごとの HTML に変換 */
export function highlight(lang, code) {
  const toks = TOKENIZERS[lang](code);
  const lines = [''];
  for (const tk of toks) {
    tk.t.split('\n').forEach((part, k) => {
      if (k > 0) lines.push('');
      if (part) lines[lines.length - 1] += `<span class="t-${tk.c}">${esc(part)}</span>`;
    });
  }
  return lines;
}

/* ---------- コピー ---------- */

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // 非セキュアコンテキスト向けの代替
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

const copyLabel = (copied) =>
  copied ? `${icon('check')}<span>コピーしました</span>` : `${icon('copy')}<span>コピー</span>`;

/* ---------- 部品 ---------- */

/**
 * コードブロック要素を生成
 * @param {'HTML'|'CSS'|'JS'} lang
 * @param {string} code
 * @param {{ small?: boolean, lineNumbers?: boolean }} [opts]
 */
export function createCodeBlock(lang, code, { small = false, lineNumbers = CONFIG.lineNumbers } = {}) {
  const el = document.createElement('div');
  el.className = `code${small ? ' code--sm' : ''}${lineNumbers ? '' : ' code--no-ln'}`;
  el.innerHTML = `
    <div class="code__head">
      <span class="code__lang">${lang}</span>
      <button type="button" class="btn btn-ghost code__copy">${copyLabel(false)}</button>
    </div>
    <div class="code__body" tabindex="0" role="region" aria-label="${lang}のサンプルコード">
      <div class="code__lines">${highlight(lang, code)
        .map((l, i) => `<div class="code__line"><span class="code__ln">${i + 1}</span><span class="code__src">${l}</span></div>`)
        .join('')}</div>
    </div>`;
  const btn = el.querySelector('.code__copy');
  let timer;
  btn.addEventListener('click', async () => {
    await copyText(code);
    btn.innerHTML = copyLabel(true);
    clearTimeout(timer);
    timer = setTimeout(() => { btn.innerHTML = copyLabel(false); }, 1600);
  });
  return el;
}

/** html / css / js を持つオブジェクトからコードブロックを並べる */
export function createCodeBlocks({ html, css, js }, opts) {
  const frag = document.createDocumentFragment();
  if (html) frag.append(createCodeBlock('HTML', html, opts));
  if (css) frag.append(createCodeBlock('CSS', css, opts));
  if (js) frag.append(createCodeBlock('JS', js, opts));
  return frag;
}
