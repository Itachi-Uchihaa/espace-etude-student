'use client';
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { saveUserPlan } from '@/store/user/userThunk';

interface PaymentModalProps {
	selectedPlan: {
		id: string;
		name: string;
		price: string;
		amount: number;
		children: number;
		avatars: number;
		color: string;
		icon: React.ElementType;
	} | null;
	onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
	selectedPlan,
	onClose,
}) => {
	const { user, uid } = useAppSelector(state => state.user);
	const stripe = useStripe();
	const elements = useElements();
	const [loading, setLoading] = useState(false);
	const dispatch = useAppDispatch();
	const router = useRouter();

	if (!selectedPlan || !user) return null;
	const IconComponent = selectedPlan.icon;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!stripe || !elements) return;
		setLoading(true);

		try {
			const cardElement = elements.getElement(CardElement);
			if (!cardElement) throw new Error('Card element not found');

			// Step 1: Create the PaymentMethod
			const { error, paymentMethod } = await stripe.createPaymentMethod({
				type: 'card',
				card: cardElement,
			});
			if (error) throw new Error(error.message);

			// Step 2: Send to backend to create subscription with payment method
			const res = await fetch('/api/create-subscription', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					paymentMethodId: paymentMethod.id,
					plan: selectedPlan, // full plan object
				}),
			});

			const { subscriptionId, backendError } = await res.json();
			if (backendError) throw new Error(backendError);

			// Step 3: Save to Firestore
			await dispatch(
				saveUserPlan({
					uid,
					plan: {
						name: selectedPlan.name,
						id: selectedPlan.id,
						price: selectedPlan.price,
						amount: selectedPlan.amount,
						children: selectedPlan.children,
						avatars: selectedPlan.avatars,
						subscriptionId,
					},
				})
			);

			onClose();
			router.push('/avatar');
		} catch (err: any) {
			console.error(err);
			alert(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center'>
			<div className='bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative'>
				<button
					className='absolute top-3 right-4 text-gray-500 hover:text-gray-800'
					onClick={onClose}
				>
					&times;
				</button>

				<div className='text-center mb-6'>
					<div
						className={`w-12 h-12 rounded-lg ${selectedPlan.color} flex items-center justify-center mx-auto mb-3`}
					>
						<IconComponent className='w-6 h-6' />
					</div>
					<h2 className='text-xl font-semibold text-gray-900 mb-1'>
						{selectedPlan.name}
					</h2>
					<p className='text-sm text-gray-600'>
						Montant: {selectedPlan.price}
					</p>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<label className='block text-[#4C4C4C] font-normal text-base'>
							Vos informations de carte
						</label>
						<div className='border border-gray-300 rounded-md px-3 py-2'>
							<CardElement
								options={{
									style: {
										base: {
											fontSize: '16px',
											color: '#32325d',
											fontFamily: 'Arial, sans-serif',
											'::placeholder': {
												color: '#aab7c4',
											},
										},
										invalid: {
											color: '#fa755a',
											iconColor: '#fa755a',
										},
									},
									hidePostalCode: true,
								}}
							/>
						</div>
					</div>

					<Button
						type='submit'
						className='w-full'
						disabled={!stripe || loading}
					>
						{loading ? (
							<>
								<Loader2 className='w-4 h-4 mr-2 animate-spin' />{' '}
								Traitement...
							</>
						) : (
							'Confirmer et Payer'
						)}
					</Button>
				</form>
			</div>
		</div>
	);
};

export default PaymentModal;
