import { create } from 'zustand';
import { getUsersCollection, signOutUser } from '@/lib/firebase';
import { auth, db } from '@/config/firebase';
import { 
	doc, 
	updateDoc, 
	serverTimestamp, 
	query, 
	where, 
	onSnapshot,
	collection
} from 'firebase/firestore';
import { 
	updatePassword, 
	EmailAuthProvider, 
	reauthenticateWithCredential 
} from 'firebase/auth';
import { StoreStudent, StudentsState } from '@/lib/types';

export const useStudentsStore = create<StudentsState>((set: any, get: any) => ({
	studentsData: null,
	currentUser: null,
	uid: null,
	isLoading: false,
	error: null,

	setStudents: (students: StoreStudent[]) => set({ studentsData: students }),
	setCurrentUser: (user: StoreStudent | null) => set({ currentUser: user }),
	setUid: (uid: string | null) => set({ uid }),
	setLoading: (loading: boolean) => set({ isLoading: loading }),
	setError: (error: string | null) => set({ error }),

	logout: async () => {
		try {
			set({ isLoading: true, error: null });
			await signOutUser();
			set({ currentUser: null, uid: null, isLoading: false });
			return { success: true };
		} catch (error: any) {
			const errorMessage = error.message || 'Failed to logout';
			set({ error: errorMessage, isLoading: false });
			return { success: false, error: errorMessage };
		}
	},

	updateUserProfile: async (updates) => {
		const { uid } = get();
		if (!uid) return;
		
		try {
			const userRef = doc(db, 'users', uid);
			
			await updateDoc(userRef, {
				...updates,
				updatedAt: serverTimestamp(),
			});
			
			// Mettre à jour le currentUser dans le store
			const { currentUser } = get();
			if (currentUser) {
				set({ currentUser: { ...currentUser, ...updates } });
			}
		} catch (error: any) {
			console.error('Failed to update profile:', error);
			set({ error: error.message });
			throw error;
		}
	},

	changeUserPassword: async (passwords) => {
		try {
			const user = auth.currentUser;
			
			if (!user || !user.email) {
				throw new Error('User not authenticated');
			}

			// Réauthentifier l'utilisateur
			const credential = EmailAuthProvider.credential(user.email, passwords.oldPassword);
			await reauthenticateWithCredential(user, credential);
			
			// Changer le mot de passe
			await updatePassword(user, passwords.newPassword);
		} catch (error: any) {
			console.error('Failed to change password:', error);
			set({ error: error.message });
			throw error;
		}
	},
})); 