// =====================================================================
// SENIM Platform — app.js
// Full-Stack Reactive Engine:
//   • Screen 2 Bento Box modals (Legal, Merit, AI Console)
//   • Screen 3 Registration + Kernel Boot Animation + LocalStorage
//   • Window redirect to dashboard.html after boot sequence
// =====================================================================

// ─────────────────────────────────────────────────────────────────────
// STATIC DATA STORES
// ─────────────────────────────────────────────────────────────────────
const MOCK_SKILL_DATA = {
    "Web Dev": {
        desc: "Веб-қосымшалар мен сайттарды құру, HTML/CSS және заманауи фреймворктермен жұмыс істеу дағдысы.",
        users: [
            { name: "Әлішер Сәбит",  level: "Level 3", jobs: 34, initials: "ӘС" },
            { name: "Мадина Нұрлан", level: "Level 2", jobs: 18, initials: "МН" },
            { name: "Темірлан Бек",  level: "Level 1", jobs: 4,  initials: "ТБ" }
        ]
    },
    "Python": {
        desc: "Деректерді талдау, скрипттер жазу және backend логикасын құруға арналған әмбебап бағдарламалау тілі.",
        users: [
            { name: "Санжар Болат", level: "Level 3", jobs: 41, initials: "СБ" },
            { name: "Айгерім Серік", level: "Level 2", jobs: 22, initials: "АС" },
            { name: "Расул Марат",  level: "Level 1", jobs: 7,  initials: "РМ" }
        ]
    },
    "React": {
        desc: "Пайдаланушы интерфейстерін (UI) жасауға арналған ең танымал JavaScript кітапханасы.",
        users: [
            { name: "Данияр Қанат",   level: "Level 3", jobs: 29, initials: "ДҚ" },
            { name: "Аружан Данияр", level: "Level 2", jobs: 15, initials: "АД" },
            { name: "Диас Марат",    level: "Level 1", jobs: 3,  initials: "ДМ" }
        ]
    },
    "AI & ML": {
        desc: "Жасанды интеллект модельдерін оқыту және машиналық үйрену алгоритмдерін енгізу.",
        users: [
            { name: "Нұрсұлтан Әлі", level: "Level 3", jobs: 45, initials: "НӘ" },
            { name: "Зарина Бақыт",  level: "Level 2", jobs: 20, initials: "ЗБ" },
            { name: "Арсен Дос",     level: "Level 1", jobs: 6,  initials: "АД" }
        ]
    },
    "Figma": {
        desc: "Интерактивті прототиптер мен UI/UX дизайндарды бірлесіп жасауға арналған кәсіби құрал.",
        users: [
            { name: "Камила Асан",   level: "Level 3", jobs: 52, initials: "КА" },
            { name: "Әділет Жолдас", level: "Level 2", jobs: 25, initials: "ӘЖ" },
            { name: "Аяна Берік",    level: "Level 1", jobs: 9,  initials: "АБ" }
        ]
    },
    "Blender": {
        desc: "3D модельдеу, анимация және визуалды эффектілерді жасауға арналған ашық бағдарламалық құрал.",
        users: [
            { name: "Илияс Темір",  level: "Level 3", jobs: 38, initials: "ИТ" },
            { name: "Томирис Мұрат", level: "Level 2", jobs: 17, initials: "ТМ" },
            { name: "Мирас Серік",  level: "Level 1", jobs: 5,  initials: "МС" }
        ]
    },
    "SMM": {
        desc: "Әлеуметтік желілерде брендті дамыту, контент жоспарын құру және аудиториямен жұмыс.",
        users: [
            { name: "Аружан Талғат", level: "Level 3", jobs: 49, initials: "АТ" },
            { name: "Бекзат Нұр",   level: "Level 2", jobs: 31, initials: "БН" },
            { name: "Диана Али",     level: "Level 1", jobs: 11, initials: "ДА" }
        ]
    },
    "Таргет": {
        desc: "Әлеуметтік желілерде мақсатты аудиторияға бағытталған жарнамалық науқандарды баптау.",
        users: [
            { name: "Ерасыл Болат",  level: "Level 3", jobs: 36, initials: "ЕБ" },
            { name: "Нұрайым Керей", level: "Level 2", jobs: 14, initials: "НК" },
            { name: "Марлен Самат",  level: "Level 1", jobs: 2,  initials: "МС" }
        ]
    }
};

