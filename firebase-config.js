// Firebase configuration (replace values if you want to override)
// NOTE: this file uses the namespaced (compat) Firebase API so it can be
// loaded directly in the browser and used by `auth.js` and `script.js`.
const firebaseConfig = {
  apiKey: "AIzaSyCr2iFs_0taRdqezWCwkg23O-MXA01oWO4",
  authDomain: "penguin-shopping-list.firebaseapp.com",
  projectId: "penguin-shopping-list",
  storageBucket: "penguin-shopping-list.firebasestorage.app",
  messagingSenderId: "570628933678",
  appId: "1:570628933678:web:19114418aee34a79a5b7bf",
  measurementId: "G-4ZEEPCH544",
};

// Initialize Firebase (namespaced/compat API)
if (typeof firebase === "undefined") {
  console.error(
    "Firebase SDK not loaded. Make sure you included the compat script tags in index.html"
  );
} else {
  firebase.initializeApp(firebaseConfig);
  try {
    // analytics may not be available in all environments
    if (firebase.analytics) firebase.analytics();
  } catch (e) {
    // ignore
  }

  // Expose the auth and firestore objects in a single place for the app to use
  const auth = firebase.auth();
  const db = firebase.firestore();
  window.firebaseServices = { auth, db };
  // Also expose firebase itself for debugging if needed
  window.firebase = firebase;
}
