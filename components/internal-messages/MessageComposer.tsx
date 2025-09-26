"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Paperclip, Send, Users, FileText, Image, File, Archive } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  department?: string
}

interface ReplyTo {
  messageId: string
  subject: string
  recipientId: string
  recipientName: string
  conversationId: string
}

interface CreateMessageRequest {
  sender_id: string
  recipient_id: string
  subject: string
  content: string
  message_type: "general" | "urgent" | "announcement" | "task" | "support"
  priority: "low" | "normal" | "high" | "urgent"
  company_id?: string
  order_id?: string
  parent_message_id?: string
  thread_id?: string
  attachments?: File[]
}

interface MessageComposerProps {
  onSendMessage: (messageData: CreateMessageRequest) => Promise<boolean>
  onCancel: () => void
  users: User[]
  currentUserId: string
  replyTo?: ReplyTo | null
}

export function MessageComposer({ 
  onSendMessage, 
  onCancel, 
  users, 
  currentUserId,
  replyTo 
}: MessageComposerProps) {
  const [recipients, setRecipients] = useState<string[]>(replyTo ? [replyTo.recipientId] : [])
  const [subject, setSubject] = useState(replyTo ? replyTo.subject : '')
  const [messageType, setMessageType] = useState<"general" | "urgent" | "announcement" | "task" | "support">('general')
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">('normal')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddRecipient = (userId: string) => {
    if (!recipients.includes(userId)) {
      setRecipients([...recipients, userId])
    }
    setSearchTerm('')
    setShowUserDropdown(false)
  }

  const handleRemoveRecipient = (userId: string) => {
    setRecipients(recipients.filter(id => id !== userId))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 50MB. Please choose a smaller file.`,
          variant: "destructive"
        })
        return false
      }
      return true
    })
    
    setAttachments([...attachments, ...validFiles])
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (file.type.includes('pdf')) return <FileText className="w-4 h-4" />
    if (file.type.includes('word') || file.type.includes('document')) return <FileText className="w-4 h-4" />
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return <FileText className="w-4 h-4" />
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please select at least one recipient.",
        variant: "destructive"
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: "No subject",
        description: "Please enter a subject for your message.",
        variant: "destructive"
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please enter a message.",
        variant: "destructive"
      })
      return
    }

    setIsSending(true)

    try {
      // For now, we'll send to the first recipient (you can extend this to multiple recipients)
      const messageData: CreateMessageRequest = {
        sender_id: currentUserId, // Add sender_id to the message data
        recipient_id: recipients[0],
        subject: subject.trim(),
        content: content.trim(),
        message_type: messageType,
        priority: priority,
        attachments: attachments,
        ...(replyTo && { thread_id: replyTo.conversationId }) // Include thread_id for replies
      }

      const success = await onSendMessage(messageData)
      
      if (success) {
        // Reset form
        setRecipients([])
        setSubject('')
        setMessageType('general')
        setPriority('normal')
        setContent('')
        setAttachments([])
        onCancel()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {replyTo ? 'Reply' : 'New Message'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {replyTo ? 'Respond to the conversation' : 'Send a message to your team'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="hover:bg-gray-100 rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients" className="text-sm font-medium text-gray-700">
              Recipients
            </Label>
            
            {replyTo ? (
              // Show recipient name for replies
              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {replyTo.recipientName}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Reply
                </Badge>
              </div>
            ) : (
              // Show recipient selection for new messages
              <div className="space-y-2">
                {/* Selected Recipients */}
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipients.map(recipientId => {
                      const user = users.find(u => u.id === recipientId)
                      return (
                        <Badge
                          key={recipientId}
                          variant="secondary"
                          className="flex items-center space-x-1 px-3 py-1"
                        >
                          <span>{user?.full_name || 'Unknown'}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRecipient(recipientId)}
                            className="h-auto p-0 ml-1 hover:bg-transparent"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      )
                    })}
                  </div>
                )}

                {/* Recipient Search */}
                <div className="relative">
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowUserDropdown(true)
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    className="pr-10"
                  />
                  <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  
                  {/* User Dropdown */}
                  {showUserDropdown && searchTerm && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleAddRecipient(user.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.full_name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject..."
              className="w-full"
            />
          </div>

          {/* Message Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="messageType" className="text-sm font-medium text-gray-700">
                Message Type
              </Label>
              <Select value={messageType} onValueChange={(value: "general" | "urgent" | "announcement" | "task" | "support") => setMessageType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                Priority
              </Label>
              <Select value={priority} onValueChange={(value: "low" | "normal" | "high" | "urgent") => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700">
              Message
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              className="w-full resize-none"
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Attachments
            </Label>
            
            {/* File Upload Button */}
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Paperclip className="w-4 h-4" />
                <span>Add Files</span>
              </Button>
              <span className="text-xs text-gray-500">
                Max 50MB per file
              </span>
            </div>

            {/* Attached Files List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-600">
                        {getFileIcon(file)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(index)}
                      className="h-auto p-1 hover:bg-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSending || recipients.length === 0 || !subject.trim() || !content.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}