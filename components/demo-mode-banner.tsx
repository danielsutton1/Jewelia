'use client'

import { useDemo } from "@/lib/demo-context"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DemoModeBanner() {
  const { isDemoMode } = useDemo()

  if (!isDemoMode) return null

  return (
    <Alert className="bg-yellow-50 border-yellow-200">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-600">
        Demo Mode: Using mock data. All changes are temporary and will be reset on page refresh.
      </AlertDescription>
    </Alert>
  )
} 
 
 