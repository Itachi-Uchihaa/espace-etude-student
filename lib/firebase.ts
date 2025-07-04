import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
} from 'firebase/firestore';

// Function to get the users collection from Firestore
export const getUsersCollection = () => {
  return collection(db, 'users');
};

// Function to get a specific user's document reference
export const getUserDocRef = (uid: string) => {
  return doc(db, 'users', uid);
};

// Function to get user document from Firestore
export const getUserDoc = async (uid: string) => {
  const userDocRef = getUserDocRef(uid);
  return getDoc(userDocRef);
};

// Function to sign in user with email and password
export const signInUser = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Function to sign in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// Function to sign out user
export const signOutUser = async () => {
  return signOut(auth);
};

// Function to listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 