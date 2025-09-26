"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus, Search, Bell, Users, Archive, AlertCircle, X, User, Clock, ArrowLeft, Send } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { MessageList } from '@/components/internal-messages/MessageList'
import { MessageComposer } from '@/components/internal-messages/MessageComposer'
import { InternalMessage, CreateMessageRequest } from '@/lib/services/InternalMessagingService'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  department?: string
}

interface Conversation {
  id: string
  participants: string[]
  lastMessage: InternalMessage
  unreadCount: number
  messages: InternalMessage[]
}

export default function InternalMessagesPage() {
  const [messages, setMessages] = useState<InternalMessage[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showComposer, setShowComposer] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<{
    messageId: string;
    subject: string;
    recipientId: string;
    recipientName: string;
    conversationId: string;
  } | null>(null)
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadCount: 0,
    activeUsers: 0
  })
  
  // New state for conversation view
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [viewMode, setViewMode] = useState<'conversations' | 'conversation'>('conversations')
  
  // NEW: File attachment state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  // NEW: Message content state
  const [messageContent, setMessageContent] = useState('')
  
  // NEW: Attachment viewer modal state
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [currentAttachments, setCurrentAttachments] = useState<any[]>([])
  
  const { toast } = useToast()

  // Fetch current user and messages on component mount
  useEffect(() => {
    fetchCurrentUser()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (currentUserId) {
      fetchMessages()
    }
  }, [currentUserId, filterType, searchTerm])

  // Group messages into conversations
  useEffect(() => {
    if (messages.length > 0 && currentUserId) {
      groupMessagesIntoConversations()
    }
  }, [messages, currentUserId])

  // Update selected conversation when messages change
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      // Find the updated conversation with the same participants
      const updatedConversation = conversations.find(conv => 
        conv.participants.sort().join('_') === selectedConversation.participants.sort().join('_')
      )
      
      if (updatedConversation) {
        setSelectedConversation(updatedConversation)
      }
    }
  }, [messages, conversations, selectedConversation])

  // Update stats when users are loaded
  useEffect(() => {
    if (users.length > 0) {
      setStats(prevStats => ({
        ...prevStats,
        activeUsers: users.length
      }))
      
      // Debug: Check if any messages have user IDs that don't exist in users array
      if (messages.length > 0) {
        const messageUserIds = new Set([
          ...messages.map(m => m.sender_id),
          ...messages.map(m => m.recipient_id)
        ])
        
        const availableUserIds = new Set(users.map(u => u.id))
        
        const missingUserIds = Array.from(messageUserIds).filter(id => !availableUserIds.has(id))
        
        if (missingUserIds.length > 0) {
          console.warn('⚠️ Messages contain user IDs not found in users array:', missingUserIds)
          console.warn('🔍 Available user IDs:', Array.from(availableUserIds))
          console.warn('🔍 Message user IDs:', Array.from(messageUserIds))
        } else {
          console.log('✅ All message user IDs are found in users array')
        }
      }
    }
  }, [users, messages])

  // Refresh conversations when current user changes
  useEffect(() => {
    if (currentUserId && messages.length > 0) {
      groupMessagesIntoConversations()
    }
  }, [currentUserId, messages])



  // Start auto-refresh when component mounts
  useEffect(() => {
    if (currentUserId) {
      startAutoRefresh()
    }
    
    return () => {
      stopAutoRefresh()
    }
  }, [currentUserId])

  const fetchCurrentUser = async () => {
    try {
      // For testing: Start with the first user from the users array
      // This will be updated when users are loaded
      if (users.length > 0) {
        const firstUserId = users[0].id
        console.log('🔧 Setting initial current user ID:', firstUserId)
        setCurrentUserId(firstUserId)
        return firstUserId
      }
      
      // ORIGINAL CODE (commented out for testing):
      // const response = await fetch('/api/auth/me')
      // if (response.ok) {
      //   const data = await response.json()
      //   if (data.success) {
      //     setCurrentUserId(data.user.id)
      //   }
      // }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
    return null
  }

  const fetchUsers = async () => {
    try {
      // Fetch real team members from the new working API endpoint
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // Include ALL users for proper ID mapping (don't filter out current user)
          const teamMembers = data.data
            .map((user: any) => ({
              id: user.id,
              full_name: `${user.first_name} ${user.last_name}`,
              email: user.email,
              role: user.jewelry_role || 'assistant',
              department: 'Jewelry Team'
            }))
          setUsers(teamMembers)
          console.log('👥 Team members loaded:', teamMembers)
          
          // Set current user ID if not already set
          if (!currentUserId && teamMembers.length > 0) {
            const firstUserId = teamMembers[0].id
            console.log('🔧 Setting current user ID from loaded users:', firstUserId)
            setCurrentUserId(firstUserId)
          }
          
          console.log('🔍 Current user ID:', currentUserId)
          console.log('🔍 Users available for mapping:', teamMembers.map((u: any) => ({ id: u.id, name: u.full_name })))
        }
      } else {
        console.error('Failed to fetch users:', response.status)
        // Fallback to mock users if API fails
        const mockUsers: User[] = [
          {
            id: '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
            full_name: 'Sarah Goldstein',
            email: 'sarah.goldstein@jewelrystudio.com',
            role: 'manager'
          },
          {
            id: '520d729b-011c-43b3-abc0-84cec17fabca',
            full_name: 'Michael Chen',
            email: 'michael.chen@gemlab.com',
            role: 'jewelry_designer'
          },
          {
            id: '17184c60-df11-44aa-9dfd-ba31deeec50e',
            full_name: 'Emma Rodriguez',
            email: 'emma.rodriguez@sparklejewelers.com',
            role: 'gemologist'
          }
        ]
        setUsers(mockUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Fallback to mock users
      const mockUsers: User[] = [
        {
          id: '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
          full_name: 'Sarah Goldstein',
          email: 'sarah.goldstein@jewelrystudio.com',
          role: 'manager'
        }
      ]
      setUsers(mockUsers)
    }
  }

  const fetchMessages = async () => {
    if (!currentUserId) return

    try {
      setLoading(true)
      console.log('🔍 Fetching messages for user:', currentUserId)
      
      const params = new URLSearchParams()
      params.append('userId', currentUserId) // Add current user ID to API call
      // Handle different filter types
      if (filterType === 'sent') {
        params.append('sender_id', currentUserId)
      } else if (filterType === 'unread') {
        params.append('status', 'unread')
      } else if (filterType === 'read') {
        params.append('status', 'read')
      } else if (filterType === 'archived') {
        params.append('status', 'archived')
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/internal-messages?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      if (data.success) {
        console.log('📥 Fetched messages from server:', data.data.messages)
        console.log('📎 First message attachments:', data.data.messages[0]?.attachments)
        console.log('👥 Available users:', users.map(u => ({ id: u.id, name: u.full_name })))
        setMessages(data.data.messages)
        setStats(prevStats => ({
          ...prevStats,
          totalMessages: data.data.total_count,
          unreadCount: data.data.unread_count
        }))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  // Group messages into conversations
  const groupMessagesIntoConversations = () => {
    const conversationMap = new Map<string, Conversation>()
    
    console.log('🔍 Grouping messages into conversations:', {
      totalMessages: messages.length,
      messages: messages.map(m => ({
        id: m.id,
        sender_id: m.sender_id,
        recipient_id: m.recipient_id,
        subject: m.subject,
        thread_id: m.thread_id,
        created_at: m.created_at
      }))
    })
    
    // First pass: group messages by thread_id if available
    messages.forEach(message => {
      if (message.thread_id) {
        if (!conversationMap.has(message.thread_id)) {
          conversationMap.set(message.thread_id, {
            id: message.thread_id,
            participants: [message.sender_id, message.recipient_id],
            lastMessage: message,
            unreadCount: 0,
            messages: []
          })
          console.log('🧵 Created conversation from thread_id:', message.thread_id)
        }
        
        const conversation = conversationMap.get(message.thread_id)!
        const messageExists = conversation.messages.some(existingMessage => existingMessage.id === message.id)
        if (!messageExists) {
          conversation.messages.push(message)
          console.log('📝 Added message to thread conversation:', message.thread_id, message.id)
          
          // Update last message if this is newer
          if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
            conversation.lastMessage = message
          }
          
          // Count unread messages
          if (message.status === 'unread' && message.recipient_id === currentUserId) {
            conversation.unreadCount++
          }
        }
      }
    })
    
    // Second pass: group remaining messages by subject and participants
    messages.forEach(message => {
      if (message.thread_id) {
        // Skip messages already grouped by thread_id
        return
      }
      
      // Try to find an existing conversation with the same subject and participants
      let conversationId: string | null = null
      
      for (const [existingId, conversation] of conversationMap.entries()) {
        // Check if this message has the same subject and participants as an existing conversation
        const hasSameSubject = conversation.messages.some(m => 
          m.subject === message.subject || 
          m.subject.includes(message.subject) || 
          message.subject.includes(m.subject)
        )
        
        const hasSameParticipants = conversation.participants.includes(message.sender_id) && 
                                  conversation.participants.includes(message.recipient_id)
        
        if (hasSameSubject && hasSameParticipants) {
          conversationId = existingId
          console.log('🔗 Found existing conversation for message:', message.id, '->', existingId)
          break
        }
      }
      
      if (!conversationId) {
        // Create new conversation based on participants
        const participants = [message.sender_id, message.recipient_id].sort()
        conversationId = participants.join('_')
        
        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: conversationId,
            participants: [message.sender_id, message.recipient_id],
            lastMessage: message,
            unreadCount: 0,
            messages: []
          })
          console.log('🆕 Created new conversation from participants:', conversationId)
        }
      }
      
      // At this point, conversationId should never be null
      if (!conversationId) {
        console.error('❌ Failed to create conversation ID for message:', message.id)
        return
      }
      
      // TypeScript assertion that conversationId is now a string
      const finalConversationId: string = conversationId
      
      const conversation = conversationMap.get(finalConversationId)!
      const messageExists = conversation.messages.some(existingMessage => existingMessage.id === message.id)
      
      if (!messageExists) {
        conversation.messages.push(message)
        console.log('📝 Added message to conversation:', finalConversationId, message.id)
        
        // Update last message if this is newer
        if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
          conversation.lastMessage = message
        }
        
        // Count unread messages
        if (message.status === 'unread' && message.recipient_id === currentUserId) {
          conversation.unreadCount++
        }
      }
    })
    
    // Convert to array and sort by last message time
    let conversationsArray = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime())
    
    // Filter conversations to only show those the current user is part of
    // (unless they're an admin, but for now we'll keep it simple)
    if (currentUserId) {
      conversationsArray = conversationsArray.filter(conversation => 
        conversation.participants.includes(currentUserId)
      )
    }
    
    console.log('✅ Final conversations (filtered for current user):', conversationsArray.map(c => ({
      id: c.id,
      participants: c.participants,
      messageCount: c.messages.length,
      lastMessage: c.lastMessage.content,
      subject: c.lastMessage.subject,
      includesCurrentUser: currentUserId ? c.participants.includes(currentUserId) : false
    })))
    
    setConversations(conversationsArray)
  }

  // Helper function to get user name by ID
  const getUserNameById = (userId: string): string => {
    const user = users.find(u => u.id === userId)
    return user?.full_name || 'Unknown User'
  }

  // Helper function to get user by ID
  const getUserById = (userId: string) => {
    console.log('🔍 Looking for user with ID:', userId)
    console.log('🔍 Available users:', users.map(u => ({ id: u.id, name: u.full_name })))
    
    const user = users.find(u => u.id === userId)
    if (!user) {
      console.warn('⚠️ User not found for ID:', userId)
      console.warn('Available users:', users.map(u => ({ id: u.id, name: u.full_name })))
    } else {
      console.log('✅ Found user:', user.full_name, 'for ID:', userId)
    }
    return user
  }

  // Helper function to validate UUID format
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  const handleSendMessage = async (messageData: CreateMessageRequest): Promise<boolean> => {
    try {
      console.log('📤 Sending message with data:', messageData)
      
      // Ensure sender_id is set
      const messageWithSender = {
        ...messageData,
        sender_id: messageData.sender_id || currentUserId || ''
      }
      
      const response = await fetch('/api/internal-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageWithSender)
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      if (data.success) {
        console.log('✅ Message sent successfully:', data)
        toast({
          title: "Message Sent",
          description: "Your internal message has been sent successfully.",
        })
        
        // Refresh messages
        await fetchMessages()
        // Clear reply data
        setReplyTo(null)
        return true
      }
      return false
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
      return false
    }
  }

  // Handle reply to message within conversation
  const handleReply = (message: InternalMessage, conversation: Conversation) => {
    console.log('🔄 Handling reply to message:', {
      messageId: message.id,
      conversationId: conversation.id,
      currentUserId,
      messageSender: message.sender_id,
      messageRecipient: message.recipient_id
    })
    
    // For replies, we reply to the person who sent us the message
    let recipientId: string;
    let recipientName: string;
    
    if (message.sender_id === currentUserId) {
      // We sent this message, so reply to the recipient
      recipientId = message.recipient_id;
      recipientName = message.recipient_name || getUserNameById(message.recipient_id);
    } else {
      // We received this message, so reply to the sender
      recipientId = message.sender_id;
      recipientName = message.sender_name || getUserNameById(message.sender_id);
    }
    
    console.log('📤 Setting reply data:', {
      recipientId,
      recipientName,
      conversationId: conversation.id
    })
    
    setReplyTo({
      messageId: message.id,
      subject: `Re: ${message.subject}`,
      recipientId: recipientId,
      recipientName: recipientName,
      conversationId: conversation.id
    });
    
    // Open composer within conversation view
    setShowComposer(true);
  };

  // Open conversation view
  const openConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setViewMode('conversation')
  }

  // Go back to conversations list
  const goBackToConversations = () => {
    setSelectedConversation(null)
    setViewMode('conversations')
    setShowComposer(false)
    setReplyTo(null)
    setMessageContent('')
    setSelectedFiles([])
  }

  // NEW: Handle file selection (both drag & drop and file picker)
  const handleFileSelection = (files: File[]) => {
    // Filter out files that are already selected
    const newFiles = files.filter(file => 
      !selectedFiles.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      )
    )
    
    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles])
      toast({
        title: "Files Added",
        description: `${newFiles.length} file(s) added successfully.`,
      })
    }
  }

  // NEW: Handle drag and drop for conversation view
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files)
    handleFileSelection(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFileSelection(files)
  }

  // NEW: Remove file function
  const removeFile = (fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove))
  }

  // NEW: Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Helper function to get Supabase URL
  const getSupabaseUrl = () => {
    // Try multiple methods to get the Supabase URL
    try {
      // Method 1: Try to get from environment (if available)
      if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return process.env.NEXT_PUBLIC_SUPABASE_URL
      }
      
      // Method 4: Fallback - using your actual Supabase URL
      console.log('✅ Using hardcoded Supabase URL for file storage')
      return 'https://jplmmjcwwhjrltlevkoh.supabase.co'
      
    } catch (error) {
      console.error('Error getting Supabase URL:', error)
      return 'https://jplmmjcwwhjrltlevkoh.supabase.co'
    }
  }

  // NEW: Handle viewing attachments - REAL FILE STORAGE VERSION
  const handleViewAttachments = (attachments: any[], messageId: string) => {
    if (attachments.length === 0) return
    
    console.log('Opening attachment viewer for:', attachments)
    setCurrentAttachments(attachments)
    setShowAttachmentModal(true)
  }

  const handleViewAttachment = async (attachment: any) => {
    console.log('Viewing attachment:', attachment)
    
    try {
      // For real attachments with file_path, use the direct URL
      if (attachment.file_path) {
        const supabaseUrl = getSupabaseUrl()
        const fileUrl = `${supabaseUrl}/storage/v1/object/public/message-attachments/${attachment.file_path}`
        console.log('🔗 Opening file URL:', fileUrl)
        
        // Open in new tab for viewing
        window.open(fileUrl, '_blank')
        return
      }
      
      // Fallback for old attachment format
      if (attachment.type?.startsWith('image/')) {
        // For images, get the actual file from storage
        const response = await fetch(`/api/internal-messages/upload?messageId=${attachment.message_id || 'unknown'}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.length > 0) {
            const fileAttachment = data.data.find((a: any) => a.name === attachment.name)
            if (fileAttachment) {
              // Get the actual file URL from Supabase Storage
              const supabaseUrl = getSupabaseUrl()
              const fileUrl = `${supabaseUrl}/storage/v1/object/public/message-attachments/${fileAttachment.file_path}`
              console.log('🔗 Opening file URL:', fileUrl)
              window.open(fileUrl, '_blank')
              return
            }
          }
        }
      }
      
      // Fallback to placeholder if file not found
      toast({
        title: "File Not Found",
        description: "The file could not be located. It may have been moved or deleted.",
        variant: "destructive"
      })
    } catch (error) {
      console.error('Error viewing attachment:', error)
      toast({
        title: "View Error",
        description: "Failed to view the file. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle downloading attachments - REAL FILE STORAGE VERSION
  const handleDownloadAttachment = async (attachment: any) => {
    try {
      // Get the file name for download
      const fileName = attachment.name || attachment.file_name || 'attachment'
      
      // Check if this is a local test file (for development testing)
      if (attachment.file_path && attachment.file_path.startsWith('/')) {
        // For local test files, create a direct download link
        const fileUrl = `${window.location.origin}${attachment.file_path}`
        
        // Method 1: Fetch the file first, then create blob download (more reliable)
        try {
          const response = await fetch(fileUrl)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const blob = await response.blob()
          
          // Create download link with blob
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          link.style.display = 'none'
          
          // Add to DOM, click, and cleanup
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Cleanup
          window.URL.revokeObjectURL(url)
          return
          
        } catch (fetchError) {
          // Method 2: Direct link approach (fallback)
          const link = document.createElement('a')
          link.href = fileUrl
          link.download = fileName
          link.target = '_blank'
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return
        }
      }
      
      // For real attachments with file_path, use the direct URL
      if (attachment.file_path) {
        const supabaseUrl = getSupabaseUrl()
        const fileUrl = `${supabaseUrl}/storage/v1/object/public/message-attachments/${attachment.file_path}`
        
        // Method 1: Fetch file as blob and create download
        try {
          const response = await fetch(fileUrl)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          window.URL.revokeObjectURL(url)
          return
          
        } catch (error) {
          // Method 2: Direct download link
          const link = document.createElement('a')
          link.href = fileUrl
          link.download = fileName
          link.target = '_blank'
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return
        }
      }
      
      // Fallback: If no file_path, try to use the attachment data directly
      if (attachment.content || attachment.data) {
        const content = attachment.content || attachment.data
        const blob = new Blob([content], { type: attachment.file_type || 'application/octet-stream' })
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        window.URL.revokeObjectURL(url)
        return
      }
      
      throw new Error('No downloadable content found in attachment')
      
    } catch (error) {
      console.error('Download failed:', error)
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Download failed: ${errorMessage}`)
    }
  }



  // NEW: Real-time messaging state
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessageCheck, setLastMessageCheck] = useState<Date>(new Date())
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // NEW: Enhanced message display with real attachments
  const renderMessageWithAttachments = (message: InternalMessage) => {
    // Use attachments directly from the message object instead of fetching separately
    const attachments = message.attachments || []
    
    // Debug logging to see what's in the message
    console.log('🔍 Rendering message:', {
      id: message.id,
      content: message.content,
      attachments: message.attachments,
      attachmentsLength: message.attachments?.length || 0
    })

    return (
      <div
        className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
      >
                            <div
                      className={`max-w-xs sm:max-w-md lg:max-w-lg px-3 py-2 rounded-2xl ${
                        message.sender_id === currentUserId
                          ? 'bg-green-50 text-gray-800 rounded-br-md border border-green-200 shadow-sm'
                          : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200'
                      }`}
                    >
          {/* Message Content */}
          <p className="text-sm sm:text-base break-words">{message.content}</p>
          

          
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((attachment, index) => (
                <div key={attachment.id || index} className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-lg">
                      {attachment.type === 'image/png' || attachment.type === 'image/jpg' || attachment.type === 'image/jpeg' || attachment.type === 'image/gif' ? '🖼️' : 
                       attachment.type === 'application/pdf' ? '📄' : '📎'}
                    </span>
                    <span className="text-xs truncate">{attachment.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleViewAttachment(attachment)}
                      className={`p-1 rounded text-xs ${
                        message.sender_id === currentUserId
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                      title="View file"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDownloadAttachment(attachment)}
                      className={`p-1 rounded text-xs ${
                        message.sender_id === currentUserId
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                      title="Download file"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Legacy Attachments (fallback) */}
          {message.attachments && message.attachments.length > 0 && attachments.length === 0 && (
            <div className="mt-2">
                             <button
                 onClick={() => handleViewAttachments(message.attachments || [], message.id)}
                 className={`text-xs px-2 py-1 rounded-full ${
                   message.sender_id === currentUserId
                     ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                 } transition-colors`}
               >
                 📎 {message.attachments.length} attachment(s)
               </button>
            </div>
          )}
          
          {/* Message Time */}
          <div className={`text-xs mt-1 ${
            message.sender_id === currentUserId ? 'text-green-600' : 'text-gray-500'
          }`}>
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    )
  }

  // NEW: Real-time message checking
  const startAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
    }
    
    const interval = setInterval(async () => {
      if (currentUserId) {
        await checkForNewMessages()
      }
    }, 5000) // Check every 5 seconds
    
    setAutoRefreshInterval(interval)
  }

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      setAutoRefreshInterval(null)
    }
  }

  // NEW: Check for new messages
  const checkForNewMessages = async () => {
    try {
      if (!currentUserId) {
        console.log('No current user ID, skipping message check')
        return
      }
      
      setIsConnected(true)
      const response = await fetch(`/api/internal-messages?userId=${currentUserId}&last_check=${lastMessageCheck.toISOString()}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.messages) {
          const newMessages = data.data.messages.filter((msg: InternalMessage) => 
            new Date(msg.created_at) > lastMessageCheck
          )
          
          if (newMessages.length > 0) {
            // Update messages and show notification
            setMessages(prev => [...prev, ...newMessages])
            setLastMessageCheck(new Date())
            
            // Show notification for new messages
            newMessages.forEach((msg: InternalMessage) => {
              if (msg.sender_id !== currentUserId) {
                toast({
                  title: "New Message",
                  description: `New message from ${msg.sender_name || 'Unknown User'}`,
                })
              }
            })
          }
        }
      }
    } catch (error) {
      console.error('Error checking for new messages:', error)
      setIsConnected(false)
    }
  }

  // NEW: Switch user function for testing
  const switchUser = async (userId: string) => {
    console.log('🔄 Switching user to:', userId)
    setCurrentUserId(userId)
    setMessages([])
    setConversations([])
    setSelectedConversation(null)
    setViewMode('conversations')
    setLastMessageCheck(new Date())
    
    // Fetch messages for the new user
    if (userId) {
      await fetchMessages()
    }
  }

  // NEW: Handle sending message from conversation view
  const handleSendMessageFromConversation = async () => {
    if (!messageContent.trim() && selectedFiles.length === 0) {
      toast({
        title: "No Content",
        description: "Please add a message or attach files before sending.",
        variant: "destructive"
      })
      return
    }

    // Check if we have a valid conversation selected
    if (!selectedConversation || !selectedConversation.participants || selectedConversation.participants.length === 0) {
      // Fallback: Create a new message to yourself for testing
      if (!currentUserId) {
        toast({
          title: "No User ID",
          description: "Please log in to send messages.",
          variant: "destructive"
        })
        return
      }

      // For testing purposes, send message to yourself
      const messageData = {
        sender_id: currentUserId,
        recipient_id: currentUserId,
        subject: 'New Message',
        content: messageContent.trim() || 'Message with attachments',
        message_type: 'general' as const,
        priority: 'normal' as const,
        attachments: []
      }

      console.log('🚀 Sending new message (no conversation):', messageData)
      
      try {
        const response = await fetch('/api/internal-messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        })

        if (response.ok) {
          toast({
            title: "Message Sent",
            description: "Your message has been sent successfully!",
          })
          
          // Clear the form
          setMessageContent('')
          setSelectedFiles([])
          
          // Refresh messages
          await fetchMessages()
        } else {
          const errorText = await response.text()
          console.error('❌ Failed to send message:', response.status, errorText)
          toast({
            title: "Error",
            description: "Failed to send message. Please try again.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('❌ Error sending message:', error)
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        })
      }
      return
    }

    // Find the recipient (the other person in the conversation)
    const recipientId = selectedConversation.participants.find(id => id !== currentUserId)
    if (!recipientId) {
      toast({
        title: "Invalid Conversation",
        description: "Could not determine message recipient.",
        variant: "destructive"
      })
      return
    }

    try {
      // First, send the message without attachments
      const messageData: any = {
        sender_id: currentUserId,
        recipient_id: recipientId,
        subject: selectedConversation.lastMessage?.subject || 'New Message',
        content: messageContent.trim() || 'Message with attachments',
        message_type: 'general' as const,
        priority: 'normal' as const,
        attachments: [] // Start with empty attachments
      }

      // Only include thread_id if it's a valid UUID
      if (isValidUUID(selectedConversation.id)) {
        messageData.thread_id = selectedConversation.id
      } else {
        console.log('⚠️ Skipping invalid thread_id:', selectedConversation.id)
      }

      console.log('🚀 Sending message with data:', messageData)

      // Send the message first and get the response
      const response = await fetch('/api/internal-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Message sent successfully:', result)
        
        const messageId = result.data?.messageId || result.data?.message?.id
        
        if (messageId) {
          console.log('✅ Message ID received:', messageId)
          
          // If there are files to upload, upload them now using the real message ID
          if (selectedFiles.length > 0) {
            console.log(`📁 Uploading ${selectedFiles.length} file(s) for message:`, messageId)
            
            for (const file of selectedFiles) {
              try {
                console.log(`📤 Uploading file: ${file.name}`)
                
                const formData = new FormData()
                formData.append('file', file)
                formData.append('messageId', messageId)
                
                console.log('📋 FormData prepared:', {
                  fileName: file.name,
                  messageId: messageId
                })
                
                const uploadResponse = await fetch('/api/internal-messages/upload', {
                  method: 'POST',
                  body: formData
                })
                
                console.log('📡 Upload response status:', uploadResponse.status)
                
                if (uploadResponse.ok) {
                  const uploadResult = await uploadResponse.json()
                  console.log(`✅ File ${file.name} uploaded successfully:`, uploadResult)
                } else {
                  const errorText = await uploadResponse.text()
                  console.error(`❌ Failed to upload ${file.name}:`, uploadResponse.status, errorText)
                }
              } catch (error) {
                console.error(`❌ Error uploading ${file.name}:`, error)
              }
            }
          }

          // Create a new message object to add to the conversation immediately
          const newMessage: InternalMessage = {
            id: messageId, // Use the real message ID
            sender_id: currentUserId!,
            recipient_id: messageData.recipient_id,
            subject: messageData.subject,
            content: messageData.content,
            message_type: messageData.message_type,
            priority: messageData.priority,
            status: 'read',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sender_name: 'You',
            recipient_name: users.find(u => u.id === messageData.recipient_id)?.full_name || 'Unknown',
            is_admin_message: false,
            attachments: [] // Attachments will be added via upload API
          }

          // Clear the form first
          setMessageContent('')
          setSelectedFiles([])
          
          toast({
            title: "Message Sent",
            description: "Your message has been sent successfully!",
          })
          
          // Wait for all file uploads to complete, then refresh messages
          if (selectedFiles.length > 0) {
            console.log('⏳ Waiting for file uploads to complete...')
            // Small delay to ensure uploads are processed
            setTimeout(async () => {
              await fetchMessages()
            }, 1000)
          } else {
            // No files, refresh immediately
            await fetchMessages()
          }
          
          // Also update the selected conversation to show the new message immediately
          if (selectedConversation) {
            const updatedConversation = {
              ...selectedConversation,
              messages: [...selectedConversation.messages, newMessage],
              lastMessage: newMessage
            }
            setSelectedConversation(updatedConversation)
          }
        } else {
          console.error('❌ No message ID received from server')
          toast({
            title: "Error",
            description: "Message sent but no ID received. Files may not upload correctly.",
            variant: "destructive"
          })
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to send message:', response.status, errorText)
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading && !currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading internal messages...</p>
        </div>
      </div>
    )
  }

  // Conversation List View
  if (viewMode === 'conversations') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Internal Messages</h1>
                <p className="text-gray-600 text-base sm:text-lg">Team Communication Hub</p>
              </div>
              <div className="ml-auto flex items-center space-x-2">
                {/* Real-time Status */}
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className={isConnected ? 'text-green-600' : 'text-gray-500'}>
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                    <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Unread Messages</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.unreadCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <Card className="bg-white shadow-sm border border-gray-100 mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-2 sm:py-3 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg text-sm sm:text-base"
                  />
                </div>
                
                {/* User Switcher for Testing */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Test as:</span>
                  <select
                    value={currentUserId || ''}
                    onChange={(e) => switchUser(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button 
                  onClick={() => setShowComposer(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  New Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="bg-white shadow-sm border border-gray-100 mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Badge 
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    filterType === 'all' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setFilterType('all')}
                >
                  All Conversations
                </Badge>
                <Badge 
                  variant={filterType === 'unread' ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    filterType === 'unread' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setFilterType('unread')}
                >
                  Unread
                </Badge>
                <Badge 
                  variant={filterType === 'read' ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    filterType === 'read' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setFilterType('read')}
                >
                  Read
                </Badge>
                <Badge 
                  variant={filterType === 'archived' ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    filterType === 'archived' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setFilterType('archived')}
                >
                  Archived
                </Badge>
                <Badge 
                  variant={filterType === 'sent' ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    filterType === 'sent' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setFilterType('sent')}
                >
                  Sent
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Conversations List */}
          {error ? (
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="p-2 sm:p-3 bg-red-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <p className="text-red-600 text-base sm:text-lg mb-4">{error}</p>
                <Button 
                  onClick={fetchMessages} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              {/* WhatsApp-style conversation list */}
              <div className="divide-y divide-gray-100">
                {conversations.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center">
                    <div className="p-2 sm:p-3 bg-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-base sm:text-lg mb-2">No conversations yet</p>
                    <p className="text-gray-500 text-sm sm:text-base">Start a conversation with your team</p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const otherParticipant = conversation.participants.find(id => id !== currentUserId)
                    const otherUser = otherParticipant ? getUserById(otherParticipant) : null
                    const lastMessage = conversation.lastMessage
                    
                    // Debug logging to see what's happening
                    console.log('🔍 Rendering conversation:', {
                      conversationId: conversation.id,
                      participants: conversation.participants,
                      currentUserId,
                      otherParticipant,
                      otherUser: otherUser?.full_name || 'Not found',
                      usersCount: users.length,
                      users: users.map(u => ({ id: u.id, name: u.full_name })),
                      lastMessage: {
                        id: lastMessage.id,
                        content: lastMessage.content,
                        sender_id: lastMessage.sender_id,
                        recipient_id: lastMessage.recipient_id,
                        subject: lastMessage.subject
                      }
                    })
                    
                    // Additional debugging for user mapping
                    if (otherParticipant) {
                      console.log('🔍 Other participant details:', {
                        id: otherParticipant,
                        foundUser: otherUser,
                        allUsers: users.map(u => ({ id: u.id, name: u.full_name }))
                      })
                    }
                    
                    // If we can't find the other user, try to get more info
                    if (!otherUser && otherParticipant) {
                      console.warn('⚠️ Could not find user for ID:', otherParticipant)
                      console.warn('Available users:', users)
                      console.warn('🔍 Message details:', {
                        messageId: lastMessage.id,
                        sender_id: lastMessage.sender_id,
                        recipient_id: lastMessage.recipient_id,
                        subject: lastMessage.subject
                      })
                    }
                    
                    return (
                      <div
                        key={conversation.id}
                        className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => openConversation(conversation)}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm bg-blue-500">
                            {otherUser?.full_name ? otherUser.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          
                          {/* Conversation Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900 text-sm">
                                  {otherUser?.full_name || 'Unknown User'}
                                </span>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="default" className="text-xs px-2 py-0.5">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(lastMessage.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mb-2">
                              <h4 className="font-medium text-gray-900 text-sm mb-1">
                                {lastMessage.subject}
                              </h4>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {lastMessage.sender_id === currentUserId ? 'You: ' : ''}{lastMessage.content}
                              </p>
                            </div>
                            
                            {/* Message metadata */}
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                                {lastMessage.message_type}
                              </Badge>
                              <Badge 
                                variant={lastMessage.priority === 'urgent' ? 'destructive' : 'outline'} 
                                className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1"
                              >
                                {lastMessage.priority}
                              </Badge>
                              {lastMessage.attachments && lastMessage.attachments.length > 0 && (
                                <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                                  📎 {lastMessage.attachments.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Message Composer Modal */}
          {showComposer && (
            <MessageComposer
              onSendMessage={handleSendMessage}
              onCancel={() => {
                setShowComposer(false)
                setReplyTo(null)
              }}
              users={users}
              currentUserId={currentUserId || ''}
              replyTo={replyTo}
            />
          )}
        </div>
      </div>
    )
  }

  // Conversation Detail View
  if (viewMode === 'conversation' && selectedConversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Conversation Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
              <button
                onClick={goBackToConversations}
                className="p-2 sm:p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
              <div className="p-2 sm:p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {users.find(u => u.id === selectedConversation.participants.find(id => id !== currentUserId))?.full_name || 'Unknown'}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">Conversation</p>
              </div>
            </div>
            
            {/* Subject */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
              <p className="text-sm sm:text-base text-gray-700">
                <span className="font-medium">Subject:</span> {selectedConversation.lastMessage.subject}
              </p>
            </div>
          </div>

          {/* WhatsApp-style Message Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Messages Header */}
            <div className="bg-green-500 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {users.find(u => u.id === selectedConversation.participants.find(id => id !== currentUserId))?.full_name || 'Unknown'}
                  </h3>
                  <p className="text-green-100 text-sm">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-green-600 rounded-full transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-green-600 rounded-full transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Messages Area */}
            <div className="h-96 sm:h-[500px] overflow-y-auto bg-gray-50 p-4 space-y-3">
              {/* Messages - Oldest at top, newest at bottom */}
              {selectedConversation.messages
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    {renderMessageWithAttachments(message)}
                  </div>
                ))}
            </div>

            {/* Quick Reply Section */}
            <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
              {/* File Attachments */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Attached Files:</p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {file.type.startsWith('image/') ? '🖼️' : '📄'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file)}
                          className="p-1 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload Area */}
              <div className="mb-3">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('file-input-conversation')?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-2xl">📎</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {selectedFiles.length > 0 ? 'Add more files' : 'Drag & drop files here'}
                      </p>
                      <p className="text-xs text-gray-500">or click to browse</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Supports: PDF, DOC, TXT, Images, ZIP
                    </p>
                  </div>
                </div>
                <input
                  id="file-input-conversation"
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip"
                />
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessageFromConversation()}
                  />
                </div>
                <Button
                  onClick={handleSendMessageFromConversation}
                  disabled={!messageContent.trim() && selectedFiles.length === 0}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 min-w-[44px] min-h-[44px]"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Attachment Modal */}
        {showAttachmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Attachments ({currentAttachments.length})</h3>
                  <button
                    onClick={() => setShowAttachmentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {currentAttachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">
                          {attachment.type?.startsWith('image/') ? '🖼️' : '📄'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-sm text-gray-500">
                          {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewAttachment(attachment)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadAttachment(attachment)}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  )
}