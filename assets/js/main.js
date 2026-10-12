// エントリーポイント：<body data-page="..."> に応じてページを描画する
import { loadData } from './data.js';
import { renderTop } from './pages/top.js';
import { renderDict } from './pages/dict.js';
import { renderDetail } from './pages/detail.js';
import { renderRoadmap } from './pages/roadmap.js';

const app = document.getElementById('app');
const { page, type, id } = document.body.dataset;

loadData()
  .then((data) => {
    app.textContent = '';
    if (page === 'top') renderTop(app, data);
    else if (page === 'dict') renderDict(app, data, type);
    else if (page === 'detail') renderDetail(app, data, id);
    else if (page === 'learn') renderRoadmap(app, data);
    // ハッシュ付きで開いた場合は描画後に該当位置へ
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  })
  .catch((err) => {
    console.error(err);
    app.innerHTML =
      '<p style="padding:40px;line-height:1.8">データを読み込めませんでした。<br>ローカルサーバー経由で開いてください（例：<code>npm start</code>）。</p>';
  });
