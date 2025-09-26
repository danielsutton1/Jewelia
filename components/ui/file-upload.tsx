"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, File, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  files: File[]
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

export function FileUpload({
  onFilesChange,
  files,
  maxFiles = 5,
  maxSize = 10, // 10MB default
  acceptedTypes = ["image/*", "application/pdf", "text/*"],
  className
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} is too large. Maximum size is ${maxSize}MB.`
    }
    
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })
    
    if (!isValidType) {
      return `File type ${file.type} is not supported.`
    }
    
    return null
  }, [maxSize, acceptedTypes])

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(newFiles)
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach(file => {
      const validationError = validateFile(file)
      if (validationError) {
        errors.push(validationError)
      } else if (files.length + validFiles.length < maxFiles) {
        validFiles.push(file)
      } else {
        errors.push(`Maximum ${maxFiles} files allowed.`)
      }
    })

    if (errors.length > 0) {
      setError(errors[0])
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles])
    }
  }, [files, maxFiles, validateFile, onFilesChange])

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }, [files, onFilesChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
  }, [addFiles])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Label>Attachments</Label>
      
      {/* Drag and Drop Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          files.length >= maxFiles && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop files here, or{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-primary"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={files.length >= maxFiles}
          >
            browse
          </Button>
        </p>
        <p className="text-xs text-muted-foreground">
          Max {maxFiles} files, {maxSize}MB each
        </p>
        <input
          id="file-upload"
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={files.length >= maxFiles}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Attached Files ({files.length}/{maxFiles})</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
 