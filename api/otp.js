// POST /api/otp — ата-ана келісімінің растау коды.
//   { action: "send", phone }          → { token, expiresIn, demoCode? }
//   { action: "verify", token, code }  → { ok, consent? }
// Сервер күй сақтамайды: код HMAC-пен токенге «бекітіледі», кодтың өзі токенде жоқ.
// SMS шлюзі қосылмағанша (SMS_PROVIDER жоқ) код демо ретінде жауапта қайтарылады.
'use strict';

const crypto = require('crypto');
const V = require('../js/validators.js');
const { send, onlyPost, body, rateLimit, sign, verify, hashCode } = require('./_lib');

const TTL = 5 * 60 * 1000;
const normalize = p => '+7' + String(p).replace(/\D/g, '').replace(/^[78]/, '').slice(0, 10);

module.exports = async (req, res) => {
    if (!onlyPost(req, res)) return;
    const b = body(req);

    if (b.action === 'send') {
        if (!rateLimit(req, res, 'otp-send', 5, 10 * 60_000)) return;
        const err = V.phone(b.phone);
        if (err) return send(res, 400, { error: err, field: 'phone' });
        const phone = normalize(b.phone);
        const code = String(crypto.randomInt(100000, 1000000));
        const exp = Date.now() + TTL;
        const token = sign({ t: 'otp', phone, h: hashCode(phone, code), exp });
        const demo = !process.env.SMS_PROVIDER;
        // TODO: SMS_PROVIDER қосылғанда кодты SMS арқылы жіберу (Mobizon, SMSC.kz)
        return send(res, 200, { token, expiresIn: TTL / 1000, demo, demoCode: demo ? code : undefined });
    }

    if (b.action === 'verify') {
        if (!rateLimit(req, res, 'otp-verify', 15, 10 * 60_000)) return;
        const p = verify(b.token);
        if (!p || p.t !== 'otp') return send(res, 400, { ok: false, error: 'Код ескірген. Жаңа код сұраңыз.' });
        const code = String(b.code || '').replace(/\D/g, '');
        const a = Buffer.from(hashCode(p.phone, code)), e = Buffer.from(p.h);
        if (code.length !== 6 || a.length !== e.length || !crypto.timingSafeEqual(a, e)) {
            return send(res, 200, { ok: false, error: 'Код дұрыс емес' });
        }
        // Келісім токені — тіркелуде ата-ана растағанын дәлелдейді.
        const consent = sign({ t: 'consent', phone: p.phone, at: Date.now(), exp: Date.now() + 30 * 60_000 });
        return send(res, 200, { ok: true, consent });
    }

    send(res, 400, { error: 'action: send немесе verify' });
};
