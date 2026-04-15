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

    //(הנתונים נשמרים גם בסגירת מחשב וברענון הדף)שליפת נתונים מהזיכרון
    const rawData = localStorage.getItem('battleship_highscores');
    //   איברים מעתיק למערך ואם אין יוצר מערך ריק rawData שמירת נתונים בדיקה אם יש ב
    const scores = rawData ? JSON.parse(rawData) : [];

    // if (scores.length > 0) {
    //     // מיון והצגה 
    //     scores.sort((a, b) => a.attempts - b.attempts);
    //     tableBody.innerHTML = scores.map((s, i) => `
    //         <tr>
    //             <td>${i + 1}</td>
    //             <td>${s.name}</td>
    //             <td>${s.attempts} ניסיונות</td>
    //         </tr>
    //     `).join('');//זה לוקח את כל האיברים במערך ומחברם שיהיו בלי רווח
    // }

    if (scores.length > 0) {
    // מיון הנתונים
    scores.sort((a, b) => a.attempts - b.attempts);

    // ניקוי הטבלה הקיימת לפני הוספה
    tableBody.textContent = '';

    // יצירת Fragment כדי לעדכן את ה-DOM פעם אחת בלבד בסוף
    const fragment = document.createDocumentFragment();

    scores.forEach((s, i) => {
        const tr = document.createElement('tr');

        // עמודת מיקום
        const tdIndex = document.createElement('td');
        tdIndex.textContent = i + 1;
        tr.appendChild(tdIndex);

        // עמודת שם
        const tdName = document.createElement('td');
        tdName.textContent = s.name;
        tr.appendChild(tdName);

        // עמודת ניסיונות
        const tdAttempts = document.createElement('td');
        tdAttempts.textContent = `${s.attempts} ניסיונות`;
        tr.appendChild(tdAttempts);

        fragment.appendChild(tr);
    });

    // הזרקה אחת ויחידה ל-DOM
    tableBody.appendChild(fragment);
}
    };
   

//זה אומר שהקוד ירוץ רק לאחר שהHTML יסיים להטען
document.addEventListener('DOMContentLoaded', initLeaderboard);