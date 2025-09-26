"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Trash2 } from "lucide-react"

interface FileUploadProps {
  files: File[]
  onChange: (files: File[]) => void
}

export function FileUpload({ files, onChange }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange([...files, ...Array.from(e.target.files)])
    }
  }

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files) {
      onChange([...files, ...Array.from(e.dataTransfer.files)])
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">Drag & Drop Files</h3>
        <p className="text-sm text-muted-foreground mb-4">or click to browse your files</p>
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Select Files
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
        <p className="text-xs text-muted-foreground mt-2">
          Upload design files, reference images, or any other relevant documents
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center p-2 rounded-md border">
              <FileText className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="flex-grow">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.type || "Unknown type"} • {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
