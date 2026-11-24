// =====================================================================
// SENIM Enterprise Engine — enterprise.js v3.0
// ─────────────────────────────────────────────────────────────────────
//  UPGRADE 1: Global Reactive Financial State Controller + Escrow Audit
//  UPGRADE 2: Cognitive Anti-Fraud Sentinel Core
//  UPGRADE 3: High-Fidelity Bento SVG Production Analytics
//  UPGRADE 4: Automated B2B Invoice Ledger Logs
// =====================================================================

// ─────────────────────────────────────────────────────────────────────
// UPGRADE 1 ▸ GLOBAL REACTIVE FINANCIAL STATE CONTROLLER
// ─────────────────────────────────────────────────────────────────────

const SENIM_FINANCIAL_STATE = {
    escrow:       120000,
    available:     45800,
    monthlyIncome: 92000,
    _subscribers: [],

    subscribe(key, el, formatter) {
        if (!el) return;
        this._subscribers.push({ key, el, formatter: formatter || ((v) => v.toLocaleString('ru-KZ') + ' ₸') });
    },

    commit(key, delta, duration) {
        duration = duration || 1200;
        const oldValue = this[key];
        const newValue = oldValue + delta;
        this[key] = newValue;
        this._subscribers.filter(function(sub){ return sub.key === key; }).forEach(function(sub){
            animateCounter(sub.el, oldValue, newValue, duration, sub.formatter);
        });
    },

    set(key, value) {
        var oldValue = this[key];
        this[key] = value;
        this._subscribers.filter(function(sub){ return sub.key === key; }).forEach(function(sub){
            animateCounter(sub.el, oldValue, value, 1200, sub.formatter);
        });
    }
};

function animateCounter(el, from, to, duration, formatter) {
    if (!el) return;
    var startTime = null;
    var delta = to - from;
    function tick(currentTime) {
        if (!startTime) startTime = currentTime;
        var elapsed  = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3);
        var current  = Math.round(from + delta * eased);
        el.textContent = formatter(current);
        if (progress < 1) { requestAnimationFrame(tick); }
        else { el.textContent = formatter(to); }
    }
    requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────────────────────────────
// UPGRADE 1 ▸ ESCROW AUDIT SUBMISSION MECHANISM
// ─────────────────────────────────────────────────────────────────────

function injectEscrowSubmissionZone() {
    var gigCards = document.querySelectorAll('.gig-card');
    if (!gigCards || gigCards.length === 0) return;
    var activeCard = gigCards[0];
    var submitBtn  = activeCard.querySelector('button');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', function handleApplyClick(e) {
        if (activeCard.querySelector('#escrow-submission-zone')) return;
        e.stopPropagation();

        var submissionZone = document.createElement('div');
        submissionZone.id = 'escrow-submission-zone';
        submissionZone.style.cssText = [
            'margin-top:16px;',
            'padding:16px;',
            'background:rgba(0,0,0,0.55);',
            'border:1.5px dashed rgba(230,110,56,0.45);',
            'border-radius:14px;',
            'animation:fadeSlideIn 0.35s ease forwards;'
        ].join('');

        submissionZone.innerHTML = [
            '<p style="font-family:\'Courier New\',monospace;font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:10px;">',
            '[ESCROW SUBMISSION TERMINAL] · Жұмысты тексеруге жолдаңыз',
            '</p>',

            '<label id="escrow-file-label" style="',
            'display:block;border:1.5px dashed rgba(230,110,56,0.35);border-radius:10px;',
            'padding:20px 12px;text-align:center;cursor:pointer;',
            'background:rgba(230,110,56,0.04);transition:border-color 0.25s,background 0.25s;margin-bottom:12px;"',
            ' onmouseover="this.style.borderColor=\'rgba(230,110,56,0.7)\';this.style.background=\'rgba(230,110,56,0.08)\'"',
            ' onmouseout="this.style.borderColor=\'rgba(230,110,56,0.35)\';this.style.background=\'rgba(230,110,56,0.04)\'"',
            '>',
            '<input type="file" id="escrow-file-input" multiple accept=".zip,.pdf,.png,.jpg,.fig,.jsx,.tsx,.html,.css,.js"',
            ' style="display:none;" onchange="handleEscrowFileSelect(this)">',
            '<div style="font-family:\'Courier New\',monospace;font-size:11px;color:#94a3b8;line-height:1.8;">',
            '<div style="font-size:22px;margin-bottom:6px;">📁</div>',
            '<span id="escrow-file-name" style="color:#64748b;">Файлды осы жерге сүйреп апарыңыз немесе таңдаңыз</span><br>',
            '<span style="font-size:9px;color:#475569;">.zip · .pdf · .jsx · .tsx · .fig · .html — қабылданады</span>',
            '</div></label>',

            '<div style="position:relative;margin-bottom:12px;">',
            '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);',
            'font-family:\'Courier New\',monospace;font-size:10px;color:#475569;pointer-events:none;">🔗</span>',
            '<input type="text" id="escrow-url-input" placeholder="Git / Figma сілтемесін қойыңыз (https://...)" style="',
            'width:100%;box-sizing:border-box;background:rgba(0,0,0,0.6);border:1px solid #1e293b;',
            'border-radius:10px;padding:10px 12px 10px 30px;font-family:\'Courier New\',monospace;',
            'font-size:11px;color:#e2e8f0;outline:none;transition:border-color 0.25s;"',
            ' oninput="validateEscrowUrl(this)"',
            ' onfocus="this.style.borderColor=\'#E66E38\'"',
            ' onblur="this.style.borderColor=(this.dataset.valid===\'true\'?\'#34d399\':\'#1e293b\')">',
            '<span id="escrow-url-status" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);',
            'font-size:10px;font-family:\'Courier New\',monospace;opacity:0;transition:opacity 0.2s;"></span>',
            '</div>',

            '<textarea id="escrow-note-input" placeholder="Жұмыс туралы қосымша ақпарат (міндетті емес)..." rows="2" style="',
            'width:100%;box-sizing:border-box;background:rgba(0,0,0,0.6);border:1px solid #1e293b;',
            'border-radius:10px;padding:10px 12px;font-family:\'Courier New\',monospace;',
            'font-size:11px;color:#e2e8f0;outline:none;resize:none;margin-bottom:12px;transition:border-color 0.25s;"',
            ' onfocus="this.style.borderColor=\'#E66E38\'" onblur="this.style.borderColor=\'#1e293b\'"></textarea>',

            '<button id="escrow-submit-btn" onclick="handleEscrowFinalSubmit()" style="',
            'width:100%;background:linear-gradient(135deg,#E66E38,#f59e0b);border:none;border-radius:10px;',
            'padding:11px 0;font-family:\'Courier New\',monospace;font-size:12px;font-weight:900;',
            'color:#000;cursor:pointer;letter-spacing:0.05em;transition:transform 0.15s ease,box-shadow 0.15s ease;',
            'box-shadow:0 4px 20px rgba(230,110,56,0.3);"',
            ' onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 6px 28px rgba(230,110,56,0.5)\'"',
            ' onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 4px 20px rgba(230,110,56,0.3)\'">',
            '🔐 Дайын жұмысты тексеруге жолдау',
            '</button>'
        ].join('');

        var buttonRow = submitBtn.closest('div');
        activeCard.insertBefore(submissionZone, buttonRow);

        submitBtn.textContent = 'Жабу ▲';
        submitBtn.onclick = function() {
            submissionZone.style.transition = 'opacity 0.25s,transform 0.25s';
            submissionZone.style.opacity    = '0';
            submissionZone.style.transform  = 'translateY(-8px)';
            setTimeout(function() {
                submissionZone.remove();
                submitBtn.textContent = 'Тапсырманы орындау →';
                submitBtn.onclick = null;
                submitBtn.addEventListener('click', handleApplyClick);
            }, 260);
        };
    });
}

