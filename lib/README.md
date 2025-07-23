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

## 🔍 Find the Project ID
The Project ID will be used when you start the firebase emulator

```bash
firebase projects:list
```

You'll see something like:

```mathematica
┌──────────────────────┬─────────────────────────┬────────────────┐
│ Project Display Name │ Project ID              │ Project Number │
├──────────────────────┼─────────────────────────┼────────────────┤
│ Questionnaire Web    │ questionnaire-web-897dc │ 167360025310   │
└──────────────────────┴─────────────────────────┴────────────────┘
```

`questionnaire-web-897dc` is your project id.

## 💻 One-Time Setup
From your project root (where `firebase.json` is), run:

```bash
firebase init
```

### **During the prompts:**
- ✅ Choose **Firestore** only (press space to select)

- ✅ Select "Use an existing project" → choose your project id

- ✅ Accept default filenames:

    - Firestore Rules: `firestore.rules`

    - Indexes: `firestore.indexes.json`

- 🚫 Do not overwrite any existing files unless you're sure

- 🚫 You can skip hosting and other options

This will generate a `firebase.json` and `.firebaserc` file if not already present.

## ⚙️ Configure Environment
Set this in your `.env.local` file:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

Switch to production by setting it to `false`:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

## 🚀 Start the Emulator
Run this from the project root:

```bash
firebase emulators:start --project <your-project-id>
```

You’ll see something like:

- Firestore Emulator: http://localhost:8080

- Emulator UI: http://localhost:4000