const MOCK_MERIT_DATA = {
    1: {
        checks: [
            "AI Proficiency Test: 94% Score Verified",
            "Basic Digital Security Checklist: PASSED",
            "Biometric Identity Status: SECURE"
        ],
        tasks: [
            "Мәтін аудармасы және транскрипция (25,000 ₸-ге дейін)",
            "Әлеуметтік желі мазмұнын тазалау (15,000 ₸-ге дейін)"
        ]
    },
    2: {
        checks: [
            "Client Satisfaction Score: 4.9 / 5.0",
            "Technical Figma Design Review: VERIFIED",
            "Biometric Identity Status: SECURE"
        ],
        tasks: [
            "UI/UX Интерфейс жүйелерін құру (150,000 ₸-ге дейін)",
            "Жоғары сапалы видеомонтаж жасау (100,000 ₸-ге дейін)"
        ]
    },
    3: {
        checks: [
            "Live System Design Assessment: 98% Score Verified",
            "Legal Tax Micro-ledger Audit: COMPLIANT",
            "Biometric Identity Status: SECURE"
        ],
        tasks: [
            "Enterprise Full-stack SaaS Development (500,000 ₸-ге дейін)",
            "Дерекқор архитектурасын масштабтау (350,000 ₸-ге дейін)"
        ]
    }
};

// ─────────────────────────────────────────────────────────────────────
// UTILITY: Generic modal open / close
// ─────────────────────────────────────────────────────────────────────
function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
            const panel = modal.querySelector('.glass-panel');
            if (panel) {
                panel.classList.remove('scale-95');
                panel.classList.add('scale-100');
            }
        });
    });
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    const panel = modal.querySelector('.glass-panel');
    if (panel) {
        panel.classList.remove('scale-100');
        panel.classList.add('scale-95');
    }
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 300);
}

