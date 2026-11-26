// SENIM логикасының тесттері: `npm test` (тәуелділік қажет емес)
global.window = {};
require('../js/security.js');
require('../js/validators.js');
require('../js/escrow.js');
const assert = require('assert');
const S = window.AISecurity, V = window.Validators, E = window.EscrowCore;
let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('  ✓', name); };

t('қалыпты тапсырма өтеді', () => {
  for (const s of ['Figma макетін React-ке айналдыру', 'Instagram посттарына мәтін жазу',
                   'Доставка сайтына дизайн', 'Дропшиппинг дүкеніне SEO'])
    assert.strictEqual(S.analyze(s).verdict, 'SAFE', s);
});
t('оффлайн жұмыс бұғатталады', () => assert.strictEqual(S.analyze('Қоймаға келіп жәшіктерді тасу керек').verdict, 'BLOCK'));
t('дроппер схемасы бұғатталады', () => assert.strictEqual(S.analyze('Картаңды бер, ақшаны қабылдап ал да аудар').verdict, 'BLOCK'));
t('grooming бұғатталады', () => assert.strictEqual(S.analyze('Ата-анаңа айтпа, суретіңді жібер').verdict, 'BLOCK'));
t('бүркемеленген whatsapp ұсталады', () => assert.notStrictEqual(S.analyze('w h a t s a p p-қа жаз').verdict, 'SAFE'));
t('чатта нөмір мен сілтеме жасырылады', () => {
  const r = S.sanitizeChatMessage('маған +7 (707) 123-45-67 жаз, https://evil.ru');
  assert.ok(!/707|evil/.test(r.sanitized), r.sanitized);
});
t('Luhn-ға сай карта нөмірі жасырылады', () => {
  assert.ok(S.sanitizeChatMessage('карта 4400 4301 2345 6789').sanitized.includes('КАРТА'));
});
t('highlight HTML-ді қауіпсіз етеді', () => assert.ok(!S.highlight('<img onerror=x>', []).includes('<img')));
t('БСН бақылау саны', () => {
  assert.strictEqual(V.bin('990740001304'), '');
  assert.notStrictEqual(V.bin('990740001305'), '');
  assert.notStrictEqual(V.bin('12345'), '');
});
t('телефон валидациясы', () => {
  assert.strictEqual(V.phone('+7 707 123 45 67'), '');
  assert.strictEqual(V.phone('87071234567'), '');
  assert.notStrictEqual(V.phone('12345'), '');
});
t('жас шегі 14–22', () => {
  assert.notStrictEqual(V.age(13), ''); assert.strictEqual(V.age(14), '');
  assert.strictEqual(V.age(22), ''); assert.notStrictEqual(V.age(23), '');
});
t('escrow есебі: 10% комиссия + 4% салық', () => {
  const tx = E.calculateTransaction(85000);
  assert.deepStrictEqual([tx.commission, tx.tax, tx.netPayout], [8500, 3400, 73100]);
});
t('кәмелетке толмаған табысы өз картасына', () => {
  E.lockFunds('p1', 100000);
  const r = E.releasePayment('p1', { age: 16, savingsShare: 0.2 });
  assert.strictEqual(r.toCard + r.toSavings, r.netPayout);
  assert.ok(r.guardianNotified);
});
// ── API (Gemini-сіз, жергілікті) ──
process.env.OTP_SECRET = 'test-secret';
delete process.env.GEMINI_API_KEY;
const L = require('../api/_lib.js');
function call(handler, body) {
  return new Promise(resolve => {
    const res = { headers: {}, statusCode: 200, setHeader(k, v) { this.headers[k] = v; }, end(d) { resolve({ status: this.statusCode, data: JSON.parse(d) }); } };
    handler({ method: 'POST', headers: {}, body }, res);
  });
}
const at = async (name, fn) => { await fn(); passed++; console.log('  ✓', name); };
(async () => {
  await at('токен: қол қою және өзгертуді анықтау', () => {
    const t = L.sign({ a: 1, exp: Date.now() + 1000 });
    assert.deepStrictEqual(L.verify(t).a, 1);
    assert.strictEqual(L.verify(t.slice(0, -2) + 'xx'), null);
    assert.strictEqual(L.verify(L.sign({ exp: Date.now() - 1 })), null);
  });
  const otp = require('../api/otp.js'), reg = require('../api/register.js'), guard = require('../api/guard.js');
  await at('OTP: жіберу → қате код → дұрыс код → келісім', async () => {
    const s = await call(otp, { action: 'send', phone: '87071234567' });
    assert.strictEqual(s.status, 200); assert.ok(/^\d{6}$/.test(s.data.demoCode));
    const bad = await call(otp, { action: 'verify', token: s.data.token, code: '000000' === s.data.demoCode ? '111111' : '000000' });
    assert.strictEqual(bad.data.ok, false);
    const ok = await call(otp, { action: 'verify', token: s.data.token, code: s.data.demoCode });
    assert.ok(ok.data.ok && ok.data.consent);
    const r = await call(reg, { type: 'youth', name: 'Айгерім', age: 16, email: 'a@b.kz', password: 'qwerty123', terms: true, consent: ok.data.consent });
    assert.strictEqual(r.data.profile.role, 'junior');
  });
  await at('тіркелу: 16 жас келісімсіз өтпейді', async () => {
    const r = await call(reg, { type: 'youth', name: 'Айгерім', age: 16, email: 'a@b.kz', password: 'qwerty123', terms: true });
    assert.strictEqual(r.status, 422); assert.ok(r.data.errors.parentPhone);
  });
  await at('тіркелу: бизнес БСН серверде тексеріледі', async () => {
    const r = await call(reg, { type: 'business', company: 'Мысал', bin: '990740001305', phone: '+77071234567', email: 'a@b.kz', password: 'qwerty123' });
    assert.ok(r.data.errors.bin);
  });
  await at('guard: AI кілтсіз де ережелер жұмыс істейді', async () => {
    const r = await call(guard, { text: 'Қоймаға келіп жәшік тасу керек', mode: 'task' });
    assert.strictEqual(r.data.verdict, 'BLOCK'); assert.strictEqual(r.data.source, 'rules');
  });
  console.log(`\n${passed} тест өтті`);
})().catch(e => { console.error('✗', e); process.exit(1); });
