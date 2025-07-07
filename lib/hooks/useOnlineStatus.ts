// Hook supprimé - plus de logique online dans Firestore
export const useOnlineStatus = () => {
  return {
    onlineUsers: [],
    offlineUsers: [],
    allUsers: [],
    loading: false,
  };
}; 