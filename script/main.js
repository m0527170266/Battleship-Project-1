/**
 * פונקציה המטפלת בתהליך ההתחברות והעברת הנתונים
 * @param {Event} event - אובייקט האירוע של שליחת הטופס
 */
const handleLogin = (event) => {
    // מניעת רענון הדף 
    event.preventDefault();

    // שליפת הנתונים מה-DOM 
    const nameInput = document.querySelector('#player-name');
    const difficultySelect = document.querySelector('#difficulty');

    //בשביל שנקבל רק מה שהשחקן הקליד
    const playerName = nameInput.value;
    const difficulty = difficultySelect.value;

    // יצירת אובייקט ליטרלי מורכב לשמירת נתוני השחקן 
    const playerStats = {
        name: playerName,
        score: 0,
        attempts: 0,
        loginTime: new Date().getTime() //  פונקציית תאריך 
    };

     //  battleship_player-זה שומר נתונים גם בסגירת מחשב ומ localStorage
    //  אופך אוביקט לטקסט ארוך JSON.stringify מוציאים נתונים וזה רק מחרוזות ולכן עשינו 
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
        // הוספת אירוע שליחת טופס דרך הקוד 
        // כתוב בלי סוגרים כדי שהפונקציה לא תפעל מיד אלא רק שמצביעים עליה handleLogin 
        loginForm.addEventListener('submit', handleLogin);
    }
};

// הפעלת הפונקציה בעת טעינת הסקריפט
init();