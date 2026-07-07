// SENIM Cyber-Security AI Core Engine (NLP Filter & Chat Sentinel)

class AISecurityEngine {
    constructor() {
        this.toxicPatterns = [
            /оффлайн кездесу/i,
            /қоймада жұмыс/i,
            /жәшік тасу/i,
            /whatsapp-қа өтейік/i,
            /telegram-ға жаз/i,
            /номеріңді бер/i,
            /карта нөмірін жібер/i,
            /пароль/i,
            /копилка/i
        ];
    }

    /**
     * Scans physical labor, offline hazards, or suspicious system inputs.
     * @param {string} text Task description to evaluate
     * @returns {object} Validation result
     */
    evaluateTaskDescription(text) {
        for (let pattern of this.toxicPatterns) {
            if (pattern.test(text)) {
                return {
                    status: 'BLOCKED',
                    reason: 'Физикалық жұмыс немесе платформадан тыс қатынас қаупі анықталды.',
                    score: 0.99
                };
            }
        }
        return {
            status: 'APPROVED',
            reason: 'Тапсырма қауіпсіздік талаптарына толық сәйкес келеді.',
            score: 0.02
        };
    }

    /**
     * Checks, flags, and filters off-platform cash scams and link phishes in chat logs.
     * @param {string} message Chat message content
     * @returns {object} Sanitized result
     */
    sanitizeChatMessage(message) {
        let isFlagged = false;
        let sanitized = message;

        // Mask phone numbers
        const phoneRegex = /(\+?7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g;
        if (phoneRegex.test(message)) {
            sanitized = sanitized.replace(phoneRegex, '[НӨМІР БҰҒАТТАЛДЫ]');
            isFlagged = true;
        }

        // Mask external links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        if (urlRegex.test(message)) {
            sanitized = sanitized.replace(urlRegex, '[СІЛТЕМЕ ҚАУІПСІЗДІК ҮШІН ӨШІРІЛДІ]');
            isFlagged = true;
        }

        // Check for direct card payments
        if (/kaspi/i.test(message) && /аудар/i.test(message)) {
            sanitized = sanitized + " (Назар аударыңыз! Платформадан тыс аударым жасау қауіпті)";
            isFlagged = true;
        }

        return {
            original: message,
            sanitized: sanitized,
            flagged: isFlagged
        };
    }

    /**
     * Simulates parental consent OTP SMS Gateway routing
     * @param {string} phone Parent phone number
     * @returns {Promise<object>} mock JSON response
     */
    async simulateParentalConsent(phone) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockOtp = Math.floor(100000 + Math.random() * 900000);
                resolve({
                    status: 'SMS_SENT',
                    phone: phone,
                    otp: mockOtp,
                    gateway: 'Mobizon_SMS_Gateway_v2',
                    message: 'Ата-аналық келісімге растау коды сәтті жіберілді.',
                    timestamp: new Date().toISOString()
                });
            }, 800);
        });
    }
}

// Export module
window.AISecurity = new AISecurityEngine();
