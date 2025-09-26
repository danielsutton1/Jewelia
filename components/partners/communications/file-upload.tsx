"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload, X, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  onUploadComplete: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  allowedTypes?: string[]
}

export default function FileUpload({
  onUploadComplete,
  maxFiles = 5,
  maxSize = 10, // 10MB
  allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setError(null)
    const selectedFiles = Array.from(e.target.files)

    // Check if adding these files would exceed the max number
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files`)
      return
    }

    // Check file types and sizes
    const invalidFiles = selectedFiles.filter(
      (file) => !allowedTypes.includes(file.type) || file.size > maxSize * 1024 * 1024,
    )

    if (invalidFiles.length > 0) {
      setError(
        `Some files were not added. Please ensure all files are under ${maxSize}MB and are of the allowed types.`,
      )
      // Filter out invalid files
      const validFiles = selectedFiles.filter(
        (file) => allowedTypes.includes(file.type) && file.size <= maxSize * 1024 * 1024,
      )
      setFiles((prev) => [...prev, ...validFiles])
    } else {
      setFiles((prev) => [...prev, ...selectedFiles])
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          onUploadComplete(files)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">Drag and drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground">Supports: PDF, JPEG, PNG, DOC, DOCX (Max {maxSize}MB per file)</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept={allowedTypes.join(",")}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {files.length} file{files.length !== 1 ? "s" : ""} selected
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center p-2 rounded bg-muted">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm truncate flex-grow">{file.name}</span>
                <span className="text-xs text-muted-foreground mx-2">{formatFileSize(file.size)}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {uploading ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">{progress}% uploaded</p>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={handleUpload} disabled={files.length === 0}>
                {progress === 100 ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Uploaded
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" /> Upload Files
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
