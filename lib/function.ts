import { storage } from '@/config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from "react-toastify"

export const uploadFile = async (
	file: File, 
	storagePath: string, 
	onProgress?: (progress: number) => void
): Promise<string> => {
	try {
		const storageRef = ref(storage, storagePath);
		const uploadTask = uploadBytesResumable(storageRef, file);

		return new Promise((resolve, reject) => {
			uploadTask.on(
				'state_changed',
				snapshot => {
					// Calculate progress percentage
					const progress =
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					if (onProgress) {
						onProgress(progress);
					}
				},
				error => {
					console.error('Upload error:', error);
					toast.error('Upload failed');
					reject(error);
				},
				async () => {
					try {
						const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
						resolve(downloadURL);
					} catch (error) {
						console.error('Error getting download URL:', error);
						toast.error('Error getting file URL');
						reject(error);
					}
				}
			);
		});
	} catch (error) {
		console.error('Error: ', error);
		toast.error('Error uploading file, please try again');
		throw error;
	}
};
