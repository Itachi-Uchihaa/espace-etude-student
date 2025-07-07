import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { signOutUser } from '@/lib/firebase';
import { auth, db } from '@/config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, Location } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'react-toastify';

export const handleSignUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  location?: Location,
  setLoading?: (loading: boolean) => void
) => {
  let firebaseUser = null;
  
  try {
    if (setLoading) setLoading(true);
    console.log('Début de création d\'utilisateur:', { email, name });
    
    // Étape 1: Créer l'utilisateur dans Firebase Authentication
    const response = await createUserWithEmailAndPassword(auth, email, password);
    firebaseUser = response.user;

    if (!firebaseUser) {
      throw new Error('Signup failed. Please try again.');
    }

    console.log('Utilisateur créé dans Firebase Auth:', firebaseUser.uid);
    await sendEmailVerification(firebaseUser);
    // Étape 2: Créer le document dans Firestore
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = {
      email: firebaseUser.email || '',
      name: name || '',
      grade: '', // Champ requis, sera mis à jour plus tard
      mayenneDeClasse: 0, // Champ requis, sera mis à jour plus tard
      online: false, // Commence hors ligne
      profileImage: '', // Champ requis, sera mis à jour plus tard
      createdAt: serverTimestamp(),
      role: 'student',
      type: 'authWithEmail',
      status: 'Pending',
      location,
      updatedAt: serverTimestamp(),
    };

    console.log('Tentative de création du document Firestore:', userDoc);

    try {
      await setDoc(userRef, userDoc);
      console.log('Document Firestore créé avec succès');
    } catch (firestoreError: any) {
      console.error('Erreur lors de la création du document Firestore:', firestoreError);
      
      // Si la création Firestore échoue, supprimer l'utilisateur Firebase Auth
      try {
        await firebaseUser.delete();
        console.log('Utilisateur Firebase Auth supprimé après échec Firestore');
      } catch (deleteError) {
        console.error('Erreur lors de la suppression de l\'utilisateur Firebase Auth:', deleteError);
      }
      
      throw new Error(`Erreur lors de la création du profil utilisateur: ${firestoreError.message}`);
    }

    // Étape 3: Vérifier que le document a bien été créé
    try {
      const { getUserDoc } = await import('@/lib/firebase');
      const createdDoc = await getUserDoc(firebaseUser.uid);
      if (!createdDoc.exists()) {
        throw new Error('Le document utilisateur n\'a pas été créé correctement');
      }
      console.log('Vérification du document Firestore réussie');
    } catch (verifyError: any) {
      console.error('Erreur lors de la vérification du document:', verifyError);
      throw new Error('Impossible de vérifier la création du profil utilisateur');
    }

    // Sign out the user after creating account so they can log in properly
    // await signOutUser();
    
    toast.success('Compte créé avec succès ! Veuillez vous connecter.');
    console.log('Création d\'utilisateur terminée avec succès');
    
  } catch (error: any) {
    console.error('Erreur de création de compte:', error);
    
    // Si l'utilisateur Firebase Auth a été créé mais qu'il y a eu une erreur après
    if (firebaseUser && error.message && !error.message.includes('auth/')) {
      try {
        await firebaseUser.delete();
        console.log('Utilisateur Firebase Auth supprimé après erreur');
      } catch (deleteError) {
        console.error('Erreur lors de la suppression de l\'utilisateur après erreur:', deleteError);
      }
    }
    
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
    if (setLoading) setLoading(false);
  }
}; 