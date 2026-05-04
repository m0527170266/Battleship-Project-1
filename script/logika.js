/**
 * @file game.js
 * @description ניהול משחק צוללות: מניעת "דריסת" צוללות ע"י איקסים אוטומטיים.
 * פרויקט סמינר מאיר תשפ"ו
 */

/** * @type {Object} 
 * אובייקט הגדרות המשחק - ריכוז משתנים גלובליים
 */
const gameSettings = {
    playerName: "אורח",//גודל לוח
    currentLevel: 1,//סופר כמה פעמים ירינו
    maxLevels: 6,
    gridSize: 6,
    attempts: 0,
    hits: 0,
    totalShipCells: 0, 
    isComputerTurn: false,//מונע מהשחקן ללחוץ מיד אחרי החטאה
    timerInterval: null,
    timeLeft: 60//שניות שנותרו
};

/** @type {Array<Object>} מערך אובייקטים המייצג את צי הצוללות. */
let ships = [];

/** @type {Object} אובייקט המרכז את קבצי האודיו  */
const gameSounds = {
    fire: new Audio('../sound/fire.mp3.wav'),
    hit: new Audio('../sound/explosion.mp3.mp3'),
    miss: new Audio('../sound/miss.mp3')
};

/**
 * מפעילה אפקט קולי.
 * @param {HTMLAudioElement} audio - אובייקט הסאונד לניגון.
 * @description מאפסת את זמן הניגון להתחלה ומנסה לנגן את הקובץ.
 */
const playEffect = (audio) => {
    audio.currentTime = 0;// מאפס כל פעם את השמע שיתחיל מהתחלה
    audio.play().catch(() => console.log("Sound blocked by browser"));// מונע מהשמע להתחיל אם הדשחקן לא לחץ על הלוח
};

/**
 * מנהלת את שעון המשחק פועלת מרמה 3 ומעלה.
 * @description מגדירה טיימר הסופר לאחור ומעדכנת את התצוגה. במידה והזמן נגמר, מופעל מסך כישלון.
 */
const startTimer = () => {
    clearInterval(gameSettings.timerInterval);//לסדר שהתיימר הקודם יעצר ויתחיל חדש כל שלב
    const timerArea = document.querySelector('#timer-display');
    const timerText = document.querySelector('#time-left');//שניות שנותרו

    if (gameSettings.currentLevel >= 3) {
        timerArea.style.display = 'block';//ככה הטימר מופיע על המסך
        gameSettings.timeLeft = 60 - ((gameSettings.currentLevel - 3) * 10);//פה בודק איזה רמה וכל רמה מוריד 10 שניות
        timerText.textContent = gameSettings.timeLeft;

        /**
         * פונקציית שעון (Callback):
         * מופעלת על ידי setInterval פעם בכל 1000 מילישניות (שנייה אחת).
         * תפקידה: להוריד שנייה מהזמן שנותר, לעדכן את התצוגה למשתמש,
         * ולבדוק אם הזמן נגמר כדי להפסיק את המשחק.
         */
        gameSettings.timerInterval = setInterval(() => {
            gameSettings.timeLeft--;//מוריד 1 מהזמן
            timerText.textContent = gameSettings.timeLeft;

            if (gameSettings.timeLeft <= 0) {
                clearInterval(gameSettings.timerInterval);
                showLevelFailure();//אם נגמר הזמן פה מופעל הדף של הכישלון
            }
        }, 1000);
    } else {
        timerArea.style.display = 'none';//אם אנו ברמה 1 או 2 מונע מהטימר להופיע
    }
};

/**
 * בודקת תקינות מיקום צוללת בלוח.
 * @param {number} startIndex - אינדקס התחלה מבוקש.
 * @param {number} size - אורך הצוללת.
 * @param {boolean} isHorizontal - האם המיקום אופקי או אנכי.
 * @returns {boolean} אמת אם המיקום פנוי וחוקי, שקר אם יש חריגה מהלוח או התנגשות.
 */
