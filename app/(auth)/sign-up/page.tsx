import SignUpForm from '@/components/auth/sign-up-form';
import React from 'react';

const page = () => {
	return (
		<div className='bg-muted p-6 md:p-10 bg-gradient-to-b from-[#4e54c8] to-[#3f2b96]'>
			<div className='w-full max-w-sm md:max-w-5xl mx-auto'>
				<SignUpForm />
			</div>
		</div>
	);
};

export default page;