function validateEscrowUrl(input) {
    var val      = input.value.trim();
    var statusEl = document.getElementById('escrow-url-status');
    if (!statusEl) return;
    if (val === '') { statusEl.style.opacity = '0'; input.dataset.valid = 'false'; return; }
    var gitPattern     = /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/.+/i;
    var figmaPattern   = /^https?:\/\/(www\.)?figma\.com\/.+/i;
    var genericPattern = /^https?:\/\/.+\..+/i;
    if (gitPattern.test(val)) {
        statusEl.textContent = '✓ Git'; statusEl.style.color = '#34d399'; statusEl.style.opacity = '1';
        input.style.borderColor = '#34d399'; input.dataset.valid = 'true';
    } else if (figmaPattern.test(val)) {
        statusEl.textContent = '✓ Figma'; statusEl.style.color = '#a78bfa'; statusEl.style.opacity = '1';
        input.style.borderColor = '#a78bfa'; input.dataset.valid = 'true';
    } else if (genericPattern.test(val)) {
        statusEl.textContent = '✓ URL'; statusEl.style.color = '#38bdf8'; statusEl.style.opacity = '1';
        input.style.borderColor = '#38bdf8'; input.dataset.valid = 'true';
    } else {
        statusEl.textContent = '✗ Қате'; statusEl.style.color = '#ef4444'; statusEl.style.opacity = '1';
        input.style.borderColor = '#ef4444'; input.dataset.valid = 'false';
    }
}

function handleEscrowFileSelect(input) {
    var nameEl = document.getElementById('escrow-file-name');
    if (!nameEl) return;
    if (input.files && input.files.length > 0) {
        var names = Array.from(input.files).map(function(f){ return f.name; }).join(', ');
        nameEl.textContent = '📎 ' + names;
        nameEl.style.color = '#E66E38';
    }
}

function handleEscrowFinalSubmit() {
    var urlInput  = document.getElementById('escrow-url-input');
    var noteInput = document.getElementById('escrow-note-input');
    var fileInput = document.getElementById('escrow-file-input');
    var submitBtn = document.getElementById('escrow-submit-btn');
    var zone      = document.getElementById('escrow-submission-zone');

    if (urlInput)  { urlInput.disabled  = true; urlInput.style.opacity  = '0.5'; }
    if (noteInput) { noteInput.disabled = true; noteInput.style.opacity = '0.5'; }
    if (fileInput) { fileInput.disabled = true; }
    if (submitBtn) {
        submitBtn.disabled     = true;
        submitBtn.textContent  = '⏳ Тексеруде...';
        submitBtn.style.background = 'linear-gradient(135deg,#374151,#4b5563)';
        submitBtn.style.color  = '#9ca3af';
    }

    if (zone) {
        var lockBadge = document.createElement('div');
        lockBadge.style.cssText = [
            'display:flex;align-items:center;gap:6px;margin-top:10px;padding:8px 12px;',
            'background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.25);',
            'border-radius:8px;font-family:\'Courier New\',monospace;font-size:10px;color:#34d399;'
        ].join('');
        lockBadge.innerHTML = '<span style="font-size:14px;">🔒</span> Тапсырма бекітілді — аудит жүргізілуде...';
        zone.appendChild(lockBadge);
    }

    runEscrowAuditStream();
}

function runEscrowAuditStream() {
    var mentorConsole = document.getElementById('ai-mentor-console');
    if (!mentorConsole) return;

    var mentorSection = document.getElementById('mentor');
    if (mentorSection) { mentorSection.scrollIntoView({ behavior: 'smooth', block: 'center' }); }

    var auditSteps = [
        { text: '[AI_AUDIT]: Fetching dynamic repository branches... [OK]',             color: '#38bdf8', delay: 0    },
        { text: '[AI_AUDIT]: Testing component architectural health... 100% Clean.',    color: '#34d399', delay: 1100 },
        { text: '[ESCROW]: Authorizing cryptographic release code... Verified.',        color: '#E66E38', delay: 2200 }
    ];

    var sep = document.createElement('div');
    sep.style.cssText = 'color:#334155;font-family:"Courier New",monospace;font-size:10px;margin-top:6px;';
    sep.textContent   = '─────────────────────────────────────';
    mentorConsole.appendChild(sep);

    var hdr = document.createElement('div');
    hdr.style.cssText = 'color:#E66E38;font-family:"Courier New",monospace;font-size:10px;font-weight:900;letter-spacing:0.1em;';
    hdr.textContent   = '[ESCROW AUDIT ENGINE]: Initiated...';
    mentorConsole.appendChild(hdr);
    mentorConsole.scrollTop = mentorConsole.scrollHeight;

    auditSteps.forEach(function(step) {
        setTimeout(function() {
            var line = document.createElement('div');
            line.style.cssText = 'color:' + step.color + ';font-family:"Courier New",monospace;font-size:10px;opacity:0;transition:opacity 0.4s ease;';
            line.textContent   = '> ' + step.text;
            mentorConsole.appendChild(line);
            mentorConsole.scrollTop = mentorConsole.scrollHeight;
            requestAnimationFrame(function(){ requestAnimationFrame(function(){ line.style.opacity = '1'; }); });
        }, step.delay + 400);
    });

    setTimeout(function() {
        var relLine = document.createElement('div');
        relLine.style.cssText = 'color:#fbbf24;font-family:"Courier New",monospace;font-size:10px;font-weight:900;opacity:0;transition:opacity 0.4s ease;';
        relLine.textContent   = '[ESCROW]: 85,000 ₸ → Қолжетімді теңгерімге аударылды. ✓ RELEASED';
        mentorConsole.appendChild(relLine);
        mentorConsole.scrollTop = mentorConsole.scrollHeight;
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ relLine.style.opacity = '1'; }); });

        SENIM_FINANCIAL_STATE.commit('escrow',       -85000, 1400);
        SENIM_FINANCIAL_STATE.commit('available',     85000, 1400);
        SENIM_FINANCIAL_STATE.commit('monthlyIncome', 85000, 1400);

        showEscrowReleaseToast();

        var submitBtn = document.getElementById('escrow-submit-btn');
        if (submitBtn) {
            submitBtn.textContent      = '✓ Тексеруден өтті — Escrow босатылды!';
            submitBtn.style.background = 'linear-gradient(135deg,#065f46,#047857)';
            submitBtn.style.color      = '#34d399';
        }

        var activeCard = document.querySelector('.gig-card');
        if (activeCard) {
            var overlay = document.createElement('div');
            overlay.style.cssText = [
                'position:absolute;inset:0;border-radius:1rem;',
                'background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.4);',
                'display:flex;align-items:center;justify-content:center;pointer-events:none;',
                'animation:fadeSlideIn 0.4s ease forwards;z-index:10;'
            ].join('');
            overlay.innerHTML = '<div style="background:rgba(5,46,37,0.95);border:1px solid rgba(52,211,153,0.5);border-radius:10px;padding:10px 20px;font-family:\'Courier New\',monospace;font-size:11px;font-weight:900;color:#34d399;letter-spacing:0.05em;">✓ ESCROW RELEASED · 85,000 ₸ АУДАРЫЛДЫ</div>';
            activeCard.style.position = 'relative';
            activeCard.appendChild(overlay);
            setTimeout(function() {
                overlay.style.transition = 'opacity 0.5s ease';
                overlay.style.opacity    = '0';
                setTimeout(function(){ overlay.remove(); }, 500);
            }, 4000);
        }
    }, 3400);
}

