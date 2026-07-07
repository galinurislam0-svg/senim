// SENIM Skill-Based Merit Level System Data & Progression Logic

const MERIT_LEVELS = [
    {
        id: 1,
        title: "Starter (Деңгей 1)",
        pointsNeeded: 0,
        unlockedSkills: ["Мәтін аудармасы", "Транскрипция", "Деректер жинау"],
        testsRequired: ["Digital Literacy Test", "Basic Grammar Quiz"],
        retainerAccess: false
    },
    {
        id: 2,
        title: "Expert (Деңгей 2)",
        pointsNeeded: 100,
        unlockedSkills: ["Видеомонтаж", "UI/UX Дизайн", "3D Модельдеу"],
        testsRequired: ["Portfolio Inspection", "Intermediate Figma Assessment"],
        retainerAccess: true
    },
    {
        id: 3,
        title: "Elite Master (Деңгей 3)",
        pointsNeeded: 500,
        unlockedSkills: ["Full-stack әзірлеу", "SaaS Құру", "Дерекқор архитектурасы"],
        testsRequired: ["Live System Design Review", "Contract Management Standard"],
        retainerAccess: true
    }
];

class MeritSystem {
    constructor() {
        this.levels = MERIT_LEVELS;
    }

    /**
     * Determines user level based on accumulated points
     * @param {number} points Accumulated client points
     * @returns {object} Level metadata
     */
    getCurrentLevelInfo(points) {
        let activeLevel = this.levels[0];
        for (let lvl of this.levels) {
            if (points >= lvl.pointsNeeded) {
                activeLevel = lvl;
            }
        }
        return activeLevel;
    }
}

// Export module
window.MeritSystem = new MeritSystem();
