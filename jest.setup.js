import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/dashboard/inventory-sharing',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase with our custom implementation
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(() => {
    // Lazy import to avoid hook timing issues
    const { createMockSupabaseClient } = require('./__tests__/utils/supabase-mocks')
    return createMockSupabaseClient()
  }),
}))

// Mock Supabase client for components - will be mocked in individual test files as needed

// Mock fetch
global.fetch = jest.fn()

// Set up default mock for inventory fetch
global.fetch.mockImplementation((url) => {
  if (url === '/api/inventory') {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            id: 'inv-001',
            name: 'Diamond Engagement Ring',
            sku: 'RING-001',
            category: 'Rings',
            subcategory: 'Engagement Rings',
            metal_type: 'White Gold',
            gemstone_type: 'Diamond',
            weight: 2.5,
            price: 8500,
            cost: 4250,
            quantity: 3,
            description: 'Beautiful 2.5 carat diamond engagement ring in white gold',
            images: ['ring-001-1.jpg', 'ring-001-2.jpg'],
            is_active: true,
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
        },
      }),
    })
  }
  
  // Default response for other endpoints
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: {} }),
  })
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

// Set up console mocking immediately (not in hooks)
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalConsoleError.call(console, ...args)
}
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: componentWillReceiveProps has been renamed')
  ) {
    return
  }
  originalConsoleWarn.call(console, ...args)
}
