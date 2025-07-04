'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Check, Eye, EyeOff, Key, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CreateAvatarProps {
	availableAvatars: string[];
}

const CreateAvatar: React.FC<CreateAvatarProps> = ({ availableAvatars }) => {
	const [firstName, setFirstName] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [newPinCode, setNewPinCode] = useState<string>('');
	const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
	const [uploadedImage, setUploadedImage] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState<boolean>(false);
	const [showNewPin, setShowNewPin] = useState<boolean>(false);
	const [isSuccess, setIsSuccess] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	// Auto-focus first name input on mount
	useEffect(() => {
		const firstNameInput = document.getElementById('firstName');
		firstNameInput?.focus();
	}, []);

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setUploadedImage(e.target?.result as string);
				setSelectedAvatar(null); // Désélectionner l'avatar prédéfini
				setErrorMessage(''); // Clear any error messages
			};
			reader.readAsDataURL(file);
		}
	};

	const handleAvatarSelect = (avatarName: string) => {
		setSelectedAvatar(avatarName);
		setUploadedImage(null); // Supprimer l'image uploadée
		setErrorMessage(''); // Clear any error messages
	};

	const handleCreateAvatar = async () => {
		// Validation
		if (!firstName.trim() || !lastName.trim()) {
			setErrorMessage('Veuillez remplir le prénom et le nom');
			return;
		}

		if (!uploadedImage && !selectedAvatar) {
			setErrorMessage('Veuillez sélectionner un avatar ou uploader une photo');
			return;
		}

		if (newPinCode.length !== 4) {
			setErrorMessage('Veuillez créer un code PIN à 4 chiffres');
			return;
		}

		setIsCreating(true);
		setErrorMessage('');
		
		try {
			// TODO: Appel API pour créer l'avatar
			console.log('Création de l\'avatar...', {
				firstName,
				lastName,
				avatar: uploadedImage || selectedAvatar,
				pinCode: newPinCode
			});
			
			// Simulation d'un délai
			await new Promise(resolve => setTimeout(resolve, 1500));
			
			setIsSuccess(true);
			
			// Success animation before redirect
			setTimeout(() => {
				router.push('/dashboard');
			}, 1000);
		} catch (error) {
			console.error('Erreur lors de la création:', error);
			setErrorMessage('Erreur lors de la création de l\'avatar');
		} finally {
			setIsCreating(false);
		}
	};

	const handleNewPinInput = (value: string) => {
		// Limiter à 4 chiffres
		if (value.length <= 4 && /^\d*$/.test(value)) {
			setNewPinCode(value);
			setErrorMessage(''); // Clear error when user starts typing
		}
	};

	return (
		<div className="flex items-center justify-center p-2 sm:p-4">
			<div className="w-full max-w-lg">
				{/* Error Message */}
				{errorMessage && (
					<div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 text-center text-xs sm:text-sm font-medium animate-shake">
						{errorMessage}
					</div>
				)}

				{/* Name Inputs */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 animate-slide-up">
					<div className="space-y-1 sm:space-y-2">
						<Label htmlFor="firstName" className="text-slate-700 font-semibold text-xs sm:text-sm">
							Prénom
						</Label>
						<Input
							id="firstName"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							placeholder="Votre prénom"
							className="h-9 sm:h-11 border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg sm:rounded-xl bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-200 text-sm"
						/>
					</div>
					<div className="space-y-1 sm:space-y-2">
						<Label htmlFor="lastName" className="text-slate-700 font-semibold text-xs sm:text-sm">
							Nom
						</Label>
						<Input
							id="lastName"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							placeholder="Votre nom"
							className="h-9 sm:h-11 border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg sm:rounded-xl bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-200 text-sm"
						/>
					</div>
				</div>

				{/* PIN Code Creation */}
				<div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 animate-slide-up">
					<Label className="text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center">
						<Key className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-emerald-600" />
						Créez votre code PIN (4 chiffres)
					</Label>
					<div className="relative max-w-xs mx-auto">
						<Input
							id="newPin"
							type={showNewPin ? 'text' : 'password'}
							placeholder="••••"
							value={newPinCode}
							onChange={(e) => handleNewPinInput(e.target.value)}
							className="text-center text-lg sm:text-xl tracking-[0.3rem] sm:tracking-[0.5rem] font-mono h-10 sm:h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg sm:rounded-xl bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-200"
							maxLength={4}
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setShowNewPin(!showNewPin)}
							className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 h-6 w-6 sm:h-8 sm:w-8 rounded-md sm:rounded-lg transition-all duration-200"
						>
							{showNewPin ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
						</Button>
					</div>
					<p className="text-xs text-slate-500 text-center">
						Ce code vous permettra de vous connecter à votre avatar
					</p>
				</div>

				{/* Avatar Selection */}
				<div className="mb-4 sm:mb-6 animate-slide-up">
					<h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 text-center">
						Choisissez votre avatar
					</h2>
					
					{/* Upload Option */}
					<div className="mb-4 sm:mb-6">
						<Button
							variant="outline"
							onClick={() => fileInputRef.current?.click()}
							className="w-full h-24 sm:h-32 py-4 sm:py-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white/60 backdrop-blur-sm group"
						>
							<div className="flex flex-col items-center space-y-1 sm:space-y-2">
								<Upload className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 group-hover:text-emerald-600 transition-colors duration-200" />
								<span className="text-slate-700 font-semibold text-xs sm:text-sm">Uploader votre photo</span>
								<span className="text-xs text-slate-500">ou glissez-déposez ici</span>
							</div>
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							className="hidden"
						/>
						{uploadedImage && (
							<div className="mt-3 sm:mt-4 text-center animate-fade-in">
								<Image
									src={uploadedImage}
									alt="Photo uploadée"
									width={80}
									height={80}
									className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto ring-2 sm:ring-3 ring-emerald-100 shadow-lg"
								/>
								<p className="text-xs sm:text-sm text-emerald-600 mt-1 sm:mt-2 font-semibold">Photo sélectionnée</p>
							</div>
						)}
					</div>

					{/* Predefined Avatars - Ligne horizontale avec scroll */}
					<div className="mb-3 sm:mb-4">
						<h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-2 sm:mb-3 text-center">
							Ou choisissez parmi nos avatars ({availableAvatars.length} disponibles)
						</h3>
						<div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
							{availableAvatars.map((avatar, index) => (
								<div
									key={avatar}
									onClick={() => handleAvatarSelect(avatar)}
									className={`relative cursor-pointer rounded-lg sm:rounded-xl border-2 p-1 sm:p-2 transition-all duration-300 hover:scale-105 animate-fade-in flex-shrink-0 ${
										selectedAvatar === avatar
											? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-md ring-2 ring-emerald-200'
											: 'border-slate-200 hover:border-emerald-300 hover:shadow-sm bg-white'
									}`}
									style={{ animationDelay: `${index * 30}ms` }}
								>
									<Image
										src={`/avatar/${avatar}`}
										alt={avatar}
										width={48}
										height={48}
										className="w-8 h-8 sm:w-12 sm:h-12 rounded-md sm:rounded-lg ring-1 ring-white"
									/>
									{selectedAvatar === avatar && (
										<div className="absolute -top-1 -right-1">
											<div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md animate-pulse">
												<Check className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Create Button avec états améliorés */}
				<div className="animate-slide-up">
					<Button
						onClick={handleCreateAvatar}
						disabled={isCreating || !firstName.trim() || !lastName.trim() || (!uploadedImage && !selectedAvatar) || newPinCode.length !== 4}
						className={`w-full h-10 sm:h-12 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group ${
							isSuccess 
								? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
								: 'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white'
						}`}
					>
						{isCreating ? (
							<div className="flex items-center justify-center">
								<div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1 sm:mr-2" />
								Création en cours...
							</div>
						) : isSuccess ? (
							<div className="flex items-center justify-center">
								<Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-pulse" />
								Avatar créé ! Redirection...
							</div>
						) : (
							<>
								Créer mon avatar
								<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Styles pour les animations */}
			<style jsx>{`
				@keyframes shake {
					0%, 100% { transform: translateX(0); }
					25% { transform: translateX(-8px); }
					75% { transform: translateX(8px); }
				}
				@keyframes fade-in {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}
				@keyframes slide-up {
					from { opacity: 0; transform: translateY(30px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.animate-shake {
					animation: shake 0.6s ease-in-out;
				}
				.animate-fade-in {
					animation: fade-in 0.6s ease-out;
				}
				.animate-slide-up {
					animation: slide-up 0.5s ease-out;
				}
			`}</style>
		</div>
	);
};

export default CreateAvatar; 