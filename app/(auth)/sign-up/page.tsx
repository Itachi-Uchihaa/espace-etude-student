import SignUpForm from '@/components/auth/sign-up-form';

export default function SignUpPage() {
	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gradient-to-b from-[#4e54c8] to-[#3f2b96]">
			<div className="w-full max-w-sm md:max-w-3xl">
				<SignUpForm />
			</div>
		</div>
	);
}