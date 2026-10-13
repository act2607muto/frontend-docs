# Handoff: HTML & CSS GUIDE（HTML・CSS学習／辞典サイト）

## 概要
HTMLタグ・CSSプロパティ・JavaScriptの辞典と、初心者〜上級者向け学習ロードマップを組み合わせた個人用学習サイト。コンセプトは「学ぶ・調べる・理解する」。すべての詳細ページで **コードと実際のブラウザ表示（ライブプレビュー）をセットで掲載** することが最重要要件。

## デザインファイルについて
`design/` 内のファイルは **HTMLで作成したデザインリファレンス（動作するプロトタイプ）** であり、そのまま本番に使うコードではない。プロトタイプは独自ランタイム（`support.js` / `.dc.html` 形式）上で動いているため、**素のHTML・CSS・JavaScript（フレームワーク非依存）で再実装**すること。将来WordPressオリジナルテーマへ移行する前提で、共通部品・データ分離を意識する。

- `design/HTML CSS Guide.dc.html` をブラウザで開くと全画面を操作確認できる（ローカルサーバー経由で開くこと）。
- 辞典データは `data/*.json` に抽出済み。実装ではここから描画する。

## 忠実度
**ハイファイ**。色・タイポグラフィ・余白・挙動は最終案。プロトタイプの値を基準に再現する。

---

## 推奨ファイル構成
```
/index.html              トップ
/html/index.html         HTML辞典一覧
/css/index.html          CSS辞典一覧
/learn/index.html        学習ロードマップ
/html/{slug}.html        HTML詳細（例 /html/h1.html）  ※1テンプレートをJSONから生成でも可
/css/{slug}.html         CSS詳細（例 /css/margin.html）
/assets/css/tokens.css   デザイントークン（ライト/ダーク）
/assets/css/base.css     リセット・タイポ
/assets/css/components.css
/assets/js/theme.js      テーマ切替
/assets/js/search.js     検索
/assets/js/accordion.js  アコーディオン
/assets/js/code.js       シンタックスハイライト・コピー
/assets/js/preview.js    iframeプレビュー生成
/data/categories.json items.json details.json roadmap.json
```
WordPress移行時の対応：一覧＝カスタム投稿タイプ（html_tag / css_property）＋タクソノミー（カテゴリ）、詳細＝single テンプレート、ロードマップ＝固定ページ。共通部品は `template-parts/` 化できる単位（header / footer / sidebar / code-block / preview / related-list）で分割しておく。

## データ構造（`data/`）
- `categories.json` … `{ html: [{id, name}], css: [...], js: [...] }`（表示順）
- `items.json` … 全項目 `{ id: "html-h1", type: "html"|"css"|"js", slug, name, summary, keywords[], category }`（144件：HTML 64・CSS 60・JS 20）
- `details.json` … 解説済み項目（全144件）
  ```
  { id, title?(見出しの上書き 例 "<!DOCTYPE html>"), ja, lead,
    meta: [{label, value}],
    code: { html, css, js? },          // null可。js があるとプレビューにコンソール欄が付く
    preview: { height, note, fullDocument }, // fullDocument=true は code.html が完全なHTML文書
    explain: [string],                 // `バッククォート` 部分はインラインコード表示
    values: { label, head, rows: [{key, desc}] },
    usages: [{ title, desc, html?, css? }],
    notes: [string],
    related: [itemId] }
  ```
- `roadmap.json` … `[{ num, name, en, desc, steps: [{ title, desc, links: [itemId] }] }]`
- details が無い項目の詳細ページは「準備中」カード＋同カテゴリの関連項目を表示（現在は全項目が解説済み。項目を追加したときの表示）。

---

## 画面

### 共通ヘッダー（トップ以外）
- sticky、高さ60px、背景 `--color-bg`、下に1pxヘアライン（`--color-divider`）。内側 max-width 1320px、左右padding 40px（SP 18px）。
- 左：ロゴ「HTML & CSS GUIDE」19px / 700。SP詳細ページではロゴ左にハンバーガー（サイドバー開閉）。
- ナビ：「学習する」「HTML辞典」「CSS辞典」「JS辞典」14px。現在地は文字色 `--color-accent` ＋下線1px アクセント（詳細ページは項目の種類に応じた辞典が現在地）。SPのナビは4等分。
- 右：検索入力（幅240px、タブレット180px、高さ34px、左に虫眼鏡アイコン）＋テーマ切替アイコンボタン（月／太陽）。
- SP（<760px）：ナビはヘッダー下段に3等分グリッドで表示。検索はアイコンボタンでヘッダー下に全幅展開。

