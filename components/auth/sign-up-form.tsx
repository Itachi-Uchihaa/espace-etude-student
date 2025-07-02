"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, User2 } from "lucide-react";
import { ImSpinner6 } from "react-icons/im";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { createUser, loginWithGoogle } = useAuth();
  const router = useRouter();
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
      toast.error("Passwords do not match");
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
    }
    if (!location.latitude || !location.longitude) {
      toast.error("Please turn on your Location to signup on the platform..");
      return;
    }

    setIsLoading(true);
    try {
      await createUser(email, password, name, location);
      router.push("/login");
    } catch (err) {
      toast.error("Error during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // setIsLoading(true);
    try {
      await loginWithGoogle();
      router.push("/profile");
    } catch (err) {
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-none rounded-none">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[600px]">
          <form
            className="p-6 lg:p-10 flex flex-col gap-6 justify-center"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-1">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={100}
                height={40}
              />
              <h1 className="text-[30px] font-bold mt-2 text-[#212121]">
                Create Account
              </h1>
              <p className="text-[#9A9A9A] text-base font-semibold">
                Sign up to upgrade your learning skills next level
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    className="px-10 bg-[#F5F5F5] border-none py-[27px] font-medium text-base focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your phone or email"
                    className="px-10 bg-[#F5F5F5] border-none py-[27px] font-medium text-base focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="px-10 bg-[#F5F5F5] border-none font-medium text-base py-[27px] focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#9B9B9B]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#9B9B9B]" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 relative">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={confirmPassword}
                    className="px-10 bg-[#F5F5F5] border-none py-[27px] font-medium text-base focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-[#9B9B9B]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#9B9B9B]" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-[50px] mt-5 bg-[#7372B7] hover:bg-[#7372B7] text-[#FFFFFF] font-semibold text-lg rounded-[10px]"
            >
              {isLoading ? <ImSpinner6 className="animate-spin" /> : "Sign Up"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#888888]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-[#9B9B9B] font-normal text-lg leading-[150%] tracking-[0%]">
                  Or
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full gap-2 bg-[#F5F5F5] h-[50px] border-none text-lg font-semibold cursor-pointer rounded-[10px]"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Image
                src="/images/google.png"
                alt="Google"
                width={16}
                height={16}
              />
              Continue with Google
            </Button>

            <p className="text-base font-medium text-center text-[#9B9B9B]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#7372B7] hover:underline">
                Login
              </Link>
            </p>
          </form>
          <div className="hidden md:block relative bg-[#6E6CD8]">
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
    </div>
  );
}
