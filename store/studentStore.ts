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

interface Location {
	latitude: number;
	longitude: number;
}

interface Student {
	id: string;
	name: string;
	email: string;
	createdAt: { toDate: () => Date } | string | Date | null; // Timestamp Firebase
	updatedAt: { toDate: () => Date } | string | Date | null; // Timestamp Firebase
	grade?: string;
	mayenneDeClasse?: number;
	online?: boolean;
	profileImage?: string;
	role: string;
	status: string;
	type: string;
	location?: Location;
	[key: string]: unknown;
}

interface StudentsState {
	studentsData: Student[] | null;
	currentUser: Student | null;
	uid: string | null;
	isLoading: boolean;
	error: string | null;
	setStudents: (students: Student[]) => void;
	setCurrentUser: (user: Student | null) => void;
	setUid: (uid: string | null) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	getAllStudents: () => (() => void) | undefined;
	logout: () => Promise<{ success: boolean; error?: string }>;
	updateUserPresence: (params: { uid: string; onlineStatus: boolean }) => Promise<void>;
	updateUserProfile: (updates: Partial<{
		name: string;
		email: string;
		grade: string;
		mayenneDeClasse: string;
		profileImage: string;
	}>) => Promise<void>;
	changeUserPassword: (passwords: {
		oldPassword: string;
		newPassword: string;
		confirmPassword: string;
	}) => Promise<void>;
}

export const useStudentsStore = create<StudentsState>((set: any, get: any) => ({
	studentsData: null,
	currentUser: null,
	uid: null,
	isLoading: false,
	error: null,

	setStudents: (students: Student[]) => set({ studentsData: students }),
	setCurrentUser: (user: Student | null) => set({ currentUser: user }),
	setUid: (uid: string | null) => set({ uid }),
	setLoading: (loading: boolean) => set({ isLoading: loading }),
	setError: (error: string | null) => set({ error }),

	getAllStudents: () => {
		try {
			set({ isLoading: true, error: null });
			
			const usersCollection = collection(db, 'users');
			const q = query(usersCollection, where('role', '==', 'student'));
			
			// Set up real-time listener
			const unsubscribe = onSnapshot(
				q,
				(snapshot) => {
					const studentData = snapshot.docs.map((doc) => {
						const data = doc.data();
						return {
							id: doc.id,
							name: data.name || '',
							email: data.email || '',
							createdAt: data.createdAt, // Garder le timestamp original
							updatedAt: data.updatedAt, // Garder le timestamp original
							grade: data.grade || '',
							mayenneDeClasse: data.mayenneDeClasse || 0,
							online: data.online || false,
							profileImage: data.profileImage || '',
							role: data.role || 'student',
							status: data.status || 'Pending',
							type: data.type || 'authWithEmail',
							location: data.location || null,
							...data // Pour inclure tous les autres champs
						};
					}) as Student[];
					
					set({ studentsData: studentData, isLoading: false });
				},
				(error: Error) => {
					console.error('Failed to fetch students:', error);
					set({ error: error.message, isLoading: false });
				}
			);
			
			// Return unsubscribe function for cleanup
			return unsubscribe;
		} catch (error: any) {
			console.error('Failed to fetch students:', error);
			set({ error: error.message, isLoading: false });
			return undefined;
		}
	},

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

	updateUserPresence: async ({ uid, onlineStatus }) => {
		try {
			const userRef = doc(db, 'users', uid);
			
			await updateDoc(userRef, {
				online: onlineStatus,
				lastSeen: serverTimestamp(),
			});
		} catch (error: any) {
			console.error('Failed to update user presence:', error);
			set({ error: error.message });
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