"use client"

import { useEffect, useRef } from "react"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  lineWidth?: number
  fillOpacity?: number
  className?: string
}

export function Sparkline({
  data,
  width = 80,
  height = 30,
  color = "currentColor",
  lineWidth = 1.5,
  fillOpacity = 0.2,
  className,
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set the device pixel ratio for sharper rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear the canvas
    ctx.clearRect(0, 0, width, height)

    // Find min and max values for scaling
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1 // Avoid division by zero

    // Calculate the step between points
    const step = width / (data.length - 1)

    // Start the path
    ctx.beginPath()
    ctx.moveTo(0, height - ((data[0] - min) / range) * height)

    // Draw the line
    for (let i = 1; i < data.length; i++) {
      const x = i * step
      const y = height - ((data[i] - min) / range) * height
      ctx.lineTo(x, y)
    }

    // Draw the stroke
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.stroke()

    // Fill the area under the line
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.globalAlpha = fillOpacity
    ctx.fill()
    ctx.globalAlpha = 1
  }, [data, width, height, color, lineWidth, fillOpacity])

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} className={className} />
}
