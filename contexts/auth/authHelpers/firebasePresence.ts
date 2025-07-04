import { getDatabase, ref, set, onDisconnect, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';

// Fonction pour gérer la présence utilisateur
export const setupUserPresence = async (userId: string) => {
  try {
    const rtdb = getDatabase();
    const presenceRef = ref(rtdb, `presence/${userId}`);
    
    // Mettre en ligne l'utilisateur
    await set(presenceRef, {
      online: true,
      lastSeen: rtdbServerTimestamp()
    });
    
    // Configurer la déconnexion automatique
    await onDisconnect(presenceRef).set({
      online: false,
      lastSeen: rtdbServerTimestamp()
    });
    
    console.log('Système de présence configuré pour:', userId);
  } catch (error) {
    console.error('Erreur lors de la configuration de la présence:', error);
  }
};

// Fonction pour nettoyer la présence
export const cleanupUserPresence = async (userId: string) => {
  try {
    const rtdb = getDatabase();
    const presenceRef = ref(rtdb, `presence/${userId}`);
    await set(presenceRef, {
      online: false,
      lastSeen: rtdbServerTimestamp()
    });
    console.log('Présence nettoyée pour:', userId);
  } catch (error) {
    console.error('Erreur lors du nettoyage de la présence:', error);
  }
}; 