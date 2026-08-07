// Importaciones necesarias
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

// Inicializar Firebase solo si se tienen todas las variables de entorno
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Auth (LOGIN)
export const auth = app ? getAuth(app) : null;

// Firestore (BASE DE DATOS)
export const db = app ? getFirestore(app) : null;

// Storage (ARCHIVOS/IMÁGENES)
export const storage = app ? getStorage(app) : null;