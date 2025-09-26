"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eraser } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface SignatureCaptureProps {
  value: string
  onChange: (value: string) => void
}

export function SignatureCapture({ value, onChange }: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set line style
    context.lineWidth = 2
    context.lineCap = "round"
    context.strokeStyle = "#000"

    // If there's a value, draw it
    if (value) {
      const img = new Image()
      img.onload = () => {
        context.drawImage(img, 0, 0)
      }
      img.src = value
    }

    // Handle window resize
    const handleResize = () => {
      const imgData = context.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      context.lineWidth = 2
      context.lineCap = "round"
      context.strokeStyle = "#000"
      context.putImageData(imgData, 0, 0)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [value])

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    setIsDrawing(true)

    // Get coordinates
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top

    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (e: any) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Get coordinates
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top

    context.lineTo(x, y)
    context.stroke()
  }

  const endDrawing = () => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    context.closePath()
    setIsDrawing(false)

    // Save signature as data URL
    const dataUrl = canvas.toDataURL("image/png")
    onChange(dataUrl)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    onChange("")
  }

  return (
    <div className="space-y-2">
      <div className="border rounded-md p-2">
        <canvas
          ref={canvasRef}
          className="w-full h-32 border border-dashed rounded-md touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
          <Eraser className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  )
}