### ① トップ
- 1画面完結（min-height 100vh）、中央寄せの単一カラム max-width 1024px（左右padding 40pxを含む）。右上にテーマ切替ボタン（`.btn.btn-secondary`、アイコン＋「ダークモード」）。
- キッカー「学ぶ・調べる・理解する」12px、字間.18em、`--strong-accent`。
- タイトル「HTML & CSS GUIDE」80px（タブレット66 / SP46）weight 400、字間-.02em、行高1。
- 説明文 15.5px / 行高1.95 / muted。
- 検索バー：高さ52px、左46pxに虫眼鏡。プレースホルダ「タグ・プロパティ・やりたいことで検索（例：flex、中央寄せ）」。
- 「よく調べるキーワード」：flex / margin / 中央寄せ / 画像 / 見出し（ゴーストボタン、クリックで検索欄に入力）。
- 入口4つ（学習する・HTML辞典・CSS辞典・JS辞典）：`repeat(auto-fit, minmax(200px,1fr))`、上罫線1px（文字色）。各「01 — ROADMAP」等のキッカー＋→アイコン、タイトル24px/700、説明13px。カード塗りは使わない。
- フッター：左「HTML & CSS GUIDE」、右「HTML n項目 ・ CSS n項目を収録」12px muted。

### ② / ③ HTML辞典・CSS辞典一覧（同一UI）
- max-width 880px、padding 56px 40px 96px（SP 36px 18px 72px）。
- キッカー「DICTIONARY — HTML」、h1 48px（SP36）weight 400、リード文。
- ツールバー：左「8カテゴリ ・ n項目」、右「すべて開く」「すべて閉じる」。下に1px文字色罫線。
- **アコーディオン**：各カテゴリ行＝番号（01…、tabular）＋カテゴリ名 23px/700 ＋「n項目」＋シェブロン（開で180°回転、0.15s）。行間はヘアライン。
- 展開リスト（カード不可・リスト型）：左インデント44px（SP 0）。各行 `コード名（等幅14px、--strong-accent、幅170px）｜説明 14px｜›`、行上ヘアライン、hoverで薄い背景（文字色5%）。クリックで詳細へ。
- 初期展開：なし（すべて閉じた状態で表示）。

### ④ / ⑤ 詳細ページ（最重要）
**レイアウト**：PC 2カラム `290px | 1fr`（タブレット 250px）、max-width 1320px。
- **サイドバー**：sticky top 61px、高さ `calc(100vh - 61px)`、独立スクロール、右ヘアライン。
  - 上部に HTML / CSS / JS のセグメント切替（`.seg`）。
  - 全カテゴリをアコーディオン表示。**閲覧中項目を含むカテゴリは初期展開**、カテゴリ名をアクセント色に。
  - 項目行：等幅12.5pxのコード名＋11.5pxの説明（1行省略）。**現在項目は背景 `--hl-bg`（アクセント15%）・文字 `--hl-text`**、`aria-current="page"`。
  - SP：左からのドロワー（幅 min(86%,340px)、shadow-lg、背景オーバーレイ neutral-900 45%）。ヘッダーのメニューボタンで開閉、オーバーレイ／×で閉じる。
- **本文**：max-width 860px、padding 40px 56px 96px（SP 22px 18px 72px）。

**本文の構成（この順で縦に並べる。タブ切替は使わない）**
1. パンくず「HTML辞典 / カテゴリ / 項目名」12.5px
2. キッカー「HTML要素 ・ 見出し・文章」、タイトル（等幅 42px / SP30、HTMLは `<h1>` 表記）、日本語名 23px/700、リード 15.5px/行高1.95、メタ情報 dl（auto-fit 160px、上罫線文字色＋下ヘアライン。例：種類／終了タグ／使用の目安）
3. 各セクション見出しは「番号（12px アクセント）＋ h2 28px ＋ 右へ伸びるヘアライン」
4. **01 サンプルコード**：HTMLブロック → CSSブロック（必要な場合のみ）
   - ブロック：枠1px divider、角4px、背景 `--code-bg`。ヘッダー行に言語名（HTML/CSS 11.5px 字間.1em）＋**コピーボタン**（押下で✓「コピーしました」1.6秒）。
   - 本文：等幅13.5px / 行高1.7、行番号（右揃え40px幅、選択不可）、横スクロール。
