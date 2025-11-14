// Authentication Logic
let currentUser = null;

// DOM Elements
const authModal = document.getElementById("authModal");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const signInEmail = document.getElementById("signInEmail");
const signInPassword = document.getElementById("signInPassword");
const signInBtn = document.getElementById("signInBtn");
const signUpEmail = document.getElementById("signUpEmail");
const signUpPassword = document.getElementById("signUpPassword");
const signUpConfirm = document.getElementById("signUpConfirm");
const signUpBtn = document.getElementById("signUpBtn");
const authError = document.getElementById("authError");
const userInfo = document.getElementById("userInfo");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// Toggle between sign in and sign up forms
function toggleAuthForm(e) {
  e.preventDefault();
  signInForm.style.display =
    signInForm.style.display === "none" ? "block" : "none";
  signUpForm.style.display =
    signUpForm.style.display === "none" ? "block" : "none";
  authError.textContent = "";
}

// Show error message
function showAuthError(message) {
  authError.textContent = message;
  authError.style.display = "block";
}

// Clear error message
function clearAuthError() {
  authError.textContent = "";
  authError.style.display = "none";
}

// Sign In
signInBtn.addEventListener("click", async () => {
  clearAuthError();
  const email = signInEmail.value.trim();
  const password = signInPassword.value.trim();

  if (!email || !password) {
    showAuthError("Kérlek töltsd ki az összes mezőt");
    return;
  }

  try {
    signInBtn.disabled = true;
    signInBtn.textContent = "Bejelentkezés...";

    const { auth } = window.firebaseServices;
    await auth.signInWithEmailAndPassword(email, password);

    // User logged in, Firebase auth state listener will handle the rest
  } catch (error) {
    showAuthError(error.message);
    signInBtn.disabled = false;
    signInBtn.textContent = "Bejelentkezés";
  }
});

// Sign Up
signUpBtn.addEventListener("click", async () => {
  clearAuthError();
  const email = signUpEmail.value.trim();
  const password = signUpPassword.value.trim();
  const confirm = signUpConfirm.value.trim();

  if (!email || !password || !confirm) {
    showAuthError("Kérlek töltsd ki az összes mezőt");
    return;
  }

  if (password !== confirm) {
    showAuthError("A jelszavak nem egyeznek");
    return;
  }

  if (password.length < 6) {
    showAuthError("A jelszónak legalább 6 karakter hosszúnak kell lennie");
    return;
  }

  try {
    signUpBtn.disabled = true;
    signUpBtn.textContent = "Fiók létrehozása...";

    const { auth } = window.firebaseServices;
    await auth.createUserWithEmailAndPassword(email, password);

    // User created and logged in
  } catch (error) {
    showAuthError(error.message);
    signUpBtn.disabled = false;
    signUpBtn.textContent = "Fiók Létrehozása";
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    const { auth } = window.firebaseServices;
    await auth.signOut();
  } catch (error) {
    console.error("Kijelentkezési hiba:", error);
  }
});

// Listen for authentication state changes
const { auth } = window.firebaseServices || {};
if (auth) {
  auth.onAuthStateChanged((user) => {
    currentUser = user;
    // expose current user globally so other scripts can detect auth state
    window.currentUser = user;

    if (user) {
      // User is logged in
      authModal.style.display = "none";
      userInfo.style.display = "flex";
      userEmail.textContent = user.email;

      // Load user's shopping list from Firestore
      if (window.loadUserShoppingList) {
        window.loadUserShoppingList();
      }
    } else {
      // User is logged out
      authModal.style.display = "flex";
      userInfo.style.display = "none";

      // Clear global user reference and restore local list view
      window.currentUser = null;

      // Clear shopping list UI (will load from localStorage if available)
      if (window.clearShoppingListUI) {
        window.clearShoppingListUI();
      }
    }
  });
}
