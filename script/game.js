/**
 * @file game.js
 * @description ניהול 6 רמות משחק, טיימר, אפקטים קוליים ותורות.
 * עודכן ללוגיקת צוללות ארוכות (שלבים 1+2).
 */

/** * @type {Object} הגדרות המשחק - שימוש באובייקט ליטרלי לפי הדרישות */
const gameSettings = {
    playerName: "אורח",
    currentLevel: 1,
    maxLevels: 6,
    gridSize: 6,
    attempts: 0,
    hits: 0,
    isComputerTurn: false,
    timerInterval: null,
    timeLeft: 60
};

/** * @type {Array<{locations: number[], hits: number, size: number, sunk: boolean}>} 
 * מערך אובייקטים המייצג את הצי - שלב 1: מבנה נתונים מורכב
 */
let ships = [];

/** * אובייקט סאונד */
const gameSounds = {
    fire: new Audio('../sound/fire.mp3.wav'),
    hit: new Audio('../sound/explosion.mp3.mp3'),
    miss: new Audio('../sound/miss.mp3')
};

/**
 * פונקציית עזר להפעלת סאונד (Arrow Function)
 * @param {HTMLAudioElement} audio 
 */
const playEffect = (audio) => {
    audio.currentTime = 0;
    audio.play().catch(() => console.log("Sound blocked by browser"));
};

/**
 * מנהלת את הטיימר - פועל רק מרמה 3 ומעלה
 */
const startTimer = () => {
    clearInterval(gameSettings.timerInterval);
    const timerArea = document.querySelector('#timer-display');
    const timerText = document.querySelector('#time-left');

    if (gameSettings.currentLevel >= 3) {
        timerArea.style.display = 'block';
        gameSettings.timeLeft = 60 - ((gameSettings.currentLevel - 3) * 10);
        timerText.textContent = gameSettings.timeLeft;

        gameSettings.timerInterval = setInterval(() => {
            gameSettings.timeLeft--;
            timerText.textContent = gameSettings.timeLeft;

            if (gameSettings.timeLeft <= 0) {
                clearInterval(gameSettings.timerInterval);
                showLevelFailure();
            }
        }, 1000);
    } else {
        timerArea.style.display = 'none';
    }
};

/**
 * שלב 2: פונקציית עזר לבדיקה אם מיקום פנוי וחוקי להצבת צוללת
 * שימוש ב-some ו-includes (HOF) לפי הדרישות
 * @param {number} startIndex 
 * @param {number} size 
 * @param {boolean} isHorizontal 
 * @returns {boolean}
 */
const canPlaceShip = (startIndex, size, isHorizontal) => {
    const { gridSize } = gameSettings;
    const row = Math.floor(startIndex / gridSize);

    for (let i = 0; i < size; i++) {
        let currentIndex = isHorizontal ? startIndex + i : startIndex + (i * gridSize);
        const currentRow = Math.floor(currentIndex / gridSize);

        // בדיקה שלא חורג מהשורה (באופקי) או מהלוח
        if (isHorizontal && currentRow !== row) return false;
        if (currentIndex >= gridSize * gridSize) return false;

        // בדיקה שהמשבצת לא תפוסה כבר
        if (ships.some(ship => ship.locations.includes(currentIndex))) return false;
    }
    return true;
};

/**
 * שלב 2: הגרלת צוללות ארוכות (גדלים 2-5)
 * שימוש ב-forEach לפי הדרישות
 */
const placeShips = () => {
    ships = []; 
    const fleet = gameSettings.currentLevel === 1 ? [3, 2, 2] : [5, 4, 3, 3, 2];
    
    fleet.forEach(size => {
        let placed = false;
        while (!placed) {
            const isHorizontal = Math.random() < 0.5;
            const startIndex = Math.floor(Math.random() * (gameSettings.gridSize * gameSettings.gridSize));

            if (canPlaceShip(startIndex, size, isHorizontal)) {
                const locations = [];
                for (let i = 0; i < size; i++) {
                    locations.push(isHorizontal ? startIndex + i : startIndex + (i * gameSettings.gridSize));
                }
                ships.push({ locations, hits: 0, size, sunk: false });
                placed = true;
            }
        }
    });
    console.log("הצי הוצב:", ships);
};

/**
 * יצירת לוח המשחק דרך ה-DOM (createElement)
 */
