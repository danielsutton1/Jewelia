'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OverviewRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main dashboard
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-emerald-700 font-medium">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
