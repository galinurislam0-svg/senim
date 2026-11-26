// SENIM — басты беттің логикасы.
//  • «мөр» қозғалысы (GSAP, бір сағат): hero мөрі, алаяқтық тізіміне ТЫЙЫМ, қадамдар, баспалдақ
//  • Сенім сүзгісі: ережелер бірден + /api/guard (Gemini) кейін
//  • escrow калькуляторы
//  • тіркелу: /api/otp → /api/register; API жоқ болса, жергілікті демо режимі
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ') + ' ₸';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} },
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  };
  const motionOn = () => html.classList.contains('motion') && window.gsap;

  function toast(msg, kind) {
    const t = $('#toast');
    t.textContent = msg; t.dataset.kind = kind || 'ok'; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3200);
  }

  async function api(path, payload, timeoutMs = 20000) {
    const res = await fetch('/api/' + path, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(timeoutMs)
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 404 || res.status === 405 || res.status === 501) throw Object.assign(new Error('no-api'), { offline: true });
    return { status: res.status, data };
  }

  function tabs(buttons, onChange) {
    buttons.forEach(b => b.addEventListener('click', () => {
      buttons.forEach(x => x.setAttribute('aria-selected', String(x === b)));
      onChange(b);
    }));
  }

  // ── Мөр басу: сайттың бір қозғалыс етістігі ─────────────
  function press(el, { kind, text } = {}) {
    if (!el) return;
    if (kind) el.className = el.className.replace(/stamp--\w+/g, '').trim() + ' stamp--' + kind;
    if (text != null) el.textContent = text;
    el.classList.add('is-on');
    if (!motionOn()) { el.style.opacity = ''; return; }
    gsap.killTweensOf(el);
    gsap.timeline()
      .fromTo(el, { scale: 1.45, opacity: 0 }, { scale: .96, opacity: .95, duration: .16, ease: 'power4.in' })
      .to(el, { scale: 1, duration: .34, ease: 'back.out(2.4)' });
  }

  // ── NAV ────────────────────────────────────────────────
  function initNav() {
    const nav = $('#nav'), btn = $('#menu-btn'), links = $('#nav-links');
    btn.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Жабу' : 'Мәзір';
    });
    $$('a', links).forEach(a => a.addEventListener('click', () => {
      links.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Мәзір';
    }));

    // Ағымдағы бөлім белгісі
    const map = new Map($$('a', links).map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(e => {
      const a = map.get(e.target.id);
      if (a) a.setAttribute('aria-current', String(e.isIntersecting));
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });

    // Hero-дан шыққанда мәзірдің фоны қатты болады (мәзір әрқашан көрінеді)
    const top = new IntersectionObserver(([e]) => nav.classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' });
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px';
    document.body.prepend(sentinel); top.observe(sentinel);
  }

  // ── MOTION ─────────────────────────────────────────────
  function initMotion() {
    const scams = $$('[data-scam]'), steps = $$('[data-step]');
    if (!motionOn()) {
      scams.forEach(s => s.classList.add('is-stamped'));
      steps.forEach(s => s.classList.add('is-on'));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out' });

    // Hero: мөр қағазға басылады, артынан мәтін жатады
    const seal = $('.seal__svg'), splash = $('.seal__splash');
    const tl = gsap.timeline({ delay: .1 });
    tl.fromTo(seal, { scale: 1.5, opacity: 0, filter: 'blur(6px)' }, { scale: .97, opacity: 1, filter: 'blur(0px)', duration: .32, ease: 'power4.in' })
      .to(seal, { scale: 1, duration: .5, ease: 'back.out(2.2)' })
      .fromTo(splash, { boxShadow: '0 0 0 0 rgba(230,110,56,.45)' }, { boxShadow: '0 0 0 46px rgba(230,110,56,0)', duration: .8, ease: 'power2.out' }, '<')
      .fromTo('[data-intro]', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .07 }, .12);

    // Idle: мөр жазуы баяу айналады (экраннан тыс — тоқтайды)
    const ring = gsap.to('#seal-ring', { rotation: -360, svgOrigin: '200 200', duration: 70, ease: 'none', repeat: -1 });
    ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? ring.play() : ring.pause() });

    // Reveal: қағаз жатады
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%', once: true,
      onEnter: els => gsap.fromTo(els, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .06, overwrite: true })
    });

    // Алаяқтық сөздеріне ТЫЙЫМ мөрі
    scams.forEach(row => ScrollTrigger.create({
      trigger: row, start: 'top 72%', once: true,
      onEnter: () => { row.classList.add('is-stamped'); press($('.scam__stamp', row)); }
    }));

    // Қадамдар: айналдырған сайын мөрленеді
    steps.forEach(step => ScrollTrigger.create({
      trigger: step, start: 'top 65%', once: true,
      onEnter: () => {
        step.classList.add('is-on');
        gsap.fromTo($('.step__seal', step), { scale: 1.35 }, { scale: 1, duration: .45, ease: 'back.out(2.4)' });
      }
    }));

    // Баспалдақ өседі
    gsap.fromTo('.stair__bar', { scaleY: 0 }, {
      scaleY: 1, duration: 1, stagger: .12, ease: 'power3.out',
      scrollTrigger: { trigger: '.stairs', start: 'top 80%', once: true }
    });
  }

  // ── СЕНІМ СҮЗГІСІ ──────────────────────────────────────
  const EXAMPLES = {
    task: [
      { label: 'Қалыпты тапсырма', text: 'Кофеханаға Instagram посттарының дизайны керек: аптасына 5 пост, Figma файлымен тапсыру. Мерзімі 7 күн.' },
      { label: 'Оффлайн «жұмыс»', text: 'Қоймаға келіп жәшіктерді тасу керек, түнгі ауысым, мекенжайды жеке жазамын.' },
      { label: 'Дроппер', text: 'Оңай табыс! Картаңды бер, ақшаны қабылдап ал да аудар, 10% сенікі.' },
      { label: 'Жасқа сай емес', text: 'Казино сайтына жарнама мәтіндерін жазу керек, ставка бонустары туралы.' }
    ],
    chat: [
      { label: 'Қалыпты чат', text: 'Сәлеметсіз бе! Макеттің екінші нұсқасын жүктедім. Түсін өзгерту керек пе?' },
      { label: 'WhatsApp-қа шақыру', text: 'Мұнда ыңғайсыз, w h a t s a p p-қа жаз: +7 707 123 45 67' },
      { label: 'Тікелей төлем', text: 'Комиссиясыз болсын, Kaspi-ге тікелей аударайын, карта нөмірін жібер.' },
      { label: 'Шекараны бұзу', text: 'Ата-анаңа айтпа, бұл біздің құпия жоба. Суретіңді жібер.' }
    ]
  };
  const STAMP = {
    SAFE: { kind: 'safe', text: 'СЕНІМ ✓', say: 'Қауіпсіз' },
    REVIEW: { kind: 'review', text: 'ТЕКСЕРУДЕ', say: 'Модератор қарайды' },
    BLOCK: { kind: 'block', text: 'ТЫЙЫМ', say: 'Бұғатталды' }
  };
  const CAT_KK = { offline: 'оффлайн қауіп', offplatform: 'платформадан тыс байланыс', payment: 'тікелей төлем', mule: 'дроппер схемасы', grooming: 'жеке шекараны бұзу', restricted: 'жасқа сай емес', pii: 'жеке дерек' };

  function initGuard() {
    const S = window.AISecurity;
    const input = $('#guard-input'), examples = $('#guard-examples');
    const ui = {
      meter: $('#guard-meter'), score: $('#guard-score'), preview: $('#guard-preview'),
      reasons: $('#guard-reasons'), ai: $('#guard-ai'), stamp: $('#guard-stamp'),
      source: $('#guard-source'), sr: $('#guard-verdict-sr'), count: $('#guard-count')
    };
    let mode = 'task', lastVerdict = null, reqId = 0, timer, ctrl;

    function renderExamples() {
      examples.innerHTML = '';
      EXAMPLES[mode].forEach(ex => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.textContent = ex.label;
        b.addEventListener('click', () => { input.value = ex.text; onInput(true); input.focus({ preventScroll: true }); });
        examples.appendChild(b);
      });
    }

    function setVerdict(verdict, score) {
      const pct = Math.round(score * 100);
      ui.meter.style.width = Math.max(pct, 3) + '%';
      ui.meter.dataset.v = verdict;
      ui.score.textContent = pct + '%';
      if (verdict !== lastVerdict) {
        const s = STAMP[verdict];
        press(ui.stamp, { kind: s.kind, text: s.text });
        ui.sr.textContent = 'Үкім: ' + s.say + ', қауіп ' + pct + '%';
        lastVerdict = verdict;
      }
    }

    function renderRules(text, r) {
      if (mode === 'chat') {
        const s = S.sanitizeChatMessage(text).sanitized;
        ui.preview.innerHTML = '<span class="k">Алушы көретін нұсқа</span>' + esc(s);
      } else {
        ui.preview.innerHTML = '<span class="k">Табылған белгілер</span>' + S.highlight(text, r.spans);
      }
      ui.preview.classList.remove('is-empty');
      ui.reasons.innerHTML = r.reasons.length
        ? r.reasons.map(x => `<li class="${x.category === 'pii' ? 'pii' : ''}"><span>${esc(x.label)}<small>${x.matches.map(esc).join(' · ')}</small></span></li>`).join('')
        : '<li class="ok"><span>Ережелер қауіп белгісін таппады</span></li>';
      setVerdict(r.verdict, r.score);
    }

    function renderAI(state, d) {
      ui.ai.hidden = false;
      ui.ai.classList.toggle('is-loading', state === 'loading');
      if (state === 'loading') {
        ui.ai.innerHTML = '<div class="ai__head"><span>Gemini талдауы</span><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></div><p class="advice">Мағынасын оқып жатыр…</p>';
        return;
      }
      if (state === 'off') {
        ui.ai.innerHTML = `<div class="ai__head"><span>Gemini талдауы</span><b>қолжетімсіз</b></div><p class="advice">${esc(d || 'AI уақытша жауап бермеді. Үкім ережелер бойынша шығарылды.')}</p>`;
        ui.source.textContent = 'ережелер';
        return;
      }
      const a = d.ai;
      const cats = (a.categories || []).map(c => CAT_KK[c] || c);
      let task = '';
      if (a.task && mode === 'task') {
        task = `<dl class="ai__task">
          <div><dt>Деңгей</dt><dd>${['', 'Starter', 'Expert', 'Elite'][a.task.level] || a.task.level}</dd></div>
          <div><dt>Бюджет</dt><dd>${fmt(a.task.budgetMin).replace(' ₸', '')}-${fmt(a.task.budgetMax)}</dd></div>
          <div><dt>Мерзім</dt><dd>${a.task.days} күн</dd></div></dl>
          ${a.task.skills.length ? `<p class="ai__skills">Дағдылар: ${a.task.skills.map(esc).join(', ')}</p>` : ''}`;
      }
      ui.ai.innerHTML = `<div class="ai__head"><span>Gemini талдауы${cats.length ? ' · ' + esc(cats.join(', ')) : ''}</span><b>${d.ms} мс</b></div>
        <p>${esc(a.explanation)}</p>${a.advice ? `<p class="advice">${esc(a.advice)}</p>` : ''}${task}`;
      ui.source.textContent = 'ережелер + Gemini';
    }

    async function askAI(text, id) {
      if (ctrl) ctrl.abort();
      ctrl = new AbortController();
      renderAI('loading');
      try {
        const res = await fetch('/api/guard', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, mode }), signal: ctrl.signal
        });
        if (id !== reqId) return;
        if (res.status === 429) return renderAI('off', 'Тым жиі сұрадыңыз. Бірнеше секундтан соң қайталаңыз.');
        if (!res.ok) return renderAI('off');
        const d = await res.json();
        if (id !== reqId) return;
        if (!d.ai) return renderAI('off', d.aiError);
        setVerdict(d.verdict, d.score);
        renderAI('done', d);
      } catch (e) {
        if (e.name !== 'AbortError' && id === reqId) renderAI('off', 'Сервер қолжетімсіз (жергілікті режим). Үкім ережелер бойынша.');
      }
    }

    function onInput(now) {
      const text = input.value.trim();
      ui.count.textContent = input.value.length + ' / 1500';
      const id = ++reqId;
      clearTimeout(timer);
      if (!text) {
        if (ctrl) ctrl.abort();
        ui.preview.className = 'guard__preview is-empty';
        ui.preview.textContent = 'Сол жаққа мәтін жаз немесе мысалды таңда.';
        ui.reasons.innerHTML = ''; ui.ai.hidden = true; ui.meter.style.width = '0%'; ui.score.textContent = '0%';
        ui.stamp.classList.remove('is-on'); ui.stamp.style.opacity = 0; lastVerdict = null; ui.source.textContent = 'ережелер';
        return;
      }
      renderRules(text, S.analyze(text));
      timer = setTimeout(() => askAI(text, id), now === true ? 0 : 700);
    }

    input.addEventListener('input', onInput);
    tabs($$('[data-guard-mode]'), b => { mode = b.dataset.guardMode; renderExamples(); lastVerdict = null; onInput(true); });
    renderExamples();
  }

  // ── ESCROW ─────────────────────────────────────────────
  function initCalc() {
    const E = window.EscrowCore, amount = $('#calc-amount'), savings = $('#calc-savings');
    let junior = true;
    $('#limit-label').textContent = fmt(E.monthlyLimit);
    const update = () => {
      const tx = E.calculateTransaction(+amount.value);
      const share = junior ? +savings.value / 100 : 0;
      const save = tx.netPayout * share, card = tx.netPayout - save;
      $('#calc-amount-out').textContent = fmt(tx.gross);
      $('#calc-savings-out').textContent = Math.round(share * 100) + '%';
      $('#out-net').textContent = fmt(card); $('#out-save').textContent = fmt(save);
      $('#out-tax').textContent = fmt(tx.tax); $('#out-fee').textContent = fmt(tx.commission);
      const w = v => (v / tx.gross * 100).toFixed(2) + '%';
      $('#bar-net').style.width = w(card); $('#bar-save').style.width = w(save);
      $('#bar-tax').style.width = w(tx.tax); $('#bar-fee').style.width = w(tx.commission);
      $('#savings-row').hidden = !junior;
      $('#calc-note').textContent = junior
        ? 'Төлем баланың өз картасына түседі. Ата-ана хабарлама алып, төлемді көреді.'
        : 'Айлық табыс лимитке жақындағанда платформа алдын ала ескертеді.';
    };
    amount.addEventListener('input', update); savings.addEventListener('input', update);
    tabs($$('[data-calc-mode]'), b => { junior = b.dataset.calcMode === 'junior'; update(); });
    update();
  }

  // ── ТІРКЕЛУ ────────────────────────────────────────────
  function setErr(input, msg) {
    const box = input.closest('.field, .guardian');
    const err = box && $('.field__err', box);
    if (err) err.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  function check(rules) {
    let first = null;
    rules.forEach(([el, fn]) => { if (!setErr(el, fn(el)) && !first) first = el; });
    if (first) first.focus();
    return !first;
  }

  function initJoin() {
    const V = window.Validators;
    const youth = $('#youth-form'), biz = $('#business-form'), age = $('#y-age');
    const guardian = $('#guardian-block'), parent = $('#y-parent');
    $('#form-no').textContent = String(1000 + Math.floor(Math.random() * 9000));

    tabs($$('[data-join]'), b => { const y = b.dataset.join === 'youth'; youth.hidden = !y; biz.hidden = y; });
    const minor = () => { const n = +age.value; return n >= 14 && n <= 17; };
    age.addEventListener('input', () => { guardian.hidden = !minor(); });

    [parent, $('#b-phone')].forEach(el => el.addEventListener('input', e => {
      if (e.inputType && e.inputType.startsWith('delete')) return;
      if (el.value.replace(/\D/g, '')) el.value = V.formatPhone(el.value);
    }));
    $('#b-bin').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 12); });

    const R = new Map([
      [$('#y-name'), el => V.name(el.value)], [age, el => V.age(el.value)],
      [$('#y-email'), el => V.email(el.value)], [$('#y-pass'), el => V.password(el.value)],
      [parent, el => minor() ? V.phone(el.value) : ''],
      [$('#y-terms'), el => el.checked ? '' : 'Ережелермен келісу қажет'],
      [$('#b-company'), el => el.value.trim().length >= 2 ? '' : 'Компания атауын жазыңыз'],
      [$('#b-bin'), el => V.bin(el.value)], [$('#b-phone'), el => V.phone(el.value)],
      [$('#b-email'), el => V.email(el.value)], [$('#b-pass'), el => V.password(el.value)]
    ]);
    R.forEach((fn, el) => el.addEventListener('blur', () => { if (el.value && el.type !== 'checkbox') setErr(el, fn(el)); }));
    const all = [...R];

    const serverErrors = (form, errors) => {
      const ids = { name: 'y-name', age: 'y-age', email: form === youth ? 'y-email' : 'b-email', password: form === youth ? 'y-pass' : 'b-pass', parentPhone: 'y-parent', terms: 'y-terms', company: 'b-company', bin: 'b-bin', phone: 'b-phone' };
      let first = null;
      Object.entries(errors || {}).forEach(([k, msg]) => { const el = document.getElementById(ids[k]); if (el) { setErr(el, msg); first = first || el; } });
      if (first) first.focus(); else toast('Тексеру сәтсіз аяқталды', 'err');
    };

    youth.addEventListener('submit', async e => {
      e.preventDefault();
      if (!check(all.slice(0, 6))) return;
      const btn = $('button[type=submit]', youth);
      const payload = {
        type: 'youth', name: $('#y-name').value.trim(), age: +age.value,
        email: $('#y-email').value.trim(), password: $('#y-pass').value, terms: true
      };
      btn.disabled = true;
      try {
        if (minor()) {
          const consent = await guardianConsent(parent.value);
          if (!consent) return;
          payload.consent = consent;
        }
        await register(youth, payload);
      } finally { btn.disabled = false; }
    });

    biz.addEventListener('submit', async e => {
      e.preventDefault();
      if (!check(all.slice(6))) return;
      const btn = $('button[type=submit]', biz);
      btn.disabled = true;
      try {
        await register(biz, {
          type: 'business', company: $('#b-company').value.trim(), bin: $('#b-bin').value,
          phone: $('#b-phone').value, email: $('#b-email').value.trim(), password: $('#b-pass').value
        });
      } finally { btn.disabled = false; }
    });

    async function register(form, payload) {
      let profile;
      try {
        const { status, data } = await api('register', payload);
        if (status === 422) return serverErrors(form, data.errors);
        if (status !== 200 || !data.ok) return toast(data.error || 'Сервер қатесі', 'err');
        profile = data.profile;
        store.set('senim_session', data.session);
      } catch (err) {
        // Жергілікті режим (python http.server / офлайн): клиенттегі тексеріс жеткілікті
        profile = { name: payload.name || payload.company, age: payload.age, role: payload.type === 'business' ? 'business' : (payload.age <= 17 ? 'junior' : 'pro') };
      }
      store.set('senim_user_name', profile.name);
      store.set('senim_user_role', profile.role);
      if (profile.age) store.set('senim_user_age', String(profile.age));
      const doc = $('#join-doc');
      doc.classList.add('is-sealed');
      press($('#join-stamp'));
      toast('Тіркелу парағы мөрленді. Кабинетке өтудеміз…');
      setTimeout(() => { location.href = 'dashboard.html'; }, motionOn() ? 1400 : 600);
    }
  }

  // Ата-ана OTP: сервер код жібереді (демо: код жауапта), растау да серверде.
  async function guardianConsent(phone) {
    let token = null, localCode = null, demoCode;
    try {
      const { status, data } = await api('otp', { action: 'send', phone });
      if (status !== 200) { toast(data.error || 'Код жіберілмеді', 'err'); return null; }
      token = data.token; demoCode = data.demoCode;
    } catch (_) {
      localCode = String(100000 + crypto.getRandomValues(new Uint32Array(1))[0] % 900000);
      demoCode = localCode;
    }

    const dlg = $('#otp-dialog'), boxes = $$('#otp-boxes input');
    $('#otp-phone').textContent = phone;
    $('#otp-demo').textContent = demoCode || '';
    $('#otp-demo-row').hidden = !demoCode;
    $('#otp-error').textContent = '';
    boxes.forEach(b => { b.value = ''; });
    boxes.forEach((b, i) => {
      b.oninput = () => { b.value = b.value.replace(/\D/g, '').slice(-1); if (b.value && boxes[i + 1]) boxes[i + 1].focus(); };
      b.onkeydown = ev => { if (ev.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); };
      b.onpaste = ev => {
        const d = (ev.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (d) { ev.preventDefault(); d.split('').forEach((c, j) => { if (boxes[j]) boxes[j].value = c; }); boxes[Math.min(d.length, 5)].focus(); }
      };
    });

    return new Promise(resolve => {
      let done = false;
      $('#otp-confirm').onclick = async ev => {
        ev.preventDefault();
        const code = boxes.map(b => b.value).join('');
        if (code.length !== 6) { $('#otp-error').textContent = '6 цифрды толық енгізіңіз'; return; }
        if (localCode) {
          if (code === localCode) { done = true; dlg.close(); toast('Ата-ана келісімі расталды'); resolve('local'); }
          else $('#otp-error').textContent = 'Код дұрыс емес';
          return;
        }
        try {
          const { data } = await api('otp', { action: 'verify', token, code });
          if (data.ok) { done = true; dlg.close(); toast('Ата-ана келісімі расталды'); resolve(data.consent); }
          else { $('#otp-error').textContent = data.error || 'Код дұрыс емес'; boxes.forEach(b => { b.value = ''; }); boxes[0].focus(); }
        } catch (_) { $('#otp-error').textContent = 'Сервер жауап бермеді'; }
      };
      dlg.onclose = () => { if (!done) resolve(null); };
      dlg.showModal();
      setTimeout(() => boxes[0].focus(), 40);
    });
  }

  function initSW() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http') && location.hostname !== 'localhost') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initMotion();
    initGuard();
    initCalc();
    initJoin();
    initSW();
  });
})();