const canPlaceShip = (startIndex, size, isHorizontal) => {
    const { gridSize } = gameSettings;//שליפת הערך גרידסיז
    const row = Math.floor(startIndex / gridSize);//חישוב באיזה שורה אני

    for (let i = 0; i < size; i++) {
        // כאן אנחנו מחשבים את המספר של כל משבצת שהצוללת תתפוס
       //אם היא אופקית (שוכבת): אנחנו פשוט מוסיפים 1 בכל פעם (+ i)
      //אם היא אנכית (עומדת): אנחנו קופצים שורה שלמה בכל פעם (+ i * gridSize)
        let currentIndex = isHorizontal ? startIndex + i : startIndex + (i * gridSize);
        const currentRow = Math.floor(currentIndex / gridSize);
 
        //בדיקה אם הצוללת שוכבת,  כי היא חייבת להישאר באותה שורה
        if (isHorizontal && currentRow !== row) return false;
        //בדיקה אם המספר של המשבצת גדול יותר מסך כל המשבצות בלוח וככה לא נצא מהלוח
        if (currentIndex >= gridSize * gridSize) return false;
        //אנחנו בודקים במערך הצוללות שכבר קיימות (ships) האם אחת מהן כבר תופסת את המשבצת הזו. הפונקציה 
        if (ships.some(ship => ship.locations.includes(currentIndex))) return false;
    }
    return true;
};

/**
 * מגרילה מיקומים לצי הצוללות ומחשבת את סך המשבצות לניצחון.
 * @description קובעת את גודל הצי לפי הרמה הנוכחית ומנסה למקם כל צוללת באופן אקראי וחוקי.
 */
const placeShips = () => {
    ships = []; 
    gameSettings.totalShipCells = 0; 
    
    // קביעת הצי לפי הרמה
    const fleet = Number(gameSettings.currentLevel) === 1 ? [3, 2, 2] : [5, 4, 3, 3, 2];
    

    /**
     * פונקציית הצבת צי (Callback):
     * רצה עבור כל גודל צוללת (size) המוגדר במערך הצי (fleet).
     * תפקידה: למצוא מיקום חוקי עבור הצוללת בעזרת לולאת ניסיונות (while),
     * לחשב את מערך המיקומים שלה, ולהוסיף אותה לרשימת הצוללות הפעילות.
     */
    fleet.forEach(size => {
        //הופכים את מיקום הצוללת לשלילי כי רק עכשיו מתחילים להגריל לה מקום
        let placed = false;
        //פה המחשב מגריל מספר כל עוד לא הצליח להגריל מקום טוב שהחזיר  טרו
        while (!placed) {
            const isHorizontal = Math.random() < 0.5;
            //הגרלת מספר בין 0-35
            const startIndex = Math.floor(Math.random() * (gameSettings.gridSize * gameSettings.gridSize));
             // בדיקה אם המקום שהגרלנו חוקי ממשיכים ונכנסים פנימה  להמשך
            if (canPlaceShip(startIndex, size, isHorizontal)) {
                //מערך זמני שיכיל את כל המספרים של המשבצות שהצוללת הזו תתפוס
                const locations = [];
                for (let i = 0; i < size; i++) {
                    locations.push(isHorizontal ? startIndex + i : startIndex + (i * gameSettings.gridSize));
                }
                 //פה יוצרים אוביקט חדש לכל צוללת עם איפה נמצאת כמה פגיעות האם טבעה ודוחפים אותה למערך ראשי של המשחק
                ships.push({ locations, hits: 0, size, sunk: false });
                //המוסיפים את אורך הצוללת לסיכום הכללי של המשבצות שצריך לפגוע עבור ניצחון
                gameSettings.totalShipCells += size; 
                placed = true;
            }
        }
    });
};

/**
 * מייצרת את הריבועים של הלוח ב-DOM 
 * @description מנקה את הלוח הקיים, מגדירה את מבנה הגריד ויוצרת אלמנטים לכל משבצת עם מאזיני אירועים.
 */
const createBoard = () => {
    const board = document.querySelector('#board');
    if (!board) return;

/**
     * פונקציית ניקוי (Callback):
     * רצה על כל אלמנט בן (child) בתוך הלוח.
     * תפקידה: להסיר פיזית את המשבצת מה-DOM כדי לאפשר בנייה של לוח חדש ונקי.
     */
    // המרת הילדים למערך ומחיקתם - מדגים גישה לבנים 
    Array.from(board.children).forEach(child => child.remove());

    board.style.display = "grid";
    board.style.gridTemplateColumns = `repeat(${gameSettings.gridSize}, 48px)`;

    for (let i = 0; i < gameSettings.gridSize * gameSettings.gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');//כך מקבל עיצובמהCSS
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(cell));//הפעלת פונקציה ירייה או החטאה
        board.appendChild(cell);//מכניס את הריבוע ללוח
    }
};

