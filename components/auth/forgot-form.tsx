"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, Mail } from "lucide-react"

export default function ForgotForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

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
    setIsLoading(true)

    // TODO: Intégrer Firebase Password Reset
    console.log("Password reset for:", email)

    // Simuler l'envoi
    setTimeout(() => {
      setIsLoading(false)
      setIsEmailSent(true)
    }, 1000)
  }

  if (isEmailSent) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-green-100 text-green-600 rounded-full p-3">
                  <Mail className="h-6 w-6" />
                </div>
              </div>
              <h1 className="text-xl font-bold mb-2">Email envoyé !</h1>
              <p className="text-muted-foreground mb-6">
                Nous avons envoyé un lien de réinitialisation à{" "}
                <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
              </p>
              <Link href="/login">
                <Button className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className='overflow-hidden p-0 border-none rounded-none'>
        <CardContent className='grid p-0 md:grid-cols-2 min-h-[600px] relative'>
          <form
          onSubmit={handleSubmit}
          className="p-6 lg:p-10 flex flex-col gap-6 justify-center"
        >
          {/* back arrow */}
          <Link
            href="/login"
            className="inline-flex h-7 w-7 absolute top-5 left-5 items-center justify-center rounded-full border-[1.5px] border-[#000000]"
          >
            <ChevronLeft className="h-5 w-5 text-black" />
          </Link>

          {/* headline */}
          <div className="space-y-1">
            <h1 className="text-[30px] font-bold leading-tight text-[#212121]">
              Enter Email
            </h1>
            <p className="text-sm font-medium text-[#9A9A9A]">
              Enter your email to reset your password
            </p>
          </div>

          {/* email field */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your phone or email"
                className="px-12 py-[27px] text-base font-medium placeholder:text-[#9B9B9B] bg-[#F5F5F5] border-none rounded-[10px] focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* send button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-[50px] rounded-[10px] bg-[#7372B7] text-lg font-semibold hover:bg-[#6564ab]"
          >
            {isLoading ? "Sending…" : "Send OTP"}
          </Button>
        </form>
          <div className='hidden md:block relative bg-[#6E6CD8]'>
            {isDesktop && (
              <Image
                src="/images/espace.png"
                alt="Espace"
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

