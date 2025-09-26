// 🔐 ENCRYPTED MESSAGE COMPOSER
// Enhanced message composer with encryption, file sharing, and video call integration

"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Paperclip, 
  Video, 
  Phone, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff,
  Lock,
  Unlock,
  FileText,
  Image,
  Video as VideoIcon,
  Archive,
  X,
  AlertCircle,
  CheckCircle,
  Shield
} from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { encryptionService } from '@/lib/services/EncryptionService'
import { videoCallService } from '@/lib/services/VideoCallService'
import { 
  EncryptionResult, 
  CallType, 
  KeyAlgorithm 
} from '@/types/encrypted-communication'

// =====================================================
// INTERFACES
// =====================================================

interface EncryptedMessageComposerProps {
  conversationId: string
  userId: string
  participants: string[]
  onMessageSent: (message: any) => void
  onFileUploaded: (file: any) => void
  onVideoCallInitiated?: (callId: string) => void
  isEncrypted?: boolean
  encryptionAlgorithm?: KeyAlgorithm
  maxFileSize?: number // in bytes
  allowedFileTypes?: string[]
  placeholder?: string
  className?: string
}

interface FileUpload {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'encrypting' | 'completed' | 'error'
  error?: string
  encryptionResult?: EncryptionResult
}

interface MessageDraft {
  content: string
  files: FileUpload[]
  isEncrypted: boolean
  encryptionAlgorithm: KeyAlgorithm
  replyTo?: string
  threadId?: string
}

// =====================================================
// COMPONENT
// =====================================================

