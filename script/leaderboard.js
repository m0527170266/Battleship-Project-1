/**
 * @file leaderboard.js
 * @description ניהול תצוגת טבלת השיאים, שליפת נתונים והצגת המנצח עם גביע.
 */

/**
 * טוענת את השיאים מה-localStorage ומציגה אותם בטבלה ובאזור המנצח.
 * @returns {void}
 */
const displayScores = () => {
    const tableBody = document.getElementById('leaderboard-body');
    const topPlayerName = document.getElementById('top-player-name');
    const topWinnerSection = document.getElementById('top-winner-section');

    // שליפת הנתונים מהמפתח שהגדרנו ב-game.js
    const rawData = localStorage.getItem('battleship_highscores');
    const scores = rawData ? JSON.parse(rawData) : [];

    // אם אין נתונים, נצא ונשאיר את הודעת ברירת המחדל של ה-HTML
    if (scores.length === 0) return;

    // מיון השיאים: מהניסיון הנמוך ביותר (הכי טוב) לגבוה ביותר
    scores.sort((a, b) => a.attempts - b.attempts);

    // טיפול במקום הראשון (הצגת הגביע והשם)
    if (topWinnerSection && topPlayerName) {
        topPlayerName.textContent = scores[0].name;
        topWinnerSection.style.display = 'block'; // הופך את האזור לנראה
    }

    // ניקוי הטבלה ומילוי בנתונים החדשים
    tableBody.innerHTML = scores.map((player, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.attempts} ניסיונות</td>
        </tr>
    `).join('');
};

/**
 * מאתחלת את הדף ברגע שכל ה-DOM נטען.
 */
document.addEventListener('DOMContentLoaded', displayScores);