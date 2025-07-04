import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type FirebaseTimestamp = { toDate: () => Date } | string | Date | null | undefined;

export const convertTimestamp = (timestamp: FirebaseTimestamp): string => {
	if (!timestamp) return '';
	
	if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
		return timestamp.toDate().toISOString();
	}
	
	if (typeof timestamp === 'string') {
		return timestamp;
	}
	
	if (timestamp instanceof Date) {
		return timestamp.toISOString();
	}
	
	return new Date(timestamp).toISOString();
};

export const formatDate = (timestamp: FirebaseTimestamp): string => {
	const dateString = convertTimestamp(timestamp);
	if (!dateString) return '';
	
	const date = new Date(dateString);
	return date.toLocaleDateString('fr-FR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
};

export const getRelativeTime = (timestamp: FirebaseTimestamp): string => {
	const dateString = convertTimestamp(timestamp);
	if (!dateString) return '';
	
	const date = new Date(dateString);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	
	if (diffInSeconds < 60) {
		return 'À l\'instant';
	}
	
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
	}
	
	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
	}
	
	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
	}
	
	return formatDate(timestamp);
};

// Fonction utilitaire pour traduire les erreurs Firebase
export const getErrorMessage = (errorCode: string): string => {
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