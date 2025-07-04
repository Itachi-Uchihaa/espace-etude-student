import { signInWithGoogle, getUserDoc, signOutUser } from '@/lib/firebase';
import { auth, db } from '@/config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, Location } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'react-toastify';
import AnalyticsService from '@/lib/analyticsService';

export const handleSignUpWithGoogle = async (
  location: Location,
  setUser: (user: User | null) => void,
  saveUser: (user: User | null) => void,
  router: any
) => {
  console.log('Début d\'inscription Google avec géolocalisation:', location);
  
  const response = await signInWithGoogle();
  const firebaseUser = response.user;
  
  if (!firebaseUser) {
    throw new Error('Google signup failed. No user found.');
  }

  console.log('Utilisateur Google connecté pour inscription:', firebaseUser.uid);
  console.log('Email de l\'utilisateur Google:', firebaseUser.email);
  console.log('Nom de l\'utilisateur Google:', firebaseUser.displayName);
  
  // Vérifier si l'utilisateur existe déjà
  const userDoc = await getUserDoc(firebaseUser.uid);
  if (userDoc.exists()) {
    console.log('Utilisateur Google existe déjà, déconnexion...');
    await signOutUser();
    throw new Error('Un compte existe déjà avec cette adresse Google. Veuillez vous connecter.');
  }

  console.log('Création d\'un nouvel utilisateur Google avec géolocalisation');
  
  // Créer le document Firestore pour le nouvel utilisateur
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
    location, // Inclure la géolocalisation
    updatedAt: serverTimestamp(),
  };
  
  console.log('Tentative de création du document Firestore pour Google:', newUserData);
  console.log('UID utilisé pour la création:', firebaseUser.uid);
  
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
    status: newUserData.status,
    location: newUserData.location
  } as User;
  
  setUser(userData);
  saveUser(userData);

  await AnalyticsService.trackLogin();
  
  router.push('/settings');
  toast.success('Inscription avec Google réussie !');
};

export const handleGoogleSignUpError = (error: any) => {
  console.error('Erreur d\'inscription Google:', error);
  
  // Utiliser la fonction de traduction des erreurs Firebase
  let errorMessage = 'Erreur d\'inscription Google';
  
  if (error.code) {
    errorMessage = getErrorMessage(error.code);
  } else if (error.message) {
    // Pour les erreurs personnalisées
    switch (error.message) {
      case 'Un compte existe déjà avec cette adresse Google. Veuillez vous connecter.':
        errorMessage = 'Un compte existe déjà avec cette adresse Google. Veuillez vous connecter.';
        break;
      default:
        errorMessage = error.message;
    }
  }
  
  toast.error(errorMessage);
  throw error;
}; 