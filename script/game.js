/**
 * @file game.js
 * @description ניהול משחק צוללות מתוקן: מניעת "דריסת" צוללות ע"י איקסים אוטומטיים.
 * עומד בדרישות פרויקט סמינר מאיר תשפ"ו.
 */

/** * @type {Object} 
 * אובייקט הגדרות המשחק - ריכוז משתנים גלובליים (דרישה 81).
 */
const gameSettings = {
    playerName: "אורח",
    currentLevel: 1,
    maxLevels: 6,
    gridSize: 6,
    attempts: 0,
    hits: 0,
    totalShipCells: 0, 
    isComputerTurn: false,
    timerInterval: null,
    timeLeft: 60
};

/** @type {Array<Object>} מערך אובייקטים המייצג את צי הצוללות. */
let ships = [];

/** @type {Object} אובייקט המרכז את קבצי האודיו (דרישה 41). */
const gameSounds = {
    fire: new Audio('../sound/fire.mp3.wav'),
    hit: new Audio('../sound/explosion.mp3.mp3'),
    miss: new Audio('../sound/miss.mp3')
};

/**
 * מפעילה אפקט קולי.
 * @param {HTMLAudioElement} audio - אובייקט הסאונד לניגון.
 */
const playEffect = (audio) => {
    audio.currentTime = 0;
    audio.play().catch(() => console.log("Sound blocked by browser"));
};

/**
 * מנהלת את שעון המשחק (דרישה 28). פועלת מרמה 3 ומעלה.
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
 * בודקת תקינות מיקום צוללת בלוח.
 */
const canPlaceShip = (startIndex, size, isHorizontal) => {
    const { gridSize } = gameSettings;
    const row = Math.floor(startIndex / gridSize);

    for (let i = 0; i < size; i++) {
        let currentIndex = isHorizontal ? startIndex + i : startIndex + (i * gridSize);
        const currentRow = Math.floor(currentIndex / gridSize);

        if (isHorizontal && currentRow !== row) return false;
        if (currentIndex >= gridSize * gridSize) return false;
        if (ships.some(ship => ship.locations.includes(currentIndex))) return false;
    }
    return true;
};

/**
 * מגרילה מיקומים לצי הצוללות ומחשבת את סך המשבצות לניצחון.
 */
const placeShips = () => {
    ships = []; 
    gameSettings.totalShipCells = 0; 
    
    // קביעת הצי לפי הרמה (דרישה 88)
    const fleet = Number(gameSettings.currentLevel) === 1 ? [3, 2, 2] : [5, 4, 3, 3, 2];
    
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
                
                gameSettings.totalShipCells += size; 
                placed = true;
            }
        }
    });
};

/**
 * מייצרת את הריבועים של הלוח ב-DOM (דרישה 18, 79).
 */
const createBoard = () => {
    const board = document.querySelector('#board');
    if (!board) return;

    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }

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
 * מטפלת בלחיצה על משבצת ובדיקת ניצחון. (תיקון: בדיקת ניצחון מדויקת)
 */
const handleCellClick = (cell) => {
    if (gameSettings.isComputerTurn || cell.classList.contains('hit') || cell.classList.contains('miss')) return;

    const clickedIndex = parseInt(cell.dataset.index);
    const hitShip = ships.find(ship => ship.locations.includes(clickedIndex));

    gameSettings.attempts++;
    document.querySelector('#current-score').textContent = `ניסיונות: ${gameSettings.attempts}`;

    if (hitShip) {
        playEffect(gameSounds.fire);
        cell.classList.add('hit');
        hitShip.hits++; 
        gameSettings.hits++; 
        
        // בדיקת ניצחון (דרישה 61)
        if (gameSettings.hits >= gameSettings.totalShipCells) {
            clearInterval(gameSettings.timerInterval);
            setTimeout(handleWin, 500);
            return;
        }

        if (hitShip.hits === hitShip.size) {
            hitShip.sunk = true;
            playEffect(gameSounds.hit);
            markSurroundingCells(hitShip); // קריאה לפונקציה המתוקנת
        }
    } else {
        cell.classList.add('miss');
        playEffect(gameSounds.miss);
        startComputerTurn();
    }
};

