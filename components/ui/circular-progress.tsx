"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  showValue?: boolean
  valuePrefix?: string
  valueSuffix?: string
  color?: string
  backgroundColor?: string
  children?: React.ReactNode
}

export function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  showValue = false,
  valuePrefix = "",
  valueSuffix = "",
  color = "var(--primary)",
  backgroundColor = "#e6e6e6",
  className,
  children,
  ...props
}: CircularProgressProps) {
  const _size = typeof size === 'number' && !isNaN(size) ? size : 120;
  const _strokeWidth = typeof strokeWidth === 'number' && !isNaN(strokeWidth) ? strokeWidth : 10;
  const _value = typeof value === 'number' && !isNaN(value) ? value : 0;
  const _max = typeof max === 'number' && !isNaN(max) && max !== 0 ? max : 100;
  const radius = (_size - _strokeWidth) / 2;
  const circumference = !isNaN(radius) ? radius * 2 * Math.PI : 0;
  const offset = !isNaN(circumference) ? circumference - (_value / _max) * circumference : 0;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: _size, height: _size }}
      {...props}
    >
      <svg width={_size} height={_size} viewBox={`0 0 ${_size} ${_size}`} className="rotate-[-90deg]">
        <circle
          cx={String(_size / 2)}
          cy={String(_size / 2)}
          r={String(radius)}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={_strokeWidth}
        />
        <circle
          cx={String(_size / 2)}
          cy={String(_size / 2)}
          r={String(radius)}
          fill="none"
          stroke={color}
          strokeWidth={_strokeWidth}
          strokeDasharray={String(circumference)}
          strokeDashoffset={String(offset)}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {showValue && (
          <span className="text-xl font-bold">
            {valuePrefix}
            {_value}
            {valueSuffix}
          </span>
        )}
        {children}
      </div>
    </div>
  )
}