// ─────────────────────────────────────────────────────────────────────
// BOOT: DOMContentLoaded
// ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // ── 1. AGE GATE: show/hide parental consent SMS panel ────────────
    const ageInput  = document.getElementById('youth-age-gate');
    const smsModule = document.getElementById('parental-sms-module');

    if (ageInput && smsModule) {
        ageInput.addEventListener('input', (e) => {
            const age = parseInt(e.target.value, 10);
            if (age >= 14 && age <= 17) {
                smsModule.classList.remove('hidden');
                setTimeout(() => {
                    smsModule.classList.remove('opacity-0', 'translate-y-2');
                    smsModule.classList.add('opacity-100', 'translate-y-0');
                }, 10);
            } else {
                smsModule.classList.remove('opacity-100', 'translate-y-0');
                smsModule.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => smsModule.classList.add('hidden'), 500);
            }
        });
    }

    // ── 2. BENTO BOX 1: Skill pill modals ────────────────────────────
    const skillModal      = document.getElementById('skill-modal');
    const skillModalBody  = document.getElementById('skill-modal-body');
    const skillModalClose = document.getElementById('skill-modal-close');

    document.querySelectorAll('.micro-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const skillName = pill.textContent.trim();
            const data = MOCK_SKILL_DATA[skillName] || {
                desc: `${skillName} дағдысы бойынша жұмыстар платформада белсенді дамып келеді.`,
                users: [
                    { name: "Ерасыл Аманжол", level: "Level 3", jobs: 42, initials: "ЕА" },
                    { name: "Аружан Серік",   level: "Level 2", jobs: 19, initials: "АС" },
                    { name: "Данияр Марат",   level: "Level 1", jobs: 5,  initials: "ДМ" }
                ]
            };

            let usersHtml = "";
            data.users.forEach(user => {
                usersHtml += `
                    <div class="bg-black/40 border border-slate-900 rounded-2xl p-4 flex items-center justify-between hover:border-matte-orange/40 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-matte-orange to-amber-500 flex items-center justify-center text-black font-bold font-mono text-sm">
                                ${user.initials}
                            </div>
                            <div>
                                <span class="font-bold text-white block text-sm">${user.name}</span>
                                <span class="text-[10px] px-2 py-0.5 rounded bg-matte-orange/10 text-matte-orange font-mono font-bold">${user.level}</span>
                            </div>
                        </div>
                        <div class="text-right text-xs font-mono">
                            <span class="text-slate-500 block">Орындалған жұмыс:</span>
                            <span class="text-white font-bold">${user.jobs}</span>
                        </div>
                    </div>`;
            });

            if (skillModalBody) {
                skillModalBody.innerHTML = `
                    <div>
                        <h3 class="text-xs font-mono text-matte-orange uppercase tracking-wider mb-1">Таңдалған дағды</h3>
                        <h4 class="text-2xl font-black font-mono text-white">${skillName}</h4>
                    </div>
                    <p class="text-slate-400 text-sm leading-relaxed">${data.desc}</p>
                    <div class="space-y-3">
                        <h5 class="text-xs font-mono text-slate-500 uppercase tracking-wider">Осы дағдыны меңгерген белсенді жас мамандар</h5>
                        <div class="grid grid-cols-1 gap-3">${usersHtml}</div>
                    </div>`;
            }
            openModal(skillModal);
        });
    });

    if (skillModalClose) skillModalClose.addEventListener('click', () => closeModal(skillModal));

    // ── 3. BENTO BOX 2: Legal telemetry modals ───────────────────────
    const legalModal      = document.getElementById('legal-telemetry-modal');
    const legalModalBody  = document.getElementById('legal-modal-body');
    const legalModalClose = document.getElementById('legal-modal-close');
    const clickJunior     = document.getElementById('click-junior');
    const clickPro        = document.getElementById('click-pro');

    if (clickJunior) {
        clickJunior.addEventListener('click', () => {
            if (legalModalBody) {
                legalModalBody.innerHTML = `
                    <div>
                        <h3 class="text-xs font-mono text-matte-orange uppercase tracking-wider mb-1">СМАРТ-КЕЛІСІМШАРТ ТЕЛЕМЕТРИЯСЫ</h3>
                        <h4 class="text-2xl font-black font-mono text-white">SENIM Junior (14–17)</h4>
                    </div>
                    <p class="text-slate-400 text-xs leading-relaxed">
                        ҚР Еңбек Кодексінің 31-бабына сәйкес, кәмелетке толмаған жасөспірімдердің жұмыс уақыты мен жағдайы ата-ана келісімі негізінде автоматты смарт-келісімшартпен толық қорғалады.
                    </p>
                    <div class="bg-black/70 p-5 rounded-xl border border-slate-800 text-xs font-mono space-y-1 overflow-x-auto">
                        <span class="text-emerald-400">{</span><br>
                        &nbsp;&nbsp;<span class="text-slate-400">"contract_id":</span>&nbsp;<span class="text-amber-300">"SNM-2026-JR"</span>,<br>
                        &nbsp;&nbsp;<span class="text-slate-400">"status":</span>&nbsp;<span class="text-matte-orange font-bold">"GUARDIAN_APPROVED"</span>,<br>
                        &nbsp;&nbsp;<span class="text-slate-400">"labor_code_compliance":</span>&nbsp;<span class="text-teal-300">"REPUBLIC_OF_KAZAKHSTAN_ART_31"</span>,<br>
                        &nbsp;&nbsp;<span class="text-slate-400">"restriction_layer":</span>&nbsp;<span class="text-cyan-300">"MAX_24_HOURS_WEEKLY"</span>,<br>
                        &nbsp;&nbsp;<span class="text-slate-400">"smart_escrow":</span>&nbsp;<span class="text-teal-300">"ACTIVE"</span><br>
                        <span class="text-emerald-400">}</span>
                    </div>`;
            }
            openModal(legalModal);
        });
    }

    if (clickPro) {
        clickPro.addEventListener('click', () => {
            if (legalModalBody) {
                legalModalBody.innerHTML = `
                    <div>
                        <h3 class="text-xs font-mono text-matte-orange uppercase tracking-wider mb-1">АВТОМАТТЫ САЛЫҚ ЕСЕПТЕУІШІ</h3>
                        <h4 class="text-2xl font-black font-mono text-white">SENIM Pro (18–22)</h4>
                    </div>
                    <label class="block text-xs font-mono text-slate-500">Табыс көлемін енгізіңіз (₸):</label>
                    <input type="number" id="tax-input-val" value="150000"
                           class="w-full bg-black/60 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-matte-orange transition-colors">
                    <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-900 font-mono text-xs">
                        <div>
                            <span class="text-slate-500 block">Жеке кәсіпкер салығы (1%):</span>
                            <span id="tax-result-val" class="text-matte-orange font-bold text-xl">1,500 ₸</span>
                        </div>
                        <div>
                            <span class="text-slate-500 block">Қолға тиетін таза табыс:</span>
                            <span id="net-result-val" class="text-white font-bold text-xl">148,500 ₸</span>
                        </div>
                    </div>`;
            }
            openModal(legalModal);

            const taxInput  = document.getElementById('tax-input-val');
            const taxResult = document.getElementById('tax-result-val');
            const netResult = document.getElementById('net-result-val');

            if (taxInput && taxResult && netResult) {
                taxInput.addEventListener('input', (e) => {
                    const val  = parseFloat(e.target.value) || 0;
                    const tax  = val * 0.01;
                    const net  = val - tax;
                    taxResult.innerText = `${tax.toLocaleString('ru-KZ', { maximumFractionDigits: 0 })} ₸`;
                    netResult.innerText = `${net.toLocaleString('ru-KZ', { maximumFractionDigits: 0 })} ₸`;
                });
            }
        });
    }

    if (legalModalClose) legalModalClose.addEventListener('click', () => closeModal(legalModal));

    // ── 4. BENTO BOX 3: Merit tracker modals ─────────────────────────
    const meritModal      = document.getElementById('merit-tracker-modal');
    const meritModalBody  = document.getElementById('merit-modal-body');
    const meritModalClose = document.getElementById('merit-modal-close');

    const handleMeritClick = (levelId) => {
        const data = MOCK_MERIT_DATA[levelId];
        let checklistHtml = "";
        data.checks.forEach(check => {
            checklistHtml += `
                <div class="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span class="text-emerald-400 font-bold">✓</span>
                    <span>${check}</span>
                </div>`;
        });

        let tasksHtml = "";
        data.tasks.forEach(task => {
            tasksHtml += `
                <div class="bg-matte-orange/5 border border-matte-orange/30 rounded-xl p-3 text-xs text-matte-orange font-bold font-mono">
                    🔓 ${task}
                </div>`;
        });

        if (meritModalBody) {
            meritModalBody.innerHTML = `
                <div>
                    <h3 class="text-xs font-mono text-matte-orange uppercase tracking-wider mb-1">ДЕҢГЕЙ АҚПАРАТЫ</h3>
                    <h4 class="text-2xl font-black font-mono text-white">Merit Level ${levelId}</h4>
                </div>
                <div class="space-y-3">
                    <h5 class="text-xs font-mono text-slate-500 uppercase tracking-wider">Криптографиялық тексеру тізімі</h5>
                    <div class="space-y-2 bg-black/40 rounded-xl p-4 border border-slate-900">${checklistHtml}</div>
                </div>
                <div class="space-y-3">
                    <h5 class="text-xs font-mono text-slate-500 uppercase tracking-wider">Қолжетімді премиум жобалар</h5>
                    <div class="grid grid-cols-1 gap-2">${tasksHtml}</div>
                </div>`;
        }
        openModal(meritModal);
    };

    const clickLvl1 = document.getElementById('click-lvl-1');
    const clickLvl2 = document.getElementById('click-lvl-2');
    const clickLvl3 = document.getElementById('click-lvl-3');

    if (clickLvl1) clickLvl1.addEventListener('click', () => handleMeritClick(1));
    if (clickLvl2) clickLvl2.addEventListener('click', () => handleMeritClick(2));
    if (clickLvl3) clickLvl3.addEventListener('click', () => handleMeritClick(3));

    if (meritModalClose) meritModalClose.addEventListener('click', () => closeModal(meritModal));

    // ── 5. BENTO BOX 4: AI Cyber-Sentinel console modals ─────────────
    const aiModal      = document.getElementById('ai-console-modal');
    const aiModalBody  = document.getElementById('ai-modal-body');
    const aiModalClose = document.getElementById('ai-modal-close');

    const handleAiClick = (mode) => {
        let streamHtml = "";
        if (mode === 'nlp') {
            streamHtml = `
                <div class="text-slate-500">&gt; [NLP-v3] Starting semantic hazard scanner...</div>
                <div class="text-slate-500">&gt; [NLP-v3] Loading physical-risk keyword corpus...</div>
                <div class="text-rose-400 font-bold">&gt; [BLOCKED] "қоймаға келіп жәшіктерді тасу керек" — offline physical risk pattern detected.</div>
                <div class="text-rose-400 font-bold">&gt; [ACTION]  Task quarantined. Client notified. Case ID: NLP-20260704-001.</div>
                <div class="text-emerald-400">&gt; [DONE]    Platform integrity score: 100%</div>`;
        } else if (mode === 'chat') {
            streamHtml = `
                <div class="text-slate-500">&gt; [SENTINEL-v1.8] Initializing active Escrow Chat Guard...</div>
                <div class="text-rose-400 font-bold">&gt; [INTERCEPT] Flagged phrase: <span class="bg-rose-900/60 px-1 rounded">"Kaspi-ге тікелей аударайық"</span></div>
                <div class="text-rose-400 font-bold">&gt; [INTERCEPT] Flagged phrase: <span class="bg-rose-900/60 px-1 rounded">"номеріңді бер"</span></div>
                <div class="text-amber-400 font-bold">&gt; [SHIELD]   External payment channel blocked. Message quarantined.</div>
                <div class="text-emerald-400">&gt; [ALERT]   Both parties notified. Phishing attempt neutralized.</div>`;
        } else {
            streamHtml = `
                <div class="text-slate-500">&gt; [AI-PILOT] Booting dual-mode mentor workspace...</div>
                <div class="text-teal-400">&gt; [READY]   AI Mentor online. Code review mode: ACTIVE.</div>
                <div class="text-slate-400">&gt; [SUGGEST] Use CSS Grid with auto-fit minmax for responsive layouts.</div>
                <div class="text-teal-400">&gt; [TIP]     Prefer semantic HTML5 elements over generic divs.</div>`;
        }

        if (aiModalBody) {
            aiModalBody.innerHTML = `
                <div>
                    <h3 class="text-xs font-mono text-matte-orange uppercase tracking-wider mb-1">ЖАУЫНГЕРЛІК СЕКЬЮРИТИ КОНСОЛЫ</h3>
                    <h4 class="text-2xl font-black font-mono text-white">AI Cyber Sentinel v2.6</h4>
                </div>
                <div class="bg-black/90 rounded-xl p-4 border border-slate-900 font-mono text-[11px] space-y-2 h-40 overflow-y-auto leading-relaxed">
                    ${streamHtml}
                </div>
                <div class="bg-matte-orange/10 border border-matte-orange/40 rounded-xl p-4 space-y-1">
                    <span class="text-matte-orange font-black text-xs block font-mono">[CRITICAL_SHIELD_ACTIVATED]</span>
                    <span class="text-white text-xs block">Unauthorized external payment channel intercepted. Phishing attempt neutralized successfully. Threat interception rate: <span class="text-emerald-400 font-bold">100%</span>.</span>
                </div>`;
        }
        openModal(aiModal);
    };

    const clickNlp       = document.getElementById('click-nlp');
    const clickChatGuard = document.getElementById('click-chat-guard');
    const clickCopilot   = document.getElementById('click-copilot');

    if (clickNlp)       clickNlp.addEventListener('click',       () => handleAiClick('nlp'));
    if (clickChatGuard) clickChatGuard.addEventListener('click', () => handleAiClick('chat'));
    if (clickCopilot)   clickCopilot.addEventListener('click',   () => handleAiClick('copilot'));

    if (aiModalClose) aiModalClose.addEventListener('click', () => closeModal(aiModal));

    // ── 6. CLOSE ALL MODALS ON BACKDROP CLICK ────────────────────────
    [skillModal, legalModal, meritModal, aiModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
        }
    });

    // ── 7. REGISTRATION TRANSITION & KERNEL BOOT SEQUENCE ────────────
    const onboardingBtn = document.getElementById('btn-submit-onboarding');

    if (onboardingBtn) {
        onboardingBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Capture the user's name from the youth form input
            const nameInputEl = document.getElementById('youth-name-input');
            const capturedName = (nameInputEl && nameInputEl.value.trim() !== '')
                ? nameInputEl.value.trim()
                : 'Жас Кәсіпкер';

            // Persist identity to localStorage
            localStorage.setItem('senim_user_name', capturedName);
            localStorage.setItem('senim_user_role', 'freelancer_youth');

            // Build full-screen terminal kernel overlay
            const terminalOverlay = document.createElement('div');
            terminalOverlay.id = 'kernel-boot-overlay';
            terminalOverlay.style.cssText = `
                position: fixed; inset: 0; z-index: 9999;
                background: #0B0B0C;
                display: flex; flex-direction: column;
                justify-content: center; align-items: center;
                opacity: 0; transition: opacity 0.4s ease;
                font-family: 'Courier New', Courier, monospace;
                padding: 2rem;
            `;
            terminalOverlay.innerHTML = `
                <div style="width: 100%; max-width: 640px;">
                    <div style="color: #E66E38; font-size: 0.65rem; letter-spacing: 0.2em; margin-bottom: 1rem; text-transform: uppercase;">
                        SENIM SECURE KERNEL — BOOT SEQUENCE v2.6.4
                    </div>
                    <div id="kernel-log-window" style="
                        background: rgba(0,0,0,0.7);
                        border: 1px solid #1e293b;
                        border-radius: 1rem;
                        padding: 1.5rem;
                        min-height: 220px;
                        overflow-y: auto;
                        font-size: 0.72rem;
                        line-height: 2;
                        color: #64748b;
                    "></div>
                </div>
            `;
            document.body.appendChild(terminalOverlay);

            // Fade overlay in
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    terminalOverlay.style.opacity = '1';
                });
            });

            const logWindow = document.getElementById('kernel-log-window');

            const kernelLogSteps = [
                { text: `[SECURE KERNEL]: Initializing Senim Encrypted Sandbox... [OK]`, color: '#94a3b8' },
                { text: `[LEDGER]: Allocating dynamic user escrow wallet address... [OK]`, color: '#E66E38' },
                { text: `[IDENTITY]: Binding user profile → "${capturedName}"... [LINKED]`, color: '#34d399' },
                { text: `[AI]: Vectorizing selected skills and analyzing demographics... DONE.`, color: '#38bdf8' },
                { text: `[ROUTING]: Compiling profile telemetry matrices... REDIRECTING.`, color: '#fbbf24' }
            ];

            let stepIndex = 0;

            const appendLog = () => {
                if (stepIndex < kernelLogSteps.length) {
                    const step = kernelLogSteps[stepIndex];
                    const logLine = document.createElement('div');
                    logLine.innerText = `> ${step.text}`;
                    logLine.style.color = step.color;
                    logWindow.appendChild(logLine);
                    logWindow.scrollTop = logWindow.scrollHeight;
                    stepIndex++;
                    setTimeout(appendLog, 520);
                } else {
                    // All logs done → redirect to dashboard
                    setTimeout(() => {
                        terminalOverlay.style.opacity = '0';
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 500);
                    }, 800);
                }
            };

            // Start logging after overlay is visible
            setTimeout(appendLog, 400);
        });
    }

}); // END DOMContentLoaded