function showEscrowReleaseToast() {
    var old = document.getElementById('escrow-release-toast');
    if (old) old.remove();
    var toast = document.createElement('div');
    toast.id  = 'escrow-release-toast';
    toast.style.cssText = [
        'position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(20px);z-index:9999;',
        'background:linear-gradient(135deg,rgba(5,46,37,0.98),rgba(6,78,59,0.98));',
        'border:1px solid rgba(52,211,153,0.5);border-radius:14px;padding:14px 24px;',
        'display:flex;align-items:center;gap:12px;font-family:\'Courier New\',monospace;font-size:12px;color:#34d399;',
        'box-shadow:0 8px 40px rgba(52,211,153,0.25);opacity:0;',
        'transition:opacity 0.35s ease,transform 0.35s ease;pointer-events:none;'
    ].join('');
    toast.innerHTML = '<span style="font-size:18px;">✅</span><div><div style="font-weight:900;letter-spacing:0.05em;">[ESCROW RELEASED] · 85,000 ₸ аударылды</div><div style="font-size:9px;color:#6ee7b7;margin-top:3px;">Қолжетімді теңгерім жаңартылды · Осы айдағы табыс жаңартылды</div></div>';
    document.body.appendChild(toast);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }); });
    setTimeout(function(){
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(function(){ toast.remove(); }, 400);
    }, 5000);
}

// ─────────────────────────────────────────────────────────────────────
// UPGRADE 2 ▸ COGNITIVE ANTI-FRAUD SENTINEL CORE
// ─────────────────────────────────────────────────────────────────────

var FRAUD_SENTINEL_PATTERNS = [
    /kaspi[-\s]?ге\s*тікелей\s*аудар/i,
    /kaspi[-\s]?ге\s*аудар/i,
    /тікелей\s*аудар/i,
    /карта[-\s]?ға\s*ауда/i,
    /банк[-\s]?ке\s*ауда/i,
    /халық[-\s]?банк[-\s]?ке/i,
    /номер(іңді|іңізді|ді)?\s*бер/i,
    /тел(ефон)?\s*нөмір/i,
    /байланыс\s*нөмір/i,
    /instagram[-\s]?да\s*(жаз|сөйлес)/i,
    /whatsapp[-\s]?қа\s*өт/i,
    /whatsapp[-\s]?та\s*(сөйлес|жаз)/i,
    /telegram[-\s]?ға\s*(өт|жаз|сөйлес)/i,
    /telegram[-\s]?да\s*(жаз|сөйлес)/i,
    /платформадан\s*тыс/i,
    /сыртта\s*(сөйлес|кездес|шеш)/i,
    /оффлайн\s*(кездес|жұмыс)/i,
    /жеке\s*сөйлес/i,
    /қоймаға\s*кел/i,
    /жәшік\s*тасу/i,
    /физикалық\s*жұмыс/i,
    /склад(қа|та)?/i,
    /накт/i
];

function escHtml(v) {
    return String(v).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
}

// Негізгі талдау js/security.js қозғалтқышында (басты беттегі «Сенім сүзгісі»).
// Ол жүктелмесе ғана төмендегі ескі тізім қолданылады.
function runFraudSentinelScan(message) {
    if (window.AISecurity && window.AISecurity.analyze) {
        var r = window.AISecurity.analyze(message);
        if (r.verdict !== 'SAFE') {
            var first = r.reasons[0];
            return { violated: true, matchedPattern: first.label + ': ' + first.matches.join(', '), score: r.score };
        }
        return { violated: false, matchedPattern: null };
    }
    for (var i = 0; i < FRAUD_SENTINEL_PATTERNS.length; i++) {
        var match = message.match(FRAUD_SENTINEL_PATTERNS[i]);
        if (match) { return { violated: true, matchedPattern: match[0] }; }
    }
    return { violated: false, matchedPattern: null };
}

function initAntifraudSentinel() {
    var mentorInput  = document.getElementById('ai-mentor-input');
    var mentorAskBtn = document.getElementById('ai-ask-btn');
    if (!mentorInput || !mentorAskBtn) return;

    var newBtn = mentorAskBtn.cloneNode(true);
    mentorAskBtn.parentNode.replaceChild(newBtn, mentorAskBtn);

    function sentinelHandler() {
        var text = mentorInput.value.trim();
        if (!text) return;
        var scan = runFraudSentinelScan(text);
        if (scan.violated) {
            triggerFraudAlert(text, scan.matchedPattern);
            mentorInput.value = '';
            return;
        }
        dispatchSafeMentorMessage(text, mentorInput);
    }

    newBtn.addEventListener('click', sentinelHandler);
    mentorInput.addEventListener('keydown', function(e){ if (e.key === 'Enter') sentinelHandler(); });
}

