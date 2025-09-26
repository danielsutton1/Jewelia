'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { socialAuthService } from '@/lib/auth/social-auth'
import { toast } from 'sonner'
import Link from 'next/link'

// Component that uses search params - wrapped in Suspense
function SocialLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Check if this is a callback from OAuth
  const isCallback = searchParams.get('code') || searchParams.get('error')

  useEffect(() => {
    if (isCallback) {
      handleOAuthCallback()
    }
  }, [isCallback])

  const handleOAuthCallback = async () => {
    // This would typically handle the OAuth callback
    // For now, we'll simulate a successful login
    setIsLoading(true)
    setStatus('loading')
    
    setTimeout(() => {
      setStatus('success')
      toast.success('Social login successful!')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }, 2000)
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    setStatus('loading')
    setErrorMessage('')

    try {
      let result
      switch (provider) {
        case 'google':
          result = await socialAuthService.signInWithGoogle({
            redirectTo: `${window.location.origin}/auth/social-login`
          })
          break
        case 'linkedin':
          result = await socialAuthService.signInWithLinkedIn({
            redirectTo: `${window.location.origin}/auth/social-login`
          })
          break
        case 'github':
          result = await socialAuthService.signInWithGitHub({
            redirectTo: `${window.location.origin}/auth/social-login`
          })
          break
        case 'facebook':
          result = await socialAuthService.signInWithFacebook({
            redirectTo: `${window.location.origin}/auth/social-login`
          })
          break
        default:
          throw new Error(`Unsupported provider: ${provider}`)
      }

      if (!result.success) {
        throw result.error
      }

      toast.success(`Redirecting to ${provider}...`)
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error)
      setErrorMessage(`Failed to sign in with ${provider}: ${error.message}`)
      setStatus('error')
      toast.error(`Failed to sign in with ${provider}`)
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    if (status === 'success') {
      return (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-green-800">Login Successful!</h2>
          <p className="text-green-600">Redirecting you to the dashboard...</p>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-800">Login Failed</h2>
          <p className="text-red-600">{errorMessage}</p>
          <Button
            onClick={() => {
              setStatus('idle')
              setErrorMessage('')
            }}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )
    }

    if (isLoading || status === 'loading') {
      return (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-blue-800">Processing Login...</h2>
          <p className="text-blue-600">Please wait while we authenticate you.</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Choose Your Login Method</h2>
          <p className="text-muted-foreground text-center">
            Sign in with your preferred social account
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => handleSocialLogin('linkedin')}
            disabled={isLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => handleSocialLogin('github')}
            disabled={isLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/auth/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          <CardTitle className="text-2xl font-bold">Social Login</CardTitle>
          <CardDescription>
            Connect with your social account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}

// Main page component with Suspense boundary
export default function SocialLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
            <CardDescription>Preparing social login options</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    }>
      <SocialLoginContent />
    </Suspense>
  )
}