const createBoard = () => {
    const board = document.querySelector('#board');
    if (!board) return;

    board.innerHTML = "";
    board.style.display = "grid";
    board.style.gridTemplateColumns = `repeat(${gameSettings.gridSize}, 48px)`;

    for (let i = 0; i < gameSettings.gridSize * gameSettings.gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(cell));
        board.appendChild(cell);
    }
};

/**
 * טיפול בלחיצה על משבצת
 * שימוש ב-find (HOF) כדי לזהות צוללת
 */
const handleCellClick = (cell) => {
    if (gameSettings.isComputerTurn || cell.classList.contains('hit') || cell.classList.contains('miss')) return;

    const clickedIndex = parseInt(cell.dataset.index);
    gameSettings.attempts++;
    document.querySelector('#current-score').textContent = `ניסיונות: ${gameSettings.attempts}`;

    // חיפוש הצוללת שנפגעה
    const hitShip = ships.find(ship => ship.locations.includes(clickedIndex));

    if (hitShip) {
        playEffect(gameSounds.fire);
        cell.classList.add('hit');
        setTimeout(() => playEffect(gameSounds.hit), 200);
        
        gameSettings.hits++;
        
        // בדיקת ניצחון (סך כל הפגיעות מול סך כל גדלי הצוללות)
        const totalShipCells = ships.reduce((sum, s) => sum + s.size, 0);
        if (gameSettings.hits === totalShipCells) {
            clearInterval(gameSettings.timerInterval);
            setTimeout(handleWin, 500);
        }
    } else {
        cell.classList.add('miss');
        playEffect(gameSounds.miss);
        startComputerTurn();
    }
};

/**
 * הודעת כישלון בזמן
 */
const showLevelFailure = () => {
    const overlay = document.querySelector('#game-win-overlay');
    const title = document.querySelector('#win-title');
    const stats = document.querySelector('#win-stats');
    const nextBtn = document.querySelector('#btn-next-level');

    title.textContent = "נגמר הזמן!";
    stats.innerHTML = `לא הצלחת לסיים את שלב ${gameSettings.currentLevel}.`;
    nextBtn.textContent = "נסה שוב";
    overlay.style.display = 'flex';

    nextBtn.onclick = () => {
        overlay.style.display = 'none';
        resetLevel();
    };
};

const resetLevel = () => {
    gameSettings.attempts = 0;
    gameSettings.hits = 0;
    placeShips();
    createBoard();
    startTimer();
};

/**
 * תור מחשב (חסימת לוח)
 */
const startComputerTurn = () => {
    gameSettings.isComputerTurn = true;
    const board = document.querySelector('#board');
    board.style.opacity = "0.5";
    setTimeout(() => {
        gameSettings.isComputerTurn = false;
        board.style.opacity = "1";
    }, 1200);
};

/**
 * ניהול הניצחון
 */
const handleWin = () => {
    const overlay = document.querySelector('#game-win-overlay');
    const title = document.querySelector('#win-title');
    const stats = document.querySelector('#win-stats');
    const nextBtn = document.querySelector('#btn-next-level');

    title.textContent = "ניצחון!";
    stats.textContent = `שלב ${gameSettings.currentLevel} הושלם ב-${gameSettings.attempts} ניסיונות!`;
    overlay.style.display = 'flex';

    nextBtn.onclick = () => {
        if (gameSettings.currentLevel < gameSettings.maxLevels) {
            gameSettings.currentLevel++;
            gameSettings.gridSize = 10; // הגדלת לוח מרמה 2
            overlay.style.display = 'none';
            resetLevel();
        } else {
            alert("ניצחת את כל המשחק!");
            window.location.href = 'leaderboard.html';
        }
    };
    saveScore();
};

const saveScore = () => {
    const scoreData = {
        name: gameSettings.playerName,
        attempts: gameSettings.attempts,
        level: gameSettings.currentLevel,
        date: new Date().toLocaleDateString()
    };
    let scores = JSON.parse(localStorage.getItem('battleship_highscores')) || [];
    scores.push(scoreData);
    localStorage.setItem('battleship_highscores', JSON.stringify(scores));
};

const initGame = () => {
    const data = JSON.parse(localStorage.getItem('battleship_player'));
    if (data) {
        gameSettings.playerName = data.name;
        document.querySelector('#current-player-name').textContent = data.name;
    }
    resetLevel();
};

window.addEventListener('DOMContentLoaded', initGame);