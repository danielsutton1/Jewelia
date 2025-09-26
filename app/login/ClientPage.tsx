"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function ClientLoginPage() {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 login-heading">Jewelia CRM</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 login-subtext">Sign in to your account to continue</p>
        </div>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl login-title">Sign In</CardTitle>
            <CardDescription className="text-sm sm:text-base login-description">Enter your email and password to access your account</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form>
              <div className="grid gap-3 sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" required className="min-h-[44px] min-w-[44px]" />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                    <Link href="/forgot-password" className="text-xs sm:text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="password" type="password" required className="min-h-[44px] min-w-[44px]" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="min-h-[44px] min-w-[44px]" />
                  <Label htmlFor="remember" className="text-xs sm:text-sm font-normal">
                    Remember me for 30 days
                  </Label>
                </div>
                <Button type="submit" className="w-full min-h-[44px] min-w-[44px]">
                  Sign In
                </Button>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-h-[44px] min-w-[44px]"
                  onClick={() => {
                    const baseUrl = process.env.NODE_ENV === 'development' 
                      ? 'http://localhost:3000' 
                      : window.location.origin;
                    window.location.href = `${baseUrl}/dashboard`;
                  }}
                >
                  Try Demo
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col p-4 sm:p-6">
            <div className="mt-2 text-center text-xs sm:text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
