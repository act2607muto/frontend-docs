// ⑥ 学習ロードマップ
import { esc, pad2, titleOf, url } from '../util.js';
import { icon } from '../icons.js';
import { renderHeader, renderFooter } from '../layout.js';

export function renderRoadmap(app, data) {
  let n = 0;
  const stages = data.roadmap.map((s) => {
    const start = n + 1;
    const steps = s.steps.map((step) => ({
      ...step,
      num: pad2(++n),
      links: [...new Set(step.links)].map((id) => data.index[id]).filter(Boolean),
    }));
    return { ...s, steps, anchor: `stage-${s.num}`, range: `STEP ${pad2(start)}–${pad2(n)}` };
  });

  const main = document.createElement('main');
  main.className = 'page page--wide';
  main.innerHTML = `
    <div class="kicker">LEARNING ROADMAP</div>
    <h1 class="page-title">学習ロードマップ</h1>
    <p class="page-lead page-lead--roadmap">上から順に進めると、HTMLの基礎から実務レベルのCSSまで無理なく身につきます。各項目のタグ・プロパティを選ぶと、辞典の詳細ページで解説とサンプルを確認できます。</p>
    <nav class="stage-jump" aria-label="段階">
      ${stages.map((s) => `
        <a href="#${s.anchor}">
          <span class="stage-jump__num">${esc(s.num)}</span>
          <span class="stage-jump__text"><span class="stage-jump__name">${esc(s.name)}</span><span class="stage-jump__range">${s.range}</span></span>
          ${icon('chevron-down')}
        </a>`).join('')}
    </nav>
    ${stages.map((s) => `
      <section class="stage" id="${s.anchor}">
        <div class="stage__label">
          <div class="kicker">STAGE ${esc(s.num)} · ${esc(s.en)}</div>
          <h2>${esc(s.name)}</h2>
          <p>${esc(s.desc)}</p>
        </div>
        <ol>
          ${s.steps.map((st) => `
            <li class="step">
              <span class="step__num">${st.num}</span>
              <div class="step__body">
                <h3>${esc(st.title)}</h3>
                <p>${esc(st.desc)}</p>
                <div class="chips">${st.links.map((it) => `<a class="chip" href="${url.item(it)}">${esc(titleOf(it))}</a>`).join('')}</div>
              </div>
            </li>`).join('')}
        </ol>
      </section>`).join('')}`;

  // 段階ジャンプはスムーズスクロール
  main.querySelectorAll('.stage-jump a').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = document.getElementById(a.hash.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', a.hash);
    }),
  );

  app.append(renderHeader(data, { current: 'learn' }), main, renderFooter(data));
}
