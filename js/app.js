// SENIM — басты беттің логикасы:
//  • мобиль мәзір және nav фоны
//  • «Сенім сүзгісі» тірі демосы (js/security.js)
//  • escrow калькуляторы (js/escrow.js)
//  • валидациясы бар тіркелу + ата-ананың OTP растауы → dashboard.html

(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₸';

    const store = {
        set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* жеке режим */ } },
        get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    };

    function toast(msg, kind = 'ok') {
        const t = $('#toast');
        t.textContent = msg;
        t.dataset.kind = kind;
        t.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => t.classList.remove('show'), 3200);
    }

    // Сегментті батырмалар (tablist) — ортақ көмекші.
    function segmented(buttons, onChange) {
        buttons.forEach(b => b.addEventListener('click', () => {
            buttons.forEach(x => x.setAttribute('aria-selected', String(x === b)));
            onChange(b);
        }));
    }

    // ── NAV ────────────────────────────────────────────────
    function initNav() {
        const nav = $('#top-nav');
        const onScroll = () => nav.classList.toggle('nav-solid', window.scrollY > 24);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        const btn = $('#menu-btn'), menu = $('#mobile-menu');
        btn.addEventListener('click', () => {
            const open = menu.classList.toggle('hidden') === false;
            btn.setAttribute('aria-expanded', String(open));
        });
        $$('a', menu).forEach(a => a.addEventListener('click', () => {
            menu.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
        }));
    }

    // ── REVEAL ON SCROLL ───────────────────────────────────
    function initReveal() {
        const els = $$('.reveal');
        if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
            els.forEach(e => e.classList.add('in'));
            return;
        }
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
        }, { rootMargin: '0px 0px -8% 0px' });
        els.forEach(e => io.observe(e));
    }

    // ── LIVE GUARD ─────────────────────────────────────────
    const EXAMPLES = {
        task: [
            { label: '✅ Қалыпты тапсырма', text: 'Кофеханаға арналған Instagram посттарының дизайны, аптасына 5 пост, Figma файлымен тапсыру.' },
            { label: '📦 Оффлайн «жұмыс»', text: 'Қоймаға келіп жәшіктерді тасу керек, түнгі ауысым, мекенжайды жеке жазамын.' },
            { label: '💳 Дроппер', text: 'Оңай табыс! Картаңды бер, ақшаны қабылдап ал да аудар, 10% сенікі.' },
            { label: '🎰 Жасқа сай емес', text: 'Казино сайтына жарнама мәтіндерін жазу керек, ставка бонустары туралы.' }
        ],
        chat: [
            { label: '✅ Қалыпты чат', text: 'Сәлеметсіз бе! Макеттің екінші нұсқасын жүктедім, түсін өзгерту керек пе?' },
            { label: '📱 WhatsApp-қа шақыру', text: 'Мұнда ыңғайсыз, w h a t s a p p-қа жаз: +7 707 123 45 67' },
            { label: '💸 Тікелей төлем', text: 'Комиссиясыз болсын, Kaspi-ге тікелей аударайын, карта нөмірін жібер.' },
            { label: '🚩 Шекараны бұзу', text: 'Ата-анаңа айтпа, бұл біздің құпия жоба. Суретіңді жібер.' }
        ]
    };

    function initGuard() {
        const input = $('#guard-input');
        const examples = $('#guard-examples');
        let mode = 'task';

        const renderExamples = () => {
            examples.innerHTML = '';
            EXAMPLES[mode].forEach(ex => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'chip';
                b.textContent = ex.label;
                b.addEventListener('click', () => { input.value = ex.text; run(); input.focus(); });
                examples.appendChild(b);
            });
        };

        const VERDICT = {
            SAFE: ['Қауіпсіз', 'verdict-safe'],
            REVIEW: ['Модераторға', 'verdict-review'],
            BLOCK: ['Бұғатталды', 'verdict-block']
        };

        const run = () => {
            const text = input.value.trim();
            const verdictEl = $('#guard-verdict'), preview = $('#guard-preview'), list = $('#guard-reasons');
            if (!text) {
                verdictEl.className = 'verdict verdict-idle'; verdictEl.textContent = 'Күтуде';
                $('#guard-score').textContent = '0%'; $('#guard-meter').style.width = '0%';
                preview.classList.add('text-slate-500');
                preview.textContent = 'Мәтін жазыңыз немесе мысалды таңдаңыз.';
                list.innerHTML = '';
                return;
            }
            const S = window.AISecurity;
            const r = S.analyze(text);
            const [label, cls] = VERDICT[r.verdict];
            verdictEl.className = 'verdict ' + cls;
            verdictEl.textContent = label;
            const pct = Math.round(r.score * 100);
            $('#guard-score').textContent = pct + '%';
            const meter = $('#guard-meter');
            meter.style.width = Math.max(pct, 3) + '%';
            meter.dataset.level = r.verdict;

            preview.classList.remove('text-slate-500');
            if (mode === 'chat') {
                const s = S.sanitizeChatMessage(text);
                preview.innerHTML =
                    `<p class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">Алушы көретін нұсқа</p>` +
                    `<p class="text-slate-200">${S.escapeHtml(s.sanitized)}</p>` +
                    (r.verdict === 'BLOCK' ? `<p class="mt-3 text-xs text-rose-300">Хабарлама жеткізілмейді. Екі тарапқа ескерту жіберіледі, ал 14–17 жаста ата-анаға да хабарланады.</p>` : '');
            } else {
                preview.innerHTML = `<p class="text-slate-200">${S.highlight(text, r.spans)}</p>`;
            }

            list.innerHTML = r.reasons.length
                ? r.reasons.map(x => `<li class="reason"><span class="reason-dot guard-${x.category}"></span><div><b>${S.escapeHtml(x.label)}</b><span class="block text-xs text-slate-500 font-mono">${x.matches.map(S.escapeHtml).join(' · ')}</span></div></li>`).join('')
                : `<li class="reason"><span class="reason-dot bg-emerald-400"></span><div><b>Қауіп белгісі табылмады</b><span class="block text-xs text-slate-500">Тапсырма жарияланады</span></div></li>`;
        };

        let t;
        input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 120); });
        segmented($$('[data-guard-mode]'), b => { mode = b.dataset.guardMode; renderExamples(); run(); });
        renderExamples();
    }

    // ── ESCROW CALCULATOR ──────────────────────────────────
    function initCalculator() {
        const E = window.EscrowCore;
        const amount = $('#calc-amount'), savings = $('#calc-savings');
        let junior = true;
        $('#limit-label').textContent = fmt(E.monthlyLimit);

        const update = () => {
            const tx = E.calculateTransaction(+amount.value);
            const share = junior ? +savings.value / 100 : 0;
            const save = tx.netPayout * share, card = tx.netPayout - save;
            $('#calc-amount-out').textContent = fmt(tx.gross);
            $('#calc-savings-out').textContent = Math.round(share * 100) + '%';
            $('#out-net').textContent = fmt(card);
            $('#out-save').textContent = fmt(save);
            $('#out-tax').textContent = fmt(tx.tax);
            $('#out-fee').textContent = fmt(tx.commission);
            const w = v => (v / tx.gross * 100).toFixed(2) + '%';
            $('#bar-net').style.width = w(card);
            $('#bar-save').style.width = w(save);
            $('#bar-tax').style.width = w(tx.tax);
            $('#bar-fee').style.width = w(tx.commission);
            $('#savings-row').classList.toggle('hidden', !junior);
            $('#calc-note').textContent = junior
                ? 'Төлем жас маманның өз картасына түседі. Ата-ана хабарлама алып, төлемді көреді.'
                : 'Айлық табыс лимитке жақындағанда платформа алдын ала ескертеді.';
        };

        amount.addEventListener('input', update);
        savings.addEventListener('input', update);
        segmented($$('[data-calc-mode]'), b => { junior = b.dataset.calcMode === 'junior'; update(); });
        update();
    }

    // ── REGISTRATION ───────────────────────────────────────
    function setError(input, msg) {
        const field = input.closest('.field');
        const err = field && field.querySelector('.field-error');
        if (err) err.textContent = msg || '';
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        return !msg;
    }

    function validateForm(rules) {
        let firstBad = null;
        for (const [input, fn] of rules) {
            const ok = setError(input, fn(input));
            if (!ok && !firstBad) firstBad = input;
        }
        if (firstBad) firstBad.focus();
        return !firstBad;
    }

    function initJoin() {
        const V = window.Validators;
        const youth = $('#youth-form'), biz = $('#business-form');
        const age = $('#y-age'), guardian = $('#guardian-block'), parent = $('#y-parent');

        segmented($$('[data-join]'), b => {
            const isYouth = b.dataset.join === 'youth';
            youth.classList.toggle('hidden', !isYouth);
            biz.classList.toggle('hidden', isYouth);
        });

        const isMinor = () => { const n = +age.value; return n >= 14 && n <= 17; };
        age.addEventListener('input', () => guardian.classList.toggle('hidden', !isMinor()));

        [parent, $('#b-phone')].forEach(el => el.addEventListener('input', e => {
            if (e.inputType && e.inputType.startsWith('delete')) return; // өшіргенде кедергі жасамау
            if (el.value.replace(/\D/g, '')) el.value = V.formatPhone(el.value);
        }));
        $('#b-bin').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 12); });

        // Өрістен шыққанда тексеру
        const liveRules = new Map([
            [$('#y-name'), el => V.name(el.value)], [age, el => V.age(el.value)],
            [$('#y-email'), el => V.email(el.value)], [$('#y-pass'), el => V.password(el.value)],
            [parent, el => isMinor() ? V.phone(el.value) : ''],
            [$('#b-company'), el => el.value.trim().length >= 2 ? '' : 'Компания атауын жазыңыз'],
            [$('#b-bin'), el => V.bin(el.value)], [$('#b-phone'), el => V.phone(el.value)],
            [$('#b-email'), el => V.email(el.value)], [$('#b-pass'), el => V.password(el.value)]
        ]);
        liveRules.forEach((fn, el) => el.addEventListener('blur', () => { if (el.value) setError(el, fn(el)); }));

        youth.addEventListener('submit', e => {
            e.preventDefault();
            const rules = [...liveRules].slice(0, 5);
            const terms = $('#y-terms');
            rules.push([terms, el => el.checked ? '' : 'Ережелермен келісу қажет']);
            if (!validateForm(rules)) return;

            const profile = {
                name: $('#y-name').value.trim(),
                age: +age.value,
                role: isMinor() ? 'junior' : 'pro'
            };
            if (isMinor()) {
                requestGuardianOtp(parent.value).then(ok => ok && finish(profile));
            } else {
                finish(profile);
            }
        });

        biz.addEventListener('submit', e => {
            e.preventDefault();
            if (!validateForm([...liveRules].slice(5))) return;
            finish({ name: $('#b-company').value.trim(), role: 'business' });
        });
    }

    // Ата-ана OTP — демо: SMS шлюзінің орнына код диалогта көрсетіледі.
    function requestGuardianOtp(phone) {
        return new Promise(resolve => {
            const dlg = $('#otp-dialog');
            const boxes = $$('#otp-boxes input');
            const code = String(Math.floor(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000)));
            let attempts = 0;
            $('#otp-phone').textContent = phone;
            $('#otp-demo').textContent = code;
            $('#otp-error').textContent = '';
            boxes.forEach(b => { b.value = ''; });

            boxes.forEach((b, i) => {
                b.oninput = () => {
                    b.value = b.value.replace(/\D/g, '').slice(-1);
                    if (b.value && boxes[i + 1]) boxes[i + 1].focus();
                };
                b.onkeydown = ev => { if (ev.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); };
                b.onpaste = ev => {
                    const d = (ev.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
                    if (d.length) { ev.preventDefault(); d.split('').forEach((c, j) => { if (boxes[j]) boxes[j].value = c; }); boxes[Math.min(d.length, 5)].focus(); }
                };
            });

            $('#otp-confirm').onclick = ev => {
                ev.preventDefault();
                const entered = boxes.map(b => b.value).join('');
                if (entered === code) { dlg.close('ok'); return; }
                attempts++;
                $('#otp-error').textContent = attempts >= 3 ? 'Тым көп әрекет. Жаңа код жіберілді.' : 'Код дұрыс емес';
                if (attempts >= 3) { dlg.close('cancel'); setTimeout(() => requestGuardianOtp(phone).then(resolve), 300); return; }
                boxes.forEach(b => { b.value = ''; }); boxes[0].focus();
            };

            dlg.onclose = () => {
                if (dlg.returnValue === 'ok') { toast('Ата-ана келісімі расталды ✓'); resolve(true); }
                else if (attempts < 3) resolve(false);
            };
            dlg.showModal();
            setTimeout(() => boxes[0].focus(), 50);
        });
    }

    function finish(profile) {
        store.set('senim_user_name', profile.name);
        store.set('senim_user_role', profile.role);
        if (profile.age) store.set('senim_user_age', String(profile.age));

        const overlay = document.createElement('div');
        overlay.className = 'boot-overlay';
        overlay.innerHTML = '<div class="boot-box"><p class="eyebrow">SENIM</p><div id="boot-log" class="boot-log"></div></div>';
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('show'));

        const steps = [
            'Профиль жасалды',
            profile.role === 'junior' ? 'Ата-ана келісімі тіркелді' : profile.role === 'business' ? 'БСН тексерілді' : 'Жас тексерілді: Pro режим',
            'Escrow әмиян ашылды',
            'Кабинетке өту…'
        ];
        const log = $('#boot-log', overlay);
        steps.forEach((s, i) => setTimeout(() => {
            const p = document.createElement('p');
            p.textContent = '✓ ' + s;
            log.appendChild(p);
        }, 350 * (i + 1)));
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 350 * steps.length + 600);
    }

    // ── SERVICE WORKER ─────────────────────────────────────
    function initSW() {
        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initNav();
        initReveal();
        initGuard();
        initCalculator();
        initJoin();
        initSW();
    });
})();
