'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, RefreshCw } from 'lucide-react'

// =====================================================
// LOADING STATES COMPONENTS
// =====================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

interface LoadingCardProps {
  className?: string
  showSkeleton?: boolean
}

export function LoadingCard({ className = '', showSkeleton = true }: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        {showSkeleton && (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[75%]" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface LoadingGridProps {
  count?: number
  className?: string
  showSkeleton?: boolean
}

export function LoadingGrid({ count = 6, className = '', showSkeleton = true }: LoadingGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard key={index} showSkeleton={showSkeleton} />
      ))}
    </div>
  )
}

interface LoadingListProps {
  count?: number
  className?: string
}

export function LoadingList({ count = 5, className = '' }: LoadingListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ rows = 5, columns = 4, className = '' }: LoadingTableProps) {
  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-[120px]" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-[100px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  text?: string
  className?: string
}

export function LoadingOverlay({ isLoading, children, text = 'Loading...', className = '' }: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <LoadingSpinner text={text} />
      </div>
    </div>
  )
}

interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  disabled = false,
  onClick
}: LoadingButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

interface LoadingPageProps {
  text?: string
  className?: string
}

export function LoadingPage({ text = 'Loading...', className = '' }: LoadingPageProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  )
}

interface LoadingSectionProps {
  text?: string
  className?: string
  height?: string
}

export function LoadingSection({ text = 'Loading...', className = '', height = 'h-32' }: LoadingSectionProps) {
  return (
    <div className={`flex items-center justify-center ${height} ${className}`}>
      <LoadingSpinner text={text} />
    </div>
  )
}

// =====================================================
// SKELETON COMPONENTS
// =====================================================

export function MessageSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[75%]" />
      </div>
    </div>
  )
}

export function PartnerCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-[150px] mb-1" />
                <Skeleton className="h-3 w-[120px] mb-1" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ThreadSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[180px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-[80px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
    </div>
  )
}

// =====================================================
// PROGRESS INDICATORS
// =====================================================

interface ProgressIndicatorProps {
  current: number
  total: number
  text?: string
  className?: string
}

export function ProgressIndicator({ current, total, text, className = '' }: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className={`text-center ${className}`}>
      <div className="mb-2">
        <span className="text-sm font-medium text-gray-700">
          {text || 'Loading'} {current} of {total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1">
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
    </div>
  )
}

// =====================================================
// INFINITE SCROLL LOADING
// =====================================================

interface InfiniteScrollLoadingProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  className?: string
}

export function InfiniteScrollLoading({ hasMore, isLoading, onLoadMore, className = '' }: InfiniteScrollLoadingProps) {
  if (!hasMore) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        <p>No more items to load</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <LoadingSpinner text="Loading more..." />
      </div>
    )
  }

  return (
    <div className={`text-center py-4 ${className}`}>
      <button
        onClick={onLoadMore}
        className="text-primary hover:text-primary/80 text-sm font-medium"
      >
        Load more
      </button>
    </div>
  )
}
