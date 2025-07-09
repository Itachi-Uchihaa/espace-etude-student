import { createAsyncThunk } from '@reduxjs/toolkit';
import {
	createUserWithEmailAndPassword,
	EmailAuthProvider,
	GoogleAuthProvider,
	reauthenticateWithCredential,
	sendEmailVerification,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	updatePassword,
} from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	serverTimestamp,
	setDoc,
	updateDoc,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import { setChildProfiles } from './userSlice';

export const createUser = createAsyncThunk<any, any>(
	'user/createUser',
	async ({ email, password, name, location }, thunkAPI) => {
		try {
			// Create user in Firebase Auth
			const response = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = response.user;

			if (!user) {
				toast.error('Signup failed. Please try again.');
				return thunkAPI.rejectWithValue(
					'User not returned from Firebase'
				);
			}
			await sendEmailVerification(user);
			// Build Firestore document
			const userDoc = {
				email: user.email,
				name: name || '',
				// createdAt: serverTimestamp(),
				role: 'student',
				type: 'authWithEmail',
				status: 'Pending',
				// updatedAt: serverTimestamp(),
				// grade: '',
				// mayenneDeClasse: 0,
				online: false,
				// profileImage: '',
				location,
			};

			// Store user doc in Firestore
			const userRef = doc(db, 'users', user.uid);
			await setDoc(userRef, userDoc);
			// Immediately create default child profile (parent profile)
			const fullName = name;
			const [firstName, ...rest] = fullName.trim().split(' ');
			const lastName = rest.join(' ');
			await addDoc(collection(db, 'users', user.uid, 'profiles'), {
				firstName: firstName || '',
				lastName: lastName || '',
				avatar: '',
				pin: '',
				createdAt: serverTimestamp(),
				grade: '',
				mayenneDeClasse: 0,
				updatedAt: serverTimestamp(),
				isParent: true,
			});

			toast.success('Account created successfully!');
			return { id: user.uid, ...userDoc };
		} catch (error: any) {
			console.error('Signup error:', error.message);
			toast.error(error.message || 'Account creation failed');
			return thunkAPI.rejectWithValue(error.message || 'Signup failed');
		}
	}
);

export const loginUser = createAsyncThunk<any, any>(
	'user/login',
	async ({ email, password }, thunkAPI) => {
		try {
			// Sign in with Firebase Auth
			const response = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = response.user;

			if (!user) {
				toast.error('Login failed. No user found.');
				return thunkAPI.rejectWithValue(
					'No user returned from Firebase'
				);
			}

			// 🔒 Check if email is verified
			if (!user.emailVerified) {
				await auth.signOut();
				toast.error('Please verify your email before logging in.');
				return thunkAPI.rejectWithValue('Email not verified');
			}

			// Get user document from Firestore
			const userRef = doc(db, 'users', user.uid);
			const userDoc = await getDoc(userRef);

			if (!userDoc.exists()) {
				toast.error(
					'Your account data has been deleted from the database.'
				);
				return thunkAPI.rejectWithValue('User data not found');
			}

			const userData = { id: userDoc.id, ...userDoc.data() };
			return userData;
		} catch (error: any) {
			console.error('Login error:', error.message || error);
			toast.error('Invalid login credentials, please try again.');
			return thunkAPI.rejectWithValue(
				error.message || 'Unknown login error'
			);
		}
	}
);

export const loginWithGoogle = createAsyncThunk<any, any>(
	'user/loginWithGoogle',
	async ({ location }, thunkAPI) => {
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			if (!user) {
				toast.error('Google login failed. Please try again.');
				return thunkAPI.rejectWithValue(
					'Google sign-in returned no user'
				);
			}

			const userRef = doc(db, 'users', user.uid);
			const userDoc = await getDoc(userRef);

			if (!userDoc.exists()) {
				const newUserData = {
					email: user.email,
					name: user.displayName || '',
					// createdAt: serverTimestamp(),
					role: 'student',
					type: 'authWithGoogle',
					status: 'Pending',
					// updatedAt: serverTimestamp(),
					// grade: '',
					// mayenneDeClasse: 0,
					online: false,
					// profileImage: '',
					location,
				};
				await setDoc(userRef, newUserData);
				// Create default profile for Google signup
				const fullName = user.displayName || '';
				const [firstName, ...rest] = fullName.trim().split(' ');
				const lastName = rest.join(' ');
				await addDoc(collection(db, 'users', user.uid, 'profiles'), {
					firstName: firstName || '',
					lastName: lastName || '',
					avatar: '',
					pin: '',
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
					isParent: true,
					grade: '',
					mayenneDeClasse: 0,
				});
				return { id: user.uid, ...newUserData };
			}

			const existingUser = { id: userDoc.id, ...userDoc.data() };
			return existingUser;
		} catch (error: any) {
			console.error('Google login error:', error.message);
			toast.error(error.message || 'Google login failed');
			return thunkAPI.rejectWithValue(
				error.message || 'Google login error'
			);
		}
	}
);

export const logout = createAsyncThunk<void, void>(
	'user/logout',
	async (_, thunkAPI) => {
		try {
			await signOut(auth);
			return;
		} catch (error: any) {
			console.error('Logout error:', error.message);
			return thunkAPI.rejectWithValue(error.message);
		}
	}
);

