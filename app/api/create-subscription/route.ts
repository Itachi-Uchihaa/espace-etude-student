import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
	throw new Error(
		'NEXT_PUBLIC_STRIPE_SECRET_KEY environment variable is not set'
	);
}
const stripe = new Stripe(stripeSecretKey, {
	apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
	try {
		const { plan, paymentMethodId, user } = await req.json();

		console.log('[CREATE_SUBSCRIPTION] Plan:', plan);
		console.log('[CREATE_SUBSCRIPTION] PaymentMethodId:', paymentMethodId);

		if (!plan?.id || !plan?.amount || !paymentMethodId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// 1. Create Stripe Product
		const product = await stripe.products.create({
			name: `Subscription - ${plan.name}`,
		});

		// 2. Create Stripe Price
		const price = await stripe.prices.create({
			unit_amount: plan.amount,
			currency: 'eur',
			recurring: { interval: 'month' },
			product: product.id,
		});

		// 3. Create Customer and attach default payment method
		const customer = await stripe.customers.create({
			email: user.email,
			name: user.name,
			payment_method: paymentMethodId,
			invoice_settings: {
				default_payment_method: paymentMethodId,
			},
		});

		// 4. Create the Subscription (fully paid)
		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [{ price: price.id }],
			default_payment_method: paymentMethodId,
			metadata: {
				planId: plan.id,
				name: plan.name,
				children: String(plan.children),
				avatars: String(plan.avatars),
			},
			expand: ['latest_invoice', 'customer'],
		});

		return NextResponse.json({
			subscriptionId: subscription.id,
			customerId: customer.id,
			currentPeriodEnd: (subscription as any).current_period_end
		});
	} catch (err: any) {
		console.error('[STRIPE_SUBSCRIPTION_ERROR]', err.message, err);
		return NextResponse.json(
			{ error: 'Something went wrong with Stripe subscription.' },
			{ status: 500 }
		);
	}
}
