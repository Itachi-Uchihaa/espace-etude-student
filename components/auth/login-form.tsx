'use client';

import type React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ImSpinner6 } from 'react-icons/im';
import { useAuth } from '@/context/auth-context';

export function LoginForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const { login, loginWithGoogle, loading } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isDesktop, setIsDesktop] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const checkScreenSize = () => {
			setIsDesktop(window.innerWidth >= 768);
		};

		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);

		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await login(email, password);
			router.push('/profile');
		} catch (error) {
			console.error('Login error:', error);
		}
	};

	const handleGoogleLogin = async () => {
		try {
			await loginWithGoogle();
			router.push('/profile');
		} catch (error) {
			console.error('Google login error:', error);
		}
	};

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className='overflow-hidden p-0 border-none rounded-none'>
				<CardContent className='grid p-0 md:grid-cols-2 min-h-[600px]'>
					<form
						className='p-6 lg:p-10 flex flex-col gap-6 justify-center'
						onSubmit={handleSubmit}
					>
						<div className='flex flex-col gap-1'>
							<Image
								src='/images/logo.png'
								alt='Logo'
								width={100}
								height={40}
							/>
							<h1 className='text-[30px] font-bold mt-2 text-[#212121]'>
								Welcome Back!
							</h1>
							<p className='text-[#9A9A9A] text-base font-semibold'>
								Log in to upgrade your learning skills next
								level
							</p>
						</div>

						<div className='grid gap-4'>
							<div className='grid gap-2'>
								<Label htmlFor='email'>Email</Label>
								<div className='relative'>
									<Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]' />
									<Input
										id='email'
										type='email'
										placeholder='Enter your phone or email'
										className='px-10 bg-[#F5F5F5] border-none py-[27px] font-medium text-base focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]'
										value={email}
										onChange={e => setEmail(e.target.value)}
										required
									/>
								</div>
							</div>

							<div className='grid gap-2'>
								{/* label */}
								<Label htmlFor='password'>Password</Label>

								{/* input with icons */}
								<div className='relative'>
									<Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]' />
									<Input
										id='password'
										type={
											showPassword ? 'text' : 'password'
										}
										placeholder='Enter password'
										className='px-10 bg-[#F5F5F5] border-none font-medium text-base py-[27px] focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]'
										value={password}
										onChange={e =>
											setPassword(e.target.value)
										}
										required
									/>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
										onClick={() =>
											setShowPassword(!showPassword)
										}
									>
										{showPassword ? (
											<EyeOff className='w-4 h-4 text-[#9B9B9B]' />
										) : (
											<Eye className='w-4 h-4 text-[#9B9B9B]' />
										)}
									</Button>
								</div>

								{/* forgot-password link */}
								<Link
									href='/forgot-password'
									className='inline-flex justify-end mt-1 text-sm font-medium text-[#7372B7] hover:underline'
								>
									Forgot password?
								</Link>
							</div>
						</div>

						<Button
							type='submit'
							className='w-full h-[50px] mt-5 bg-[#7372B7] hover:bg-[#7372B7] text-[#FFFFFF] font-semibold text-lg rounded-[10px]'
							disabled={loading}
						>
							{loading ? (
								<ImSpinner6 className='animate-spin' />
							) : (
								'Login'
							)}
						</Button>

						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<span className='w-full border-t border-[#888888]' />
							</div>
							<div className='relative flex justify-center'>
								<span className='bg-white px-2 text-[#9B9B9B] font-normal text-lg leading-[150%] tracking-[0%]'>
									Or
								</span>
							</div>
						</div>

						<Button
							variant='outline'
							type='button'
							className='w-full gap-2 bg-[#F5F5F5] h-[50px] border-none text-lg font-semibold cursor-pointer rounded-[10px]'
							onClick={handleGoogleLogin}
							disabled={loading}
						>
							<Image
								src='/images/google.png'
								alt='Google'
								width={16}
								height={16}
							/>
							Continue with Google
						</Button>

						<p className='text-base font-medium text-center text-[#9B9B9B]'>
							Don't have An Account ?{' '}
							<Link
								href='/sign-up'
								className='text-[#7372B7] hover:underline'
							>
								Sign Up
							</Link>
						</p>
					</form>
					<div className='hidden md:block relative bg-[#6E6CD8]'>
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
}

export default LoginForm;
