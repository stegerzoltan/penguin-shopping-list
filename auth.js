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
    showAuthError("Please fill in all fields");
    return;
  }

  try {
    signInBtn.disabled = true;
    signInBtn.textContent = "Signing in...";

    const { auth } = window.firebaseServices;
    await auth.signInWithEmailAndPassword(email, password);

    // User logged in, Firebase auth state listener will handle the rest
  } catch (error) {
    showAuthError(error.message);
    signInBtn.disabled = false;
    signInBtn.textContent = "Sign In";
  }
});

// Sign Up
signUpBtn.addEventListener("click", async () => {
  clearAuthError();
  const email = signUpEmail.value.trim();
  const password = signUpPassword.value.trim();
  const confirm = signUpConfirm.value.trim();

  if (!email || !password || !confirm) {
    showAuthError("Please fill in all fields");
    return;
  }

  if (password !== confirm) {
    showAuthError("Passwords do not match");
    return;
  }

  if (password.length < 6) {
    showAuthError("Password must be at least 6 characters");
    return;
  }

  try {
    signUpBtn.disabled = true;
    signUpBtn.textContent = "Creating account...";

    const { auth } = window.firebaseServices;
    await auth.createUserWithEmailAndPassword(email, password);

    // User created and logged in
  } catch (error) {
    showAuthError(error.message);
    signUpBtn.disabled = false;
    signUpBtn.textContent = "Create Account";
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    const { auth } = window.firebaseServices;
    await auth.signOut();
  } catch (error) {
    console.error("Logout error:", error);
  }
});

// Listen for authentication state changes
const { auth } = window.firebaseServices || {};
if (auth) {
  auth.onAuthStateChanged((user) => {
    currentUser = user;

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

      // Clear shopping list
      if (window.clearShoppingListUI) {
        window.clearShoppingListUI();
      }
    }
  });
}
