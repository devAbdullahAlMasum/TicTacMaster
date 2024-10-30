// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyADYfmaWrLMHhAuVkwGMw0p0vCoR_brWgI",
    authDomain: "tik-tak-to-ff218.firebaseapp.com",
    databaseURL: "https://tik-tak-to-ff218-default-rtdb.firebaseio.com",
    projectId: "tik-tak-to-ff218",
    storageBucket: "tik-tak-to-ff218.appspot.com",
    messagingSenderId: "1055505730933",
    appId: "1:1055505730933:web:7b0c46dd17fa078e67d73c",
    measurementId: "G-DZ01YMXBF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

export { db, ref, set, onValue, remove, get };
