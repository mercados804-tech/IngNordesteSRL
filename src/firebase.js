// Importaciones necesarias
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración
const firebaseConfig = {
  apiKey: "AIzaSyCQfS1whbEKb24cOT57n2YSCQdSu393SWE",
  authDomain: "ingnordestesrl.firebaseapp.com",
  projectId: "ingnordestesrl",
  storageBucket: "ingnordestesrl.firebasestorage.app",
  messagingSenderId: "109719130858",
  appId: "1:109719130858:web:ecb25fd4474440e25afd93",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Auth (LOGIN)
export const auth = getAuth(app);

// Firestore (BASE DE DATOS)
export const db = getFirestore(app);

// Storage (ARCHIVOS/IMÁGENES)
export const storage = getStorage(app);