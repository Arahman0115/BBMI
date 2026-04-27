import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// ─────────────────────────────────────────────────────────────────────────────
// Fill in your Firebase project config here.
// Firebase Console → Project Settings → Your apps → Web app → SDK setup & config
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBceJoyPpL-6NHuTJCfcZnPY6f6r7SvB6E",
  authDomain: "bbmipoc.firebaseapp.com",
  projectId: "bbmipoc",
  storageBucket: "bbmipoc.firebasestorage.app",
  messagingSenderId: "949816188780",
  appId: "1:949816188780:web:28f522b9124c2188865d49"
}
// ─────────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app
