"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"

interface DashboardClientWrapperProps {
  children: React.ReactNode
}

export function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  const { user, loading, userRole, permissions } = useAuth()
  const router = useRouter()

  // For development, bypass authentication temporarily
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>
  }

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please log in to access the dashboard")
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-emerald-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
} 