/**
 * מטפלת בלחיצה על משבצת ובדיקת ניצחון
 * @param {HTMLElement} cell - אלמנט המשבצת שנלחצה.
 * @description בודקת אם יש פגיעה, מעדכנת סטטיסטיקות, מפעילה סאונד ובודקת תנאי ניצחון או הטבעה.
 */
const handleCellClick = (cell) => {
    //מניעת לחיצות מיותרות  אם פגענו או החטאנו במקום זה או שזה תור המחשב
    if (gameSettings.isComputerTurn || cell.classList.contains('hit') || cell.classList.contains('miss')) return;

    const clickedIndex = parseInt(cell.dataset.index);
    //האם יש צוללת שבתוך רשימת המיקומים שלה מופיע המספר שעכשיו לחצו עליו
    const hitShip = ships.find(ship => ship.locations.includes(clickedIndex));

    gameSettings.attempts++;//מעלה כמות נסיונות
    document.querySelector('#current-score').textContent = `ניסיונות: ${gameSettings.attempts}`;

    if (hitShip) {
        playEffect(gameSounds.fire);
        cell.classList.add('hit');
        //מעלה מונה פגיעות של הצוללת הזו ושל המשחק כולו
        hitShip.hits++; 
        gameSettings.hits++; 
        
        // בדיקת ניצחון
        if (gameSettings.hits >= gameSettings.totalShipCells) {
            //עוצר טיימר אחרי חצי דקה ומפעיל דף ניצחון
            clearInterval(gameSettings.timerInterval);
            setTimeout(handleWin, 500);
            return;
        }

        //בדיקה אם צוללת טבע לגמרי
        if (hitShip.hits === hitShip.size) {
            hitShip.sunk = true;
            playEffect(gameSounds.hit);
            markSurroundingCells(hitShip); 
            updateFleetStatus();
        }
    } else {
        cell.classList.add('miss');
        playEffect(gameSounds.miss);
        startComputerTurn();//קורא למחשב להתחיל את המשחק שלו 
    }
};

/**
 * פונקציה סופית לחשיפת צוללת -  לפי כיוון התמונה 
 * @param {Object} ship - אובייקט הצוללת שהוטבעה.
 * @description חושפת את הגרפיקה של הצוללת ומסמנת משבצות ריקות מסביבה כ"החמצה" באופן אוטומטי.
 */
const markSurroundingCells = (ship) => {
    const { gridSize } = gameSettings;
    const allCells = document.querySelectorAll('.cell');
    
    // מיון המיקומים כדי לוודא שאנחנו עובדים משמאל לימין / מלמעלה למטה
    const sortedLocations = [...ship.locations].sort((a, b) => a - b);
    //אם ההפרש בין המשבצת הראשונה לשנייה הוא 1, סימן שהן צמודות באותה שורה גדול יותר  סימן שהן אחת מתחת לשנייה 
    const isHorizontal = sortedLocations.length > 1 && (sortedLocations[1] - sortedLocations[0] === 1);

    /**
     * פונקציית חשיפה גרפית (Callback):
     * מעדכנת את התמונה בהתאם לכיוון (אופקי/אנכי) ומסירה את הפיצוץ.
     */
    sortedLocations.forEach((index, i) => {
        const cell = allCells[index];
        
        // 1. הסרת הפיצוץ (האיקס) כדי שלא יסתיר את הצוללת
        cell.classList.remove('hit'); 
        
        // 2. הוספת המחלקה של הצוללת
        cell.classList.add('revealed-ship');

        // חישוב המיקום בתמונה (הראש ב-100% והזנב ב-0% )
        const positionPercent = ((ship.size - 1 - i) / (ship.size - 1)) * 100;

        if (isHorizontal) {
            // צוללת שוכבת - משתמשים בתמונה הרגילה
            cell.style.backgroundImage = "url('../image/צוללת.png')";
            cell.style.backgroundSize = `${ship.size * 100}% 100%`;
            cell.style.backgroundPosition = `${positionPercent}% 0%`;
    } else {
            // עדכון השם המדויק והסיומת הנכונה
            cell.style.backgroundImage = "url('../image/zolelet.jpg')"; 
            cell.style.backgroundRepeat = "no-repeat";
            cell.style.backgroundSize = `100% ${ship.size * 100}%`;

            // חישוב המיקום - אם הראש למטה, נחליף את ה-0 וה-100
            let pos;
            if (i === 0) {
                pos = 0;   // חלק עליון של התמונה (אמור להיות הראש)
            } else if (i === ship.size - 1) {
                pos = 100; // חלק תחתי של התמונה (אמור להיות הזנב)
            } else {
                pos = (i / (ship.size - 1)) * 100; // האמצע
            }

            cell.style.backgroundPosition = `0% ${pos}%`;
        }
    });

    /**
     * פונקציית סריקת סביבה (Callback):
     * רצה עבור כל אינדקס של משבצת בצוללת שהוטבעה.
     * תפקידה: לסמן ב-X (miss) את כל המשבצות הריקות מסביב לצוללת (רדיוס של משבצת אחת).
     */
    ship.locations.forEach(index => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        //עושה סריקה של ריבוע מסביב לצוללת שהטבענו
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                    //הופכים חזרה את השורה והעמודה שמצאנו למספר אינדקס רגיל אחרי הפירוק לשורה ועמודה מקודם
                    const neighborIndex = r * gridSize + c;
                    const neighborCell = allCells[neighborIndex];
                    //בודק האם במשבצות השכנה של הצוללת יש צוללת או רק ואז ישים החטאה
                    const isAnyShipThere = ships.some(s => s.locations.includes(neighborIndex));
                    if (!isAnyShipThere && !neighborCell.classList.contains('hit') && !neighborCell.classList.contains('miss')) {
                        neighborCell.classList.add('miss');
                    }
                }
            }
        }
    });
};


