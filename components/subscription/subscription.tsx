'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Users, Zap, Crown, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Elements } from '@stripe/react-stripe-js';
import PaymentModal from './PaymentModal';
import { stripePromise } from '@/lib/stripe';

const Subscription = () => {
	const [loading, setLoading] = useState<string | null>(null);
	const [selectedPlan, setSelectedPlan] = useState<any>(null);
	const [openModal, setOpenModal] = useState(false);

	const packages = [
		{
			id: 'essentiel',
			name: 'Essentiel',
			price: '19,99 €',
			amount: 1999,
			period: '/mois',
			children: 1,
			avatars: 1,
			description: 'Parfait pour commencer l\'apprentissage',
			features: [
				'1 compte enfant',
				'1 avatar personnalisable',
				'Accès aux exercices',
				'Suivi des progrès',
				'Support par email'
			],
			popular: false,
			icon: Users,
			color: 'bg-blue-100 text-blue-600'
		},
		{
			id: 'interactive',
			name: 'Interactive',
			price: '29,99 €',
			amount: 2999,
			period: '/mois',
			children: 2,
			avatars: 2,
			description: 'Idéal pour les familles avec plusieurs enfants',
			features: [
				'2 comptes enfants',
				'2 avatars personnalisables',
				'Accès aux exercices',
				'Suivi des progrès',
				'Support par email'
			],
			popular: true,
			icon: Zap,
			color: 'bg-[#7372B7]/10 text-[#7372B7]'
		},
		{
			id: 'premium',
			name: 'Premium',
			price: '39,99 €',
			amount: 3999,
			period: '/mois',
			children: 3,
			avatars: 3,
			description: 'L\'expérience complète pour toute la famille',
			features: [
				'3 comptes enfants',
				'3 avatars personnalisables',
				'Accès aux exercices',
				'Suivi des progrès',
				'Support par email'
			],
			popular: false,
			icon: Crown,
			color: 'bg-yellow-100 text-yellow-600'
		}
	];

	const handleSubscribeClick = (pkg: any) => {
		setSelectedPlan(pkg);
		setOpenModal(true);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b border-gray-200">
				<div className="max-w-4xl mx-auto px-6 py-4">
					<div className="flex items-center justify-center">
						<Image
							src="/images/logo.png"
							alt="Espace Étude"
							width={120}
							height={48}
							className="h-12 w-auto"
						/>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-6 py-12">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Choisissez votre plan
					</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Sélectionnez le plan qui correspond le mieux à vos besoins
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid md:grid-cols-3 gap-6">
					{packages.map((pkg) => {
						const IconComponent = pkg.icon;
						return (
							<Card 
								key={pkg.id} 
								className={`relative transition-all duration-200 hover:shadow-lg ${
									pkg.popular 
										? 'ring-2 ring-[#7372B7] shadow-lg' 
										: 'border border-gray-200'
								}`}
							>
								{pkg.popular && (
									<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
										<Badge className="bg-[#7372B7] text-white px-3 py-1 text-xs font-medium">
											<Star className="w-3 h-3 mr-1" />
											Populaire
										</Badge>
									</div>
								)}
								
								<CardHeader className="text-center pb-4 pt-6">
									<div className={`w-12 h-12 rounded-lg ${pkg.color} flex items-center justify-center mx-auto mb-3`}>
										<IconComponent className="w-6 h-6" />
									</div>
									<CardTitle className="text-xl font-semibold text-gray-900">
										{pkg.name}
									</CardTitle>
									<CardDescription className="text-gray-600 text-sm">
										{pkg.description}
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-4">
									{/* Price */}
									<div className="text-center">
										<div className="flex items-baseline justify-center">
											<span className="text-3xl font-bold text-gray-900">
												{pkg.price}
											</span>
											<span className="text-gray-500 ml-1 text-sm">
												{pkg.period}
											</span>
										</div>
										<p className="text-xs text-gray-500 mt-1">
											{pkg.children} enfant{pkg.children > 1 ? 's' : ''} • {pkg.avatars} avatar{pkg.avatars > 1 ? 's' : ''}
										</p>
									</div>

									{/* Features */}
									<div className="space-y-2">
										{pkg.features.map((feature, featureIndex) => (
											<div key={featureIndex} className="flex items-center">
												<Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
												<span className="text-sm text-gray-700">{feature}</span>
											</div>
										))}
									</div>

									{/* CTA Button */}
									<Button 
										onClick={() => handleSubscribeClick(pkg)}
										className={`w-full py-2.5 text-sm font-medium ${
											pkg.popular 
												? 'bg-[#7372B7] hover:bg-[#6A69A8] text-white' 
												: 'bg-gray-900 hover:bg-gray-800 text-white'
										}`}
									>
											'Commencer'
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{openModal && selectedPlan && (
					<Elements stripe={stripePromise}>
						<PaymentModal
							selectedPlan={selectedPlan}
							onClose={() => setOpenModal(false)}
						/>
					</Elements>
				)}
			</div>
		</div>
	);
};

export default Subscription; 