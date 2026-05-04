/**
 * @file app.js
 * @description הסקריפט הראשי המאחד את כל המודולים ומפעיל אותם לפי סוג הדף.
 */

import { initGame } from './logika.js';
import { initLeaderboard } from './leaderboard.js';
import { init as initLogin } from './main.js';



/**
 * בדיקה איזה דף נטען והפעלת ה-Init המתאים.
 */
const run = () => {
    console.log("Current Path:", window.location.pathname); // זה יעזור לראות מה הדפדפן מזהה

    const path = window.location.pathname;
//בודק איזו פונקציה להפעיל  משחק טבלת ניצחון 
    if (path.includes('logika.html')) {
        initGame();
    } else if (path.includes('leaderboard.html')) {
        initLeaderboard();
    } else {
        //אם לא הופעל כלום מפעיל  את:
        // דף הבית (index.html)
        initLogin();
    }
};

// פונקציה לניהול כפתורי חזרה לתפריט
const setupBackButtons = () => {
    // בודק את שני ה-ID האפשריים שהשתמשת בהם בדפים השונים
    const backBtn = document.getElementById('back-btn') || document.getElementById('back-to-menu');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }
};

// הפעלת הפונקציה
setupBackButtons();

//  הפעלת האפליקציה בטעינת ה-DOM ורק אחרי שכל הHTML סיים לרוץ יפעל 
document.addEventListener('DOMContentLoaded', run);