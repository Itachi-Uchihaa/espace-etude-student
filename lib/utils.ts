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