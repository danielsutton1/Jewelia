"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useResponsive } from '@/hooks/use-responsive'

interface SidebarContextType {
  isExpanded: boolean
  isMobileOpen: boolean
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const SIDEBAR_PREFERENCE_KEY = 'jewelia_sidebar_expanded'

export function SidebarProvider({ children }: { children: ReactNode }) {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Load sidebar preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SIDEBAR_PREFERENCE_KEY)
      if (stored !== null) {
        setIsExpanded(JSON.parse(stored))
      }
    }
  }, [])

  // Save sidebar preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isDesktop) {
      localStorage.setItem(SIDEBAR_PREFERENCE_KEY, JSON.stringify(isExpanded))
    }
  }, [isExpanded, isDesktop])

  // Auto-close mobile sidebar when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setIsMobileOpen(false)
    }
  }, [isMobile])

  // Set default states based on screen size
  useEffect(() => {
    if (isMobile) {
      // Mobile: always start collapsed (hidden)
      setIsExpanded(false)
    } else if (isTablet) {
      // Tablet: start collapsed
      setIsExpanded(false)
    }
    // Desktop: use stored preference or default to expanded
  }, [isMobile, isTablet])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileOpen(false)
  }

  const value: SidebarContextType = {
    isExpanded,
    isMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    isMobile,
    isTablet,
    isDesktop
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
} 