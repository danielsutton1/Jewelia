import { useState, useEffect } from 'react'

export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Always initialize with the default value for SSR
  const [state, setState] = useState<T>(defaultValue)
  const [hydrated, setHydrated] = useState(false)

  // Once the component mounts, we can safely access localStorage
  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setState(JSON.parse(stored))
      } catch (e) {
        console.error(`Failed to parse stored value for key ${key}:`, e)
      }
    }
    setHydrated(true)
  }, [key])

  // Only persist to localStorage after hydration
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(key, JSON.stringify(state))
    }
  }, [key, state, hydrated])

  return [state, setState]
} 