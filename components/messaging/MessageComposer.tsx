'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Send, 
  Paperclip, 
  Smile, 
  X, 
  File, 
  Image, 
  FileText, 
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  AlertCircle,
  Upload,
  Mic,
  Edit3,
  MoreHorizontal
} from 'lucide-react'
import { FileUpload } from './FileUpload'
import { VoiceMessage } from './VoiceMessage'
import { cn } from '@/lib/utils'

interface MessageComposerProps {
  threadId: string
  onSendMessage: (content: string, attachments?: File[], uploadedFiles?: UploadedFile[], voiceMessage?: Blob) => Promise<void>
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
  placeholder?: string
  maxAttachments?: number
  maxFileSize?: number
  showVoiceMessage?: boolean
  showReactions?: boolean
  showEditMode?: boolean
}

interface UploadedFile {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  uploadedAt: string
}

export function MessageComposer({
  threadId,
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Type your message...",
  maxAttachments = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  showVoiceMessage = true,
  showReactions = true,
  showEditMode = true
}: MessageComposerProps) {
  const [message, setMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [originalMessage, setOriginalMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleFileSelect = useCallback((files: File[]) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev, ...files].slice(0, maxAttachments)
      return newFiles
    })
  }, [maxAttachments])

  const handleFileRemove = useCallback((file: File) => {
    setSelectedFiles(prev => prev.filter(f => f !== file))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[file.name]
      return newProgress
    })
    setUploadErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[file.name]
      return newErrors
    })
  }, [])

  const handleTyping = useCallback((value: string) => {
    setMessage(value)
    
    // Handle typing indicators
    if (onTyping) {
      if (value.length > 0 && !isTyping) {
        setIsTyping(true)
        onTyping(true)
      } else if (value.length === 0 && isTyping) {
        setIsTyping(false)
        onTyping(false)
      }
    }

    // Clear existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing indicator after 3 seconds of no input
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        onTyping?.(false)
      }, 3000)
    }
    
    // Typing indicator logic
    if (onTyping) {
      if (!isTyping) {
        setIsTyping(true)
        onTyping(true)
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        onTyping(false)
      }, 1000)
    }
  }, [isTyping, onTyping])

  const handleVoiceMessage = (audioBlob: Blob) => {
    handleSend('', [], [], audioBlob)
    setShowVoiceRecorder(false)
  }

  const handleEditMode = () => {
    if (editMode) {
      // Cancel edit mode
      setEditMode(false)
      setMessage(originalMessage)
    } else {
      // Enter edit mode
      setEditMode(true)
      setOriginalMessage(message)
    }
  }

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('messageId', 'temp') // Will be updated after message creation

    try {
      const response = await fetch('/api/messaging/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('File upload error:', error)
      return null
    }
  }

  const handleUpload = async (files: File[]) => {
    setIsUploading(true)
    setUploadErrors({})

    for (const file of files) {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50))
          setUploadProgress(prev => ({ ...prev, [file.name]: i }))
        }

        const uploadedFile = await uploadFile(file)
        if (uploadedFile) {
          setUploadedFiles(prev => [...prev, uploadedFile])
          setSelectedFiles(prev => prev.filter(f => f !== file))
        } else {
          setUploadErrors(prev => ({ ...prev, [file.name]: 'Upload failed' }))
        }
      } catch (error) {
        setUploadErrors(prev => ({ ...prev, [file.name]: 'Upload failed' }))
      }

      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[file.name]
        return newProgress
      })
    }

    setIsUploading(false)
  }

  const handleSend = async (customMessage?: string, customFiles?: File[], customUploadedFiles?: UploadedFile[], voiceMessage?: Blob) => {
    const messageToSend = customMessage ?? message
    const filesToSend = customFiles ?? selectedFiles
    const uploadedFilesToSend = customUploadedFiles ?? uploadedFiles

    if (!messageToSend.trim() && filesToSend.length === 0 && uploadedFilesToSend.length === 0 && !voiceMessage) {
      return
    }

    setIsSending(true)

    try {
      await onSendMessage(messageToSend, filesToSend, uploadedFilesToSend, voiceMessage)
      
      // Reset form
      setMessage('')
      setSelectedFiles([])
      setUploadedFiles([])
      setShowVoiceRecorder(false)
      setEditMode(false)
      setOriginalMessage('')
      
      // Clear typing indicator
      if (onTyping) {
        setIsTyping(false)
        onTyping(false)
      }
      
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  return (
    <Card className="border-t">
      <CardContent className="p-4">
        {/* Voice Message Recorder */}
        {showVoiceRecorder && (
          <div className="mb-4">
            <VoiceMessage
              onSend={handleVoiceMessage}
              onCancel={() => setShowVoiceRecorder(false)}
              disabled={disabled || isSending}
            />
          </div>
        )}

        {/* File Upload Area */}
        {(selectedFiles.length > 0 || uploadedFiles.length > 0) && (
          <div className="mb-4 space-y-2">
            {/* Selected Files */}
            {selectedFiles.map((file) => (
              <div key={file.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {uploadProgress[file.name] !== undefined && (
                    <Progress value={uploadProgress[file.name]} className="w-20" />
                  )}
                  
                  {uploadErrors[file.name] && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileRemove(file)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Uploaded Files */}
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{file.fileName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadedFile(file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Upload Button */}
            {selectedFiles.length > 0 && (
              <Button
                onClick={() => handleUpload(selectedFiles)}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            )}
          </div>
        )}

        {/* Message Input */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={editMode ? "Edit your message..." : placeholder}
              className="min-h-[60px] resize-none"
              disabled={disabled || isSending}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Voice Message Button */}
            {showVoiceMessage && !showVoiceRecorder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVoiceRecorder(true)}
                disabled={disabled || isSending}
                title="Voice Message"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}

            {/* File Upload Button */}
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFiles={selectedFiles}
              maxFiles={maxAttachments - uploadedFiles.length}
              maxSize={maxFileSize}
              acceptedTypes={['image/*', 'application/pdf', 'text/*']}
              disabled={disabled || isSending}
            />

            {/* Edit Mode Toggle */}
            {showEditMode && message.trim() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditMode}
                disabled={disabled || isSending}
                title={editMode ? "Cancel Edit" : "Edit Message"}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}

            {/* Send Button */}
            <Button
              onClick={() => handleSend()}
              disabled={disabled || isSending || (!message.trim() && selectedFiles.length === 0 && uploadedFiles.length === 0)}
              size="sm"
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="mt-2 text-xs text-gray-500">
            Typing...
          </div>
        )}
      </CardContent>
    </Card>
  )
} 