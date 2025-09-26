"use client"

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paintEntries = performance.getEntriesByType('paint')
      
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      const largestContentfulPaint = paintEntries.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0

      // Measure First Input Delay (FID) - simplified version
      let firstInputDelay = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            firstInputDelay = (entry as any).processingStart - entry.startTime
            observer.disconnect()
          }
        }
      })
      observer.observe({ entryTypes: ['first-input'] })

      // Measure Cumulative Layout Shift (CLS) - simplified version
      let cumulativeLayoutShift = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            cumulativeLayoutShift += (entry as any).value
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      setMetrics({
        loadTime,
        firstContentfulPaint,
        largestContentfulPaint,
        firstInputDelay,
        cumulativeLayoutShift
      })
    }

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    return () => {
      window.removeEventListener('load', measurePerformance)
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !metrics) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">Performance Metrics</div>
      <div className="space-y-1">
        <div>Load Time: {metrics.loadTime.toFixed(2)}ms</div>
        <div>FCP: {metrics.firstContentfulPaint.toFixed(2)}ms</div>
        <div>LCP: {metrics.largestContentfulPaint.toFixed(2)}ms</div>
        <div>FID: {metrics.firstInputDelay.toFixed(2)}ms</div>
        <div>CLS: {metrics.cumulativeLayoutShift.toFixed(4)}</div>
      </div>
      <div className="mt-2 text-xs text-gray-300">
        {metrics.loadTime < 5000 ? '✅ Good' : '⚠️ Slow'}
      </div>
    </div>
  )
}