/**
 * מסמנת משבצות מסביב לצוללת שהוטבעה (תיקון: בדיקה שאין צוללת אחרת במשבצת).
 */
const markSurroundingCells = (ship) => {
    const { gridSize } = gameSettings;
    const allCells = document.querySelectorAll('.cell');

    ship.locations.forEach(index => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                    const neighborIndex = r * gridSize + c;
                    const neighborCell = allCells[neighborIndex];
                    
                    // בדיקה קריטית: האם המשבצת הזו שייכת לצוללת כלשהי אחרת?
                    const isAnyShipThere = ships.some(s => s.locations.includes(neighborIndex));

                    if (!isAnyShipThere && 
                        !neighborCell.classList.contains('hit') && 
                        !neighborCell.classList.contains('miss')) {
                        neighborCell.classList.add('miss');
                    }
                }
            }
        }
    });
};

/**
 * מציגה מסך כישלון.
 */
const showLevelFailure = () => {
    const overlay = document.querySelector('#game-win-overlay');
    const title = document.querySelector('#win-title');
    const stats = document.querySelector('#win-stats');
    const nextBtn = document.querySelector('#btn-next-level');

    title.textContent = "נגמר הזמן!";
    stats.textContent = `לא הצלחת לסיים את שלב ${gameSettings.currentLevel}.`;
    nextBtn.textContent = "נסה שוב";
    overlay.style.display = 'flex';

    nextBtn.onclick = () => {
        overlay.style.display = 'none';
        resetLevel();
    };
};

/**
 * מאפסת את השלב ומעדכנת גודל לוח.
 */
const resetLevel = () => {
    gameSettings.attempts = 0;
    gameSettings.hits = 0;
    gameSettings.totalShipCells = 0; 
    
    gameSettings.gridSize = Number(gameSettings.currentLevel) === 1 ? 6 : 10;
    
    document.querySelector('#current-score').textContent = `ניסיונות: 0`;
    document.querySelector('#game-win-overlay').style.display = 'none'; 

    placeShips();
    createBoard();
    startTimer();
};

/**
 * מדמה תור מחשב.
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
 * ניהול מסך ניצחון ומעבר שלב (דרישה 92, 93).
 */
const handleWin = () => {
    const overlay = document.querySelector('#game-win-overlay');
    const title = document.querySelector('#win-title');
    const stats = document.querySelector('#win-stats');
    const nextBtn = document.querySelector('#btn-next-level');

    if (overlay && title && stats) {
        title.textContent = "ניצחון!";
        stats.textContent = `שלב ${gameSettings.currentLevel} הושלם ב-${gameSettings.attempts} ניסיונות!`;
        overlay.style.display = 'flex';
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            if (gameSettings.currentLevel < gameSettings.maxLevels) {
                gameSettings.currentLevel++;
                overlay.style.display = 'none';
                resetLevel();
            } else {
                window.location.href = 'leaderboard.html';
            }
        };
    }
    saveScore();
};

/**
 * שומרת תוצאה ב-localStorage (דרישה 30).
 */
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

/**
 * מאתחלת את המשחק.
 */
const initGame = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const levelFromUrl = urlParams.get('level'); 

    const data = JSON.parse(localStorage.getItem('battleship_player'));
    
    if (data) {
        gameSettings.playerName = data.name;
        document.querySelector('#current-player-name').textContent = data.name;
        
        if (levelFromUrl === 'hard' || data.level === '2') {
            gameSettings.currentLevel = 2;
        } else {
            gameSettings.currentLevel = 1;
        }
    }
    
    resetLevel(); 
};

window.addEventListener('DOMContentLoaded', initGame);
