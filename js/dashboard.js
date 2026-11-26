// SENIM демо кабинеті: бір оқиға — тапсырма → кепіл → тапсыру → салық → карта.
// Есептер js/escrow.js, сүзгі js/security.js, тәлімгер /api/mentor (Gemini).
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ') + ' ₸';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const get = k => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3000);
  }
  function press(el) {
    el.classList.add('is-on');
    if (reduced || !window.gsap) { el.style.opacity = .95; return; }
    gsap.timeline()
      .fromTo(el, { scale: 1.45, opacity: 0 }, { scale: .96, opacity: .95, duration: .16, ease: 'power4.in' })
      .to(el, { scale: 1, duration: .34, ease: 'back.out(2.4)' });
  }

  // ── Профиль ───────────────────────────────────────────
  const name = (get('senim_user_name') || 'Айгерім').trim();
  const first = name.split(/\s+/)[0];
  const role = get('senim_user_role') || 'junior';
  const age = Number(get('senim_user_age')) || (role === 'junior' ? 16 : 19);
  const isJunior = role === 'junior';

  function initProfile() {
    $('#db-name').textContent = first;
    $('#db-name-chip').textContent = first;
    $('#db-av').textContent = first.charAt(0).toUpperCase();
    $('#db-role-line').textContent = isJunior
      ? `${age} жас · SENIM Junior · ата-ана келісімі расталған`
      : role === 'business' ? 'Бизнес аккаунт · бұл демо жас маманның көзімен көрсетілген'
      : `${age} жас · SENIM Pro · толық дербес аккаунт`;
    if (!isJunior) document.querySelectorAll('[data-junior]').forEach(el => { el.hidden = true; const li = el.closest('li'); if (li) li.hidden = true; });
    const maxH = age <= 15 ? 24 : 36;
    $('#h-max').textContent = maxH;
    $('#h-bar').style.width = (9 / maxH * 100) + '%';
    $('#h-note').textContent = `Еңбек кодексі бойынша ${age <= 15 ? '14-15' : '16-17'} жасқа аптасына ${maxH} сағаттан аспайды. 22:00-ден кейін тапсырма берілмейді.`;
    $('#parent-feed').querySelectorAll('li')[0].lastChild.textContent = `${first}: «Арман Кофе» жобасына кірісті. 45 000 ₸ кепілде.`;
    $('#logout').addEventListener('click', () => { try { ['senim_user_name', 'senim_user_role', 'senim_user_age', 'senim_session'].forEach(k => localStorage.removeItem(k)); } catch (_) {} });
  }

  // ── Ақша және салық журналы ───────────────────────────
  const E = window.EscrowCore;
  const done = [
    { project: 'Кофехана мәзірін аудару (kk/ru/en)', client: 'Арман Кофе', gross: 25000 },
    { project: 'Лендинг беттің Figma макеті', client: 'Bilim Lab', gross: 85000 },
    { project: 'TikTok роликтерінің монтажы, 4 дана', client: 'Qazaq Sport', gross: 60000 }
  ];
  const money = { escrow: 45000 + 30000, withdrawn: 0 };

  function renderMoney() {
    const rows = done.map(d => ({ ...d, ...E.calculateTransaction(d.gross) }));
    const sum = k => rows.reduce((s, r) => s + r[k], 0);
    $('#m-escrow').textContent = fmt(money.escrow);
    $('#m-ready').textContent = fmt(rows[rows.length - 1].netPayout + (done.length > 3 ? rows[rows.length - 2].netPayout : 0));
    $('#m-month').textContent = fmt(sum('netPayout'));
    const pct = sum('gross') / E.monthlyLimit * 100;
    $('#m-limit-bar').style.width = pct.toFixed(1) + '%';
    $('#m-limit-txt').textContent = pct.toFixed(0) + '%';

    $('#tax-body').innerHTML = rows.map((r, i) => `<tr${i === rows.length - 1 && done.length > 3 ? ' class="is-new"' : ''}>
      <th scope="row">${esc(r.project)}<small>${esc(r.client)}</small></th>
      <td>${fmt(r.gross)}</td><td>${fmt(r.commission)}</td><td>${fmt(r.tax)}</td><td><b>${fmt(r.netPayout)}</b></td>
      <td><button class="db-pdf" type="button" data-i="${i}">Шот-фактура</button></td></tr>`).join('');
    $('#t-gross').textContent = fmt(sum('gross')); $('#t-fee').textContent = fmt(sum('commission'));
    $('#t-tax').textContent = fmt(sum('tax')); $('#t-net').textContent = fmt(sum('netPayout'));
    document.querySelectorAll('.db-pdf').forEach(b => b.addEventListener('click', () => invoice(rows[+b.dataset.i])));
  }

  function invoice(r) {
    const w = window.open('', '_blank', 'width=760,height=820');
    if (!w) return toast('Терезе ашылмады: браузер бұғаттады');
    const id = 'SNM-' + (2026000 + Math.round(r.gross / 100));
    w.document.write(`<!doctype html><html lang="kk"><head><meta charset="utf-8"><title>Шот-фактура ${id}</title>
      <style>body{font:15px/1.5 -apple-system,Arial,sans-serif;color:#111;padding:48px;max-width:640px;margin:auto}h1{font-size:28px;margin:0 0 4px}
      .m{color:#666;font-size:13px}table{width:100%;border-collapse:collapse;margin:28px 0}td{padding:10px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right}
      .t td{font-weight:700;font-size:18px;border-bottom:2px solid #111}.seal{display:inline-block;border:3px solid #E66E38;color:#E66E38;border-radius:999px;padding:8px 18px;font-weight:900;letter-spacing:.1em;transform:rotate(-8deg);margin-top:20px}</style></head><body>
      <h1>Шот-фактура</h1><p class="m">№ ${id} · ${new Date().toLocaleDateString('kk-KZ')}</p>
      <p><b>Орындаушы:</b> ${esc(name)} (өзін-өзі жұмыспен қамтыған)<br><b>Тапсырыс беруші:</b> ${esc(r.client)}<br><b>Қызмет:</b> ${esc(r.project)}</p>
      <table><tr><td>Жоба бюджеті</td><td>${fmt(r.gross)}</td></tr><tr><td>Платформа комиссиясы 10%</td><td>−${fmt(r.commission)}</td></tr>
      <tr><td>Салық 4% (SENIM салық агенті ретінде аударды)</td><td>−${fmt(r.tax)}</td></tr><tr class="t"><td>Орындаушыға төленді</td><td>${fmt(r.netPayout)}</td></tr></table>
      <p class="m">Негіз: ҚР Салық кодексі (2026), интернет-платформа арқылы өзін-өзі жұмыспен қамтығандар режимі. Демо құжат.</p>
      <span class="seal">SENIM · ТӨЛЕНДІ</span><script>onload=()=>print()<\/script></body></html>`);
    w.document.close();
  }

  // ── Escrow сценарийі ──────────────────────────────────
  function initProject() {
    const GROSS = 45000, tx = E.calculateTransaction(GROSS);
    const steps = [...document.querySelectorAll('#p-steps li')];
    const btn = $('#p-btn'), reset = $('#p-reset'), hint = $('#p-hint');
    let state = 1; // 0-1 орындалды: тапсырма тексерілді, ақша кепілде
    $('#s-gross').textContent = fmt(GROSS); $('#s-fee').textContent = '−' + fmt(tx.commission);
    $('#s-tax').textContent = '−' + fmt(tx.tax); $('#s-net').textContent = fmt(tx.netPayout);

    const HINT = [
      '', 'Қазір: ақша кепілде, жұмыс сізден күтілуде.',
      'Жұмыс тапсырылды. Енді тапсырыс берушінің рөлінде қабылдап көріңіз.',
      'Қабылданды. Платформа салық пен комиссияны есептеп жатыр…',
      `Дайын: ${fmt(tx.netPayout)} картаға түсті, ${fmt(tx.tax)} салық мемлекетке аударылды.`
    ];
    const BTN = ['', 'Жұмысты тапсыру', 'Тапсырыс беруші ретінде қабылдау', '', ''];

    function render() {
      steps.forEach((li, i) => { li.classList.toggle('is-done', i <= state); li.classList.toggle('is-now', i === state + 1); });
      hint.textContent = HINT[state];
      btn.hidden = state >= 3; btn.textContent = BTN[state] || '';
      reset.hidden = state < 4;
      $('#p-split').hidden = state < 4;
    }

    btn.addEventListener('click', () => {
      state++;
      render();
      if (state === 3) {
        setTimeout(() => {
          state = 4; render();
          press($('#p-stamp'));
          money.escrow -= GROSS;
          done.push({ project: 'Instagram посттарының дизайны, 5 пост', client: 'Арман Кофе', gross: GROSS });
          renderMoney();
          const li = document.createElement('li');
          li.innerHTML = `<time>Бүгін</time>${esc(first)}: картаға ${fmt(tx.netPayout)} түсті. Салық ${fmt(tx.tax)} аударылды.`;
          li.className = 'is-ok';
          $('#parent-feed').prepend(li);
          toast(`${fmt(tx.netPayout)} картаға түсті`);
        }, reduced ? 50 : 900);
      }
    });
    reset.addEventListener('click', () => {
      state = 1; money.escrow += GROSS; done.pop(); renderMoney();
      const s = $('#p-stamp'); s.classList.remove('is-on'); s.style.opacity = '';
      const f = $('#parent-feed'); if (f.firstElementChild.classList.contains('is-ok')) f.firstElementChild.remove();
      render();
    });
    render();
  }

  // ── Тапсырмалар ───────────────────────────────────────
  const GIGS = [
    { title: 'Кофехана үшін логотип, 3 нұсқа', client: 'Нан мен Кофе', level: 'Expert', budget: 30000, days: 5, skills: 'Figma, Illustrator' },
    { title: 'Мектеп сайтына жаңалықтарды қазақшаға аудару', client: 'Bilim Lab', level: 'Starter', budget: 12000, days: 3, skills: 'Аударма' },
    { title: 'Telegram-бот: кезекке жазылу', client: 'Smile Dent', level: 'Elite', budget: 120000, days: 10, skills: 'Python, aiogram' }
  ];
  const BLOCKED = [
    'Қоймаға келіп жәшік тасу керек, түнгі ауысым',
    'Картаңды бере тұр, ақшаны қабылдап ал да аудар, 10% сенікі',
    'Казино сайтына жарнама мәтіндері, ставка бонустары'
  ];
  function initGigs() {
    const S = window.AISecurity;
    $('#gig-list').innerHTML = GIGS.map((g, i) => {
      const r = S.analyze(g.title);
      return `<li class="doc db-gig">
        <div class="db-gig__top"><span class="db-badge">${esc(g.level)}</span>${r.verdict === 'SAFE' ? '<span class="db-ok">Сүзгіден өтті</span>' : '<span class="doc__meta">Модератор тексеруде</span>'}</div>
        <h3>${esc(g.title)}</h3>
        <p class="doc__meta">${esc(g.client)} · ${esc(g.skills)}</p>
        <div class="db-gig__foot"><b>${fmt(g.budget)}</b><span class="doc__meta">${g.days} күн · ақша кепілде</span>
          <button class="btn btn--line" type="button" data-i="${i}">Өтінім беру</button></div>
      </li>`;
    }).join('');
    document.querySelectorAll('#gig-list button').forEach(b => b.addEventListener('click', () => {
      b.textContent = 'Өтінім жіберілді ✓'; b.disabled = true;
      toast('Өтінім жіберілді. Тапсырыс беруші бюджетті кепілге салғанда жұмыс басталады.');
    }));
    $('#blocked-list').innerHTML = BLOCKED.map(t => {
      const r = S.analyze(t);
      return `<li><p>${S.highlight(t, r.spans)}</p><small>${esc(r.reasons.map(x => x.label).join(', '))}</small><span class="stamp stamp--block" aria-hidden="true">ТЫЙЫМ</span></li>`;
    }).join('');
    $('#blocked-count').textContent = BLOCKED.length + ' тапсырма';
  }

  // ── AI тәлімгер ───────────────────────────────────────
  const CHIPS = [
    'Логотипке қанша баға қоямын? 16 жастамын, Figma-ны 2 жыл қолданамын',
    'Клиент мерзімді үнемі ұзартып жүр. Не істеймін?',
    'React-та useState деген не? Қысқа мысал',
    'Алаяқтық мысалы: «Kaspi-ге тікелей аударайын, нөміріңді бер»'
  ];
  const history = [];
  function initMentor() {
    const log = $('#chat-log'), input = $('#chat-input');
    const add = (cls, html) => { const d = document.createElement('div'); d.className = 'msg ' + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };
    $('#chat-chips').innerHTML = CHIPS.map((c, i) => `<button type="button" class="chip${i === 3 ? ' chip--warn' : ''}">${esc(c.replace(/^Алаяқтық мысалы: «|»$/g, i === 3 ? '' : '$&'))}</button>`).join('');
    $('#chat-chips').querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => {
      send(i === 3 ? 'Kaspi-ге тікелей аударайын, нөміріңді бер' : CHIPS[i]);
    }));
    $('#chat-form').addEventListener('submit', e => { e.preventDefault(); const t = input.value.trim(); if (t) { input.value = ''; send(t); } });

    async function send(text) {
      add('msg--me', `<p>${esc(text)}</p>`);
      const local = window.AISecurity.analyze(text);
      if (local.verdict === 'BLOCK') {
        add('msg--block', `<p><b>Хабарлама жіберілмеді.</b> ${esc(local.reasons.map(r => r.label).join(', '))}. Платформадан тыс төлем мен байланыс: алаяқтардың басты тәсілі.</p>`);
        return;
      }
      const wait = add('msg--ai is-wait', '<p>Ойланып жатыр…</p>');
      try {
        const res = await fetch('/api/mentor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history: history.slice(-6) }), signal: AbortSignal.timeout(30000) });
        const d = await res.json();
        if (d.blocked) { wait.className = 'msg msg--block'; wait.innerHTML = `<p><b>Хабарлама жіберілмеді.</b> ${esc(d.reply)}</p>`; return; }
        if (!res.ok || !d.reply) throw new Error();
        wait.classList.remove('is-wait');
        wait.innerHTML = '<p>' + esc(d.reply).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/```[\w]*\n?([\s\S]*?)```/g, '<code>$1</code>').replace(/^\s*[*-] /gm, '• ').replace(/\n/g, '<br>') + '</p>';
        history.push({ role: 'user', text }, { role: 'ai', text: d.reply });
      } catch (_) {
        wait.classList.remove('is-wait');
        wait.innerHTML = '<p>Тәлімгер қазір жауап бере алмады (Gemini бос емес). Бірнеше секундтан соң қайталаңыз.</p>';
      }
      log.scrollTop = log.scrollHeight;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initProfile();
    renderMoney();
    initProject();
    initGigs();
    initMentor();
  });
})();
