// SENIM Escrow — қаражатты кепілде ұстау және төлем есебі.
// Салық: 2026 жылғы ҚР Салық кодексі бойынша өзін-өзі жұмыспен қамтығандар режимі —
// интернет-платформа арқылы табыстың 4%-ы (платформа салық агенті ретінде ұстап қалады).
// Маслихат мөлшерлемені ±50% өзгерте алады, сондықтан ол конфигте бөлек тұр.

(function () {
    'use strict';

    const CONFIG = {
        taxRate: 0.04,          // өзін-өзі жұмыспен қамтығандар режимі, базалық мөлшерлеме
        commissionRate: 0.10,   // платформа комиссиясы
        mrp2026: 4325,          // АЕК 2026
        monthlyLimitMrp: 300    // режим лимиті: айына 300 АЕК
    };

    class EscrowPipeline {
        constructor(config = CONFIG) {
            this.config = { ...config };
            this.lockedBalances = {};
        }

        get monthlyLimit() {
            return this.config.mrp2026 * this.config.monthlyLimitMrp;
        }

        /** Клиент төлеген сомадан комиссия мен салықты есептеу. Тиынға дейін дөңгелектенеді. */
        calculateTransaction(totalAmount) {
            const gross = Math.max(0, Number(totalAmount) || 0);
            const r = n => Math.round(n * 100) / 100;
            const commission = r(gross * this.config.commissionRate);
            const tax = r(gross * this.config.taxRate);
            return { gross, commission, tax, netPayout: r(gross - commission - tax), status: 'ESCROW_LOCKED' };
        }

        lockFunds(projectId, amount) {
            this.lockedBalances[projectId] = {
                ...this.calculateTransaction(amount),
                status: 'LOCKED',
                timestamp: new Date().toISOString()
            };
            return this.lockedBalances[projectId];
        }

        /**
         * Жұмыс қабылданғанда қаражатты босату.
         * Кәмелетке толмаған жастың табысы — оның өз меншігі, сондықтан төлем оның картасына түседі.
         * Ата-ана әр төлемді көреді, ал жинақ үлесін (savingsShare) отбасы өзі таңдайды.
         */
        releasePayment(projectId, user = { age: 18, savingsShare: 0 }) {
            const tx = this.lockedBalances[projectId];
            if (!tx || tx.status !== 'LOCKED') {
                return { status: 'FAILED', reason: 'Транзакция табылмады немесе бұғатталмаған.' };
            }
            tx.status = 'RELEASED';
            tx.releasedAt = new Date().toISOString();
            const savings = Math.min(Math.max(user.savingsShare || 0, 0), 0.5);
            tx.toCard = Math.round(tx.netPayout * (1 - savings) * 100) / 100;
            tx.toSavings = Math.round(tx.netPayout * savings * 100) / 100;
            tx.guardianNotified = user.age < 18;
            return tx;
        }
    }

    const root = typeof window !== 'undefined' ? window : globalThis;
    root.EscrowCore = new EscrowPipeline();
    root.SENIM_CONFIG = CONFIG;
    if (typeof module !== 'undefined' && module.exports) module.exports = { EscrowCore: root.EscrowCore, CONFIG, EscrowPipeline };
})();
