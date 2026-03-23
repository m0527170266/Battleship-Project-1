/**
 * @file game.js
 * @description שלב 1: אתחול נתונים והצגת פרטי שחקן
 */

// אובייקט ליטרלי לריכוז נתוני המשחק - דרישה חובה [cite: 81]
const gameSettings = {
    playerName: "",
    level: "easy",
    gridSize: 6,
    attempts: 0,
    hits: 0
};

/**
 * פונקציית חץ לאתחול המשחק בטעינת הדף [cite: 6]
 */
const initGame = () => {
    // 1. שליפת שם השחקן מה-localStorage 
    const savedData = JSON.parse(localStorage.getItem('battleship_player'));
    if (savedData) {
        gameSettings.playerName = savedData.name;
        // עדכון ה-DOM עם שם השחקן [cite: 22]
        document.querySelector('#current-player-name').textContent = gameSettings.playerName;
    }

    // 2. שליפת רמת הקושי מה-URL (Query Parameters) [cite: 31, 92]
    const urlParams = new URLSearchParams(window.location.search);
    gameSettings.level = urlParams.get('level') || 'easy';

    // 3. הגדרת גודל הלוח בהתאם לרמה [cite: 88]
    if (gameSettings.level === 'hard') {
        gameSettings.gridSize = 10;
    } else {
        gameSettings.gridSize = 6;
    }

    console.log(`המשחק הופעל עבור: ${gameSettings.playerName}, רמה: ${gameSettings.level}`);
};

// הפעלת פונקציית האתחול כשה-DOM מוכן [cite: 24]
window.addEventListener('DOMContentLoaded', initGame);