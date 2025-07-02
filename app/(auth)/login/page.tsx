import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="bg-muted p-6 md:p-10 bg-gradient-to-b from-[#4e54c8] to-[#3f2b96]">
      <div className="w-full max-w-sm md:max-w-4xl mx-auto">
        <LoginForm />
      </div>
    </div>
  )
}