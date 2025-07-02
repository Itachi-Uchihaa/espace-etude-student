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
  loginWithGoogle: (options?: { autoCreate?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  createUser: (email: string, password: string, name: string, location?: Location) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fonction utilitaire pour traduire les erreurs Firebase
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    // Erreurs d'authentification
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cette adresse email. Veuillez vérifier votre email ou créer un compte.';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect. Veuillez réessayer.';
    case 'auth/invalid-email':
      return 'Adresse email invalide. Veuillez vérifier le format de votre email.';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé. Contactez l\'administrateur.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
    case 'auth/network-request-failed':
      return 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect.';
    case 'auth/account-exists-with-different-credential':
      return 'Un compte existe déjà avec cette adresse email mais avec une méthode de connexion différente.';
    case 'auth/operation-not-allowed':
      return 'Cette méthode de connexion n\'est pas autorisée.';
    case 'auth/weak-password':
      return 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.';
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée par un autre compte.';
    case 'auth/requires-recent-login':
      return 'Cette opération nécessite une connexion récente. Veuillez vous reconnecter.';
    case 'auth/popup-closed-by-user':
      return 'La fenêtre de connexion Google a été fermée. Veuillez réessayer.';
    case 'auth/popup-blocked':
      return 'La fenêtre de connexion Google a été bloquée par votre navigateur.';
    case 'auth/cancelled-popup-request':
      return 'Connexion Google annulée.';
    default:
      return 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
  }
};

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
              router.push('/settings');
              // Toast de succès seulement lors de la redirection depuis les pages de connexion
              if (isLoggingIn) {
                toast.success('Connexion réussie !');
              }
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
      
      router.push('/settings');
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      // Utiliser la fonction de traduction des erreurs Firebase
      let errorMessage = 'Erreur de connexion';
      
      if (error.code) {
        errorMessage = getErrorMessage(error.code);
      } else if (error.message) {
        // Pour les erreurs personnalisées
        switch (error.message) {
          case 'Données utilisateur non trouvées':
            errorMessage = 'Compte utilisateur introuvable dans la base de données.';
            break;
          case 'Accès non autorisé. Rôle non reconnu.':
            errorMessage = 'Accès non autorisé. Seuls les étudiants peuvent se connecter.';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      setIsLoggingIn(false);
    }
  };

  const loginWithGoogle = async (options?: { autoCreate?: boolean }) => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      
      const response = await signInWithGoogle();
      const firebaseUser = response.user;
      
      if (!firebaseUser) {
        throw new Error('Google login failed. No user found.');
      }
      
      const userDoc = await getUserDoc(firebaseUser.uid);

      // Vérifier si l'utilisateur existe déjà
      if (!userDoc.exists()) {
        if (options?.autoCreate) {
          // Si l'utilisateur n'existe pas et autoCreate est true, créer un nouveau compte
          const userRef = doc(db, 'users', firebaseUser.uid);
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
          const userData = { id: firebaseUser.uid, ...newUserData } as User;
          
          setUser(userData);
          saveUser(userData);
          
          router.push('/settings');
          return;
        } else {
          // Sinon, déconnecter et afficher une erreur
          await signOutUser();
          throw new Error('Aucun compte trouvé avec cette adresse Google. Veuillez d\'abord créer un compte.');
        }
      }

      // Utilisateur existant
      const userData = { id: userDoc.id, ...userDoc.data() } as User;
      
      // Only allow students
      if (userData.role !== 'student') {
        await signOutUser();
        throw new Error('Accès non autorisé. Rôle non reconnu.');
      }
      
      setUser(userData);
      saveUser(userData);
      
      router.push('/settings');
    } catch (error: any) {
      console.error('Erreur de connexion Google:', error);
      
      // Utiliser la fonction de traduction des erreurs Firebase
      let errorMessage = 'Erreur de connexion Google';
      
      if (error.code) {
        errorMessage = getErrorMessage(error.code);
      } else if (error.message) {
        // Pour les erreurs personnalisées
        switch (error.message) {
          case 'Aucun compte trouvé avec cette adresse Google. Veuillez d\'abord créer un compte.':
            errorMessage = 'Aucun compte trouvé avec cette adresse Google. Veuillez d\'abord créer un compte.';
            break;
          case 'Accès non autorisé. Rôle non reconnu.':
            errorMessage = 'Accès non autorisé. Seuls les étudiants peuvent se connecter.';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
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
      
      toast.success('Compte créé avec succès ! Veuillez vous connecter.');
    } catch (error: any) {
      console.error('Erreur de création de compte:', error);
      
      // Utiliser la fonction de traduction des erreurs Firebase
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (error.code) {
        errorMessage = getErrorMessage(error.code);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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