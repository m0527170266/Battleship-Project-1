/**
 * @file game.js
 * @description ניהול לוגיקת המשחק, יצירת לוח דינמי וטיפול בניצחון.
 */

/** @type {Object} אובייקט הגדרות המשחק */
const gameSettings = {
    playerName: "אורח",
    level: "easy",
    gridSize: 6,
    attempts: 0,
    hits: 0
};

/** @type {number[]} מערך מיקומי הצוללות הסודיות */
let shipLocations = [];

/**
 * מגרילה מיקומים לצוללות על פי רמת הקושי.
 * @returns {void}
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
    console.log("מיקומי הצוללות:", shipLocations); 
};

/**
 * יוצרת את לוח המשחק בתוך ה-DOM.
 * @returns {void}
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
 * מטפלת בלחיצה על משבצת בלוח.
 * @param {HTMLElement} cell - האלמנט שעליו נלחץ.
 */
const handleCellClick = (cell) => {
    if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

    const clickedIndex = parseInt(cell.dataset.index);
    gameSettings.attempts++;
    
    const scoreElement = document.querySelector('#current-score');
    if (scoreElement) scoreElement.textContent = `ניסיונות: ${gameSettings.attempts}`;

    if (shipLocations.includes(clickedIndex)) {
        cell.classList.add('hit');
        gameSettings.hits++;
        
        if (gameSettings.hits === shipLocations.length) {
            setTimeout(handleWin, 500); 
        }
    } else {
        cell.classList.add('miss');
    }
};

/**
 * מנהלת את תהליך הניצחון ומציגה את המודל המרכזי.
 * @returns {void}
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

    // שמירת תוצאה
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
 * מאתחלת את המשחק בטעינה.
 * @returns {void}
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