"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface Segment {
  value: number
  color: string
}

interface SegmentedCircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: Segment[]
  size?: number
  strokeWidth?: number
  backgroundColor?: string
  children?: React.ReactNode
}

export function SegmentedCircularProgress({
  segments,
  size = 120,
  strokeWidth = 10,
  backgroundColor = "#e6e6e6",
  className,
  children,
  ...props
}: SegmentedCircularProgressProps) {
  const _size = typeof size === 'number' && !isNaN(size) ? size : 120;
  const _strokeWidth = typeof strokeWidth === 'number' && !isNaN(strokeWidth) ? strokeWidth : 10;
  const radius = (_size - _strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;

  // Calculate start/end for each segment
  let prevPercent = 0;
  const arcs = segments.map((seg, i) => {
    const percent = seg.value / total;
    const dasharray = percent * circumference;
    const dashoffset = circumference - prevPercent * circumference;
    prevPercent += percent;
    return (
      <circle
        key={i}
        cx={_size / 2}
        cy={_size / 2}
        r={radius}
        fill="none"
        stroke={seg.color}
        strokeWidth={_strokeWidth}
        strokeDasharray={`${dasharray} ${circumference - dasharray}`}
        strokeDashoffset={dashoffset}
        strokeLinecap="round"
        className="transition-all duration-500 ease-in-out"
      />
    );
  });

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: _size, height: _size }}
      {...props}
    >
      <svg width={_size} height={_size} viewBox={`0 0 ${_size} ${_size}`} className="rotate-[-90deg]">
        <circle
          cx={_size / 2}
          cy={_size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={_strokeWidth}
        />
        {arcs}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
} 