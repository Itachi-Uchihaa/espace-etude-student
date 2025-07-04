import { signInWithGoogle, getUserDoc, signOutUser } from '@/lib/firebase';
import { auth, db } from '@/config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'react-toastify';
import AnalyticsService from '@/lib/analyticsService';

export const handleLoginWithGoogle = async (
  options: { autoCreate?: boolean } = {},
  setUser: (user: User | null) => void,
  saveUser: (user: User | null) => void,
  router: any
) => {
  console.log('Début de connexion Google avec options:', options);
  
  const response = await signInWithGoogle();
  const firebaseUser = response.user;
  
  if (!firebaseUser) {
    throw new Error('Google login failed. No user found.');
  }

  console.log('Utilisateur Google connecté:', firebaseUser.uid);
  console.log('Email de l\'utilisateur Google:', firebaseUser.email);
  console.log('Nom de l\'utilisateur Google:', firebaseUser.displayName);
  
  // Attendre un peu pour s'assurer que l'authentification est complète
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Vérifier que l'utilisateur est toujours authentifié
  if (!auth.currentUser) {
    throw new Error('Utilisateur non authentifié après connexion Google');
  }
  
  console.log('Vérification de l\'authentification réussie, auth.currentUser:', auth.currentUser.uid);
  
  const userDoc = await getUserDoc(firebaseUser.uid);

  // Vérifier si l'utilisateur existe déjà
  if (!userDoc.exists()) {
    console.log('Utilisateur Google non trouvé dans Firestore');
    
    if (options?.autoCreate) {
      console.log('Création automatique d\'un nouvel utilisateur Google');
      
      // Si l'utilisateur n'existe pas et autoCreate est true, créer un nouveau compte
      const userRef = doc(db, 'users', firebaseUser.uid);
      const newUserData = {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        grade: '', // Champ requis, sera mis à jour plus tard
        mayenneDeClasse: 0, // Champ requis, sera mis à jour plus tard
        online: false, // Commence hors ligne
        profileImage: '', // Champ requis, sera mis à jour plus tard
        createdAt: serverTimestamp(),
        role: 'student',
        type: 'authWithGoogle',
        status: 'Pending',
        updatedAt: serverTimestamp(),
      };
      
      console.log('Tentative de création du document Firestore pour Google:', newUserData);
      console.log('UID utilisé pour la création:', firebaseUser.uid);
      
      // Vérifier que l'utilisateur a les permissions nécessaires
      console.log('Vérification des permissions Firestore...');
      console.log('auth.currentUser existe:', !!auth.currentUser);
      console.log('auth.currentUser.uid:', auth.currentUser?.uid);
      console.log('firebaseUser.uid:', firebaseUser.uid);
      console.log('Les UIDs correspondent:', auth.currentUser?.uid === firebaseUser.uid);
      
      try {
        await setDoc(userRef, newUserData);
        console.log('Document Firestore créé avec succès pour Google');
        
        // Vérifier que le document a bien été créé
        const createdDoc = await getUserDoc(firebaseUser.uid);
        if (!createdDoc.exists()) {
          throw new Error('Le document utilisateur Google n\'a pas été créé correctement');
        }
        console.log('Vérification du document Firestore Google réussie');
        
      } catch (firestoreError: any) {
        console.error('Erreur lors de la création du document Firestore pour Google:', firestoreError);
        console.error('Code d\'erreur:', firestoreError.code);
        console.error('Message d\'erreur:', firestoreError.message);
        await signOutUser();
        throw new Error(`Erreur lors de la création du profil utilisateur Google: ${firestoreError.message}`);
      }
      
      const userData = { 
        id: firebaseUser.uid, 
        email: newUserData.email,
        name: newUserData.name,
        grade: newUserData.grade,
        mayenneDeClasse: newUserData.mayenneDeClasse,
        online: newUserData.online,
        profileImage: newUserData.profileImage,
        role: newUserData.role,
        type: newUserData.type,
        status: newUserData.status
      } as User;
      
      setUser(userData);
      saveUser(userData);

      await AnalyticsService.trackLogin();
      
      router.push('/settings');
      return;
    } else {
      // Sinon, déconnecter et afficher une erreur
      console.log('AutoCreate désactivé, déconnexion de l\'utilisateur Google');
      await signOutUser();
      throw new Error('Aucun compte trouvé avec cette adresse Google. Veuillez d\'abord créer un compte.');
    }
  }

  console.log('Utilisateur Google existant trouvé dans Firestore');
  
  // Utilisateur existant
  const userData = { id: userDoc.id, ...userDoc.data() } as User;
  
  // Only allow students
  if (userData.role !== 'student') {
    console.log('Utilisateur Google avec rôle non autorisé:', userData.role);
    await signOutUser();
    throw new Error('Accès non autorisé. Rôle non reconnu.');
  }
  
  setUser(userData);
  saveUser(userData);
  
  router.push('/settings');
};

export const handleGoogleLoginError = (error: any) => {
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
}; 