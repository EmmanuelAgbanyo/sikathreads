# Sika Threads — Production Deployment & Configuration Guide

**Official Tagline:** *Weaving Heritage, Stitching Modernity.*  
**Primary Currency:** Ghana Cedi (GHS)  
**Order Model:** Order Requests & Concierge Verification (No online payments processed)

---

## 1. Firebase Project Setup

1. Open the [Firebase Console](https://console.firebase.google.com/) and create or select a project (e.g. `sika-threads-ghana`).
2. Enable the following Firebase Services:
   - **Authentication:** Enable Email/Password provider.
   - **Cloud Firestore:** Create Firestore in production mode (location: `europe-west1` or preferred African low-latency region).
   - **Firebase Storage:** Create standard storage bucket for high-resolution fabric images.
   - **Firebase Hosting:** Initialize hosting for the web application.

---

## 2. Deploying Firestore & Storage Security Rules

Deploy the included security rules:
```bash
firebase deploy --only firestore:rules,storage
```

The rules enforce:
- Deny-by-default for unmapped paths.
- Public read access ONLY to published catalogue items, active categories, and site settings.
- Customer access restricted strictly to their own order requests and StyleMatch submissions.
- Administrator writes protected by Firebase custom claims (`request.auth.token.role == 'admin'`).
- Inspiration upload validation: image mime type only, maximum 5 MB.

---

## 3. Provisioning the Initial Administrator Securely

To provision the first store administrator without exposing public registration:

1. Create the user in Firebase Authentication with an authorized staff email (e.g., `admin@sikathreads.com.gh`).
2. Run a trusted Node.js administrative script using Firebase Admin SDK:
```javascript
import admin from 'firebase-admin';

admin.initializeApp();
const user = await admin.auth().getUserByEmail('admin@sikathreads.com.gh');
await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
console.log('Admin custom claim granted to', user.email);
```
3. Never store admin flags in client-editable Firestore documents.

---

## 4. Google AI Studio / Gemini API Server Configuration

1. Visit [Google AI Studio](https://aistudio.google.com/) and create a Gemini API Key.
2. In your secure server runtime or Cloud Functions environment, configure:
```bash
GEMINI_API_KEY="your_ai_studio_api_key"
```
3. **Security Rule:** Never place `GEMINI_API_KEY` in frontend Vite `.env` or client code. The client calls `/api/stylematch/analyze`, which runs on the trusted backend.

---

## 5. Building & Deploying Frontend to Firebase Hosting

1. Build the production bundle:
```bash
npm run build
```
2. Verify that `dist/` contains all minified assets, compiled styles, and `logo.png`.
3. Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

---

## 6. Pre-Launch Production Smoke Test Checklist

- [x] Official tagline is exact: **"Weaving Heritage, Stitching Modernity."**
- [x] Brand colors applied: Warm Ivory `#FAF9F6`, Gold `#B8863B`, Charcoal `#20201D`, Burgundy `#8B2635`.
- [x] Product prices are in Ghana Cedis (GHS).
- [x] No online payment gateway or card forms are present.
- [x] Order requests generate unique references (`ST-2026-XXXX`).
- [x] Sika StyleMatch AI matches strictly against real published catalogue items.
- [x] Admin approval is required before recommendation emails are sent.
- [x] 3–5 minute target countdown and delay notification system are operational.
- [x] Sourcing workflow is active for out-of-stock and bespoke weaves.
- [x] All unit tests pass with zero errors.
