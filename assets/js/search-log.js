// 検索履歴の記録と「よく調べるキーワード」の取得（Vercel の API 経由で Supabase に保存）
// API がない環境（GitHub Pages・ローカルの npm start など）では何もせず、既定のキーワードを使う
import { ROOT } from './util.js';

const api = (name) => `${ROOT}api/${name}`;

/** 検索結果から項目を開いたときに、検索語を記録する（ページ移動を妨げないよう sendBeacon で送る） */
export function logSearch(query) {
  const keyword = query.trim();
  if (!keyword || !navigator.sendBeacon) return;
  try {
    navigator.sendBeacon(api('search-log'), new Blob([JSON.stringify({ keyword })], { type: 'application/json' }));
  } catch { /* 記録できなくても検索には影響させない */ }
}

/** よく検索された語句を取得する（取得できなければ空配列） */
export async function fetchPopularKeywords(limit = 5) {
  try {
    const r = await fetch(`${api('popular-keywords')}?limit=${limit}`);
    if (!r.ok) return [];
    const { keywords } = await r.json();
    return Array.isArray(keywords) ? keywords.filter((k) => typeof k === 'string') : [];
  } catch {
    return [];
  }
}