5. **02 実行結果**：アクセント色1px枠のボックス。ヘッダー「ブラウザでの表示」＋右に補足（例：「リンクにマウスを乗せると下線が消えます」）。中身は **sandbox付き iframe（srcdoc）** に code.html と code.css を流し込んだ実レンダリング。背景は常に白、body padding 20px 24px、system-uiフォント。`fullDocument:true` の場合は code.html をそのまま文書として使い、code.css は外部CSS（style.css）を読み込んだ状態として head に差し込む。サンプル中の画像ファイル名（photo.jpg など）はプレースホルダー画像に置き換える。高さは preview.height を初期値とし、読み込み後は中身の高さに自動で合わせる（iframe は `sandbox="allow-scripts"`、中から postMessage で高さを通知）。
6. **03 解説**：段落 15.5px / 行高2、両端揃え。`バッククォート` はインラインコード（等幅.88em、ヘアライン枠、アクセント文字色）。
7. **04 応用例・注意点**：値／属性の表（`.table`、2列）→ 応用例（h3 21px＋説明＋コードブロック）→ 注意点（番号付きリスト、各行ヘアライン区切り）
8. **05 関連項目**：リスト行（種類タグ HTML/CSS ＋ コード名 ＋ 説明）、クリックで遷移
9. 前の項目／次の項目（同種類の並び順）ボタン2つ

### ⑥ 学習ロードマップ
- max-width 1040px。キッカー「LEARNING ROADMAP」、h1「学習ロードマップ」、リード。
- 段階ジャンプ：3列（SPは1列）の枠線ボタン「01 初心者 / STEP 01–07」。クリックで該当段階へスクロール。
- 各段階：PC 2カラム `240px | 1fr`。左は sticky（top 96px）で「STAGE 01 · BEGINNER」、h2 40px/400、説明。右は縦タイムライン。
- ステップ：直径40pxの円（アクセント1px枠、通し番号01〜21）＋円の間を結ぶ1px縦線（最後のステップは線なし）。タイトル22px/700、説明13.5px muted、関連タグ・プロパティのチップ（等幅12.5px、枠線、hoverで枠アクセント＋薄背景）→ 詳細ページへ。
- 進捗率・完了チェック・ポイントは**付けない**。

---

### CSS辞典「CSSの記法」カテゴリ（追加）
- CSS辞典の最初のカテゴリ。プロパティではなく、CSSの書き方・セレクタの基本を解説する（15項目）。
- 外部スタイルシート / 内部スタイルシート / インラインスタイル、詳細度、継承、`#id` / `.class` / 要素セレクタ、`A, B`（複数指定）、`A B` / `A > B` / `A + B` / `A ~ B`、疑似クラス / 疑似要素。
- 詳細度の目安：インライン 1-0-0-0 ≒ 1000点、id 1-0-0 ≒ 100点、クラス・属性・疑似クラス 0-1-0 ≒ 10点、要素・疑似要素 0-0-1 ≒ 1点、`*` 0点。

### ⑦ JS辞典（追加）
- 一覧・詳細ページの構成は HTML / CSS 辞典と同じ（`/js/index.html`、`/js/{slug}.html`）。キッカーは「JavaScript ・ カテゴリ名」。
- カテゴリ：基本構文 / 配列・オブジェクト / DOM操作 / イベント / タイマー・非同期（計20項目）。学習ロードマップには含めない。
- サンプルコードは HTML → CSS → JS の順に表示。JSのハイライトは VS Code Light+ / Dark+ 準拠（宣言系キーワード青、制御構文紫、文字列 #a31515 / #ce9178、変数 #001080 / #9cdcfe）。
- 実行結果：画面の表示に加え、下に「コンソール」欄（console.log / warn / error の出力、エラー）を表示。「もう一度実行」で iframe を読み込み直す。HTML がない項目はコンソール欄だけを表示。
- JS のプレビューのみ iframe に `allow-forms` も付ける（submit イベントを扱うため）。

