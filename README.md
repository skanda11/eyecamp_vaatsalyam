# Eye Camp App — deploy guide

## 1. Create the Firebase project
1. Go to console.firebase.google.com → **Add project** → name it (e.g. `premaarpitham-eye-camp`).
2. **Build → Authentication** → Get started → enable **Email/Password**.
3. **Build → Firestore Database** → Create database → production mode → region **asia-south1 (Mumbai)**.
4. **Build → Hosting** → Get started (you can skip the CLI steps shown there, done below instead).
5. **Project settings (gear icon) → General → Your apps → Add app → Web**. Copy the `firebaseConfig` object.

## 2. Wire up the code
1. Paste the config into `src/firebase.js`, replacing the `REPLACE_ME` values.
2. In `.firebaserc`, replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID` with your actual project ID (shown in Project settings).
3. Install dependencies:
   ```
   npm install
   ```

## 3. Install the Firebase CLI and log in
```
npm install -g firebase-tools
firebase login
```

## 4. Deploy the security rules
```
firebase deploy --only firestore:rules
```

## 5. Build and deploy the app
```
npm run build
firebase deploy --only hosting
```
This prints a live URL like `https://premaarpitham-eye-camp.web.app` — that's the app.

## 6. Create the first admin account
Firestore rules require every account to have a role, and only an existing admin
can create new accounts in-app — so the very first one has to be made by hand:

1. Firebase Console → **Authentication → Add user** → enter your email + a password.
2. Copy the generated **User UID**.
3. Firebase Console → **Firestore Database → Start collection** → collection ID `users`.
4. Document ID = the UID you copied. Add fields:
   - `name` (string) — your name
   - `email` (string) — same email
   - `role` (string) — `admin`
5. Open the deployed URL, sign in with that account.

From here on, use the **Staff** tab in the app to create accounts for coordinators
and each station's volunteers — no more console work needed.

## 7. On camp day
- Open the app URL on each device **once while online** before the camp starts —
  this caches the app and lets Firestore's offline cache pre-warm.
- On phones, use "Add to Home Screen" from the browser menu so it opens like an app.
- If wifi drops mid-camp, stations can keep working — entries queue locally and
  sync automatically once connectivity returns. Just don't force-close the tab
  while offline, or unsynced entries on that device are lost.

## Notes
- Firebase's free (Spark) tier comfortably covers a monthly camp of this size.
- A custom domain can be attached later under Hosting → Add custom domain.
- Patient records persist across camps (`patients` collection), so August's
  follow-up search will find anyone registered this cycle too.
