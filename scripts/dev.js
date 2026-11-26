// Жергілікті сервер: статика + /api/* функциялары (Vercel-дегідей), .env.local оқиды.
// Іске қосу: npm run dev  →  http://localhost:8080
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8080;

for (const f of ['.env.local', '.env']) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
}

const TYPES = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain'
};

function patch(res) {
    res.status = c => { res.statusCode = c; return res; };
    res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    return res;
}

http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let p = decodeURIComponent(url.pathname);

    if (p.startsWith('/api/')) {
        const name = p.slice(5).replace(/[^a-z0-9-]/gi, '');
        const file = path.join(ROOT, 'api', name + '.js');
        if (!name || name.startsWith('_') || !fs.existsSync(file)) { res.statusCode = 404; return res.end('{}'); }
        let raw = '';
        req.on('data', c => { raw += c; if (raw.length > 1e6) req.destroy(); });
        req.on('end', async () => {
            try { req.body = raw ? JSON.parse(raw) : {}; } catch (_) { req.body = {}; }
            req.query = Object.fromEntries(url.searchParams);
            // өзгерістер бірден көрінсін: api/ және js/ модульдерін қайта жүктеу
            for (const k of Object.keys(require.cache)) if (k.startsWith(path.join(ROOT, 'api')) || k.startsWith(path.join(ROOT, 'js'))) delete require.cache[k];
            try { await require(file)(req, patch(res)); }
            catch (e) { console.error(e); res.statusCode = 500; res.end('{"error":"server"}'); }
        });
        return;
    }

    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(ROOT, p);
    if (!file.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
    if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html'; // cleanUrls
    fs.readFile(file, (err, data) => {
        if (err) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return fs.readFile(path.join(ROOT, '404.html'), (_, d) => res.end(d || 'Not found'));
        }
        res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
        res.end(data);
    });
}).listen(PORT, () => console.log(`SENIM: http://localhost:${PORT}  (AI: ${process.env.GEMINI_API_KEY ? 'қосулы' : 'жоқ'})`));
