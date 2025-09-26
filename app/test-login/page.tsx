'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestLoginPage() {
  const { user, signIn, signOut, loading } = useAuth()
  const [email, setEmail] = useState('test@jewelia.com')
  const [password, setPassword] = useState('testpassword123')
  const [message, setMessage] = useState('')

  const handleSignIn = async () => {
    try {
      setMessage('Signing in...')
      await signIn(email, password)
      setMessage('Sign in successful!')
    } catch (error) {
      setMessage(`Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleSignOut = async () => {
    try {
      setMessage('Signing out...')
      await signOut()
      setMessage('Sign out successful!')
    } catch (error) {
      setMessage(`Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testEndpoint = async () => {
    try {
      setMessage('Testing endpoint...')
      const response = await fetch('/api/social/test-auth')
      const data = await response.json()
      setMessage(`Endpoint test result: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setMessage(`Endpoint test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🧪 Test Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSignIn} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-green-100 rounded">
                <p className="text-sm font-medium">✅ Signed in as:</p>
                <p className="text-sm">{user.email}</p>
                <p className="text-xs text-gray-600">ID: {user.id}</p>
              </div>
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Sign Out
              </Button>
            </div>
          )}
          
          <Button 
            onClick={testEndpoint} 
            variant="secondary" 
            className="w-full"
          >
            Test Social Endpoint
          </Button>
          
          {message && (
            <div className="p-3 bg-blue-100 rounded">
              <p className="text-sm">{message}</p>
            </div>
          )}
          
          <div className="text-xs text-gray-500 text-center">
            <p>This page helps test authentication</p>
            <p>Use test@jewelia.com / testpassword123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

