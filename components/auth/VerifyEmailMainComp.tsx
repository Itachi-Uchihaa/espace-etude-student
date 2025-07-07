'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import EmailVerification from './EmailVerification';

const VerifyEmailMainComp = () => {
	const searchParams = useSearchParams();
	const email = searchParams.get('email');

	if (!email) {
		return <p>No email provided. Please sign up again.</p>;
	}
	return (
		<div className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gradient-to-b from-[#4e54c8] to-[#3f2b96]'>
			<div className='w-full max-w-sm md:max-w-3xl'>
				<EmailVerification email={email} />
			</div>
		</div>
	);
};

export default VerifyEmailMainComp;
