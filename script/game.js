/**
 * @file game.js
 * @description ניהול המשחק - אתחול נתונים ויצירת לוח דינמי
 */

// 1. אובייקט ליטרלי לריכוז נתוני המשחק (דרישה חובה) 
const gameSettings = {
    playerName: "אורח",
    level: "easy",
    gridSize: 6,
    attempts: 0,
    hits: 0
};

/**
 * 2. פונקציית חץ ליצירת לוח המשחק בתוך ה-DOM [cite: 234, 307]
 */
const createBoard = () => {
    const boardElement = document.querySelector('#board');
    if (!boardElement) return;

    // ניקוי הלוח למניעת כפילויות
    boardElement.innerHTML = "";

    // הגדרת מבנה ה-Grid לפי גודל הלוח שנקבע [cite: 246]
    boardElement.style.display = "grid";
    boardElement.style.gridTemplateColumns = `repeat(${gameSettings.gridSize}, 45px)`;

    // לולאה ליצירת המשבצות 
    for (let i = 0; i < gameSettings.gridSize * gameSettings.gridSize; i++) {
        const cell = document.createElement('div');
        
        cell.classList.add('cell'); // הוספת קלאס CSS [cite: 249]
        cell.dataset.index = i;      // שמירת אינדקס המשבצת [cite: 252]

        // הוספת אירוע לחיצה לכל משבצת [cite: 308]
        cell.addEventListener('click', () => handleCellClick(cell));

        boardElement.appendChild(cell);
    }
};

/**
 * 3. פונקציית חץ לאתחול נתוני המשחק בטעינה 
 */
const initGame = () => {
    // שליפת שם השחקן מה-localStorage [cite: 319]
    const savedData = JSON.parse(localStorage.getItem('battleship_player'));
    if (savedData && savedData.name) {
        gameSettings.playerName = savedData.name;
        document.querySelector('#current-player-name').textContent = gameSettings.playerName;
    }

    // שליפת רמת הקושי מה-URL [cite: 320]
    const urlParams = new URLSearchParams(window.location.search);
    gameSettings.level = urlParams.get('level') || 'easy';

    // קביעת גודל הלוח: 6 לרמה קלה, 10 לרמה קשה [cite: 326]
    gameSettings.gridSize = (gameSettings.level === 'hard') ? 10 : 6;

    // קריאה ליצירת הלוח
    createBoard();

    console.log(`משחק התחיל: ${gameSettings.playerName}, רמה: ${gameSettings.level}`);
};

/**
 * 4. טיפול בלחיצה על משבצת (לוגיקה בסיסית לשלב 2)
 */
const handleCellClick = (cell) => {
    // מניעת לחיצה חוזרת
    if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

    // עדכון ניסיונות באובייקט ובתצוגה [cite: 314]
    gameSettings.attempts++;
    document.querySelector('#current-score').textContent = `ניסיונות: ${gameSettings.attempts}`;
    
    // סימון זמני לבדיקה
    cell.classList.add('miss'); 
};

// הפעלת האתחול כשהדף מוכן [cite: 308]
window.addEventListener('DOMContentLoaded', initGame);