/**
 * מציגה מסך כישלון.
 * @description חושפת את ה-Overlay עם הודעה שהזמן נגמר ומאפשרת אתחול של השלב הנוכחי.
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
        overlay.style.display = 'none';//החלון עם ההודע יוסתר
        resetLevel();// תגיד שיתחל השלב מחדש 
    };
};

/**
 * מאפסת את השלב ומעדכנת גודל לוח.
 * @description מאפסת מונים, קובעת גודל גריד לפי רמה, ומייצרת לוח וצוללות מחדש.
 */
const resetLevel = () => {
    gameSettings.attempts = 0;
    gameSettings.hits = 0;
    gameSettings.totalShipCells = 0; 
    //יצירת לוח בגודל 6 או 10
    gameSettings.gridSize = Number(gameSettings.currentLevel) === 1 ? 6 : 10;
    
    document.querySelector('#current-score').textContent = `ניסיונות: 0`;
    document.querySelector('#game-win-overlay').style.display = 'none'; 

    placeShips();//הגרלת צוללות
    createBoard();//בניית ריבועים 
    startTimer();// הפעלת שעון העצר
    updateFleetStatus();
};

/**
 * מדמה תור מחשב.
 * @description משנה את נראות הלוח ומונעת לחיצות משתמש לזמן קצר כדי לייצר תחושת המתנה.
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
 * ניהול מסך ניצחון ומעבר שלב
 * @description מציגה סטטיסטיקות סיום, שומרת את התוצאה ומגדירה ניווט לשלב הבא או לטבלת השיאים.
 */
const handleWin = () => {
    //"לוכדים" את כל חלקי חלון הניצחון מה-HTML
    const overlay = document.querySelector('#game-win-overlay');//המסך המטושטש
    const title = document.querySelector('#win-title');//כותרת הניצחון
    const stats = document.querySelector('#win-stats');//כמה נסיונות
    const nextBtn = document.querySelector('#btn-next-level');//כפתור  שלב הבאה

    if (overlay && title && stats) {//בודק אם כל האלמנטים קימים
        title.textContent = "ניצחון!";
        stats.textContent = `שלב ${gameSettings.currentLevel} הושלם ב-${gameSettings.attempts} ניסיונות!`;
        overlay.style.display = 'flex';
    }

    if (nextBtn) {
        /**
         * פונקציית טיפול בלחיצה (Event Handler):
         * מופעלת בעת לחיצה על כפתור "השלב הבא".
         * בודקת אם נותרו שלבים נוספים:
         * - אם כן: מקדמת את הרמה, מסתירה את מסך הניצחון ומאפסת את הלוח.
         * - אם לא: מעבירה את המשתמש לדף טבלת השיאים.
         */
        nextBtn.onclick = () => {
            //בודק אם יש עוד שלב ואז מעביר ומקדם שלב
            if (gameSettings.currentLevel < gameSettings.maxLevels) {
                gameSettings.currentLevel++;
                overlay.style.display = 'none';
                resetLevel();
            } else {//אם אין עוד שלב שומר נתונים ומעביר לטבלת שיאים
                window.location.href = 'leaderboard.html';
            }
        };
    }
    saveScore();
};

