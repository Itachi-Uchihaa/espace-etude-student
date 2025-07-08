'use client';

import type React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ImSpinner6 } from 'react-icons/im';
import { useAuth } from '@/contexts/auth';
import { loginUser, loginWithGoogle } from '@/store/user/userThunk';
import { useAppDispatch } from '@/store/store';
import { toast } from 'react-toastify';

export function LoginForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const dispatch = useAppDispatch();
	// const { login, loginWithGoogle, loading: authLoading } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isDesktop, setIsDesktop] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const checkScreenSize = () => {
			setIsDesktop(window.innerWidth >= 768);
		};

		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);

		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	 const getLocation = () => {
		return new Promise<GeolocationPosition>((resolve, reject) => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(resolve, reject);
		} else {
			reject("Geolocation not supported");
		}
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		// e.preventDefault();
		// try {
		// 	await login(email, password);
		// 	router.push('/settings');
		// } catch (error) {
		// 	console.error('Erreur de connexion:', error);
		// }
		e.preventDefault();
		setIsLoading(true);
		const result = await dispatch(loginUser({ email, password }));
		if (loginUser.fulfilled.match(result)) {
			// router.push('/settings');
			const userData = result.payload;
			if (!userData.plan) {
				router.push('/subscription');
			} else {
				router.push('/avatar');
			}
		} else {
			console.error(result.payload); // error message
		}
		setIsLoading(false);
	};

	const handleGoogleLogin = async () => {
		let location = { latitude: 0, longitude: 0 };
		try {
			  const position = await getLocation();
			  location = {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			  };
			} catch (err) {
			  console.error("Error capturing location:", err);
			  if (err instanceof GeolocationPositionError) {
				if (err.code === err.PERMISSION_DENIED) {
				  toast.error(`Géolocalisation refusée (Code: ${err.code}). Veuillez autoriser l'accès à votre position dans les paramètres de votre navigateur. Message: ${err.message}`);
				} else if (err.code === err.POSITION_UNAVAILABLE) {
				  toast.error(`Position indisponible (Code: ${err.code}). Veuillez vérifier votre connexion internet et réessayer. Message: ${err.message}`);
				} else if (err.code === err.TIMEOUT) {
				  toast.error(`Timeout de géolocalisation (Code: ${err.code}). Veuillez réessayer. Message: ${err.message}`);
				}
			  } else {
				toast.error(`Erreur de géolocalisation: ${err}. Veuillez autoriser l'accès à votre position et réessayer.`);
			  }
			  return;
			}
			
			if (!location.latitude || !location.longitude) {
			  toast.error("Veuillez activer votre géolocalisation pour vous inscrire sur la plateforme.");
			  return;
			}
		try {
			// await loginWithGoogle({ autoCreate: false});
			// await dispatch(loginWithGoogle({ location })).unwrap();
			// router.push('/settings');
			const result = await dispatch(loginWithGoogle({ location }));
			if (loginWithGoogle.fulfilled.match(result)) {
				const userData = result.payload;
				if (!userData.plan) {
					router.push('/subscription');
				} else {
					router.push('/avatar');
				}
			}
		} catch (error) {
			console.error('Erreur de connexion Google:', error);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
		<Card className="overflow-hidden p-0">
		  <CardContent className="grid p-0 md:grid-cols-2 min-h-[500px] md:min-h-[600px]">
			<form className="p-6 md:p-8" onSubmit={handleSubmit}>
			  <div className="flex flex-col gap-4">
				  <div className="flex flex-col">
					  <Image 
						src="/images/logo.png" 
						alt="Logo" 
						width={80} 
						height={40} 
					  />
				  </div>
				<div className="flex flex-col">
				  <h1 className="text-2xl font-bold">Bienvenue</h1>
				  <p className="text-balance text-muted-foreground">
					Connectez-vous à votre compte <span className="bg-gradient-to-b from-[#101433] to-[#303C99] bg-clip-text text-transparent font-semibold">Étudiant</span>
				  </p>
				</div>
				<div className="grid gap-2">
				  <Label htmlFor="email">Email</Label>
				  <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
				</div>
				<div className="grid gap-2">
				  <div className="flex items-center justify-between">
					<Label htmlFor="password">Mot de passe</Label>
					<Link 
					  href="/forgot-password" 
					  className="text-sm text-[#7372B7] hover:text-purple-800"
					>
					  Mot de passe oublié ?
					</Link>
				  </div>
				  <div className="relative">
					<Input 
					  id="password" 
					  type={showPassword ? "text" : "password"} 
					  placeholder="********" 
					  required 
					  value={password} 
					  onChange={(e) => setPassword(e.target.value)} 
					/>
					<Button
					  type="button"
					  variant="ghost"
					  size="sm"
					  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
					  onClick={() => setShowPassword(!showPassword)}
					>
					  {showPassword ? (
						<EyeOff className="h-4 w-4 text-muted-foreground" />
					  ) : (
						<Eye className="h-4 w-4 text-muted-foreground" />
					  )}
					</Button>
				  </div>
				</div>
				<Button 
				  type="submit" 
				  className="w-full text-white" 
				  disabled={isLoading}
				>
				  {isLoading ? (
					<ImSpinner6 className="text-white animate-spin" />
				  ) : (
					"Connexion"
				  )}
				</Button>
  
				<div className="relative">
				  <div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				  </div>
				  <div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
					  Ou continuer avec
					</span>
				  </div>
				</div>
  
				<Button 
				  variant="outline" 
				  type="button" 
				  className="w-full"
				  onClick={handleGoogleLogin}
				  disabled={isLoading}
				>
				  <Image 
					src="/images/google.png" 
					alt="Google" 
					width={16} 
					height={16} 
				  />
				  Continuer avec Google
				</Button>
				<p className="text-base font-medium text-center text-muted-foreground">
				  Pas encore de compte ?{' '}
				  <Link href="/sign-up" className="text-[#7372B7] hover:underline">
					{"S'inscrire"}
				  </Link>
				</p>
				<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
				  <p className="text-sm text-muted-foreground">
					Accédez à votre espace étudiant.
				  </p>
				</div>
			  </div>
			</form>
			<div className="hidden md:block relative bg-muted">
			  {isDesktop && (
				  <Image 
					src="/images/espace.png" 
					alt="Restaurant" 
					fill
					className="object-cover" 
					priority
				  />
			  )}
			</div>
		  </CardContent>
		</Card>
		<div className="text-balance text-center text-xs text-white">
		  {"Pour plus d'informations, visitez notre site officiel"} <a href="https://espaceetude.com" className="text-white hover:bg-white hover:text-[#303C99] transition-all duration-300 rounded-md px-1 py-0.5">Espacetude.com</a>
		</div>
	  </div>
	);
}

export default LoginForm;
