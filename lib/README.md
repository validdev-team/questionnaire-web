# 🔥 Firebase Emulator Setup for Local Development

This project uses the **Firebase Emulator Suite** to allow local development without touching the live Firestore data. Follow the steps below to get it running.

---

## ✅ Requirements

Make sure you have the following installed:

- **Node.js**
- **Firebase CLI**

If Firebase CLI isn’t installed yet, run:

```bash
npm install -g firebase-tools
```

Then log in to Firebase

```bash
firebase login
```

## 💻 One-Time Setup
From your project root (where `firebase.json` is), run:

```bash
firebase use --add
```

Choose the Firebase project:
👉 `questionnaire-web-897dc`

This creates a `.firebaserc` file to track your project settings.

## ⚙️ Configure Environment
Set this in your `.env.local` file:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true  # For Firebase Emulator
```

Switch to production by setting it to `false`:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

## 🚀 Start the Emulator
Run this from the project root:

```bash
firebase emulators:start --project questionnaire-web-897dc
```

You’ll see something like:

- Firestore Emulator: http://localhost:8080

- Emulator UI: http://localhost:4000