'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Eye, EyeOff, HelpCircle, Key, ArrowRight, Edit3, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';

interface Avatar {
	// id: number;
	// name: string;
	// avatar: string;
	// pin: string;
	// email: string;
	id: string;
	firstName: string;
	lastName: string;
	avatar: string;
	pin: string;
}

interface LoginAvatarProps {
	existingAvatars: Avatar[];
}

const LoginAvatar: React.FC<LoginAvatarProps> = ({ existingAvatars }) => {
	const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
	const [pinCode, setPinCode] = useState<string>('');
	const [showPin, setShowPin] = useState<boolean>(false);
	const [showForgotPin, setShowForgotPin] = useState<boolean>(false);
	const [recoveryEmail, setRecoveryEmail] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSuccess, setIsSuccess] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const router = useRouter();

	// Auto-focus PIN input when avatar is selected
	useEffect(() => {
		if (selectedAvatar) {
			const timer = setTimeout(() => {
				const pinInput = document.getElementById('pin-input');
				pinInput?.focus();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [selectedAvatar]);

	const handleAvatarLogin = async () => {
	if (!selectedAvatar || pinCode.length !== 4) return;
		setIsLoading(true);
		setErrorMessage('');
		try {
			// 🔒 Secure PIN comparison
			const isMatch = await bcrypt.compare(pinCode, selectedAvatar.pin);
			if (isMatch) {
				setIsSuccess(true);
				console.log('Connexion réussie pour:', selectedAvatar.firstName);
				// Success animation before redirect
				setTimeout(() => {
					router.push('/settings');
				}, 800);
			} else {
				setErrorMessage('Incorrect PIN code. Please try again.');
				const pinInput = document.getElementById('pin-input');
				pinInput?.classList.add('animate-shake');
				setTimeout(() => pinInput?.classList.remove('animate-shake'), 500);
				setPinCode('');
			}
		} catch (error) {
			console.error('PIN verification error:', error);
			setErrorMessage('Something went wrong. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handlePinInput = (value: string) => {
		if (value.length <= 4 && /^\d*$/.test(value)) {
			setPinCode(value);
			setErrorMessage(''); // Clear error when user starts typing
		}
	};

	const handleForgotPin = async () => {
		if (!recoveryEmail.trim()) return;
		
		// TODO: Appel API
		console.log('Envoi du code PIN à:', recoveryEmail);
		setShowForgotPin(false);
		setRecoveryEmail('');
	};

	return (
		<div className="flex items-center justify-center p-2 sm:p-4">
			<div className="w-full max-w-sm sm:max-w-md">
				{selectedAvatar && (
					<div className="mb-6 sm:mb-8 animate-slide-up">
						<div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
							<div className="flex items-center space-x-4 sm:space-x-6">
								<div className="relative">
									<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden ring-3 sm:ring-4 ring-emerald-100 shadow-lg">
										<Image
											src={selectedAvatar.avatar}
											alt={selectedAvatar.firstName}
											width={80}
											height={80}
											className="w-full h-full object-cover"
										/>
									</div>
									<div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
										<div className="w-5 h-5 sm:w-7 sm:h-7 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
											<Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
										</div>
									</div>
								</div>
								<div className="flex-1">
									<div className="flex items-center justify-between mb-1 sm:mb-2">
										<h3 className="text-lg sm:text-xl font-semibold text-slate-900">
											{selectedAvatar.firstName}
										</h3>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setSelectedAvatar(null)}
											className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 sm:p-2 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl transition-all duration-200"
										>
											<Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
										</Button>
									</div>
									<p className="text-slate-500 text-xs sm:text-sm font-medium">Username</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Sélection d'avatar moderne avec animations */}
				{!selectedAvatar && (
					<div className="mb-6 sm:mb-8 animate-fade-in">
					{existingAvatars.length > 0 ? (
					<>
						<h2 className="text-slate-900 font-semibold mb-4 sm:mb-6 text-center text-xs sm:text-sm">Select Your Avatar</h2>
						<div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
							{existingAvatars.map((avatar, index) => (
								<button
									key={avatar.id}
									onClick={() => setSelectedAvatar(avatar)}
									className="relative group transition-all duration-300 hover:scale-110 animate-fade-in"
									style={{ animationDelay: `${index * 100}ms` }}
								>
									<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden ring-2 sm:ring-3 ring-slate-200 group-hover:ring-emerald-300 shadow-lg group-hover:shadow-xl transition-all duration-300">
										<Image
											src={avatar.avatar}
											alt={avatar.firstName}
											width={80}
											height={80}
											className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110 group-hover:scale-110"
										/>
									</div>
									<div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-transparent via-transparent to-black/5 group-hover:from-emerald-500/10 group-hover:to-emerald-600/10 transition-all duration-300" />
									<div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
										<div className="bg-slate-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
											{avatar.firstName}
										</div>
									</div>
								</button>
							))}
						</div>
								</>
								) : (
								<p className="text-center text-slate-500 text-sm">
									No avatar created yet.
								</p>
								)}
					</div>
				)}

				{/* Code PIN moderne avec meilleure UX */}
				{selectedAvatar && (
					<div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8 animate-slide-up">
						<div className="text-center">
							<Label className="text-slate-700 font-semibold mb-3 sm:mb-4 block flex items-center justify-center text-sm sm:text-base">
								<Key className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-emerald-600" />
								Enter PIN Code
							</Label>
							<div className="relative">
								<Input
									id="pin-input"
									type={showPin ? 'text' : 'password'}
									placeholder="••••"
									value={pinCode}
									onChange={(e) => handlePinInput(e.target.value)}
									className={`text-center text-xl sm:text-2xl tracking-[0.5rem] sm:tracking-[0.8rem] font-mono h-12 sm:h-16 border-2 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl sm:rounded-2xl focus:ring-3 sm:focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 ${
										errorMessage ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
									}`}
									maxLength={4}
									autoFocus
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setShowPin(!showPin)}
									className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl transition-all duration-200"
								>
									{showPin ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
								</Button>
							</div>
							
							{/* Error message */}
							{errorMessage && (
								<div className="mt-2 sm:mt-3 text-red-600 text-xs sm:text-sm font-medium animate-shake">
									{errorMessage}
								</div>
							)}
						</div>

						{/* Forgot PIN */}
						<div className="text-center">
							<Button
								variant="link"
								onClick={() => setShowForgotPin(true)}
								className="text-slate-500 hover:text-slate-700 text-xs sm:text-sm font-medium transition-colors duration-200"
							>
								<HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
								Forgot PIN?
							</Button>
						</div>
					</div>
				)}

				{/* Bouton de connexion moderne avec états améliorés */}
				{selectedAvatar && (
					<div className="animate-slide-up">
						<Button
							onClick={handleAvatarLogin}
							disabled={!selectedAvatar || pinCode.length !== 4 || isLoading}
							className={`w-full h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group ${
								isSuccess 
									? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
									: 'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white'
							}`}
						>
							{isLoading ? (
								<div className="flex items-center justify-center">
									<div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-white/30 border-t-white rounded-full animate-spin mr-2 sm:mr-3" />
									Signing In...
								</div>
							) : isSuccess ? (
								<div className="flex items-center justify-center">
									<Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-pulse" />
									Success! Redirecting...
								</div>
							) : (
								<>
									Sign In
									<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
								</>
							)}
						</Button>
					</div>
				)}

				{/* Modal Forgot PIN moderne avec animations */}
				{showForgotPin && (
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
						<div className="max-w-sm w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 animate-slide-up">
							<div className="text-center mb-6 sm:mb-8">
								<div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
									<HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
								</div>
								<h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
									Recover PIN
								</h3>
								<p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
									Enter your email to receive your PIN code
								</p>
							</div>
							<div className="space-y-4 sm:space-y-6">
								<div>
									<Label className="text-slate-700 font-semibold mb-2 sm:mb-3 block text-xs sm:text-sm">
										Recovery Email
									</Label>
									<Input
										type="email"
										value={recoveryEmail}
										onChange={(e) => setRecoveryEmail(e.target.value)}
										placeholder="your@email.com"
										className="h-10 sm:h-12 border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg sm:rounded-xl focus:ring-3 sm:focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200 text-sm"
									/>
								</div>
								<div className="flex space-x-3 sm:space-x-4 pt-3 sm:pt-4">
									<Button
										variant="ghost"
										onClick={() => setShowForgotPin(false)}
										className="flex-1 h-10 sm:h-12 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-sm"
									>
										Cancel
									</Button>
									<Button
										onClick={handleForgotPin}
										className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg sm:rounded-xl hover:from-slate-700 hover:to-slate-800 shadow-lg font-medium transition-all duration-200 text-sm"
									>
										Send PIN
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
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

export default LoginAvatar;