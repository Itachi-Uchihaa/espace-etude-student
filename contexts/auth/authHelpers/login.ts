import { signInUser, getUserDoc } from '@/lib/firebase';
import { User } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'react-toastify';
import AnalyticsService from '@/lib/analyticsService';

export const handleLogin = async (
  email: string, 
  password: string,
  setUser: (user: User | null) => void,
  saveUser: (user: User | null) => void,
  router: any
) => {
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
    throw new Error('Accès non autorisé. Rôle non reconnu.');
  }
  
  setUser(userData);
  saveUser(userData);

  await AnalyticsService.trackLogin();
  
  router.push('/settings');
};

export const handleLoginError = (error: any) => {
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
}; 