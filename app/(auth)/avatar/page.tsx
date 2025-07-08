'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Plus, Sparkles } from 'lucide-react';
import LoginAvatar from '@/components/avatar/login-avatar';
import CreateAvatar from '@/components/avatar/create-avatar';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchChildProfiles } from '@/store/user/userThunk';

// Données d'exemple pour les avatars existants
const existingAvatars = [
	{
		id: 1,
		name: 'Alex',
		avatar: 'avatar1.png',
		pin: '1234',
		email: 'alex@example.com'
	},
	{
		id: 2,
		name: 'Sarah',
		avatar: 'avatar2.png',
		pin: '5678',
		email: 'sarah@example.com'
	},
	{
		id: 3,
		name: 'Max',
		avatar: 'avatar3.png',
		pin: '9012',
		email: 'max@example.com'
	}
];

// Avatars disponibles pour la création
const availableAvatars = [
  'https://api.dicebear.com/7.x/adventurer/png?seed=Leo',
  'https://api.dicebear.com/7.x/adventurer/png?seed=Ruby',
  'https://api.dicebear.com/7.x/adventurer/png?seed=Tiger',
  'https://api.dicebear.com/7.x/adventurer/png?seed=Pixel',
  'https://api.dicebear.com/7.x/adventurer/png?seed=Maya',
  'https://api.dicebear.com/7.x/adventurer/png?seed=Niko',
];

export default function AvatarPage() {
	const dispatch=  useAppDispatch();
	const { uid, avatars } = useAppSelector(state => state.user);
	const [activeMode, setActiveMode] = useState<'login' | 'create'>('login');

	useEffect(() => {
	if (uid) {
		dispatch(fetchChildProfiles(uid));
	}
	}, [uid, dispatch]);
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-2xl">
				{/* Header */}
				<div className="text-center mb-8 animate-fade-in">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
						<Sparkles className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-slate-900 mb-2">
						Espace Étude
					</h1>
					<p className="text-slate-600 text-lg">
						Choisissez votre avatar pour commencer
					</p>
				</div>

				{/* Main Card */}
				<Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
					<CardHeader className="text-center pb-6">
						<CardTitle className="text-2xl font-bold text-slate-900">
							Avatar Selection
						</CardTitle>
						<CardDescription className="text-slate-600">
							Connectez-vous avec un avatar existant ou créez-en un nouveau
						</CardDescription>
					</CardHeader>
					
					<CardContent className="p-6">
						{/* Mode Selection Buttons */}
						<div className="flex gap-4 mb-8 justify-center">
							<Button
								variant={activeMode === 'login' ? 'default' : 'outline'}
								onClick={() => setActiveMode('login')}
								className="flex items-center gap-2 px-6 py-3"
							>
								<User className="w-4 h-4" />
								Se connecter
							</Button>
							<Button
								variant={activeMode === 'create' ? 'default' : 'outline'}
								onClick={() => setActiveMode('create')}
								className="flex items-center gap-2 px-6 py-3"
							>
								<Plus className="w-4 h-4" />
								Créer un avatar
							</Button>
						</div>

						{/* Content */}
						<div className="transition-all duration-300">
							{activeMode === 'login' && (
								<div className="animate-fade-in">
									<LoginAvatar existingAvatars={avatars} />
								</div>
							)}
							
							{activeMode === 'create' && (
								<div className="animate-fade-in">
									<CreateAvatar availableAvatars={availableAvatars} setActiveMode={setActiveMode} />
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="text-center mt-8 text-slate-500 text-sm">
					<p>© 2024 Espace Étude. Tous droits réservés.</p>
				</div>
			</div>
		</div>
	);
}