function triggerFraudAlert(originalMsg, matchedPhrase) {
    var mentorConsole  = document.getElementById('ai-mentor-console');
    var aiWrapper      = document.querySelector('#mentor > div');
    var mentorInput    = document.getElementById('ai-mentor-input');
    if (!mentorConsole) return;

    if (aiWrapper) {
        aiWrapper.style.transition  = 'border-color 0.1s ease,box-shadow 0.1s ease';
        aiWrapper.style.borderColor = '#EF4444';
        aiWrapper.style.boxShadow   = '0 0 0 2px rgba(239,68,68,0.6),0 0 40px rgba(239,68,68,0.2)';
        setTimeout(function(){ aiWrapper.style.borderColor = ''; aiWrapper.style.boxShadow = ''; }, 1500);
    }
    if (mentorInput) {
        mentorInput.style.borderColor = '#EF4444';
        mentorInput.style.boxShadow   = '0 0 10px rgba(239,68,68,0.4)';
        setTimeout(function(){ mentorInput.style.borderColor = ''; mentorInput.style.boxShadow = ''; }, 1500);
    }

    var alertBlock = document.createElement('div');
    alertBlock.style.cssText = [
        'background:rgba(127,29,29,0.4);border:1px solid rgba(239,68,68,0.6);border-radius:8px;',
        'padding:10px 12px;margin:6px 0;font-family:\'Courier New\',monospace;',
        'font-size:10px;line-height:1.9;opacity:0;transition:opacity 0.35s ease;'
    ].join('');
    alertBlock.innerHTML = [
        '<div style="color:#ef4444;font-weight:900;letter-spacing:0.08em;font-size:9px;">',
        '⛔ [CRITICAL SHIELD WARNING - CODE 403]: Off-platform solicitation attempt intercepted.',
        '</div>',
        '<div style="color:#fca5a5;font-size:9px;">[TELEMETRY]: User communications isolated. Security protocols active.</div>',
        '<div style="color:#f87171;font-size:9px;margin-top:2px;">[PATTERN MATCH]: "<span style="background:rgba(239,68,68,0.25);padding:0 3px;border-radius:3px;">' + escHtml(matchedPhrase) + '</span>"</div>',
        '<div style="color:#6b7280;font-size:8px;margin-top:4px;">[CASE ID]: SENIM-FRAUD-' + Date.now() + ' · ' + new Date().toLocaleTimeString('kk-KZ') + '</div>'
    ].join('');
    mentorConsole.appendChild(alertBlock);
    mentorConsole.scrollTop = mentorConsole.scrollHeight;
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ alertBlock.style.opacity = '1'; }); });
}

function dispatchSafeMentorMessage(text, mentorInput) {
    var mentorConsole = document.getElementById('ai-mentor-console');
    if (!mentorConsole) return;

    var userLine = document.createElement('div');
    userLine.style.cssText = 'color:#e2e8f0;font-family:"Courier New",monospace;font-size:10px;';
    userLine.textContent   = '> ' + text;
    mentorConsole.appendChild(userLine);
    mentorConsole.scrollTop = mentorConsole.scrollHeight;
    mentorInput.value = '';

    var responses = {
        def:      'Бұл тамаша сұрақ! Нақты кодпен жауап беру үшін толығырақ жаза аласыз ба?',
        useState: 'useState – React-тағы хук. `const [count, setCount] = useState(0);` деп жариялап, setCount(count + 1) арқылы күйді жаңартасыз.',
        grid:     'CSS Grid үшін: `display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;` – адаптивті тор.',
        python:   'Python-да функция: `def calculate(x): return x * 0.04` – 4% салықты есептейтін функция.',
        figma:    'Figma-да Auto Layout – элементтерді топтастырып, padding/gap арқылы икемді компоненттер жасайды.'
    };
    var lower = text.toLowerCase();
    var resp  = responses.def;
    if (lower.includes('usestate') || lower.includes('state'))         resp = responses.useState;
    else if (lower.includes('grid') || lower.includes('тор'))          resp = responses.grid;
    else if (lower.includes('python') || lower.includes('функция'))    resp = responses.python;
    else if (lower.includes('figma') || lower.includes('auto layout')) resp = responses.figma;

    setTimeout(function(){
        var aiLine = document.createElement('div');
        aiLine.style.cssText = 'color:#34d399;font-family:"Courier New",monospace;font-size:10px;';
        aiLine.textContent   = '// AI: ' + resp;
        mentorConsole.appendChild(aiLine);
        mentorConsole.scrollTop = mentorConsole.scrollHeight;
    }, 420);
}

// ─────────────────────────────────────────────────────────────────────
// UPGRADE 3 ▸ HIGH-FIDELITY BENTO SVG PRODUCTION ANALYTICS
// ─────────────────────────────────────────────────────────────────────

var ANALYTICS_DATA = {
    weeks:    ['1-апта', '2-апта', '3-апта', '4-апта', '5-апта', '6-апта', '7-апта', '8-апта'],
    earnings: [32000, 60000, 41000, 78000, 55000, 92000, 68000, 107000],
    labels:   ['Апт 1', 'Апт 2', 'Апт 3', 'Апт 4', 'Апт 5', 'Апт 6', 'Апт 7', 'Апт 8']
};