## 操作・挙動
- **テーマ切替**：`html[data-theme="light|dark"]`。localStorage `hcg-theme` に保存。初回は `prefers-color-scheme` に従ってよい。
- **検索**：items.json の name / slug / keywords / summary / カテゴリ名を対象。スコア：完全一致100 > 前方一致70 > 部分一致50 > キーワード40 > 説明30 > カテゴリ15（解説済みを+1）。上位8件をドロップダウン表示（種類タグ・名前・カテゴリ・説明）。↑↓で選択、Enterで遷移、Escで閉じる。0件時「一致する項目は見つかりませんでした。別のキーワードをお試しください。」。`<` `>` は無視（`<h1>` でもヒット）。日本語（中央寄せ・画像・見出し・余白など）でヒットさせるため keywords を充実させること。
- **アコーディオン**：複数同時展開可（設定で1つずつにも切替可能な実装にしておく）。`<button aria-expanded>` を使用。
- **コピー**：`navigator.clipboard.writeText`。
- **フォーカス**：`:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`
- アニメーションはシェブロン回転程度に留める。
- **レスポンシブ**：SP <760px、タブレット 760–1099px、PC ≥1100px。

## シンタックスハイライト（VS Code Light+ / Dark+ 準拠）
| トークン | Light | Dark |
|---|---|---|
| 地の文 | #1f1f1f | #d4d4d4 |
| `< > </` 記号 | #800000 | #808080 |
| タグ名 | #800000 | #569cd6 |
| 属性名 | #e50000 | #9cdcfe |
| 属性値 | #0000ff | #ce9178 |
| コメント | #008000 | #6a9955 |
| CSSセレクタ | #800000 | #d7ba7d |
| CSSプロパティ | #e50000 | #9cdcfe |
| CSS値 | #0451a5 | #ce9178 |
| 数値・単位・色 | #098658 | #b5cea8 |
| @キーワード | #af00db | #c586c0 |
| 関数名 | #795e26 | #dcdcaa |
| 行番号 | #a19c98 | #6e7681 |
| コード背景 | #fbfaf8 | #1e1e1e |

軽量な自作トークナイザ（プロトタイプ内 `tokHTML` / `tokCSS` 参照）か、Prism.js 等にこの配色のテーマを当てる。

## デザイントークン
ベースは Classical デザインシステム（`design/_ds/.../styles.css`）。フォントのみ本プロジェクトで上書き。

**ライト**
- bg #f3f2f2 / surface #eae9e9 / text #201f1d / divider = text 16%
- accent #b68235、ramp：100 #fff3e4, 200 #ffe3bf, 300 #facb8d, 400 #e1ad66, 500 #c28d41, 600 #a06f24, 700 #7d5411, 800 #5a3b0a
- strong-accent（本文サイズのアクセント文字）= accent-700、link = accent-700
- muted = text 62%、tint(hover) = text 5%、hl-bg = accent 15%、hl-text = accent-800

**ダーク**
- bg #1a1918 / surface #232120 / text #e4e0da / divider = #e4e0da 15%
- accent #d2a25e、strong-accent・link = accent-400、hl-text = accent-300
- shadow-md `0 3px 12px rgba(0,0,0,.45)` / shadow-lg `0 12px 36px rgba(0,0,0,.6)`

**フォント**
- 本文・見出し：`"Helvetica Neue", Helvetica, Arial, "Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif`（英数字・記号＝Helvetica、日本語＝Noto Sans JP）。見出しは700。
- コード：`ui-monospace, SFMono-Regular, Menlo, Consolas, "Noto Sans Mono", monospace`
- Noto Sans JP は Google Fonts（400/500/700）

**その他**：radius sm 2px / md 4px。影は shadow-md（検索ドロップダウン）、shadow-lg（SPドロワー）のみ。数字の列・番号は `font-variant-numeric: tabular-nums`。

## アイコン
Lucide（moon, sun, search, menu, x, chevron-down, chevron-right, arrow-right, copy, check）。線幅1.6。

## 将来拡張への備え
- 実行結果ボックスは「コード編集＋リアルタイムプレビュー」に差し替えられるよう、code-block と preview を独立部品にする（code を受け取って srcdoc を生成する関数を共通化）。
- お気に入り：item id をキーに localStorage 保存できる構造。リスト行・詳細タイトル横にボタンを置く余地を残す。
- スニペット集：details.json と同じ code/preview 構造を流用。

## ファイル
- `design/HTML CSS Guide.dc.html` … 全画面のプロトタイプ（データ・トークナイザ・検索ロジックを含む）
- `design/support.js`, `design/_ds/...` … プロトタイプ実行用
- `data/*.json` … 辞典・ロードマップデータ
