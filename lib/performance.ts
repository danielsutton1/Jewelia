// Performance optimization utilities

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const preloadComponent = (componentPath: string) => {
  if (typeof window !== 'undefined') {
    import(componentPath)
  }
}

export const preloadRoute = (route: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
  }
}

export const optimizeImages = () => {
  if (typeof window === 'undefined') return
  
  const images = document.querySelectorAll('img[data-src]')
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = img.dataset.src || ''
        img.classList.remove('lazy')
        imageObserver.unobserve(img)
      }
    })
  })
  
  images.forEach(img => imageObserver.observe(img))
}

export const measurePerformance = () => {
  if (typeof window === 'undefined') return null
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paintEntries = performance.getEntriesByType('paint')
  
  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    largestContentfulPaint: paintEntries.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
  }
}

export const isPerformanceGood = (metrics: ReturnType<typeof measurePerformance>) => {
  if (!metrics) return false
  
  return (
    metrics.loadTime < 5000 &&
    metrics.firstContentfulPaint < 2000 &&
    metrics.domContentLoaded < 3000
  )
}