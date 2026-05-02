/**
 * פונקציה המטפלת בתהליך ההתחברות והעברת הנתונים
 * @param {Event} event - אובייקט האירוע של שליחת הטופס
 * * תיאור פעולה: 
 * 1. מניעת רענון הדף.
 * 2. שליפת ערכי השם ורמת הקושי מהטופס.
 * 3. יצירת אובייקט נתונים ושמירתו ב-LocalStorage כטקסט (JSON).
 * 4. ניתוב המשתמש לעמוד המשחק עם פרמטר רמת הקושי.
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

     //window.location.href: פקודה של ה-BOM שמשנה את כתובת האתר
    // מעבר לדף המשחק תוך העברת רמת הקושי בכתובת (Query Parameters)-ככה יודע איזה גודל  לוח 
    window.location.href = `page/game.html?level=${difficulty}`;
};

/**
 * פונקציית אתחול המוסיפה אירועים דרך הקוד בלבד
 * * תיאור פעולה:
 * 1. איתור אלמנט הטופס בדף.
 * 2. בדיקה שהטופס קיים (למניעת שגיאות).
 * 3. הצמדת מאזין אירועים (Event Listener) מסוג submit המפעיל את פונקציית handleLogin.
 */
export const init = () => {
    //תופסים את הFORM מהHTML
    const loginForm = document.querySelector('#login-form');
    
    if (loginForm) {
        // if הוספת אירוע שליחת טופס דרך הקוד רק אם קיים הדף ויש בו משהו-וזו בדיקת ה
        // כתוב בלי סוגרים כדי שהפונקציה לא תפעל מיד אלא רק שמצביעים עליה handleLogin 
        loginForm.addEventListener('submit', handleLogin);
    }
};