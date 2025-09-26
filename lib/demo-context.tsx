'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface DemoContextType {
  isDemoMode: boolean
  toggleDemoMode: () => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(true)

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode)
  }

  return (
    <DemoContext.Provider value={{ isDemoMode, toggleDemoMode }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider')
  }
  return context
} 
 
 