import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { DemoProvider } from '@/lib/demo-context'
import { SidebarProvider } from '@/components/dashboard/sidebar-context'
import { Toaster } from '@/components/ui/toaster'

// Mock Supabase client to avoid ES module issues
jest.mock('@/lib/supabase/browser', () => ({
  createSupabaseBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  })),
}))

// Mock AuthProvider to avoid Supabase dependency
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="mock-auth-provider">{children}</div>
}

// Re-export mock data from separate file to avoid hook timing issues
export { getMockInventorySharingData, getMockApiResponses } from './mock-data'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockAuthProvider>
      <DemoProvider>
        <SidebarProvider>
          {children}
          <Toaster />
        </SidebarProvider>
      </DemoProvider>
    </MockAuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock fetch response helper
export const mockFetchResponse = (response: any) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: response?.success !== false,
    json: () => Promise.resolve(response),
    status: response?.success !== false ? 200 : 400,
    statusText: response?.success !== false ? 'OK' : 'Bad Request',
  })
}

// Mock fetch error helper
export const mockFetchError = (errorMessage: string) => {
  global.fetch = jest.fn().mockRejectedValue(new Error(errorMessage))
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }