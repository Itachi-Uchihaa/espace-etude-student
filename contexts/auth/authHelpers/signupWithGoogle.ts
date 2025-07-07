import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getUserDoc, signOutUser } from '@/lib/firebase';
import { auth, db } from '@/config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Location } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'react-toastify';

export const handleSignUpWithGoogle = async (
  location: Location,
  router: any,
  setLoading?: (loading: boolean) => void
) => {
  let unsubscribe: (() => void) | null = null;
  
  try {
    if (setLoading) setLoading(true);
    console.log('Début d\'inscription Google avec géolocalisation:', location);
    
    // Étape 1: Connexion avec Google
    const provider = new GoogleAuthProvider();
    const response = await signInWithPopup(auth, provider);
    const firebaseUser = response.user;
    
    if (!firebaseUser) {
      throw new Error('Google signup failed. No user found.');
    }

    console.log('Utilisateur Google connecté pour inscription:', firebaseUser.uid);
    console.log('Email de l\'utilisateur Google:', firebaseUser.email);
    console.log('Nom de l\'utilisateur Google:', firebaseUser.displayName);
    
    // Étape 2: Vérifier si l'utilisateur existe déjà
    const userDoc = await getUserDoc(firebaseUser.uid);
    if (userDoc.exists()) {
      console.log('Utilisateur Google existe déjà, déconnexion...');
      await signOutUser();
      throw new Error('Un compte existe déjà avec cette adresse Google. Veuillez vous connecter.');
    }

    console.log('Création d\'un nouvel utilisateur Google avec géolocalisation');
    
    // Étape 3: Créer le document Firestore pour le nouvel utilisateur
    const userRef = doc(db, 'users', firebaseUser.uid);
    const newUserData = {
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || '',
      grade: '', // Champ requis, sera mis à jour plus tard
      mayenneDeClasse: 0, // Champ requis, sera mis à jour plus tard
      online: false, // Commence hors ligne
      profileImage: firebaseUser.photoURL || '', // Utiliser la photo Google si disponible
      createdAt: serverTimestamp(),
      role: 'student',
      type: 'authWithGoogle',
      status: 'Pending',
      location, // Inclure la géolocalisation
      updatedAt: serverTimestamp(),
    };
    
    console.log('Tentative de création du document Firestore pour Google:', newUserData);
    console.log('UID utilisé pour la création:', firebaseUser.uid);
    
    // Étape 4: Créer le document dans Firestore
    try {
      console.log('Début du bloc try - Tentative de setDoc...');
      console.log('Configuration Firebase DB:', db);
      console.log('Référence utilisateur:', userRef);
      console.log('Données à enregistrer:', JSON.stringify(newUserData, null, 2));
      
      await setDoc(userRef, newUserData);
      console.log('Document Firestore créé avec succès pour Google');
    } catch (firestoreError: any) {
      console.error('Erreur lors de la création du document Firestore pour Google:', firestoreError);
      console.error('Code d\'erreur:', firestoreError.code);
      console.error('Message d\'erreur:', firestoreError.message);
      console.error('Stack trace:', firestoreError.stack);
      console.error('Détails complets de l\'erreur:', firestoreError);
      
      // Nettoyer en cas d'erreur
      await signOutUser();
      throw new Error(`Erreur lors de la création du profil utilisateur Google: ${firestoreError.message}`);
    }

    // Étape 5: Vérifier que le document a bien été créé
    try {
      console.log('Début de la vérification du document créé...');
      const createdDoc = await getUserDoc(firebaseUser.uid);
      console.log('Document récupéré:', createdDoc.exists() ? 'existe' : 'n\'existe pas');
      if (!createdDoc.exists()) {
        throw new Error('Le document utilisateur Google n\'a pas été créé correctement');
      }
      console.log('Vérification du document Firestore Google réussie');
    } catch (verifyError: any) {
      console.error('Erreur lors de la vérification du document Google:', verifyError);
      await signOutUser();
      throw new Error('Impossible de vérifier la création du profil utilisateur Google');
    }
    
    console.log('Fin du bloc try - Début de la déconnexion...');
    // Déconnecter l'utilisateur après la création du compte pour qu'il puisse se connecter proprement
    await signOutUser();
    
    toast.success('Compte créé avec succès ! Veuillez vous connecter.');
    console.log('Création d\'utilisateur Google terminée avec succès');
    
  } catch (error: any) {
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
  } finally {
    if (setLoading) setLoading(false);
  }
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