function injectSVGAnalyticsPanel() {
    var overviewSection = document.getElementById('overview');
    if (!overviewSection) return;
    var sparklineBlock = overviewSection.querySelector('.mb-8');
    if (!sparklineBlock) return;

    var SVG_W  = 780, SVG_H = 180;
    var PAD_L  = 48,  PAD_R = 24, PAD_T = 20, PAD_B = 40;
    var chartW = SVG_W - PAD_L - PAD_R;
    var chartH = SVG_H - PAD_T - PAD_B;
    var n      = ANALYTICS_DATA.earnings.length;
    var maxVal = Math.max.apply(null, ANALYTICS_DATA.earnings) * 1.08;

    var pts = ANALYTICS_DATA.earnings.map(function(val, i){
        return {
            x:    PAD_L + (i / (n - 1)) * chartW,
            y:    PAD_T + chartH - (val / maxVal) * chartH,
            val:  val,
            week: ANALYTICS_DATA.weeks[i],
            lbl:  ANALYTICS_DATA.labels[i]
        };
    });

    function smoothPath(p) {
        var d = 'M ' + p[0].x + ' ' + p[0].y;
        for (var i = 1; i < p.length; i++) {
            var prev = p[i-1], curr = p[i];
            var cpx1 = prev.x + (curr.x - prev.x) * 0.45, cpy1 = prev.y;
            var cpx2 = curr.x - (curr.x - prev.x) * 0.45, cpy2 = curr.y;
            d += ' C ' + cpx1 + ' ' + cpy1 + ', ' + cpx2 + ' ' + cpy2 + ', ' + curr.x + ' ' + curr.y;
        }
        return d;
    }
    function areaPath(p) {
        return smoothPath(p) + ' L ' + p[p.length-1].x + ' ' + (PAD_T+chartH) + ' L ' + p[0].x + ' ' + (PAD_T+chartH) + ' Z';
    }

    var linePath = smoothPath(pts);
    var fillPath = areaPath(pts);

    var gridHTML = '';
    for (var g = 0; g <= 4; g++) {
        var gy  = PAD_T + (g / 4) * chartH;
        var gv  = Math.round(maxVal - (g / 4) * maxVal);
        var gvf = gv >= 1000 ? Math.round(gv/1000) + 'k' : gv;
        gridHTML += '<line x1="' + PAD_L + '" y1="' + gy + '" x2="' + (SVG_W - PAD_R) + '" y2="' + gy + '" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';
        gridHTML += '<text x="' + (PAD_L-6) + '" y="' + (gy+4) + '" text-anchor="end" font-family="Courier New,monospace" font-size="8" fill="#334155">' + gvf + '</text>';
    }

    var ptsHTML = '', lblHTML = '';
    pts.forEach(function(pt, i){
        var isLast = i === pts.length - 1;
        ptsHTML += '<circle cx="' + pt.x + '" cy="' + pt.y + '" r="5"' +
            ' fill="' + (isLast ? '#E66E38' : '#1a1a1c') + '"' +
            ' stroke="' + (isLast ? '#f59e0b' : '#E66E38') + '" stroke-width="2"' +
            ' class="svg-data-point"' +
            ' data-week="' + pt.week + '" data-val="' + pt.val.toLocaleString('ru-KZ') + ' ₸"' +
            ' style="cursor:pointer;"' +
            ' onmouseover="showSVGTooltip(this)" onmouseout="hideSVGTooltip()"/>';
        lblHTML += '<text x="' + pt.x + '" y="' + (PAD_T+chartH+20) + '" text-anchor="middle"' +
            ' font-family="Courier New,monospace" font-size="8"' +
            ' fill="' + (isLast ? '#E66E38' : '#475569') + '"' +
            ' font-weight="' + (isLast ? '700' : '400') + '">' + pt.lbl + '</text>';
    });

    var panel = document.createElement('div');
    panel.id  = 'svg-analytics-panel';
    panel.style.cssText = 'background:rgba(18,18,20,0.6);border:1px solid #0f172a;border-radius:18px;padding:24px;margin-bottom:32px;position:relative;overflow:visible;';
    panel.innerHTML = [
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:12px;">',
          '<div>',
            '<p style="font-family:\'Courier New\',monospace;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.18em;margin:0 0 4px;">Апталық деректер</p>',
            '<h2 style="font-family:\'Courier New\',monospace;font-size:16px;font-weight:900;color:#fff;margin:0;">📈 Табыс және транзакциялар аналитикасы</h2>',
          '</div>',
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">',
            '<div style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:3px;background:#E66E38;border-radius:2px;display:inline-block;"></span><span style="font-family:\'Courier New\',monospace;font-size:9px;color:#64748b;">Табыс ₸</span></div>',
            '<span style="font-family:\'Courier New\',monospace;font-size:9px;font-weight:700;background:rgba(230,110,56,0.1);color:#E66E38;padding:3px 10px;border-radius:20px;border:1px solid rgba(230,110,56,0.25);">↑ +234% 8 апта</span>',
            '<span style="font-family:\'Courier New\',monospace;font-size:9px;font-weight:700;background:rgba(52,211,153,0.08);color:#34d399;padding:3px 10px;border-radius:20px;border:1px solid rgba(52,211,153,0.2);">● LIVE</span>',
          '</div>',
        '</div>',

        '<div style="position:relative;width:100%;overflow:hidden;">',
          '<svg id="analytics-svg-chart" viewBox="0 0 ' + SVG_W + ' ' + SVG_H + '" style="width:100%;height:auto;display:block;overflow:visible;" preserveAspectRatio="xMidYMid meet">',
            '<defs>',
              '<linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">',
                '<stop offset="0%" stop-color="#E66E38" stop-opacity="0.22"/>',
                '<stop offset="70%" stop-color="#E66E38" stop-opacity="0.05"/>',
                '<stop offset="100%" stop-color="#E66E38" stop-opacity="0"/>',
              '</linearGradient>',
              '<filter id="glowFilter"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
              '<clipPath id="chart-clip"><rect x="' + PAD_L + '" y="' + PAD_T + '" width="' + chartW + '" height="' + (chartH+1) + '"/></clipPath>',
            '</defs>',
            gridHTML,
            '<path d="' + fillPath + '" fill="url(#areaGrad)" clip-path="url(#chart-clip)" opacity="0" id="svg-area-path"><animate attributeName="opacity" from="0" to="1" dur="0.8s" begin="0.2s" fill="freeze"/></path>',
            '<path id="svg-trend-line" d="' + linePath + '" fill="none" stroke="#E66E38" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowFilter)" stroke-dasharray="1200" stroke-dashoffset="1200">',
              '<animate attributeName="stroke-dashoffset" from="1200" to="0" dur="1.2s" begin="0.1s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"/>',
            '</path>',
            ptsHTML,
            lblHTML,
          '</svg>',
          '<div id="svg-tooltip" style="position:absolute;pointer-events:none;opacity:0;transition:opacity 0.2s ease,transform 0.2s ease;transform:translateY(-6px);z-index:100;">',
            '<div style="background:rgba(18,18,20,0.97);border:1px solid rgba(230,110,56,0.5);border-radius:10px;padding:8px 14px;box-shadow:0 8px 30px rgba(0,0,0,0.6);white-space:nowrap;">',
              '<div id="svg-tooltip-week" style="font-family:\'Courier New\',monospace;font-size:9px;color:#64748b;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.1em;"></div>',
              '<div id="svg-tooltip-val" style="font-family:\'Courier New\',monospace;font-size:14px;font-weight:900;color:#E66E38;"></div>',
            '</div>',
            '<div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid rgba(230,110,56,0.5);margin:0 auto;"></div>',
          '</div>',
        '</div>',

        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:20px;border-top:1px solid #0f172a;padding-top:16px;">',
          '<div style="text-align:center;"><div style="font-family:\'Courier New\',monospace;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Жоғары апта</div><div style="font-family:\'Courier New\',monospace;font-size:14px;font-weight:900;color:#E66E38;">107,000 ₸</div><div style="font-family:\'Courier New\',monospace;font-size:8px;color:#1e3a2f;">8-апта</div></div>',
          '<div style="text-align:center;"><div style="font-family:\'Courier New\',monospace;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Орт. апт. табыс</div><div style="font-family:\'Courier New\',monospace;font-size:14px;font-weight:900;color:#fff;">66,625 ₸</div><div style="font-family:\'Courier New\',monospace;font-size:8px;color:#334155;">8 апта</div></div>',
          '<div style="text-align:center;"><div style="font-family:\'Courier New\',monospace;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Жалпы табыс</div><div style="font-family:\'Courier New\',monospace;font-size:14px;font-weight:900;color:#34d399;">533,000 ₸</div><div style="font-family:\'Courier New\',monospace;font-size:8px;color:#1e3a2f;">↑ БАРЛЫҚ АПТА</div></div>',
          '<div style="text-align:center;"><div style="font-family:\'Courier New\',monospace;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Өсу коэффиц.</div><div style="font-family:\'Courier New\',monospace;font-size:14px;font-weight:900;color:#a78bfa;">+234%</div><div style="font-family:\'Courier New\',monospace;font-size:8px;color:#312e81;">Апт 1 → Апт 8</div></div>',
        '</div>'
    ].join('');

    sparklineBlock.after(panel);
}

function showSVGTooltip(circleEl) {
    var tooltip     = document.getElementById('svg-tooltip');
    var tooltipWeek = document.getElementById('svg-tooltip-week');
    var tooltipVal  = document.getElementById('svg-tooltip-val');
    var svgEl       = document.getElementById('analytics-svg-chart');
    if (!tooltip || !tooltipWeek || !tooltipVal || !svgEl) return;

    tooltipWeek.textContent = circleEl.getAttribute('data-week');
    tooltipVal.textContent  = '+' + circleEl.getAttribute('data-val');

    var circleRect  = circleEl.getBoundingClientRect();
    var wrapperRect = svgEl.parentElement.getBoundingClientRect();
    var relLeft     = circleRect.left - wrapperRect.left + circleRect.width / 2;
    var relTop      = circleRect.top  - wrapperRect.top;

    tooltip.style.left      = relLeft + 'px';
    tooltip.style.top       = (relTop - 70) + 'px';
    tooltip.style.transform = 'translateX(-50%) translateY(0)';
    tooltip.style.opacity   = '1';

    circleEl.setAttribute('r', '7');
    circleEl.style.filter = 'drop-shadow(0 0 6px rgba(230,110,56,0.8))';
}

