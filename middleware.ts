import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Check if Supabase environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('⚠️ Supabase environment variables not available in middleware, allowing all requests')
    
    // Define public routes that don't require authentication
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/reset-password', '/', '/dashboard']
    const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))
    
    // Allow all requests when Supabase is not configured (demo mode)
    return response
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Define public routes that don't require authentication
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/reset-password', '/']
    const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

    // If no session and trying to access protected route, redirect to login
    if (!session && !isPublicRoute) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If session exists and trying to access auth pages, redirect to customers
    if (session && isPublicRoute && req.nextUrl.pathname !== '/') {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard/customers'
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow the request to proceed (fail open for demo mode)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 