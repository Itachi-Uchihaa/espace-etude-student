import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { loginUser, loginWithGoogle, logout } from './userThunk';

export interface UserState {
	user: any | null;
	uid: string | null;
	isLoading: boolean;
	error: unknown | null;
}

const initialState: UserState = {
	user: getCookie('user') ? JSON.parse(getCookie('user') as string) : null,
	uid: (getCookie('uid') as string) || null,
	isLoading: false,
	error: null,
};

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		// Additional reducers if needed
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

export default userSlice.reducer;
