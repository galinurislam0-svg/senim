// SENIM — форма валидаторлары (ЖСН/БСН бақылау саны, телефон, email).

(function () {
    'use strict';

    // ЖСН мен БСН-ның 12-ші цифры — бақылау саны. Алгоритм: салмақтар 1..11, mod 11;
    // нәтиже 10 болса — салмақтар 3..11,1,2 қайта; тағы 10 болса — нөмір жарамсыз.
    function checkDigitValid(id) {
        if (!/^\d{12}$/.test(id)) return false;
        const d = id.split('').map(Number);
        const w1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        const w2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
        let c = w1.reduce((s, w, i) => s + w * d[i], 0) % 11;
        if (c === 10) c = w2.reduce((s, w, i) => s + w * d[i], 0) % 11;
        return c !== 10 && c === d[11];
    }

    function bin(value) {
        const v = String(value || '').replace(/\s/g, '');
        if (!/^\d{12}$/.test(v)) return 'БСН 12 цифрдан тұруы керек';
        // БСН-ның 5-ші цифры — тұлға түрі (4,5,6). ЖК үшін ЖСН де жарайды.
        if (!checkDigitValid(v)) return 'БСН бақылау саны сәйкес келмейді';
        return '';
    }

    function phone(value) {
        const d = String(value || '').replace(/\D/g, '');
        const norm = d.length === 11 && (d[0] === '7' || d[0] === '8') ? d.slice(1) : d;
        if (norm.length !== 10 || !/^7\d{9}$/.test(norm)) return 'Қазақстан нөмірін енгізіңіз: +7 7XX XXX XX XX';
        return '';
    }

    function formatPhone(value) {
        let d = String(value || '').replace(/\D/g, '');
        if (d[0] === '8') d = '7' + d.slice(1);
        if (d[0] !== '7') d = '7' + d;
        d = d.slice(0, 11);
        const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
        let out = '+7';
        if (p[0]) out += ' ' + p[0];
        if (p[1]) out += ' ' + p[1];
        if (p[2]) out += ' ' + p[2];
        if (p[3]) out += ' ' + p[3];
        return out;
    }

    function email(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim()) ? '' : 'Email дұрыс емес';
    }

    function password(value) {
        const v = String(value || '');
        if (v.length < 8) return 'Кемінде 8 таңба';
        if (!/\d/.test(v) || !/[a-zа-яәіңғүұқөһ]/i.test(v)) return 'Әріп пен цифр болсын';
        return '';
    }

    function age(value) {
        const n = Number(value);
        if (!Number.isInteger(n)) return 'Жасыңызды енгізіңіз';
        if (n < 14) return 'Платформа 14 жастан бастап қолжетімді';
        if (n > 22) return 'SENIM 14–22 жастағы жастарға арналған';
        return '';
    }

    function name(value) {
        const v = String(value || '').trim();
        return v.length >= 2 && v.split(/\s+/).length >= 1 ? '' : 'Аты-жөніңізді жазыңыз';
    }

    window.Validators = { bin, phone, formatPhone, email, password, age, name, checkDigitValid };
})();