export const updateUserProfile = createAsyncThunk<any, Partial<any>>(
	'user/updateUserProfile',
	async (updates, thunkAPI) => {
		try {
			const user = auth.currentUser;

			if (!user) throw new Error('User not authenticated');

			const userRef = doc(db, 'users', user.uid);

			// Merge dynamic updates with timestamp
			const updateData = {
				...updates,
				updatedAt: serverTimestamp(),
			};

			await updateDoc(userRef, updateData);

			toast.success('Profile updated successfully!');
			return {
				id: user.uid,
				...updates,
			};
		} catch (error: any) {
			console.error('Profile update error:', error.message);
			toast.error(error.message || 'Profile update failed');
			return thunkAPI.rejectWithValue(error.message);
		}
	}
);

export const updateProfile = createAsyncThunk<any, any>(
	'user/updateChildProfile',
	async ({ uid, profileId, updates }, { rejectWithValue }) => {
		try {
			const profileRef = doc(db, 'users', uid, 'profiles', profileId);
			await updateDoc(profileRef, {
				...updates,
				updatedAt: serverTimestamp(),
			});
			toast.success('Profile updated successfully!');
			return true;
		} catch (error: any) {
			console.error('Profile update error:', error.message);
			toast.error(error.message || 'Failed to update profile');
			return rejectWithValue(error.message);
		}
	}
);

export const changeUserPassword = createAsyncThunk<any, any>(
	'user/changeUserPassword',
	async (
		{
			oldPassword,
			newPassword,
			confirmPassword,
		}: {
			oldPassword: string;
			newPassword: string;
			confirmPassword: string;
		},
		thunkAPI
	) => {
		try {
			if (newPassword !== confirmPassword) {
				throw new Error('Passwords do not match');
			}

			const user = auth.currentUser;

			if (!user || !user.email) {
				throw new Error('User not authenticated');
			}

			const credential = EmailAuthProvider.credential(
				user.email,
				oldPassword
			);

			await reauthenticateWithCredential(user, credential);
			await updatePassword(user, newPassword);

			toast.success('Password changed successfully!');
			return true;
		} catch (error: any) {
			console.error('Password change error:', error.message);
			toast.error(error.message || 'Password change failed');
			return thunkAPI.rejectWithValue(error.message);
		}
	}
);

// export const updateUserPresence = createAsyncThunk<any, any>(
// 	'user/updateUserPresence',
// 	async ({ uid, onlineStatus }, thunkAPI) => {
// 		try {
// 			const userRef = doc(db, 'users', uid);

// 			await updateDoc(userRef, {
// 				online: onlineStatus,
// 				lastSeen: serverTimestamp(),
// 			});

// 			return { uid, online: onlineStatus };
// 		} catch (error: any) {
// 			console.error('Failed to update user presence:', error);
// 			return thunkAPI.rejectWithValue(error.message);
// 		}
// 	}
// );

export const updateUserPresence = createAsyncThunk<any, any>(
	'user/updateUserPresence',
	async ({ uid, onlineStatus }, thunkAPI) => {
		try {
			const userDocRef = doc(db, 'users', uid);
			const updatePresence = async (status: boolean) => {
				await updateDoc(userDocRef, {
					online: status,
					lastSeen: serverTimestamp(),
				});
			};
			// Initial update
			await updatePresence(onlineStatus);
			// Handle tab/browser close
			if (onlineStatus) {
				const unloadHandler = () => updatePresence(false);
				// Remove and re-add to prevent duplicates
				window.removeEventListener('beforeunload', unloadHandler);
				window.addEventListener('beforeunload', unloadHandler);
			}
			return { uid, online: onlineStatus };
		} catch (error: any) {
			console.error('Error updating presence:', error.message);
			return thunkAPI.rejectWithValue(error.message);
		}
	}
);

export const saveUserPlan = createAsyncThunk<any, any>(
	'user/saveUserPlan',
	async ({ uid, plan }, { rejectWithValue }) => {
		try {
			await setDoc(doc(db, 'users', uid), { plan }, { merge: true });
		} catch (error: any) {
			console.error('[SAVE_USER_PLAN_ERROR]', error.message);
			return rejectWithValue(error.message);
		}
	}
);

export const createChildProfileThunk = createAsyncThunk<any, any>(
	'user/createChildProfile',
	async ({ uid, firstName, lastName, avatar, pin }, { rejectWithValue }) => {
		try {
			if (!uid) throw new Error('UID manquant.');
			const userRef = doc(db, 'users', uid);
			const profilesRef = collection(db, 'users', uid, 'profiles');
			const existingProfilesSnap = await getDocs(profilesRef);
			const profiles = existingProfilesSnap.docs.map(doc => doc.data());
			const existingCount = profiles.filter(p => !p.isParent).length;
			const userDocSnap = await getDoc(userRef);
			const userData = userDocSnap.exists() ? userDocSnap.data() : null;
			const allowedChildren = Number(userData?.plan?.children || 0);
			if (existingCount >= allowedChildren) {
				const message = `Limite atteinte : votre plan autorise seulement ${allowedChildren} profil(s).`;
				toast.error(message);
				return rejectWithValue(message);
			}
			const hashedPin = await bcrypt.hash(pin, 10);
			await addDoc(profilesRef, {
				firstName,
				lastName,
				avatar,
				pin: hashedPin,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				isParent: false,
				grade: '',
				mayenneDeClasse: 0,
			});
			return { success: true };
		} catch (error: any) {
			console.error('[CREATE_CHILD_PROFILE_ERROR]', error.message);
			return rejectWithValue(error.message);
		}
	}
);

export const fetchChildProfiles = (uid: any) => async (dispatch: any) => {
	try {
		const profilesRef = collection(db, 'users', uid, 'profiles');
		onSnapshot(profilesRef, (snapshot: any) => {
			const profiles = snapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			}));

			dispatch(setChildProfiles(profiles));
		});
	} catch (error: any) {
		console.error('[FETCH_CHILD_PROFILES_ERROR]', error.message);
	}
};