function hideSVGTooltip() {
    var tooltip = document.getElementById('svg-tooltip');
    if (tooltip) { tooltip.style.opacity = '0'; tooltip.style.transform = 'translateX(-50%) translateY(-6px)'; }
    document.querySelectorAll('.svg-data-point').forEach(function(pt){ pt.setAttribute('r','5'); pt.style.filter='none'; });
}

// ─────────────────────────────────────────────────────────────────────
// UPGRADE 4 ▸ AUTOMATED B2B INVOICE LEDGER LOGS
// ─────────────────────────────────────────────────────────────────────

var INVOICE_LEDGER_DATA = [
    { id:'INV-SENIM-2026-0041', txHash:'0x4f8a3c...e9d21b', project:'Figma макетін React лэндингіне айналдыру',    client:'SENIM B2B · #C-0019', amount:85000,  date:'2026-06-28', compliance:'ҚР Салық кодексі · 4%', status:'RELEASED', statusColor:'#34d399' },
    { id:'INV-SENIM-2026-0039', txHash:'0x7c2e91...b34f08', project:'SMM мазмұн жоспары (3 ай)',                  client:'SENIM B2B · #C-0031', amount:45000,  date:'2026-06-15', compliance:'ҚР Салық кодексі · 4%', status:'RELEASED', statusColor:'#34d399' },
    { id:'INV-SENIM-2026-0035', txHash:'0x1a9d44...c78e55', project:'Мобильді қосымшаға арналған UI дизайн жүйесі', client:'SENIM B2B · #C-0047', amount:60000,  date:'2026-06-02', compliance:'ҚР Салық кодексі · 4%', status:'RELEASED', statusColor:'#34d399' },
    { id:'INV-SENIM-2026-0028', txHash:'0x9b1f73...a20c34', project:'Python деректерін талдайтын скрипт',          client:'SENIM B2B · #C-0022', amount:120000, date:'2026-05-18', compliance:'ҚР Салық кодексі · 4%', status:'ESCROW',   statusColor:'#f59e0b' }
];

// Салық (4%) пен комиссия (10%) js/escrow.js конфигінен есептеледі.
INVOICE_LEDGER_DATA.forEach(function(inv){
    var tx = window.EscrowCore ? window.EscrowCore.calculateTransaction(inv.amount)
        : { tax: inv.amount * 0.04, commission: inv.amount * 0.10, netPayout: inv.amount * 0.86 };
    inv.tax = tx.tax; inv.fee = tx.commission; inv.net = tx.netPayout;
});

