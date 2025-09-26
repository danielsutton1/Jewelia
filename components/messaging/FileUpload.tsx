'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (files: File[]) => void
  onFileRemove: (file: File) => void
  selectedFiles: File[]
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  disabled?: boolean
}

interface UploadedFile {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  uploadedAt: string
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFiles,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  disabled = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit`
    }
    
    if (!acceptedTypes.includes(file.type)) {
      return 'File type not supported'
    }
    
    return null
  }

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const validFiles: File[] = []
    const errors: Record<string, string> = {}

    Array.from(files).forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors[file.name] = error
      } else if (selectedFiles.length + validFiles.length < maxFiles) {
        validFiles.push(file)
      }
    })

    if (Object.keys(errors).length > 0) {
      setUploadErrors(prev => ({ ...prev, ...errors }))
    }

    if (validFiles.length > 0) {
      onFileSelect(validFiles)
    }
  }, [selectedFiles.length, maxFiles, onFileSelect, maxSize, acceptedTypes])

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
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileSelect])

  const uploadFile = async (file: File, messageId: string): Promise<UploadedFile | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('messageId', messageId)

    try {
      const response = await fetch('/api/messaging/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const handleUpload = async (files: File[], messageId: string) => {
    const uploadPromises = files.map(async (file) => {
      const fileId = `${file.name}-${Date.now()}`
      
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[fileId] || 0
            if (current < 90) {
              return { ...prev, [fileId]: current + 10 }
            }
            return prev
          })
        }, 100)

        const uploadedFile = await uploadFile(file, messageId)
        
        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        
        if (uploadedFile) {
          setUploadedFiles(prev => [...prev, uploadedFile])
        }
        
        return uploadedFile
      } catch (error) {
        setUploadErrors(prev => ({ 
          ...prev, 
          [fileId]: error instanceof Error ? error.message : 'Upload failed' 
        }))
        return null
      }
    })

    await Promise.all(uploadPromises)
  }

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Drag & Drop Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-6 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            Drag and drop files here, or click to select
          </p>
          <p className="text-xs text-gray-500">
            Max {maxFiles} files, {formatFileSize(maxSize)} each
          </p>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length}/{maxFiles})</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemove(file)}
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading...</h4>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{fileId.split('-')[0]}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Upload Errors */}
      {Object.keys(uploadErrors).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-600">Upload Errors</h4>
          {Object.entries(uploadErrors).map(([fileId, error]) => (
            <div key={fileId} className="flex items-center space-x-2 p-2 bg-red-50 rounded text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{fileId.split('-')[0]}: {error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-green-600">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">{file.fileName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 