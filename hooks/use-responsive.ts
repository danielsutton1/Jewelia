"use client"

import { useState, useEffect } from 'react'

export type ScreenSize = 'mobile' | 'tablet' | 'desktop'

export function useResponsive() {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop')
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        setScreenSize('mobile')
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
      } else if (width < 1024) {
        setScreenSize('tablet')
        setIsMobile(false)
        setIsTablet(true)
        setIsDesktop(false)
      } else {
        setScreenSize('desktop')
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
      }
    }

    // Set initial size
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop
  }
} 