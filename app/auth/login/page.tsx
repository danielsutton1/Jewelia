'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, User, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const router = useRouter()
  const { signIn, resetPassword } = useAuth()

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!password.trim()) {
      setError('Password is required')
      return false
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Manual login attempt with:', { email, password: '***' })
      await signIn(email, password)
      
      console.log('✅ Manual login successful, preparing redirect...')
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('rememberedEmail')
      }
      
      // Add a small delay to ensure auth state is updated
      setTimeout(() => {
        router.push('/dashboard/customers')
        toast.success('Successfully logged in!')
      }, 200)
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Failed to log in. Please check your credentials.')
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    setError('')
    
    try {
      console.log('🚀 Starting demo login...')
      
      // Use the demo credentials directly with the auth provider
      await signIn('test@jewelia.com', 'testpassword123')
      
      console.log('✅ Demo login successful, redirecting to dashboard...')
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        router.push('/dashboard/customers')
        toast.success('Welcome to the Jewelia CRM Demo!')
      }, 500)
      
    } catch (error: any) {
      console.error('Demo login error:', error)
      setError('Demo login failed. Please try again.')
      toast.error('Demo login failed. Please try again.')
    } finally {
      setDemoLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first')
      return
    }
    
    setIsResetting(true)
    setError('')
    
    try {
      await resetPassword(email)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      console.error('Password reset error:', error)
      setError(error.message || 'Failed to send reset email')
      toast.error('Failed to send reset email')
    } finally {
      setIsResetting(false)
    }
  }

  // Load remembered email on component mount
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe')
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    
    if (remembered === 'true' && rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative">
      <Card className="w-full max-w-md bg-white border-gray-200 shadow-lg relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Jewelia CRM
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your account or try our demo
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white border-gray-300 focus:border-emerald-400 focus:ring-emerald-400/20"
                  required
                  disabled={loading || demoLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white border-gray-300 focus:border-emerald-400 focus:ring-emerald-400/20"
                  required
                  disabled={loading || demoLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={loading || demoLoading}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="text-sm text-gray-600 hover:text-gray-700 p-0 h-auto"
                onClick={handlePasswordReset}
                disabled={isResetting || loading || demoLoading}
              >
                {isResetting ? 'Sending...' : 'Forgot password?'}
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading || demoLoading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
          
          {/* Demo Button */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700"
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
            >
              {demoLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading Demo...
                </div>
              ) : (
                <>
                  🚀 Try Demo
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Experience Jewelia CRM with sample data
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or sign in with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base border-gray-300 hover:bg-gray-50"
              onClick={() => window.open('/auth/social-login', '_self')}
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
 
 