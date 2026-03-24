/**
 * @file game.js
 * @description ניהול לוגיקת משחק הצוללות: הגרלת מיקומים, אפקטים קוליים, תצוגת פגיעות וניהול תורות.
 * כולל שימוש ב-LocalStorage לשמירת נתונים ו-URLSearchParams לניהול רמות קושי.
 */

/** * @type {Object} 
 * @property {string} playerName - שם השחקן הנוכחי.
 * @property {string} level - רמת הקושי (easy/hard).
 * @property {number} gridSize - גודל הלוח (6 או 10).
 * @property {number} attempts - מספר הניסיונות שבוצעו.
 * @property {number} hits - מספר הפגיעות המוצלחות.
 * @property {boolean} isComputerTurn - האם כרגע תור המחשב (חוסם לחיצות שחקן).
 */
const gameSettings = {
    playerName: "אורח",
    level: "easy",
    gridSize: 6,
    attempts: 0,
    hits: 0,
    isComputerTurn: false 
};

/** * @type {number[]} 
 * מערך המכיל את האינדקסים של המשבצות בהן מוחבאות צוללות.
 */
let shipLocations = [];

/** * אובייקט המכיל את קבצי האודיו של המשחק.
 * נתיבים מותאמים לתיקיית SOUND.
 */
const gameSounds = {
    fire: new Audio('../sound/fire.mp3.wav'),
    hit: new Audio('../sound/explosion.mp3.mp3'),
    miss: new Audio('../sound/miss.mp3')
};

/**
 * מפעילה אפקט קולי.
 * @param {HTMLAudioElement} audio - אובייקט הסאונד להשמעה.
 */
const playEffect = (audio) => {
    audio.currentTime = 0; // אתחול הזמן כדי לאפשר השמעה רציפה בלחיצות מהירות
    audio.play().catch(() => console.log("Sound playback was blocked by browser."));
};

/**
 * מגרילה מיקומים לצוללות על פי רמת הקושי הנוכחית.
 * רמה קלה: 5 צוללות. רמה קשה: 10 צוללות.
 */
const placeShips = () => {
    shipLocations = [];
    const shipsToPlace = (gameSettings.level === 'hard') ? 10 : 5;
    
    while (shipLocations.length < shipsToPlace) {
        const randomPos = Math.floor(Math.random() * (gameSettings.gridSize * gameSettings.gridSize));
        if (!shipLocations.includes(randomPos)) {
            shipLocations.push(randomPos);
        }
    }
    console.log("Secret Ship Locations:", shipLocations); 
};

/**
 * יוצרת את לוח המשחק ב-DOM באופן דינמי.
 * מגדירה את מבנה הגריד (Grid) ומוסיפה מאזיני אירועים לכל משבצת.
 */
const createBoard = () => {
    const boardElement = document.querySelector('#board');
    if (!boardElement) return;

    boardElement.innerHTML = "";
    boardElement.style.display = "grid";
    boardElement.style.gridTemplateColumns = `repeat(${gameSettings.gridSize}, 48px)`;

    for (let i = 0; i < gameSettings.gridSize * gameSettings.gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(cell));
        boardElement.appendChild(cell);
    }
};

/**
 * מטפלת באירוע לחיצה על משבצת בלוח.
 * מבצעת בדיקת פגיעה/החטאה, מעדכנת תצוגה, משמיעה סאונד ומנהלת תורות.
 * @param {HTMLElement} cell - אלמנט המשבצת שנלחץ.
 */
const handleCellClick = (cell) => {
    if (gameSettings.isComputerTurn || cell.classList.contains('hit') || cell.classList.contains('miss')) return;

    const clickedIndex = parseInt(cell.dataset.index);
    gameSettings.attempts++;
    
    const scoreElement = document.querySelector('#current-score');
    if (scoreElement) scoreElement.textContent = `ניסיונות: ${gameSettings.attempts}`;

    if (shipLocations.includes(clickedIndex)) {
        // פגיעה: משמיעים ירייה ואז פיצוץ
        playEffect(gameSounds.fire); 
        cell.classList.add('hit'); 
        
        // השהייה קלה כדי לשמוע את הפיצוץ אחרי הירייה
        setTimeout(() => {
            playEffect(gameSounds.hit);
        }, 200);

        gameSettings.hits++;
        
        if (gameSettings.hits === shipLocations.length) {
            setTimeout(handleWin, 500); 
        }
    } else {
        // החטאה: משמיעים רק את צליל ההחטאה
        cell.classList.add('miss'); 
        playEffect(gameSounds.miss);
        startComputerTurn();
    }
};

/**
 * מדמה את תור המחשב על ידי חסימת הלוח לזמן מוגדר.
 * בסיום ההמתנה, השליטה חוזרת לשחקן.
 */
const startComputerTurn = () => {
    gameSettings.isComputerTurn = true;
    const board = document.querySelector('#board');
    if (board) board.style.opacity = "0.5"; 

    setTimeout(() => {
        gameSettings.isComputerTurn = false;
        if (board) board.style.opacity = "1";
    }, 1500); 
};

/**
 * מנהלת את סיום המשחק במצב ניצחון.
 * מציגה את מודל הניצחון, מעדכנת סטטיסטיקות ושומרת ב-LocalStorage.
 */
const handleWin = () => {
    const overlay = document.querySelector('#game-win-overlay');
    const statsText = document.querySelector('#win-stats');
    const nextBtn = document.querySelector('#btn-next-level');

    if (statsText) {
        statsText.innerHTML = `כל הכבוד <b>${gameSettings.playerName}</b>!<br>סיימת ב-${gameSettings.attempts} ניסיונות.`;
    }

    if (overlay) overlay.style.display = 'flex';

    if (nextBtn) {
        nextBtn.onclick = () => {
            const nextLevel = gameSettings.level === 'easy' ? 'hard' : 'hard';
            window.location.href = `game.html?level=${nextLevel}`;
        };
    }

    saveScore();
};

/**
 * שומרת את תוצאת המשחק הנוכחי בטבלת השיאים ב-LocalStorage.
 */
const saveScore = () => {
    const scoreData = {
        name: gameSettings.playerName,
        attempts: gameSettings.attempts,
        level: gameSettings.level,
        date: new Date().toLocaleDateString()
    };
    let scores = JSON.parse(localStorage.getItem('battleship_highscores')) || [];
    scores.push(scoreData);
    localStorage.setItem('battleship_highscores', JSON.stringify(scores));
};

/**
 * מאתחלת את המשחק: טוענת נתוני שחקן, מגדירה רמת קושי ויוצרת לוח.
 */
const initGame = () => {
    const savedData = JSON.parse(localStorage.getItem('battleship_player'));
    if (savedData && savedData.name) {
        gameSettings.playerName = savedData.name;
        const nameDisplay = document.querySelector('#current-player-name');
        if (nameDisplay) nameDisplay.textContent = gameSettings.playerName;
    }

    const urlParams = new URLSearchParams(window.location.search);
    gameSettings.level = urlParams.get('level') || 'easy';
    gameSettings.gridSize = (gameSettings.level === 'hard') ? 10 : 6;

    placeShips();
    createBoard();
};

window.addEventListener('DOMContentLoaded', initGame);