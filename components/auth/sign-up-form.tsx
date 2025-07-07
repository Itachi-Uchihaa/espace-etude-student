"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { ImSpinner6 } from "react-icons/im";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { createUser, loginWithGoogle } from "@/store/user/userThunk";
import { useAppDispatch } from "@/store/store";

export default function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // const { createUser, signUpWithGoogle } = useAuth();
  const router = useRouter();
  const dispatch =  useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    // Capture location
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

    setIsLoading(true);
    try {
      // await createUser(email, password, name, location);
      await dispatch(createUser({ email, password, name, location })).unwrap();
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error("Error creating user:", err)
      // L'erreur est déjà gérée dans le contexte d'authentification
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    // Capture location first
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

    setIsLoading(true);
    try {
      // await signUpWithGoogle(location);
      await dispatch(loginWithGoogle({ location })).unwrap();
      router.push("/settings");
    } catch (err) {
      console.error("Error signing up with Google:", err);
      // L'erreur est déjà gérée dans le contexte d'authentification
    } finally {
      setIsLoading(false);
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
                <h1 className="text-2xl font-bold">Créer un compte</h1>
                <p className="text-balance text-muted-foreground">
                  Rejoignez notre plateforme <span className="bg-gradient-to-b from-[#101433] to-[#303C99] bg-clip-text text-transparent font-semibold">Étudiant</span>
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Votre nom complet" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
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
              
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input 
                    id="confirm-password" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="********" 
                    required 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                  "S'inscrire"
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
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <Image 
                  src="/images/google.png" 
                  alt="Google" 
                  width={16} 
                  height={16} 
                />
                {"S'inscrire avec Google"}
              </Button>
              
              <p className="text-base font-medium text-center text-muted-foreground">
                Déjà un compte ?{" "}
                <Link href="/login" className="text-[#7372B7] hover:underline">
                  Se connecter
                </Link>
              </p>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  {"Rejoignez notre communauté d'étudiants."}
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
