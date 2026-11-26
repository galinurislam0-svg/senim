// POST /api/register — тіркелу деректерін серверде қайта тексеру.
// Клиенттегі тексеріс айналып өтілсе де, мұнда сол ережелер қайта қолданылады.
// 14–17 жаста /api/otp берген ата-ана келісімі токені міндетті.
// Дерекқор әлі қосылмаған: жауапта қол қойылған сессия токені қайтарылады.
'use strict';

const V = require('../js/validators.js');
const { send, onlyPost, body, rateLimit, sign, verify } = require('./_lib');

function youth(b) {
    const errors = {};
    const put = (k, msg) => { if (msg) errors[k] = msg; };
    put('name', V.name(b.name));
    put('age', V.age(b.age));
    put('email', V.email(b.email));
    put('password', V.password(b.password));
    if (!b.terms) errors.terms = 'Ережелермен келісу қажет';
    const age = Number(b.age);
    const minor = age >= 14 && age <= 17;
    if (minor) {
        const c = verify(b.consent);
        if (!c || c.t !== 'consent') errors.parentPhone = 'Ата-ана келісімі расталмаған';
    }
    return { errors, profile: { name: String(b.name || '').trim().slice(0, 80), age, role: minor ? 'junior' : 'pro' } };
}

function business(b) {
    const errors = {};
    const put = (k, msg) => { if (msg) errors[k] = msg; };
    put('company', String(b.company || '').trim().length >= 2 ? '' : 'Компания атауын жазыңыз');
    put('bin', V.bin(b.bin));
    put('phone', V.phone(b.phone));
    put('email', V.email(b.email));
    put('password', V.password(b.password));
    return { errors, profile: { name: String(b.company || '').trim().slice(0, 120), role: 'business' } };
}

module.exports = async (req, res) => {
    if (!onlyPost(req, res)) return;
    if (!rateLimit(req, res, 'register', 10, 10 * 60_000)) return;

    const b = body(req);
    const { errors, profile } = b.type === 'business' ? business(b) : youth(b);
    if (Object.keys(errors).length) return send(res, 422, { ok: false, errors });

    const session = sign({ t: 'session', ...profile, exp: Date.now() + 7 * 24 * 3600_000 });
    send(res, 200, { ok: true, profile, session });
};
