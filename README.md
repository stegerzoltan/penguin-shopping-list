# 🐧 Penguin Shopping List with Firebase

A cute penguin-themed shopping list web app with Firebase cloud storage and authentication!

## Features

✨ **Features:**

- 🐧 Adorable penguin theme with animated background penguin
- 📝 Add, complete, and delete shopping items
- ☁️ Cloud storage with Firebase Firestore
- 🔐 User authentication with email/password
- 📱 Responsive design (mobile & desktop)
- 💾 Real-time sync across devices
- 🎨 Beautiful animations and UI

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and create a new project
3. Name it (e.g., "Penguin Shopping List")
4. Accept the terms and create the project
5. Wait for the project to be created

### 2. Set Up Firebase Authentication

1. In the Firebase Console, go to **Build** → **Authentication**
2. Click **Get started**
3. Select **Email/Password** as the sign-in method
4. Enable it and save

### 3. Set Up Firestore Database

1. In the Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Start in **test mode** (for development)
4. Choose a location
5. Click **Create**

### 4. Get Your Firebase Config

1. In the Firebase Console, click the gear icon and select **Project settings**
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</`)
4. Copy the Firebase config object

### 5. Update firebase-config.js

1. Open `firebase-config.js` in your editor
2. Replace the `firebaseConfig` object with your actual credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789000",
  appId: "1:123456789000:web:abcdef123456",
};
```

### 6. Run the App

1. Open `index.html` in your web browser
2. Create an account or sign in
3. Start adding items to your shopping list!

## File Structure

```
penguin/
├── index.html           # Main HTML file
├── styles.css           # All styling and animations
├── script.js            # Shopping list functionality
├── auth.js              # Authentication logic
├── firebase-config.js   # Firebase configuration (UPDATE THIS!)
└── README.md            # This file
```

## How It Works

1. **Authentication**: Users create an account with email/password
2. **Storage**: Each user's shopping list is stored in their Firestore collection
3. **Real-time Sync**: Lists update in real-time across multiple devices/tabs
4. **Fallback**: If Firebase is unavailable, the app falls back to localStorage

## Firestore Structure

```
users/
└── {userId}/
    └── shoppingItems/
        └── {itemId}/
            ├── text: "Item name"
            ├── completed: false
            └── timestamp: Date
```

## Troubleshooting

### "Firebase is not defined"

- Make sure `firebase-config.js` is loaded before `auth.js` and `script.js`
- Check that Firebase CDN links are correct in HTML

### Items not saving

- Check browser console for errors (F12 → Console)
- Verify Firebase credentials in `firebase-config.js`
- Ensure Firestore Database is created and rules allow writes

### Can't create account

- Make sure Email/Password authentication is enabled in Firebase
- Check that password is at least 6 characters
- Look for error messages in the browser console

## Security Notes

⚠️ **Important**: The current setup uses Firebase test mode for development. Before deploying to production:

1. Update Firestore security rules
2. Move away from test mode
3. Keep your `firebase-config.js` private
4. Consider adding email verification
5. Implement password reset functionality

## License

Feel free to use and modify for your own projects! 🐧

---

Happy waddling! 🐧❄️
