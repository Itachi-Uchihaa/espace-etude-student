import { deleteCookie, setCookie } from 'cookies-next';
import { User } from '@/lib/types';

// Fonction pour sauvegarder l'utilisateur dans les cookies
export const saveUser = (user: User | null) => {
  if (user) {
    setCookie('user', user);
    setCookie('uid', user.id);
  } else {
    deleteCookie('user');
    deleteCookie('uid');
  }
}; 