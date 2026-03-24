/**
 * @file leaderboard.js
 * @description ניהול תצוגת שיאים וחזרה לתפריט הראשי.
 */

/**
 * מאתחלת את דף השיאים, מציגה נתונים ומפעילה את כפתור החזרה.
 */
const initLeaderboard = () => {
    const backBtn = document.getElementById('back-btn');
    const tableBody = document.getElementById('leaderboard-body');

    // תיקון כפתור החזרה - שימוש בנתיב ישיר
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }

    // שליפת נתונים מהזיכרון
    const rawData = localStorage.getItem('battleship_highscores');
    const scores = rawData ? JSON.parse(rawData) : [];

    if (scores.length > 0) {
        // מיון והצגה (כפי שעשינו קודם)
        scores.sort((a, b) => a.attempts - b.attempts);
        tableBody.innerHTML = scores.map((s, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${s.name}</td>
                <td>${s.attempts} ניסיונות</td>
            </tr>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', initLeaderboard);