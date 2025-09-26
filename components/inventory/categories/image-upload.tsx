"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string) => void
  aspectRatio?: string
}

export function ImageUpload({ currentImage, onImageChange, aspectRatio = "1:1" }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // In a real app, you would upload the file to your server or cloud storage
    // and then set the returned URL. For this demo, we'll just use the preview URL.
    onImageChange(url)
  }

  // Clear the selected image
  const clearImage = () => {
    setPreviewUrl(null)
    onImageChange("")
  }

  // Calculate aspect ratio styles
  const getAspectRatioStyle = () => {
    if (!aspectRatio) return {}

    const [width, height] = aspectRatio.split(":").map(Number)
    return {
      aspectRatio: `${width} / ${height}`,
    }
  }

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative">
          <div
            className="border rounded-md overflow-hidden bg-muted flex items-center justify-center"
            style={getAspectRatioStyle()}
          >
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Category preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-background"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border rounded-md border-dashed flex flex-col items-center justify-center p-6 bg-muted/50"
          style={getAspectRatioStyle()}
        >
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <div className="text-sm text-muted-foreground mb-4">Drag and drop an image or click to browse</div>
          <Button variant="outline" size="sm" asChild>
            <label>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
              <Input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </Button>
        </div>
      )}
    </div>
  )
}
