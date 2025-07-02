"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Eye, EyeOff, BadgeCheck, Lock, ChevronLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

export default function ResetForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isDesktop, setIsDesktop] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setIsLoading(true)
    
    try {
      // TODO: Intégrer Firebase Password Reset Confirmation
      console.log("Reset password with token:", token)
      console.log("New password:", password)
      
      // Simuler la réinitialisation
      setTimeout(() => {
        setIsLoading(false)
        setIsSuccess(true)
      }, 1000)
      
    } catch (error) {
      setIsLoading(false)
      setError("Une erreur est survenue. Veuillez réessayer.")
    }
  }

  const handleSuccess = () => {
    setIsSuccess(false)
    router.push('/login')
  }

  return (
    <div className="flex flex-col gap-6">
      <AlertDialog open={isSuccess} onOpenChange={setIsSuccess}>
        <AlertDialogContent className="w-[95%] sm:w-auto sm:max-w-[425px]">
          <AlertDialogHeader className="space-y-1">
            <div className="flex justify-center">
              <BadgeCheck className="h-16 w-16 text-[#7372B7]" />
            </div>
            <AlertDialogTitle className="text-center font-bold text-[28px]">Password Successfully Changed</AlertDialogTitle>
            {/* <AlertDialogDescription className="text-center">
              Votre mot de passe a été modifié avec succès.
            </AlertDialogDescription> */}
          </AlertDialogHeader>
          <AlertDialogAction 
            className="w-full bg-[#7372B7] h-[40px] mt-7"
            onClick={handleSuccess}
          >
            Back To Login
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <Card className='overflow-hidden p-0 border-none rounded-none'>
        <CardContent className='grid p-0 md:grid-cols-2 min-h-[600px] relative'>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center gap-8 px-6 py-10 lg:px-12"
          >
            {/* back arrow in thin circle */}
            <Link
              href="/login"
              className="inline-flex h-7 w-7 absolute top-5 left-5 items-center justify-center rounded-full border-[1.5px] border-[#000000]"
            >
              <ChevronLeft className="h-5 w-5 text-black" />
            </Link>

            {/* headline & subtext */}
            <div className="space-y-1">
              <h1 className="text-[30px] font-bold leading-tight text-[#212121]">
                Set New Password
              </h1>
              <p className="text-sm font-medium text-[#9A9A9A]">
                Create new strong password
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* new password */}
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="bg-[#F5F5F5] placeholder:text-[#9B9B9B]
                             px-12 py-[27px] rounded-[10px] border-none
                             text-base font-medium focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#9B9B9B]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#9B9B9B]" />
                  )}
                </Button>
              </div>
            </div>

            {/* confirm password */}
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]" />
                <Input
                  id="confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="bg-[#F5F5F5] placeholder:text-[#9B9B9B]
                             px-12 py-[27px] rounded-[10px] border-none
                             text-base font-medium focus:outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-[#9B9B9B]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#9B9B9B]" />
                  )}
                </Button>
              </div>
            </div>

            {/* submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-[50px] w-full rounded-[10px] bg-[#7372B7] text-lg font-semibold hover:bg-[#6462ad]"
            >
              {isLoading ? "Updating…" : "Set New Password"}
            </Button>
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
  )
}