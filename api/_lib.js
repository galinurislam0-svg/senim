// SENIM API — ортақ көмекшілер (Vercel "_" бар файлдарды маршрут етпейді).
'use strict';

const crypto = require('crypto');

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';

/** Бірінші модель жауап бермесе, келесісіне ауысамыз. */
function models() {
    const env = process.env.GEMINI_MODELS;
    if (env) return env.split(',').map(s => s.trim()).filter(Boolean);
    // 503 («сұраныс көп») жиі болады, сондықтан тізбек ұзын: бірі бос болмаса, келесісі.
    return ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
}

function hasAI() {
    return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Gemini Interactions API. Мәтінді қайтарады.
 * @param {object} body  system_instruction, input, response_format, ...
 * @param {number} timeoutMs  бүкіл тізбекке ортақ уақыт шегі
 */
async function gemini(body, timeoutMs = 9000) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY жоқ');
    const deadline = Date.now() + timeoutMs;
    const errors = [];

    // 503 өтпелі: уақыт қалса, қысқа үзілістен соң тізбекті тағы бір рет айналамыз.
    const chain = models();
    const attempts = [...chain, null, ...chain];
    for (const model of attempts) {
        if (model === null) {
            if (!errors.every(e => / 50[03]$/.test(e))) break;
            await new Promise(r => setTimeout(r, 900));
            continue;
        }
        const left = deadline - Date.now();
        if (left < 800) break;
        try {
            const res = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                body: JSON.stringify({
                    model, store: false,
                    generation_config: { thinking_level: 'low', thinking_summaries: 'none' },
                    ...body
                }),
                // бір модель бүкіл уақытты жеп қоймасын: келесісіне де мүмкіндік қалсын
                signal: AbortSignal.timeout(Math.min(left, Math.max(4000, timeoutMs * 0.6)))
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                errors.push(`${model}: ${res.status}`);
                if (res.status === 400) break; // сұраныстың өзі қате
                continue;
            }
            const text = (data.steps || [])
                .filter(s => s.type === 'model_output')
                .flatMap(s => s.content || [])
                .filter(c => c.type === 'text')
                .map(c => c.text || '')
                .join('');
            if (text) return { text, model };
            errors.push(`${model}: бос жауап`);
        } catch (e) {
            errors.push(`${model}: ${e && e.name === 'TimeoutError' ? 'таймаут' : 'желі'}`);
        }
    }
    throw new Error('Gemini жауап бермеді (' + errors.join('; ') + ')');
}

function parseJson(text) {
    const cleaned = String(text).trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
    return JSON.parse(cleaned);
}

// ── HTTP ────────────────────────────────────────────────
function send(res, status, payload) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify(payload));
}

function onlyPost(req, res) {
    if (req.method === 'POST') return true;
    res.setHeader('Allow', 'POST');
    send(res, 405, { error: 'Тек POST' });
    return false;
}

function body(req) {
    const b = req.body;
    if (b && typeof b === 'object') return b;
    try { return JSON.parse(b || '{}'); } catch (_) { return {}; }
}

function clientIp(req) {
    const xf = req.headers['x-forwarded-for'];
    return (Array.isArray(xf) ? xf[0] : String(xf || '')).split(',')[0].trim() || 'local';
}

// Қарапайым жылдамдық шегі. Бір серверлес инстанс ішінде жұмыс істейді:
// бұл қорғаныстың бірінші қабаты, толық шешім үшін Vercel Firewall/KV керек.
const buckets = new Map();
function rateLimit(req, res, name, max, windowMs) {
    const key = name + ':' + clientIp(req);
    const now = Date.now();
    const b = buckets.get(key) || { n: 0, reset: now + windowMs };
    if (now > b.reset) { b.n = 0; b.reset = now + windowMs; }
    b.n++;
    buckets.set(key, b);
    if (buckets.size > 5000) buckets.clear();
    if (b.n > max) {
        res.setHeader('Retry-After', String(Math.ceil((b.reset - now) / 1000)));
        send(res, 429, { error: 'Тым көп сұраныс. Сәлден соң қайталаңыз.' });
        return false;
    }
    return true;
}

// ── Қол қойылған токендер (OTP, сессия) ─────────────────
function secret() {
    const s = process.env.OTP_SECRET || process.env.GEMINI_API_KEY;
    if (!s) throw new Error('OTP_SECRET жоқ');
    return s;
}

const b64u = buf => Buffer.from(buf).toString('base64url');

function sign(payload) {
    const data = b64u(JSON.stringify(payload));
    const mac = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
    return data + '.' + mac;
}

function verify(token) {
    if (typeof token !== 'string' || !token.includes('.')) return null;
    const [data, mac] = token.split('.');
    const expected = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
    const a = Buffer.from(mac || ''), b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
        const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
        if (payload.exp && Date.now() > payload.exp) return null;
        return payload;
    } catch (_) { return null; }
}

function hashCode(phone, code) {
    return crypto.createHmac('sha256', secret()).update(phone + '|' + code).digest('base64url');
}

module.exports = { gemini, hasAI, parseJson, send, onlyPost, body, rateLimit, sign, verify, hashCode, clientIp };
