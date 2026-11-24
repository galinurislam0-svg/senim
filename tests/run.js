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
console.log(`\n${passed} тест өтті`);