/**
 * שומרת תוצאה ב-localStorage 
 * @description יוצרת אובייקט תוצאה ומוסיפה אותו למערך השיאים שנשמר בדפדפן.
 */
const saveScore = () => {
    const scoreData = {
        name: gameSettings.playerName,
        attempts: gameSettings.attempts,//מספר נסיונות
        level: gameSettings.currentLevel,//מספר שלב שהגענו
        date: new Date().toLocaleDateString()//תאריך
    };
    //אם יש נתונים הופך אותם ומכניס למערך ואם אין בונה מערך ריק
    let scores = JSON.parse(localStorage.getItem('battleship_highscores')) || [];
    scores.push(scoreData);
    //הופך את המערך שוב לרשימה  דורס מידע ישן ומכניס גם את הניצחון החדש
    localStorage.setItem('battleship_highscores', JSON.stringify(scores));
};


/**
 * מטפלת בלחיצת מקשים במקלדת 
 * @param {KeyboardEvent} event - אובייקט האירוע 
 * @description מאפשרת לחיצה על Enter כדי לעבור שלב כאשר מופיע מסך הניצחון.
 */
const handleKeyPress = (event) => {
    //בודק אם מסך הניצחון מופיע
    const overlay = document.querySelector('#game-win-overlay');
    
    // שימוש ב-event.key 
    //בודק אם קיים מסך ניצחון ומופיע והוקש אנטר 
    if (overlay && overlay.style.display === 'flex' && event.key === 'Enter') {
        const nextBtn = document.querySelector('#btn-next-level');
        if (nextBtn) {
            nextBtn.click(); // לוחץ אוטומטית על הכפתור בשבילך
        }
    }
};

/**
 * מאתחלת את המשחק.
 * @description טוענת נתוני שחקן, מגדירה רמה ראשונית ומפעילה את השלב הראשון.
 */
export const initGame = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const levelFromUrl = urlParams.get('level'); //בודק אם הוקש רמת קושי ומהי
//שולף מהדפדפן את המידע שנשמר תחת המפתח
    const data = JSON.parse(localStorage.getItem('battleship_player'));
    
    if (data) {
        gameSettings.playerName = data.name;
        document.querySelector('#current-player-name').textContent = data.name;
        //קובע רמת קושי
        if (levelFromUrl === 'hard' || data.level === '2') {
            gameSettings.currentLevel = 2;
        } else {
            gameSettings.currentLevel = 1;
        }
    }
    //מעכשיו כל פעם ששחקן לוחץ יש לו מאזין
    window.addEventListener('keydown', handleKeyPress);
    
    resetLevel(); 

    // הפיכת המשתנה לגלובלי כדי שנוכל לראות אותו בקונסול צריך להוריד 
window.ships = ships;
window.gameSettings = gameSettings;
};

/**
 * מעדכנת את התצוגה הויזואלית של הצי שנותר להטביע
 * @description בונה מחדש את רשימת האינדיקטורים של הצוללות ומסמנת מי הוטבעה ומי עוד חיה.
 */
const updateFleetStatus = () => {
    const fleetVisual = document.querySelector('#fleet-visual');
    if (!fleetVisual) return;

    // ניקוי התצוגה הקודמת כל עוד יש ילדים
while (fleetVisual.firstChild) {
    fleetVisual.removeChild(fleetVisual.firstChild);
}

    /**
     * פונקציית מעבר (Callback):
     * רצה עבור כל הצוללת (ship) במערך ה-ships.
     * מייצרת אלמנט ויזואלי המייצג את מצב הצוללת (חיה/מוטבעת) בתפריט הצד.
     */
    ships.forEach(ship => {
        const shipDiv = document.createElement('div');
        shipDiv.classList.add('ship-indicator');//עבור כל צוללת מיצרים קופסא

        // יצירת ריבועים לפי גודל הצוללת
        for (let i = 0; i < ship.size; i++) {
            const square = document.createElement('div');
            square.classList.add('indicator-square');
            
            // אם הצוללת הוטבעה - צבע אפור, אם חיה - צבע אדום
            if (ship.sunk) {
                square.classList.add('sunk');
            } else {
                square.classList.add('alive');
            }
            shipDiv.appendChild(square);//מכניס את הריבוע ללוח
        }
        //אחרי שסיימנו לצייר את כל הריבועים עבור צוללת מסוימת, אנחנו מדביקים את הכל ללוח
        fleetVisual.appendChild(shipDiv);
    });
};