export function EncryptedMessageComposer({
  conversationId,
  userId,
  participants,
  onMessageSent,
  onFileUploaded,
  onVideoCallInitiated,
  isEncrypted = true,
  encryptionAlgorithm = 'AES-256-GCM',
  maxFileSize = 100 * 1024 * 1024, // 100MB
  allowedFileTypes = ['image/*', 'video/*', 'application/pdf', 'text/*'],
  placeholder = "Type your encrypted message...",
  className = ""
}: EncryptedMessageComposerProps) {
  // =====================================================
  // STATE
  // =====================================================

  const [messageDraft, setMessageDraft] = useState<MessageDraft>({
    content: '',
    files: [],
    isEncrypted: isEncrypted,
    encryptionAlgorithm
  })

  const [isComposing, setIsComposing] = useState(false)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [encryptionStatus, setEncryptionStatus] = useState<'idle' | 'encrypting' | 'encrypted' | 'error'>('idle')
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [messageDraft.content])

  useEffect(() => {
    // Cleanup typing timeout
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [typingTimeout])

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setMessageDraft(prev => ({ ...prev, content }))
    
    // Handle typing indicators
    setIsComposing(true)
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    const timeout = setTimeout(() => {
      setIsComposing(false)
    }, 1000)
    
    setTypingTimeout(timeout)
  }, [typingTimeout])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    for (const file of files) {
      // Validate file size
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum file size of ${Math.round(maxFileSize / 1024 / 1024)}MB`,
          variant: "destructive"
        })
        continue
      }

      // Validate file type
      const isValidType = allowedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1))
        }
        return file.type === type
      })

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an allowed file type`,
          variant: "destructive"
        })
        continue
      }

      // Create file upload object
      const fileUpload: FileUpload = {
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'uploading'
      }

      setMessageDraft(prev => ({
        ...prev,
        files: [...prev.files, fileUpload]
      }))

      // Process file upload
      await processFileUpload(fileUpload)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [maxFileSize, allowedFileTypes, toast])

  const handleFileRemove = useCallback((fileId: string) => {
    setMessageDraft(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }))
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (!messageDraft.content.trim() && messageDraft.files.length === 0) {
      return
    }

    try {
      setIsEncrypting(true)
      setEncryptionStatus('encrypting')

      let encryptedContent = messageDraft.content
      let encryptionResult: EncryptionResult | undefined

      // Encrypt message content if encryption is enabled
      if (messageDraft.isEncrypted) {
        try {
          encryptionResult = await encryptionService.encryptMessage(
            messageDraft.content,
            conversationId,
            userId
          )
          encryptedContent = encryptionResult.encryptedData
          setEncryptionStatus('encrypted')
        } catch (error) {
          console.error('Failed to encrypt message:', error)
          setEncryptionStatus('error')
          toast({
            title: "Encryption failed",
            description: "Message could not be encrypted. Sending as plain text.",
            variant: "destructive"
          })
          // Continue without encryption
          messageDraft.isEncrypted = false
        }
      }

      // Prepare message object
      const message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: userId,
        content: encryptedContent,
        originalContent: messageDraft.content,
        isEncrypted: messageDraft.isEncrypted,
        encryptionAlgorithm: messageDraft.encryptionAlgorithm,
        encryptionResult,
        files: messageDraft.files.filter(f => f.status === 'completed'),
        replyTo: messageDraft.replyTo,
        threadId: messageDraft.threadId,
        timestamp: new Date().toISOString(),
        status: 'sending'
      }

      // Send message
      onMessageSent(message)

      // Reset composer
      setMessageDraft({
        content: '',
        files: [],
        isEncrypted: isEncrypted,
        encryptionAlgorithm
      })

      // Reset encryption status
      setTimeout(() => {
        setEncryptionStatus('idle')
      }, 2000)

      toast({
        title: "Message sent",
        description: messageDraft.isEncrypted ? "Message encrypted and sent securely" : "Message sent",
        variant: "default"
      })

    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: "Failed to send message",
        description: "An error occurred while sending your message",
        variant: "destructive"
      })
    } finally {
      setIsEncrypting(false)
    }
  }, [messageDraft, conversationId, userId, isEncrypted, encryptionAlgorithm, onMessageSent, toast])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // =====================================================
  // FILE PROCESSING
  // =====================================================

  const processFileUpload = async (fileUpload: FileUpload) => {
    try {
      setIsUploading(true)

      // Simulate file upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setMessageDraft(prev => ({
          ...prev,
          files: prev.files.map(f => 
            f.id === fileUpload.id ? { ...f, progress: i } : f
          )
        }))
      }

      // Encrypt file if encryption is enabled
      if (messageDraft.isEncrypted) {
        setMessageDraft(prev => ({
          ...prev,
          files: prev.files.map(f => 
            f.id === fileUpload.id ? { ...f, status: 'encrypting' } : f
          )
        }))

        try {
          const encryptionResult = await encryptionService.encryptFile(
            fileUpload.file,
            conversationId,
            userId
          )

          setMessageDraft(prev => ({
            ...prev,
            files: prev.files.map(f => 
              f.id === fileUpload.id ? { 
                ...f, 
                status: 'completed',
                encryptionResult 
              } : f
            )
          }))

          onFileUploaded({
            ...fileUpload,
            encryptionResult,
            status: 'completed'
          })

        } catch (error) {
          console.error('Failed to encrypt file:', error)
          setMessageDraft(prev => ({
            ...prev,
            files: prev.files.map(f => 
              f.id === fileUpload.id ? { 
                ...f, 
                status: 'error',
                error: 'Encryption failed'
              } : f
            )
          }))
        }
      } else {
        // No encryption
        setMessageDraft(prev => ({
          ...prev,
          files: prev.files.map(f => 
            f.id === fileUpload.id ? { ...f, status: 'completed' } : f
          )
        }))

        onFileUploaded({
          ...fileUpload,
          status: 'completed'
        })
      }

    } catch (error) {
      console.error('Failed to process file upload:', error)
      setMessageDraft(prev => ({
        ...prev,
        files: prev.files.map(f => 
          f.id === fileUpload.id ? { 
            ...f, 
            status: 'error',
            error: 'Upload failed'
          } : f
        )
      }))
    } finally {
      setIsUploading(false)
    }
  }

  // =====================================================
  // VIDEO CALL HANDLERS
  // =====================================================

  const handleVideoCall = useCallback(async (callType: CallType) => {
    try {
      const response = await videoCallService.initiateCall({
        conversationId,
        callType,
        participants,
        isEncrypted: messageDraft.isEncrypted
      })

      if (response.success && response.callId) {
        setIsVideoCallActive(true)
        onVideoCallInitiated?.(response.callId)
        
        toast({
          title: `${callType === 'audio' ? 'Audio' : 'Video'} call initiated`,
          description: `Calling ${participants.length} participant(s)`,
          variant: "default"
        })
      } else {
        throw new Error(response.error || 'Failed to initiate call')
      }
    } catch (error) {
      console.error('Failed to initiate video call:', error)
      toast({
        title: "Call failed",
        description: "Could not initiate the call. Please try again.",
        variant: "destructive"
      })
    }
  }, [conversationId, participants, messageDraft.isEncrypted, onVideoCallInitiated, toast])

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const renderEncryptionStatus = () => {
    switch (encryptionStatus) {
      case 'encrypting':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Encrypting...</span>
          </div>
        )
      case 'encrypted':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Encrypted</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Encryption failed</span>
          </div>
        )
      default:
        return null
    }
  }

  const renderFileUploads = () => {
    if (messageDraft.files.length === 0) return null

    return (
      <div className="space-y-2">
        {messageDraft.files.map((fileUpload) => (
          <div key={fileUpload.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {getFileIcon(fileUpload.file.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileUpload.file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {fileUpload.status === 'uploading' && (
                <Progress value={fileUpload.progress} className="h-1 mt-1" />
              )}
              {fileUpload.status === 'encrypting' && (
                <div className="flex items-center gap-2 text-blue-600 text-xs mt-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  Encrypting...
                </div>
              )}
              {fileUpload.status === 'error' && (
                <p className="text-xs text-red-600 mt-1">{fileUpload.error}</p>
              )}
              {fileUpload.status === 'completed' && fileUpload.encryptionResult && (
                <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                  <Shield className="h-3 w-3" />
                  Encrypted
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFileRemove(fileUpload.id)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    )
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-600" />
    if (mimeType.startsWith('video/')) return <VideoIcon className="h-5 w-5 text-purple-600" />
    if (mimeType === 'application/pdf') return <FileText className="h-5 w-5 text-red-600" />
    return <Archive className="h-5 w-5 text-gray-600" />
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Compose Message</CardTitle>
          <div className="flex items-center gap-2">
            {renderEncryptionStatus()}
            <Badge variant={messageDraft.isEncrypted ? "default" : "secondary"}>
              {messageDraft.isEncrypted ? (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Encrypted
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3 mr-1" />
                  Plain Text
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Message Content */}
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={messageDraft.content}
            onChange={handleContentChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="min-h-[100px] resize-none"
            disabled={isEncrypting || isUploading}
          />
          
          {/* Character count and encryption info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{messageDraft.content.length} characters</span>
            {messageDraft.isEncrypted && (
              <span>Algorithm: {messageDraft.encryptionAlgorithm}</span>
            )}
          </div>
        </div>

        {/* File Uploads */}
        {renderFileUploads()}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* File Upload */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isEncrypting || isUploading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach files</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Video Call */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVideoCall('video')}
                    disabled={isVideoCallActive}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start video call</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Audio Call */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVideoCall('audio')}
                    disabled={isVideoCallActive}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start audio call</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={
              (!messageDraft.content.trim() && messageDraft.files.length === 0) ||
              isEncrypting ||
              isUploading
            }
            className="min-w-[100px]"
          >
            {isEncrypting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Encrypting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedFileTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}
