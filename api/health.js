// GET /api/health — бэкенд күйі (кілттің өзін ешқашан көрсетпейді).
'use strict';

const { send, hasAI } = require('./_lib');

module.exports = (req, res) => {
    send(res, 200, {
        ok: true,
        ai: hasAI(),
        sms: Boolean(process.env.SMS_PROVIDER),
        time: new Date().toISOString()
    });
};