function injectInvoiceLedger() {
    var financeSection = document.getElementById('finance');
    if (!financeSection) return;

    var totalAmount = INVOICE_LEDGER_DATA.reduce(function(s,i){ return s+i.amount; }, 0);
    var totalTax    = INVOICE_LEDGER_DATA.reduce(function(s,i){ return s+i.tax;    }, 0);
    var totalNet    = INVOICE_LEDGER_DATA.reduce(function(s,i){ return s+i.net;    }, 0);

    var rowsHTML = INVOICE_LEDGER_DATA.map(function(inv, idx){
        var bg = idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent';
        return [
            '<div class="inv-row" style="display:grid;grid-template-columns:1.8fr 1fr 0.8fr 0.8fr 0.8fr 1.2fr 0.9fr;',
            'padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.03);align-items:center;',
            'transition:background 0.2s;background:' + bg + ';"',
            ' onmouseover="this.style.background=\'rgba(230,110,56,0.04)\'"',
            ' onmouseout="this.style.background=\'' + bg + '\'">',

              '<div><div style="font-family:\'Courier New\',monospace;font-size:11px;color:#e2e8f0;font-weight:700;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + inv.project + '</div>',
              '<div style="font-family:\'Courier New\',monospace;font-size:8px;color:#334155;">' + inv.id + '</div>',
              '<div style="font-family:\'Courier New\',monospace;font-size:8px;color:#1e3a5f;margin-top:1px;">' + inv.date + '</div></div>',

              '<div style="font-family:\'Courier New\',monospace;font-size:9px;color:#475569;">',
              '<span style="background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:4px;border:1px solid #1e293b;font-size:8px;">' + inv.txHash + '</span></div>',

              '<div style="text-align:right;font-family:\'Courier New\',monospace;font-size:11px;font-weight:900;color:#fff;">' + inv.amount.toLocaleString('ru-KZ') + ' ₸</div>',
              '<div style="text-align:right;font-family:\'Courier New\',monospace;font-size:11px;color:#E66E38;">' + inv.tax.toLocaleString('ru-KZ') + ' ₸</div>',
              '<div style="text-align:right;font-family:\'Courier New\',monospace;font-size:11px;font-weight:900;color:#34d399;">' + inv.net.toLocaleString('ru-KZ') + ' ₸</div>',

              '<div style="text-align:center;">',
              '<span style="display:inline-block;background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;',
              'font-family:\'Courier New\',monospace;font-size:7px;font-weight:700;padding:3px 8px;border-radius:20px;letter-spacing:0.04em;white-space:nowrap;">' + inv.compliance + '</span>',
              '<div style="font-family:\'Courier New\',monospace;font-size:7px;color:' + inv.statusColor + ';margin-top:3px;font-weight:700;">● ' + inv.status + '</div></div>',

              '<div style="text-align:right;">',
              '<button onclick="downloadInvoicePDF(\'' + inv.id + '\',\'' + inv.project.replace(/'/g,"\\'") + '\',' + inv.amount + ',' + inv.tax + ',' + inv.net + ',\'' + inv.txHash + '\',\'' + inv.date + '\',\'' + inv.compliance + '\')" style="',
              'background:transparent;border:1px solid rgba(230,110,56,0.35);border-radius:7px;padding:5px 10px;',
              'font-family:\'Courier New\',monospace;font-size:9px;font-weight:700;color:#E66E38;cursor:pointer;',
              'transition:all 0.2s ease;white-space:nowrap;"',
              ' onmouseover="this.style.background=\'rgba(230,110,56,0.12)\';this.style.borderColor=\'rgba(230,110,56,0.7)\'"',
              ' onmouseout="this.style.background=\'transparent\';this.style.borderColor=\'rgba(230,110,56,0.35)\'">⬇ Жүктеу (PDF)</button></div>',
            '</div>'
        ].join('');
    }).join('');

    var panel = document.createElement('div');
    panel.id  = 'invoice-ledger-panel';
    panel.style.marginTop = '24px';
    panel.innerHTML = [
        '<div id="invoice-ledger-toggle" onclick="toggleInvoiceLedger()" style="',
        'display:flex;justify-content:space-between;align-items:center;padding:16px 20px;',
        'background:rgba(18,18,20,0.7);border:1px solid #0f172a;border-radius:14px;cursor:pointer;',
        'user-select:none;transition:border-color 0.25s,background 0.25s;"',
        ' onmouseover="this.style.borderColor=\'rgba(230,110,56,0.3)\';this.style.background=\'rgba(18,18,20,0.9)\'"',
        ' onmouseout="this.style.borderColor=\'#0f172a\';this.style.background=\'rgba(18,18,20,0.7)\'">',
          '<div style="display:flex;align-items:center;gap:12px;">',
            '<span style="font-size:18px;">🧾</span>',
            '<div>',
              '<p style="font-family:\'Courier New\',monospace;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 2px;">Автоматты генерация · ҚР Еңбек Кодексі</p>',
              '<h3 style="font-family:\'Courier New\',monospace;font-size:13px;font-weight:900;color:#fff;margin:0;">Ресми электронды чектер мен келісімшарттар</h3>',
            '</div>',
          '</div>',
          '<div style="display:flex;align-items:center;gap:10px;">',
            '<span style="font-family:\'Courier New\',monospace;font-size:9px;background:rgba(230,110,56,0.1);color:#E66E38;padding:3px 10px;border-radius:20px;border:1px solid rgba(230,110,56,0.25);font-weight:700;">' + INVOICE_LEDGER_DATA.length + ' жазба</span>',
            '<span id="invoice-chevron" style="font-family:\'Courier New\',monospace;font-size:12px;color:#475569;transition:transform 0.3s ease;display:inline-block;">▼</span>',
          '</div>',
        '</div>',

        '<div id="invoice-ledger-body" style="overflow:hidden;max-height:0;transition:max-height 0.45s cubic-bezier(0.4,0,0.2,1),opacity 0.35s ease;opacity:0;">',
          '<div style="background:rgba(18,18,20,0.6);border:1px solid #0f172a;border-top:none;border-radius:0 0 14px 14px;overflow:hidden;">',

            '<div style="display:grid;grid-template-columns:1.8fr 1fr 0.8fr 0.8fr 0.8fr 1.2fr 0.9fr;padding:10px 20px;border-bottom:1px solid #0f172a;font-family:\'Courier New\',monospace;font-size:8px;color:#334155;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">',
              '<span>Жоба / ID</span><span>TX Хэш</span><span style="text-align:right;">Жалпы</span>',
              '<span style="text-align:right;">Салық</span><span style="text-align:right;">Таза</span>',
              '<span style="text-align:center;">Сәйкестік</span><span style="text-align:right;">Әрекет</span>',
            '</div>',

            rowsHTML,

            '<div style="display:grid;grid-template-columns:1.8fr 1fr 0.8fr 0.8fr 0.8fr 1.2fr 0.9fr;padding:14px 20px;border-top:2px solid #1e293b;align-items:center;background:rgba(0,0,0,0.3);">',
              '<div style="font-family:\'Courier New\',monospace;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">БАРЛЫҚ ТРАНЗАКЦИЯЛАР</div>',
              '<div></div>',
              '<div style="text-align:right;font-family:\'Courier New\',monospace;font-size:12px;font-weight:900;color:#fff;">' + totalAmount.toLocaleString('ru-KZ') + ' ₸</div>',
              '<div style="text-align:right;font-family:\'Courier New\',monospace;font-size:12px;font-weight:900;color:#E66E38;">' + totalTax.toLocaleString('ru-KZ') + ' ₸</div>',
              '<div style="text-align:right;font-family:\'Courier New\',monospace;font-size:12px;font-weight:900;color:#34d399;">' + totalNet.toLocaleString('ru-KZ') + ' ₸</div>',
              '<div></div><div></div>',
            '</div>',

            '<div style="padding:12px 20px;border-top:1px solid #0f172a;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">',
              '<span style="font-family:\'Courier New\',monospace;font-size:8px;color:#1e293b;">⚖️ Барлық транзакциялар ҚР Еңбек Кодексінің 31-бабына сәйкес шифрланып сақталады · SENIM Legal Ledger Engine v3.1</span>',
              '<button onclick="downloadAllInvoicesPDF()" style="background:transparent;border:1px solid #1e293b;border-radius:7px;padding:5px 12px;font-family:\'Courier New\',monospace;font-size:8px;color:#475569;cursor:pointer;transition:all 0.2s;"',
              ' onmouseover="this.style.borderColor=\'rgba(230,110,56,0.4)\';this.style.color=\'#E66E38\'"',
              ' onmouseout="this.style.borderColor=\'#1e293b\';this.style.color=\'#475569\'">⬇ Барлығын жүктеу (PDF архив)</button>',
            '</div>',
          '</div>',
        '</div>'
    ].join('');

    financeSection.appendChild(panel);
}

function toggleInvoiceLedger() {
    var body    = document.getElementById('invoice-ledger-body');
    var chevron = document.getElementById('invoice-chevron');
    if (!body || !chevron) return;
    var isOpen = body.style.maxHeight !== '0px' && body.style.maxHeight !== '';
    if (isOpen) {
        body.style.maxHeight = '0';    body.style.opacity = '0';
        chevron.style.transform = 'rotate(0deg)';
    } else {
        body.style.maxHeight = '1000px'; body.style.opacity = '1';
        chevron.style.transform = 'rotate(180deg)';
    }
}

function downloadInvoicePDF(id, project, amount, tax, net, txHash, date, compliance) {
    var userName    = localStorage.getItem('senim_user_name') || 'Жас Кәсіпкер';
    var printWin    = window.open('', '_blank', 'width=800,height=700');
    printWin.document.write('<!DOCTYPE html><html lang="kk"><head><meta charset="UTF-8"><title>SENIM Invoice · ' + id + '</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#fff;font-family:\'Courier New\',Courier,monospace;color:#111;padding:48px;}.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;padding-bottom:24px;border-bottom:2px solid #E66E38;}.brand{font-size:28px;font-weight:900;color:#E66E38;letter-spacing:-0.02em;}.brand-sub{font-size:9px;color:#999;letter-spacing:0.2em;text-transform:uppercase;margin-top:2px;}.inv-title{text-align:right;}.inv-title h1{font-size:22px;font-weight:900;color:#111;letter-spacing:0.05em;}.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;}.meta-block h4{font-size:8px;text-transform:uppercase;letter-spacing:0.15em;color:#999;margin-bottom:6px;}.meta-block p{font-size:12px;color:#222;font-weight:700;line-height:1.7;}table{width:100%;border-collapse:collapse;margin-bottom:24px;}th{border-bottom:2px solid #E66E38;padding:10px 12px;text-align:left;font-size:9px;color:#999;text-transform:uppercase;letter-spacing:0.12em;}td{padding:12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#333;}.right{text-align:right;font-weight:700;}.orange{color:#E66E38;}.green{color:#059669;font-weight:900;}.sum-box{background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin-bottom:24px;}.sum-row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px solid #f0f0f0;}.sum-row:last-child{border-bottom:none;font-size:16px;font-weight:900;}.comp{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;margin-bottom:24px;font-size:10px;color:#166534;line-height:1.8;}.tx-box{background:#1a1a1c;border-radius:8px;padding:14px 18px;margin-bottom:32px;font-size:10px;color:#64748b;line-height:1.8;}.tx-box span{color:#34d399;font-weight:700;}.footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5e7eb;padding-top:20px;}.footer p{font-size:8px;color:#aaa;}.seal{width:72px;height:72px;border:3px solid #E66E38;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;color:#E66E38;font-weight:900;text-align:center;letter-spacing:0.05em;text-transform:uppercase;}</style></head><body>');
    printWin.document.write('<div class="hdr"><div><div class="brand">SENIM</div><div class="brand-sub">Platform · Ресми Шот-Фактура</div></div><div class="inv-title"><h1>INVOICE</h1><p>' + id + '</p><p style="margin-top:4px;font-size:11px;color:#E66E38;">' + date + '</p></div></div>');
    printWin.document.write('<div class="meta-grid"><div class="meta-block"><h4>Орындаушы</h4><p>' + escHtml(userName) + '<br>ЖК · SENIM Verified Freelancer<br>Merit Level 2 · ID: SNM-USR-8821</p></div><div class="meta-block"><h4>Тапсырыс беруші</h4><p>SENIM Platform B2B<br>ҚР, Алматы қ., Абай д-лы 150А<br>БСН: 201840023881</p></div></div>');
    printWin.document.write('<table><thead><tr><th>Қызмет / Жоба</th><th style="text-align:right;">Жалпы сома</th><th style="text-align:right;">Салық (4%)</th><th style="text-align:right;">Таза табыс</th></tr></thead><tbody><tr><td>' + escHtml(project) + '</td><td class="right">' + amount.toLocaleString('ru-KZ') + ' ₸</td><td class="right orange">' + tax.toLocaleString('ru-KZ') + ' ₸</td><td class="right green">' + net.toLocaleString('ru-KZ') + ' ₸</td></tr></tbody></table>');
    printWin.document.write('<div class="sum-box"><div class="sum-row"><span style="color:#666;">Жалпы сома:</span><span style="font-weight:700;">' + amount.toLocaleString('ru-KZ') + ' ₸</span></div><div class="sum-row"><span style="color:#666;">Салық, платформа ұстаған (4%):</span><span class="orange">- ' + tax.toLocaleString('ru-KZ') + ' ₸</span></div><div class="sum-row"><span style="color:#666;">Таза төлем:</span><span class="green">' + net.toLocaleString('ru-KZ') + ' ₸</span></div></div>');
    printWin.document.write('<div class="comp"><strong>Заңды сәйкестік:</strong> ' + compliance + '<br>Осы шот-фактура ҚР Еңбек Кодексінің 31-бабына және «Электронды құжат және электронды цифрлық қолтаңба туралы» Заңының талаптарына толық сәйкес келеді. Платформа комиссиясы SENIM Smart Escrow Engine арқылы автоматты түрде есептелген.</div>');
    printWin.document.write('<div class="tx-box"><p>Транзакция ID: <span>' + txHash + '</span></p><p>Gateway: <span>SENIM Escrow Smart Contract v3.1 · Halyk OpenAPI</span></p><p>Status: <span>SETTLED · VERIFIED</span></p><p>Timestamp: <span>' + new Date().toISOString() + '</span></p></div>');
    printWin.document.write('<div class="footer"><div><p>SENIM Platform · senim.kz</p><p style="margin-top:4px;">© 2026 SENIM · Барлық транзакциялар шифрланған</p></div><div class="seal">SENIM<br>VERIFIED<br>✓</div></div>');
    printWin.document.write('<script>window.onload=function(){window.print();};<\/script></body></html>');
    printWin.document.close();
}

function downloadAllInvoicesPDF() {
    var total = INVOICE_LEDGER_DATA.reduce(function(s,i){ return s+i.amount; }, 0);
    var net   = INVOICE_LEDGER_DATA.reduce(function(s,i){ return s+i.net;    }, 0);
    alert('[SENIM LEDGER EXPORT]\n\n📄 ' + INVOICE_LEDGER_DATA.length + ' шот-фактура жүктелуде...\nЖалпы сома: ' + total.toLocaleString('ru-KZ') + ' ₸\nТаза табыс: ' + net.toLocaleString('ru-KZ') + ' ₸\n\nҚР Еңбек Кодексінің 31-бабына сәйкес архивталған.\nSENIM Legal Ledger Engine v3.1');
}

// ─────────────────────────────────────────────────────────────────────
// STYLES INJECTION
// ─────────────────────────────────────────────────────────────────────
function injectEnterpriseStyles() {
    var s = document.createElement('style');
    s.id  = 'enterprise-styles';
    s.textContent = [
        '@keyframes fadeSlideIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}',
        '#escrow-submission-zone{animation:fadeSlideIn 0.35s cubic-bezier(0.4,0,0.2,1) forwards;}',
        '.svg-data-point{transition:r 0.18s ease;}',
        '#invoice-ledger-body{transition:max-height 0.45s cubic-bezier(0.4,0,0.2,1),opacity 0.35s ease;}',
        '#svg-analytics-panel{animation:fadeSlideIn 0.5s ease forwards;}'
    ].join('');
    document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────────────
// FINANCIAL STATE DOM BINDING
// ─────────────────────────────────────────────────────────────────────
function bindFinancialStateToDom() {
    var balanceGrid = document.querySelector('#overview .grid');
    if (!balanceGrid) return;
    var cards = balanceGrid.querySelectorAll(':scope > div');
    if (cards.length < 3) return;

    var escrowEl    = cards[0].querySelector('p.text-2xl');
    var availableEl = cards[1].querySelector('p.text-2xl');
    var monthlyEl   = cards[2].querySelector('p.text-2xl');

    if (escrowEl)    { escrowEl.id    = 'state-escrow-value';    SENIM_FINANCIAL_STATE.subscribe('escrow',       escrowEl,    function(v){ return v.toLocaleString('ru-KZ') + ' ₸'; }); }
    if (availableEl) { availableEl.id = 'state-available-value'; SENIM_FINANCIAL_STATE.subscribe('available',    availableEl, function(v){ return v.toLocaleString('ru-KZ') + ' ₸'; }); }
    if (monthlyEl)   { monthlyEl.id   = 'state-monthly-value';   SENIM_FINANCIAL_STATE.subscribe('monthlyIncome', monthlyEl, function(v){ return v.toLocaleString('ru-KZ') + ' ₸'; }); }
}

// ─────────────────────────────────────────────────────────────────────
// ENTERPRISE BOOT
// ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    injectEnterpriseStyles();
    bindFinancialStateToDom();
    injectEscrowSubmissionZone();
    initAntifraudSentinel();
    injectSVGAnalyticsPanel();
    injectInvoiceLedger();

    console.log('%c[SENIM ENTERPRISE ENGINE v3.0]%c\n ▸ Reactive State Controller    [ACTIVE]\n ▸ Escrow Audit Mechanism       [ACTIVE]\n ▸ Anti-Fraud Sentinel Core     [ACTIVE]\n ▸ SVG Analytics Panel          [ACTIVE]\n ▸ B2B Invoice Ledger           [ACTIVE]\n',
        'color:#E66E38;font-weight:900;font-size:12px;',
        'color:#94a3b8;font-size:11px;'
    );
});
