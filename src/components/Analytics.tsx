'use client'

import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useEffect } from 'react'

export default function Analytics() {
  useEffect(() => {
    // Log performance metrics for Speed Insights
    if (typeof window !== 'undefined') {
      // Track Time to First Byte (TTFB)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            console.log('TTFB:', navEntry.responseStart - navEntry.requestStart)
          }
          
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime)
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation', 'paint'] })
      
      return () => observer.disconnect()
    }
  }, [])

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  )
}