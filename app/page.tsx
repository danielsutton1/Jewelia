"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export default function WelcomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect immediately without showing loading screen
    if (user) {
      router.replace("/dashboard")
    } else {
      router.replace("/auth/login")
    }
  }, [user, router])

  // Show nothing while redirecting to prevent flash
  return null
}
// DEPLOYMENT FORCE REFRESH - Thu Aug 21 18:36:03 EDT 2025
// FORCE DEPLOYMENT - Thu Aug 21 18:55:35 EDT 2025 - All Supabase .or() method errors fixed
