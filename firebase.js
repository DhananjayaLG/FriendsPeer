import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  onValue,
  push,
  remove,
  onChildAdded
} from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAIR-ibMom9Ga_ihld2kg-gNOdK4imvL9E",
    authDomain: "p2pmessenger-7f097.firebaseapp.com",
    databaseURL: "https://p2pmessenger-7f097-default-rtdb.firebaseio.com",
    projectId: "p2pmessenger-7f097",
    storageBucket: "p2pmessenger-7f097.firebasestorage.app",
    messagingSenderId: "488417374721",
    appId: "1:488417374721:web:b707672a1231165e1bc600",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, onValue, push, remove, onChildAdded };

// firebase.js
// import { initializeApp } from 'firebase/app';
// import { getDatabase } from 'firebase/database';

// const firebaseConfig = {
//     apiKey: "AIzaSyABTrI723RHUeTb06zKC9NDP62j3U4QPHw",
//     authDomain: "chat-app-bbdfe.firebaseapp.com",
//     databaseURL: 'https://chat-app-bbdfe-default-rtdb.firebaseio.com/',
//     projectId: "chat-app-bbdfe",
//     storageBucket: "chat-app-bbdfe.firebasestorage.app",
//     messagingSenderId: "209427031817",
//     appId: "1:209427031817:web:4eb8e60bca4e9e6e5495d8"
// };

// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

// export { db };
