'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserDoc, onAuthStateChange, signOutUser, signInUser, signInWithGoogle, getUsersCollection } from '@/lib/firebase';
import { auth, db } from '@/config/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { deleteCookie, setCookie } from 'cookies-next';

interface Location {
  latitude: number;
  longitude: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  type?: string;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
  location?: Location;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  createUser: (email: string, password: string, name: string, location?: Location) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Fonction pour sauvegarder l'utilisateur dans les cookies
  const saveUser = (user: User | null) => {
    if (user) {
      setCookie('user', user);
      setCookie('uid', user.id);
    } else {
      deleteCookie('user');
      deleteCookie('uid');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getUserDoc(firebaseUser.uid);
          
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User;
            
            // Only allow students
            if (userData.role !== 'student') {
              await signOutUser();
              return;
            }
            
            setUser(userData);
            saveUser(userData);
            
            if (pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/') {
              router.push('/profile');
            }
          } else {
            await signOutUser();
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          await signOutUser();
        }
      } else {
        setUser(null);
        saveUser(null);
        if (!isLoggingIn && pathname !== '/login' && pathname !== '/forgot-password' && pathname !== '/reset-password' && pathname !== '/' && pathname !== '/sign-up') {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router, isLoggingIn, pathname]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      
      const response = await signInUser(email, password);
      const firebaseUser = response.user;
      
      if (!firebaseUser) {
        throw new Error('Login failed. No user found.');
      }
      
      const userDoc = await getUserDoc(firebaseUser.uid);
      if (!userDoc.exists) {
        throw new Error('Données utilisateur non trouvées');
      }

      const userData = { id: userDoc.id, ...userDoc.data() } as User;
      
      // Only allow students
      if (userData.role !== 'student') {
        await signOutUser();
        throw new Error('Accès non autorisé. Rôle non reconnu.');
      }
      
      setUser(userData);
      saveUser(userData);
      toast.success('Connexion réussie !');
      
      router.push('/profile');
    } catch (error: any) {
      console.error('Erreur de connexion:', error.message);
      toast.error(error.message || 'Erreur de connexion');
      throw error;
    } finally {
      setLoading(false);
      setIsLoggingIn(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      
      const response = await signInWithGoogle();
      const firebaseUser = response.user;
      
      if (!firebaseUser) {
        throw new Error('Google login failed. No user found.');
      }
      
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getUserDoc(firebaseUser.uid);

      let userData: User;

      // If first-time Google login, create a Firestore doc
      if (!userDoc.exists()) {
        const newUserData = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          createdAt: serverTimestamp(),
          role: 'student',
          type: 'authWithGoogle',
          status: 'Pending',
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newUserData);
        userData = { id: firebaseUser.uid, ...newUserData };
      } else {
        // Existing user
        userData = { id: userDoc.id, ...userDoc.data() } as User;
      }
      
      // Only allow students
      if (userData.role !== 'student') {
        await signOutUser();
        throw new Error('Accès non autorisé. Rôle non reconnu.');
      }
      
      setUser(userData);
      saveUser(userData);
      toast.success('Connexion réussie !');
      
      router.push('/profile');
    } catch (error: any) {
      console.error('Erreur de connexion Google:', error.message);
      toast.error(error.message || 'Erreur de connexion Google');
      throw error;
    } finally {
      setLoading(false);
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOutUser();
      setUser(null);
      saveUser(null);
      router.push('/login');
      toast.success('Déconnexion réussie !');
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error.message);
      toast.error('Erreur de déconnexion');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (email: string, password: string, name: string, location?: Location) => {
    try {
      setLoading(true);
      
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = response.user;

      if (!firebaseUser) {
        throw new Error('Signup failed. Please try again.');
      }

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = {
        email: firebaseUser.email || '',
        name: name || '',
        createdAt: serverTimestamp(),
        role: 'student',
        type: 'authWithEmail',
        status: 'Pending',
        location,
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, userDoc);

      // Sign out the user after creating account so they can log in properly
      await signOutUser();
      
      toast.success('Account created successfully! Please log in.');
    } catch (error: any) {
      console.error('Signup error:', error.message);
      toast.error(error.message || 'Account creation failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const userRef = doc(db, 'users', firebaseUser.uid);

      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      const updatedUser = { ...user, ...data } as User;
      setUser(updatedUser);
      saveUser(updatedUser);
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error.message);
      toast.error(error.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, createUser, updateUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 