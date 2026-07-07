// SENIM Secure Escrow Capital Pipeline & Banking Interface

class EscrowPipeline {
    constructor() {
        this.taxRate = 0.01;      // 1% tax for micro-ledger
        this.commissionRate = 0.10; // 10% platform commission
        this.lockedBalances = {};   // Simulated database of locked funds
    }

    /**
     * Locks funds for a project under escrow
     * @param {string} projectId Project Identifier
     * @param {number} amount Project Budget
     * @returns {object} Status statement
     */
    lockFunds(projectId, amount) {
        const breakdown = this.calculateTransaction(amount);
        this.lockedBalances[projectId] = {
            ...breakdown,
            status: 'LOCKED',
            timestamp: new Date().toISOString()
        };
        return this.lockedBalances[projectId];
    }

    /**
     * Calculates the platform commission (10%)
     * @param {number} amount Gross transaction amount
     * @returns {number} Calculated fee
     */
    calculateCommission(amount) {
        return amount * this.commissionRate;
    }

    /**
     * Releases payment from escrow to the freelancer, with automated dual-routing for junior users.
     * @param {string} projectId Project Identifier
     * @param {object} user User metadata (including age and parent accounts)
     * @returns {object} Payout status statement
     */
    releasePayment(projectId, user = { age: 18 }) {
        const tx = this.lockedBalances[projectId];
        if (!tx || tx.status !== 'LOCKED') {
            return { status: 'FAILED', reason: 'Транзакция табылмады немесе бұғатталмаған.' };
        }

        tx.status = 'RELEASED';
        tx.releasedAt = new Date().toISOString();

        if (user.age < 18) {
            // Junior dual-routing: split payout between parent account & teen card
            tx.routingMode = 'DUAL_ROUTING';
            tx.parentShare = tx.netPayout * 0.70; // 70% goes to parents account
            tx.teenShare = tx.netPayout * 0.30;   // 30% goes to teens account
            tx.parentAccount = 'KZ82HALYK9920194819';
            tx.teenCard = 'KZ49ALTYN8219481928';
        } else {
            tx.routingMode = 'DIRECT';
            tx.recipientCard = 'KZ49ALTYN8219481928';
        }

        return tx;
    }

    /**
     * Calculates payment breakdown including commissions and taxes legally
     * @param {number} totalAmount Total sum allocated by client
     * @returns {object} Financial ledger details
     */
    calculateTransaction(totalAmount) {
        const platformCommission = this.calculateCommission(totalAmount);
        const taxAmount = totalAmount * this.taxRate;
        const netPayout = totalAmount - platformCommission - taxAmount;

        return {
            gross: totalAmount,
            commission: platformCommission,
            tax: taxAmount,
            netPayout: netPayout,
            status: 'ESCROW_LOCKED'
        };
    }

    /**
     * Simulates payout status checks via Halyk Open API
     * @param {string} txId Transaction UUID
     * @returns {Promise<object>} Status promise
     */
    async queryTransactionStatus(txId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: txId,
                    gateway: 'HalykOpenAPI',
                    status: 'SETTLED',
                    payoutChannel: 'Approved Teen Debit Card',
                    timestamp: new Date().toISOString()
                });
            }, 800);
        });
    }
}

// Export module
window.EscrowCore = new EscrowPipeline();
