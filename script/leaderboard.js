/**
 * @file leaderboard.js
 * @description ניהול תצוגת שיאים וחזרה לתפריט הראשי.
 */

/**
 * מאתחלת את דף השיאים, מציגה נתונים ומפעילה את כפתור החזרה.
 * הפונקציה מבצעת את הפעולות הבאות:
 * 1. הגדרת מאזין לכפתור חזרה לדף הבית.
 * 2. שליפת נתוני שיאים מה-LocalStorage.
 * 3. מיון הנתונים לפי מספר ניסיונות.
 * 4. יצירה והזרקה דינמית של שורות הטבלה ל-DOM.
 */
export const initLeaderboard = () => {
    const backBtn = document.getElementById('back-btn');
    const tableBody = document.getElementById('leaderboard-body');

    //  כפתור החזרה - שימוש בנתיב ישיר
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            //window.location.href-משנה את כתובת הדפדפן שילך לעמוד אחר  ויש בדיקה אם הכפתור קיים ולחצו ורק אז פעולת העברה נעשת
            window.location.href = '../index.html';
        });
    }

    //(הנתונים נשמרים גם בסגירת מחשב וברענון הדף)שליפת נתונים מהזיכרון
    const rawData = localStorage.getItem('battleship_highscores');
    //     איברים מעתיק למערך והופך מהמחרוזת שוב עי ג'יסון ואם אין יוצר מערך ריק rawData שמירת נתונים בדיקה אם יש ב
    const scores = rawData ? JSON.parse(rawData) : [];


    //רק אם יש לפחות שיא אחד במערך, תתחיל לעבוד
   if (scores.length > 0) {
    /**
     * פונקציית מיון (Comparator):
     * מבצעת השוואה בין שני אובייקטים (a ו-b) במערך השיאים.
     * המיון מתבצע בסדר עולה לפי מאפיין ה-attempts (כמות הניסיונות).
     */
    scores.sort((a, b) => a.attempts - b.attempts);

    // ניקוי הטבלה הקיימת לפני הוספה
    tableBody.textContent = '';

    // יצירת Fragment כדי לעדכן את ה-DOM פעם אחת בלבד בסוף
    const fragment = document.createDocumentFragment();

    /**
     * פונקציית מעבר (Callback):
     * רצה עבור כל איבר (s) ואינדקס (i) במערך scores.
     * בונה אלמנט <tr> וממלאת אותו בנתוני השחקן.
     */
    scores.forEach((s, i) => {
        //יצירת אלמנט HTML חדש מסוג "שורה
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