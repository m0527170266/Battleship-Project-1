/**
 * פונקציה המטפלת בתהליך ההתחברות והעברת הנתונים
 * @param {Event} event - אובייקט האירוע של שליחת הטופס
 */
const handleLogin = (event) => {
    // מניעת רענון הדף - דרישה חובה [cite: 25]
    event.preventDefault();

    // שליפת הנתונים מה-DOM [cite: 18, 22]
    const nameInput = document.querySelector('#player-name');
    const difficultySelect = document.querySelector('#difficulty');

    const playerName = nameInput.value;
    const difficulty = difficultySelect.value;

    // יצירת אובייקט ליטרלי מורכב לשמירת נתוני השחקן [cite: 8, 30]
    const playerStats = {
        name: playerName,
        score: 0,
        attempts: 0,
        loginTime: new Date().getTime() // שימוש בפונקציית תאריך [cite: 9]
    };

    // שמירת האובייקט ב-localStorage (חובה להפוך לטקסט עם JSON.stringify) [cite: 30, 91]
    localStorage.setItem('battleship_player', JSON.stringify(playerStats));

    // מעבר לדף המשחק תוך העברת רמת הקושי בכתובת (Query Parameters) 
    window.location.href = `page/game.html?level=${difficulty}`;
};

/**
 * פונקציית אתחול המוסיפה אירועים דרך הקוד בלבד
 */
const init = () => {
    const loginForm = document.querySelector('#login-form');
    
    if (loginForm) {
        // הוספת אירוע שליחת טופס דרך הקוד [cite: 24, 25]
        loginForm.addEventListener('submit', handleLogin);
    }
};

// הפעלת הפונקציה בעת טעינת הסקריפט
init();