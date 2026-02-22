import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    initializeAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBCsE4I_9x2XRsLc0SiDBoIaEy6aMyTp7w",
    authDomain: "dyscover-fe5b0.firebaseapp.com",
    databaseURL: "https://dyscover-fe5b0-default-rtdb.firebaseio.com",
    projectId: "dyscover-fe5b0",
    storageBucket: "dyscover-fe5b0.firebasestorage.app",
    messagingSenderId: "192892199676",
    appId: "1:192892199676:web:1f5489767f7cb8e9172d79"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Simple auth wrappers matching the reference repository
export const loginUser = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const signUpUser = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase display name immediately
    await updateProfile(user, { displayName: name });

    return user;
};

export const logoutUser = async () => {
    await signOut(auth);
};

export const onAuthChange = (callback: (user: any) => void) => {
    return onAuthStateChanged(auth, callback);
};

export { auth };
export default app;
