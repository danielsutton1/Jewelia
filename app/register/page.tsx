"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/providers/auth-provider"
import { toast } from "sonner"
// import { supabase } from "@/lib/supabase"

// Password strength function
function passwordStrength(password: string) {
  let score = 0
  if (!password) return 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const auth = useAuth()

  const pwStrength = useMemo(() => passwordStrength(password), [password])
  const pwStrengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Excellent"][pwStrength]
  const pwStrengthColor = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-green-500", "bg-emerald-600"][pwStrength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!terms) {
      toast.error("You must agree to the terms and privacy policy.")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      // For now, just simulate registration success
      // In a real app, you would call signUp here
      console.log('Registration attempt:', { firstName, lastName, email, password })
      
      // Persist registration info to localStorage
      localStorage.setItem("jewelia_user_info", JSON.stringify({ firstName, lastName, email, password }))
      
      toast.success("Account created! Please check your email to verify your account.")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Failed to create account.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-3 sm:p-4">
      <div className="w-full max-w-md px-2 sm:px-4">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="mb-3 sm:mb-4 inline-block rounded-full bg-primary/10 p-3 sm:p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 sm:h-8 sm:w-8 text-primary"
            >
              <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
              <polyline points="2.32 6.16 12 11 21.68 6.16" />
              <line x1="12" x2="12" y1="22" y2="11" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 register-heading">Jewelia CRM</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 register-subtext">Create a new account to get started</p>
        </div>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl register-title">Create Account</CardTitle>
            <CardDescription className="text-sm sm:text-base register-description">Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name" className="text-sm sm:text-base">First name</Label>
                    <Input id="first-name" placeholder="John" required value={firstName} onChange={e => setFirstName(e.target.value)} className="min-h-[44px] min-w-[44px]" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name" className="text-sm sm:text-base">Last name</Label>
                    <Input id="last-name" placeholder="Doe" required value={lastName} onChange={e => setLastName(e.target.value)} className="min-h-[44px] min-w-[44px]" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} className="min-h-[44px] min-w-[44px]" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="min-h-[44px] min-w-[44px]" />
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-2 w-20 sm:w-24 rounded ${pwStrengthColor}`}></div>
                    <span className="text-xs text-muted-foreground">{pwStrengthLabel}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password" className="text-sm sm:text-base">Confirm Password</Label>
                  <Input id="confirm-password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="min-h-[44px] min-w-[44px]" />
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" required checked={terms} onCheckedChange={checked => setTerms(!!checked)} className="mt-1 min-h-[44px] min-w-[44px]" />
                  <Label htmlFor="terms" className="text-xs sm:text-sm font-normal leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      terms of service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      privacy policy
                    </Link>
                  </Label>
                </div>
                <Button type="submit" className="w-full min-h-[44px] min-w-[44px]" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col p-4 sm:p-6">
            <div className="mt-2 text-center text-xs sm:text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
