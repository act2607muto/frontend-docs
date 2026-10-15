# frontend docs

HTMLタグ・CSSプロパティ・JavaScriptの辞典と学習ロードマップのサイトです。素の HTML・CSS・JavaScript（フレームワーク・依存パッケージなし）で実装しています。
仕様は [`design_handoff_html_css_guide/README.md`](design_handoff_html_css_guide/README.md) を参照してください。

## 使い方

```sh
npm start        # http://localhost:8000/ で確認（JSON を fetch するためローカルサーバーが必要）
npm run build    # data/*.json から全ページの HTML を再生成
```

`data/items.json` に項目を追加したり slug を変更したりしたら、`npm run build` で詳細ページを生成し直してください。

## 公開（Vercel ＋ Supabase）

Vercel で公開すると、`api/` の API が動き、検索履歴を Supabase に保存してトップの「よく調べるキーワード」に反映します。
API がない環境（GitHub Pages・`npm start`）では、`assets/js/config.js` の既定の語句を表示します。

1. **Supabase**：プロジェクトを作成し、SQL Editor で [`supabase/schema.sql`](supabase/schema.sql) を実行する
2. **Vercel**：このリポジトリをインポートし、Environment Variables に次の2つを登録してデプロイする
   - `SUPABASE_URL` … Supabase の Project URL（Settings → API）
   - `SUPABASE_SERVICE_ROLE_KEY` … Supabase の `service_role` キー（ブラウザには出さない秘密の鍵）

ビルド設定は `vercel.json` に書いてあります（`npm run build` → リポジトリ直下をそのまま公開）。

| API | 内容 |
|---|---|
| `POST /api/search-log` | 検索結果から項目を開いたときの検索語を記録（辞典にヒットする語句だけ） |
| `GET /api/popular-keywords?limit=5` | 直近30日でよく検索された語句（5分間キャッシュ） |

## 構成

```
index.html / html/ / css/ / js/ / learn/   生成されたページ（中身は JS が data/ から描画）
data/                                 辞典・ロードマップのデータ
assets/css/  tokens.css  base.css  components.css
assets/js/
  main.js         エントリー（<body data-page> でページを振り分け）
  config.js       設定（アコーディオンを1つずつ開く・行番号の表示 など）
  data.js         JSON の読み込みと整形
  layout.js       ヘッダー・フッター
  theme.js        テーマ切替
  search.js       検索
  search-dialog.js  Ctrl / ⌘ + K で開く検索ウィンドウ
  search-log.js   検索履歴の送信・よく調べるキーワードの取得
  accordion.js    アコーディオン
  code.js         シンタックスハイライト（HTML / CSS / JS）・コピー
  preview.js      iframe プレビュー（srcdoc の生成を独立させている）・JS のコンソール出力
  pages/          トップ・辞典一覧・詳細・ロードマップ
scripts/
  build-pages.mjs ページ生成
  serve.mjs       確認用サーバー
api/             Vercel の API（検索履歴の記録・人気の語句）
supabase/        データベースの定義（schema.sql）
```
