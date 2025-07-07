import { onAuthStateChange, getUserDoc, signOutUser } from '@/lib/firebase';
import { auth, db } from '@/config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/lib/types';
import { toast } from 'react-toastify';
import { setupUserPresence, cleanupUserPresence } from './firebasePresence';
import { saveUser } from './saveUser';

export const createAuthStateListener = (
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void,
  router: any,
  pathname: string,
  isLoggingIn: boolean
) => {
  return onAuthStateChange(async (firebaseUser) => {
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
          
          // Mettre à jour updatedAt dans Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          await updateDoc(userRef, {
            updatedAt: serverTimestamp(),
          });
          
          // Configurer le système de présence (Realtime Database seulement)
          await setupUserPresence(firebaseUser.uid);
          
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
      // Utilisateur déconnecté
      console.log('Utilisateur déconnecté...');
      
      setUser(null);
      saveUser(null);
      if (!isLoggingIn && pathname !== '/login' && pathname !== '/forgot-password' && pathname !== '/reset-password' && pathname !== '/' && pathname !== '/sign-up' && pathname !== '/avatar') {
        router.push('/login');
      }
    }
    setLoading(false);
  });
};

export const createBeforeUnloadHandler = (user: User | null) => {
  return async () => {
    if (user) {
      try {
        await cleanupUserPresence(user.id);
      } catch (error) {
        console.error('Erreur lors du nettoyage de la présence (beforeunload):', error);
      }
    }
  };
}; 