// SENIM Guard — қауіпсіздік қозғалтқышы (браузерде, сервер қажет емес)
// Тапсырма мәтіні мен чат хабарламаларын санат бойынша талдап, қауіп ұпайын береді.
// Қазақша, орысша және латын әрпімен жазылған айла-амалдарды таниды.

(function () {
    'use strict';

    // Әр санаттың салмағы — бір сәйкестік қауіпті қаншалықты арттыратыны.
    const CATEGORIES = {
        offline: {
            label: 'Оффлайн / физикалық қауіп',
            weight: 0.55,
            patterns: [
                /оффлайн/i, /кездес(у|ейік|еміз)/i, /жолығ(у|айық)/i, /үйге кел/i, /келіп ал/i,
                /қойма/i, /жәшік/i, /жүк тасу/i, /тасу керек/i, /курьер/i, /закладк/i,
                /склад/i, /встрет(иться|имся)/i, /приезжай/i, /приходи/i, /(?<![а-яёәіңғүұқөһ])адрес(ке|ім|ің|ы)?(?![а-яёәіңғүұқөһ])/i,
                /мекенжай/i, /машинаға отыр/i, /түнгі/i, /ночн(ая|ую) смен/i
            ]
        },
        offplatform: {
            label: 'Платформадан тыс байланыс',
            weight: 0.45,
            patterns: [
                /whats\s?app/i, /ватсап/i, /вотсап/i, /telegram(?![-\s]?(бот|bot|канал|mini))/i, /телеграм(?![-\s]?(бот|канал))/i, /\btg\b/i,
                /директке? жаз/i, /в директ/i, /в личк/i, /жеке(ге)? жаз/i, /тікелей жаз/i,
                /номер(іңді|ін) бер/i, /номер(ің)? жібер/i, /дай номер/i, /скинь номер/i
            ]
        },
        payment: {
            label: 'Тікелей төлем / алаяқтық',
            weight: 0.6,
            patterns: [
                /kaspi/i, /каспи/i, /карта нөмір/i, /номер карт/i, /тікелей аудар/i,
                /напрямую переве/i, /переведу на карт/i, /алдын ала төле/i, /предоплат/i,
                /\bcvv\b/i, /смс[-\s]?код/i, /код из смс/i, /sms[-\s]?код/i, /пароль/i,
                /логин(ің|ды)? бер/i, /комиссиясыз/i, /без комисси/i
            ]
        },
        mule: {
            label: 'Дроппер схемасы (ақша жылыстату)',
            weight: 0.85,
            patterns: [
                /картаңды бер/i, /карта(ңды|ны)? аш(ып бер|ып беріңіз)/i, /оформи(ть)? карт/i,
                /(?<![а-яёәіңғүұқөһ])дроп(пер|ы|ом|ка)?(?![а-яёәіңғүұқөһш])/i, /обнал/i, /ақшаны қабылдап/i, /қабылдап ал да аудар/i,
                /получи(шь)? деньги и переведи/i, /прими перевод/i, /картаңа ақша түседі/i
            ]
        },
        grooming: {
            label: 'Жеке шекараны бұзу',
            weight: 0.9,
            patterns: [
                /ата-анаңа айтпа/i, /ешкімге айтпа/i, /никому не говори/i, /родителям не говори/i,
                /құпия бол(сын|ады)/i, /суретің(ді)? жібер/i, /фото(ңды|ңызды)? жібер/i,
                /скинь фото/i, /жасың нешеде/i, /сколько тебе лет/i, /үйің қайда/i, /где живешь/i
            ]
        },
        restricted: {
            label: 'Жасқа сай емес сала',
            weight: 0.8,
            patterns: [
                /казино/i, /casino/i, /(?<![а-яёәіңғүұқөһ])ставк[аиу]/i, /\bbet\b/i, /1xbet/i, /букмекер/i,
                /(?<![а-яёәіңғүұқөһ])вейп/i, /\bvape\b/i, /алкоголь/i, /(?<![а-яёәіңғүұқөһ])сыра(?![а-яёәіңғүұқөһ])/i, /темекі/i, /18\+/i, /крипто.?пирамид/i
            ]
        }
    };

    // Жеке деректер — чатта автоматты жасырылады.
    const PII = [
        { key: 'phone', label: 'телефон', token: '[НӨМІР ЖАСЫРЫЛДЫ]',
          re: /(?:\+?7|8)[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}/g },
        { key: 'card', label: 'карта нөмірі', token: '[КАРТА ЖАСЫРЫЛДЫ]',
          re: /\b(?:\d[ \-]?){15,18}\d\b/g, check: luhn },
        { key: 'iban', label: 'IBAN', token: '[ШОТ ЖАСЫРЫЛДЫ]', re: /\bKZ\d{2}[A-Z0-9 ]{14,22}\b/gi },
        { key: 'url', label: 'сілтеме', token: '[СІЛТЕМЕ ЖАСЫРЫЛДЫ]',
          re: /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:kz|ru|com|me|io|link|site|xyz)\b\S*/gi },
        { key: 'email', label: 'email', token: '[EMAIL ЖАСЫРЫЛДЫ]', re: /[\w.+-]+@[\w-]+\.[\w.]+/g },
        { key: 'handle', label: 'ник', token: '[НИК ЖАСЫРЫЛДЫ]', re: /(^|\s)@[a-z0-9_]{4,}/gi }
    ];

    function luhn(raw) {
        const d = raw.replace(/\D/g, '');
        if (d.length < 16 || d.length > 19) return false;
        let sum = 0;
        for (let i = 0; i < d.length; i++) {
            let n = +d[d.length - 1 - i];
            if (i % 2) { n *= 2; if (n > 9) n -= 9; }
            sum += n;
        }
        return sum % 10 === 0;
    }

    // «w h a t s a p p», «к.а.с.п.и» сияқты бүркемелеуді ашу.
    function collapse(text) {
        return text.toLowerCase().replace(/[\s.\-_*|]+/g, '');
    }

    function findPii(text) {
        const hits = [];
        for (const p of PII) {
            p.re.lastIndex = 0;
            let m;
            while ((m = p.re.exec(text))) {
                const value = m[0].trim();
                if (!p.check || p.check(value)) {
                    const start = m.index + (m[0].length - m[0].trimStart().length);
                    hits.push({ type: p.key, label: p.label, start, end: start + value.length, value });
                }
            }
        }
        return hits;
    }

    /**
     * Мәтінді толық талдау.
     * @returns {{score:number, verdict:'SAFE'|'REVIEW'|'BLOCK', reasons:Array, spans:Array, pii:Array}}
     */
    function analyze(text) {
        text = String(text || '');
        const collapsed = collapse(text);
        const reasons = [];
        const spans = [];

        for (const [key, cat] of Object.entries(CATEGORIES)) {
            const found = new Set();
            for (const re of cat.patterns) {
                const g = new RegExp(re.source, 'gi');
                let m, hit = false;
                while ((m = g.exec(text))) {
                    hit = true;
                    found.add(m[0]);
                    spans.push({ start: m.index, end: m.index + m[0].length, category: key });
                    if (!m[0].length) g.lastIndex++;
                }
                // Бүркемеленген нұсқасын да тексеру (тек бос орынсыз үлгілер үшін)
                if (!hit) {
                    const src = re.source.replace(/\\b/g, '').replace(/\\s[?*+]?| \??/g, '');
                    const m2 = collapsed.match(new RegExp(src, 'i'));
                    if (m2) found.add(m2[0] + ' (бүркемеленген)');
                }
            }
            if (found.size) {
                reasons.push({ category: key, label: cat.label, weight: cat.weight, matches: [...found] });
            }
        }

        const pii = findPii(text);
        pii.forEach(p => spans.push({ start: p.start, end: p.end, category: 'pii' }));
        if (pii.length) {
            reasons.push({
                category: 'pii', label: 'Жеке дерек бөлісу', weight: 0.35,
                matches: [...new Set(pii.map(p => p.label))]
            });
        }

        // Тәуелсіз оқиғалар ықтималдығы: 1 − Π(1 − w). Қайталанған сәйкестік қауіпті сәл арттырады.
        let safe = 1;
        for (const r of reasons) {
            const w = Math.min(0.97, r.weight + 0.05 * (r.matches.length - 1));
            safe *= (1 - w);
        }
        const score = Math.round((1 - safe) * 100) / 100;
        const verdict = score >= 0.6 ? 'BLOCK' : score >= 0.3 ? 'REVIEW' : 'SAFE';

        spans.sort((a, b) => a.start - b.start);
        return { score, verdict, reasons, spans, pii };
    }

    // Ескі API — үйлесімділік үшін сақталған.
    function evaluateTaskDescription(text) {
        const r = analyze(text);
        return {
            status: r.verdict === 'SAFE' ? 'APPROVED' : r.verdict === 'REVIEW' ? 'REVIEW' : 'BLOCKED',
            reason: r.reasons.length ? r.reasons.map(x => x.label).join(', ')
                : 'Тапсырма қауіпсіздік талаптарына сәйкес келеді.',
            score: r.score,
            details: r
        };
    }

    function sanitizeChatMessage(message) {
        let sanitized = String(message || '');
        const hits = findPii(sanitized).sort((a, b) => b.start - a.start);
        for (const h of hits) {
            const token = PII.find(p => p.key === h.type).token;
            sanitized = sanitized.slice(0, h.start) + token + sanitized.slice(h.end);
        }
        const r = analyze(message);
        return {
            original: message,
            sanitized,
            flagged: r.verdict !== 'SAFE' || hits.length > 0,
            verdict: r.verdict,
            score: r.score,
            reasons: r.reasons
        };
    }

    // Мәтінді HTML-ге қауіпсіз айналдырып, табылған жерлерін <mark>-пен белгілеу.
    function escapeHtml(s) {
        return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function highlight(text, spans) {
        let out = '', pos = 0;
        for (const s of spans) {
            if (s.start < pos) continue;
            out += escapeHtml(text.slice(pos, s.start));
            out += `<mark class="guard-mark guard-${s.category}">${escapeHtml(text.slice(s.start, s.end))}</mark>`;
            pos = s.end;
        }
        return out + escapeHtml(text.slice(pos));
    }

    const api = {
        analyze, evaluateTaskDescription, sanitizeChatMessage, highlight, escapeHtml,
        categories: CATEGORIES
    };
    const root = typeof window !== 'undefined' ? window : globalThis;
    root.AISecurity = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
