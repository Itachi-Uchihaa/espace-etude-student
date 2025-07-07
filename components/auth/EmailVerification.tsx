'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ImSpinner6 } from 'react-icons/im';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { auth } from '@/config/firebase';
import { sendEmailVerification } from 'firebase/auth';

interface EmailVerificationProps extends React.ComponentProps<'div'> {
	email: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
	className,
	email,
	...props
}) => {
	const router = useRouter();
	const [isDesktop, setIsDesktop] = useState(false);
	const [isResending, setIsResending] = useState(false);

	// Handle resizing for image
	useEffect(() => {
		const handleResize = () => setIsDesktop(window.innerWidth >= 768);
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Handle resend email
	const handleResendVerification = async () => {
		setIsResending(true);
		try {
			const user = auth.currentUser;
			if (user) {
				await sendEmailVerification(user);
				toast.success(
					'Verification email resent. Please check your inbox.'
				);
			} else {
				toast.error('No user is currently logged in.');
			}
		} catch (error) {
			console.error('Error resending verification email:', error);
			toast.error('Failed to resend verification email.');
		} finally {
			setIsResending(false);
		}
	};

	// Auth state check for verified email
	useEffect(() => {
		const checkEmailVerification = async () => {
			const user = auth.currentUser;
			if (user) {
				await user.reload(); // Refresh the user data
				if (user.emailVerified) {
					toast.success('Email verified successfully.');
					router.push('/login');
				}
			}
		};
		const interval = setInterval(checkEmailVerification, 3000);
		// Clear interval on component unmount
		return () => clearInterval(interval);
	}, [router]);

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className='overflow-hidden p-0'>
				<CardContent className='grid p-0 md:grid-cols-2 min-h-[500px] md:min-h-[600px]'>
					<div className='p-6 md:p-8 flex flex-col items-center justify-center gap-4'>
						<div>
							<Image
								src='/images/logo.png'
								alt='Logo'
								width={80}
								height={40}
							/>
						</div>
						<div>
							<div className='p-6 rounded-lg shadow-lg'>
								<h2 className='text-2xl font-bold text-center mb-4'>
									Verify Your Email
								</h2>
								<p className='text-center text-[#101433] mb-6'>
									We've sent a verification email to{' '}
									<strong>{email}</strong>. Please check your
									inbox and click the link to verify your
									email address.
								</p>
								<Button
									onClick={handleResendVerification}
									className='w-full text-white'
									disabled={isResending}
								>
									{isResending ? (
										<ImSpinner6 className='text-white animate-spin' />
									) : (
										'Resend Verification Email'
									)}
								</Button>
							</div>
						</div>
					</div>
					<div className='hidden md:block relative bg-muted'>
						{isDesktop && (
							<Image
								src='/images/espace.png'
								alt='Restaurant'
								fill
								className='object-cover'
								priority
							/>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default EmailVerification;
