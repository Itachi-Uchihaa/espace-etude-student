import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { loginUser, loginWithGoogle, logout } from './userThunk';

export interface UserState {
	user: any | null;
	avatars: any;
	activeProfile: any | null;
	uid: string | null;
	isLoading: boolean;
	error: unknown | null;
}

const initialState: UserState = {
	user: getCookie('user') ? JSON.parse(getCookie('user') as string) : null,
	avatars: [],
	activeProfile: getCookie('activeProfile') ? JSON.parse(getCookie('activeProfile') as string): null,
	uid: (getCookie('uid') as string) || null,
	isLoading: false,
	error: null,
};

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		// Additional reducers if needed
		setChildProfiles: (state, action) => {
			state.avatars = action.payload;
		},
		setActiveProfile: (state, action) => {
		state.activeProfile = action.payload;
		setCookie('activeProfile', JSON.stringify(action.payload));
		},
		clearActiveProfile: state => {
			state.activeProfile = null;
			deleteCookie('activeProfile');
		},
	},
	extraReducers: builder => {
		/* ---- loginUser ---- */
		builder
			.addCase(loginUser.pending, state => {
				state.isLoading = true;
			})
			.addCase(
				loginUser.fulfilled,
				(state, action: PayloadAction<any>) => {
					state.user = action.payload;
					state.uid = action.payload.id;
					setCookie('uid', action.payload.id);
					setCookie('user', action.payload);
					state.isLoading = false;
				}
			)
			.addCase(loginUser.rejected, state => {
				state.isLoading = false;
			})

			/* ---- loginUser with google ---- */
			.addCase(loginWithGoogle.pending, state => {
				state.isLoading = true;
			})
			.addCase(
				loginWithGoogle.fulfilled,
				(state, action: PayloadAction<any>) => {
					state.user = action.payload;
					state.uid = action.payload.id;
					setCookie('uid', action.payload.id);
					setCookie('user', action.payload);
					state.isLoading = false;
				}
			)
			.addCase(loginWithGoogle.rejected, state => {
				state.isLoading = false;
			})
			/* ---- logout ---- */
			.addCase(logout.pending, state => {
				state.isLoading = true;
			})
			.addCase(logout.fulfilled, state => {
				state.isLoading = false;
				state.user = null;
				state.uid = null;
				deleteCookie('user');
				deleteCookie('uid');
			})
			.addCase(logout.rejected, state => {
				state.isLoading = false;
			});
	},
});

export const { setChildProfiles, setActiveProfile, clearActiveProfile } = userSlice.actions;
export default userSlice.reducer;
