'use client';
import { createContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOutUser } from '@/lib/firebase';
import { auth, db } from '@/config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import AnalyticsService from '@/lib/analyticsService';
import { Location, User } from '@/lib/types';

// Import des helpers
import { setupUserPresence, cleanupUserPresence } from './authHelpers/firebasePresence';
import { saveUser } from './authHelpers/saveUser';
import { handleLogin, handleLoginError } from './authHelpers/login';
import { 
  handleLoginWithGoogle, 
  handleGoogleLoginError 
} from './authHelpers/loginWithGoogle';
import { handleSignUpWithGoogle, handleGoogleSignUpError } from './authHelpers/signupWithGoogle';
import { handleSignUpWithEmail } from './authHelpers/signupWithEmail';
import { createAuthStateListener, createBeforeUnloadHandler } from './authHelpers/authStateListener';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (options?: { autoCreate?: boolean }) => Promise<void>;
  signUpWithGoogle: (location: Location) => Promise<void>;
  logout: () => Promise<void>;
  createUser: (email: string, password: string, name: string, location?: Location) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = createAuthStateListener(
      setUser,
      setLoading,
      router,
      pathname,
      isLoggingIn
    );

    // Gestionnaire pour détecter la fermeture du navigateur/onglet
    const handleBeforeUnload = createBeforeUnloadHandler(user);

    // Ajouter l'écouteur d'événement
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router, isLoggingIn, pathname, user]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      
      await handleLogin(email, password, setUser, saveUser, router);
    } catch (error: any) {
      handleLoginError(error);
    } finally {
      setLoading(false);
      setIsLoggingIn(false);
    }
  };

  const loginWithGoogle = async (options?: { autoCreate?: boolean }) => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      
      await handleLoginWithGoogle(options, setUser, saveUser, router);
    } catch (error: any) {
      handleGoogleLoginError(error);
    } finally {
      setLoading(false);
      setIsLoggingIn(false);
    }
  };

  const signUpWithGoogle = async (location: Location) => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      
      await handleSignUpWithGoogle(location, setUser, saveUser, router);
    } catch (error: any) {
      handleGoogleSignUpError(error);
    } finally {
      setLoading(false);
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('Début de la déconnexion pour:', user?.id);
      
      // Nettoyer la présence et le statut offline AVANT de déconnecter
      if (user && auth.currentUser) {
        try {
          console.log('Mise à jour du statut offline en cours...');
          
          // Nettoyer la présence dans Realtime Database
          await cleanupUserPresence(user.id);
          console.log('Présence Realtime DB nettoyée');
          
          // Mettre à jour Firestore
          const userRef = doc(db, 'users', user.id);
          await updateDoc(userRef, {
            online: false,
            updatedAt: serverTimestamp(),
          });
          console.log('Statut Firestore mis à jour: online = false');
          
          // Petit délai pour s'assurer que la mise à jour est propagée
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Délai de 500ms écoulé');
          
        } catch (error) {
          console.error('Erreur lors de la mise à jour du statut offline:', error);
        }
      } else {
        console.log('Utilisateur non trouvé ou non connecté');
      }
      
      console.log('Déconnexion Firebase Auth...');
      await AnalyticsService.trackLogout();
      await signOutUser();
      
      console.log('Nettoyage du state local...');
      setUser(null);
      saveUser(null);
      
      console.log('Redirection vers login...');
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
      await handleSignUpWithEmail(email, password, name, location, setLoading);
    } catch (error) {
      throw error;
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
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, signUpWithGoogle, logout, createUser, updateUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 