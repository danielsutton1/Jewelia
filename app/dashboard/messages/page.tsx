"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Search, 
  Filter, 
  MoreVertical,
  User,
  Building2,
  Clock,
  Check,
  AlertCircle,
  Star,
  Reply,
  Forward,
  Archive,
  Trash2,
  Users,
  Briefcase,
  Eye,
  Download,
  FileText,
  X,
  Brain,
  Sparkles,
  Lightbulb,
  TrendingUp,
  CheckCircle
} from "lucide-react"
import { ExternalMessage, CreateExternalMessageRequest } from "@/lib/services/ExternalMessagingService"
import { InternalMessage, CreateMessageRequest } from "@/lib/services/InternalMessagingService"
import AIEnhancedMessageInput from "@/components/messaging/AIEnhancedMessageInput"

interface Partner {
  id: string
  name: string
  type: string
  avatar_url?: string
  specialties?: string[]
  status: 'active' | 'inactive'
  contact_name?: string
  contact_email?: string
}

interface TeamMember {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  role?: string
  department?: string
  status: 'active' | 'inactive'
}

interface Conversation {
  id: string
  partner?: Partner
  teamMember?: TeamMember
  groupMembers?: (Partner | TeamMember)[]
  lastMessage: ExternalMessage | InternalMessage | null
  unreadCount: number
  messages: (ExternalMessage | InternalMessage)[]
  type: 'external' | 'internal'
  // Enhanced conversation properties
  conversationId?: string
  subject?: string
  category?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  status?: 'active' | 'in_progress' | 'resolved' | 'closed' | 'archived'
  businessType?: 'inquiry' | 'quote' | 'order' | 'support' | 'general'
  tags?: string[]
  lastMessageAt?: string
  participants?: string[]
  created_at?: string
  updated_at?: string
}

export default function ExternalMessagesPage() {
  const searchParams = useSearchParams()
  const [currentUserId, setCurrentUserId] = useState<string>('6d1a08f1-134c-46dd-aa1e-21f95b80bed4') // Sarah Goldstein
  const [partners, setPartners] = useState<Partner[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageContent, setMessageContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPartner, setSelectedPartner] = useState<string>("all")
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("all")
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])
  const [showGroupOptions, setShowGroupOptions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [lastMessageCheck, setLastMessageCheck] = useState<Date>(new Date())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'external' | 'internal'>('external')
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(true)
  const [aiAnalysisResults, setAiAnalysisResults] = useState<any>(null)
  const [showAiResults, setShowAiResults] = useState(false)
  const [smartReplySuggestions, setSmartReplySuggestions] = useState<string[]>([])
  const [showSmartReply, setShowSmartReply] = useState(false)
  const [currentAttachments, setCurrentAttachments] = useState<any[]>([])
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)

  // Load partners and create sample data if none exist
  useEffect(() => {
    if (!currentUserId) return
    
    const loadData = async () => {
      setLoading(true)
      
      // Only show loading screen after 500ms to avoid flash for quick loads
      const showLoadingTimeout = setTimeout(() => {
        setShowLoadingScreen(true)
      }, 500)
      
      // Add a timeout fallback to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        console.log('⚠️ Loading timeout reached, setting loading to false')
        setLoading(false)
        setShowLoadingScreen(false)
      }, 5000) // 5 second timeout - reasonable for API calls
      
      try {
        console.log('🚀 Starting data loading process...')
        
        // Load team members from internal messages backend
        console.log('🔄 Fetching team data from /api/users')
        const teamResponse = await fetch('/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!teamResponse.ok) {
          throw new Error(`Users API failed: ${teamResponse.status} ${teamResponse.statusText}`)
        }
        
        const teamData = await teamResponse.json()
        console.log('✅ Team data loaded:', teamData.users?.length || 0, 'users')
        
        let members: TeamMember[] = []
        if (teamData.success && teamData.data) {
          members = teamData.data.map((user: any) => ({
            id: user.id,
            full_name: user.full_name || user.email,
            email: user.email,
            avatar_url: user.avatar_url,
            role: user.role || 'Team Member',
            department: user.role || 'General',
            status: 'active' as const
          }))
          setTeamMembers(members)
          console.log('✅ Loaded team members:', members.length, members.map(m => m.full_name))
        }
        
        // Load partners
        try {
          console.log('🔄 Fetching partner data from /api/check-data')
          const partnerResponse = await fetch('/api/check-data', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!partnerResponse.ok) {
            throw new Error(`Partner API failed: ${partnerResponse.status} ${partnerResponse.statusText}`)
          }
          
          const partnerData = await partnerResponse.json()
          console.log('✅ Partner data loaded:', partnerData.partners?.length || 0, 'partners')
          
          if (partnerData.partners && partnerData.partners.length > 0) {
            // Remove duplicates before setting partners
            const uniquePartners = partnerData.partners.filter((partner: Partner, index: number, self: Partner[]) => 
              index === self.findIndex(p => p.id === partner.id)
            )
            console.log('🔄 Setting partners from API:', uniquePartners.length, 'unique partners')
            setPartners(uniquePartners)
            console.log('🔄 Loading conversations for', uniquePartners.length, 'partners')
            await loadConversations(uniquePartners, members)
            console.log('✅ Conversations loaded successfully')
          } else {
            console.log('⚠️ No partners found, creating sample partners')
            await createSamplePartners()
          }
        } catch (partnerError) {
          console.error('❌ Failed to load partners:', partnerError)
          console.log('🔄 Falling back to creating sample partners')
          await createSamplePartners()
        }
      } catch (error) {
        console.error('Error loading data:', error)
        await createSamplePartners()
      } finally {
        clearTimeout(loadingTimeout)
        clearTimeout(showLoadingTimeout)
        setLoading(false)
        setShowLoadingScreen(false)
        console.log('✅ Data loading completed, loading set to false')
      }
    }
    
    loadData()
  }, [currentUserId])

  // Create sample partners for testing
  const createSamplePartners = async () => {
    console.log('🔄 Creating sample partners as fallback')
    const samplePartners: Partner[] = [
      {
        id: 'partner-1',
        name: 'Gemstone Suppliers Inc.',
        type: 'company',
        status: 'active',
        specialties: ['diamonds', 'rubies', 'emeralds']
      },
      {
        id: 'partner-2',
        name: 'Precious Metals Co.',
        type: 'company',
        status: 'active',
        specialties: ['gold', 'silver', 'platinum']
      },
      {
        id: 'partner-3',
        name: 'Jewelry Crafting Studio',
        type: 'company',
        status: 'active',
        specialties: ['casting', 'setting', 'polishing']
      }
    ]
    
    setPartners(samplePartners)
    console.log('✅ Sample partners set:', samplePartners.length, 'partners')
    
    // Create sample partner relationships
    await createSampleRelationships(samplePartners)
    
    // Load conversations with empty team members for now
    console.log('🔄 Loading conversations for sample partners')
    await loadConversations(samplePartners, [])
    console.log('✅ Sample partner setup completed')
  }

  // Create sample partner relationships
  const createSampleRelationships = async (partners: Partner[]) => {
    if (!currentUserId) {
      console.log('⚠️ No current user ID, skipping relationship creation')
      return
    }
    
    console.log('🔄 Creating sample relationships for', partners.length, 'partners')
    
    try {
      for (const partner of partners) {
        try {
          // Create relationship between current user and partner
          const response = await fetch('/api/partners/relationships', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              partner_id: partner.id,
              partner_a: currentUserId,
              partner_b: partner.id,
              status: 'active',
              relationship_type: 'business'
            })
          })
          
          if (!response.ok) {
            console.log(`⚠️ Failed to create relationship with ${partner.name}: ${response.status} ${response.statusText}`)
            // Continue with other partners even if one fails
            continue
          }
          
          console.log(`✅ Created relationship with ${partner.name}`)
        } catch (partnerError) {
          console.error(`❌ Error creating relationship with ${partner.name}:`, partnerError)
          // Continue with other partners
        }
      }
    } catch (error) {
      console.error('❌ Error creating sample relationships:', error)
    }
  }

  // Load conversations for partners and team members - USING REAL BACKEND DATA
  const loadConversations = async (partnersList: Partner[], members: TeamMember[]) => {
    console.log('🚀 Starting loadConversations with REAL backend data:', partnersList.length, 'partners and', members.length, 'members')
    const startTime = Date.now()
    
    try {
      const allConversations: Conversation[] = []
      
      // Load real external conversations from backend
      for (const partner of partnersList) {
        try {
          const response = await fetch(`/api/external-messages?partnerId=${partner.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data.messages && data.data.messages.length > 0) {
              const messages = data.data.messages
              const sortedMessages = messages.sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )
              const lastMessage = sortedMessages[0]
              const unreadCount = messages.filter((msg: any) => !msg.is_read).length
              
              allConversations.push({
                id: partner.id,
                partner: {
                  id: partner.id,
                  name: partner.name,
                  type: partner.type,
                  avatar_url: partner.avatar_url,
                  specialties: partner.specialties || [],
                  status: partner.status
                },
                lastMessage: {
                  id: lastMessage.id,
                  content: lastMessage.content,
                  sender_id: lastMessage.sender_id,
                  recipient_id: currentUserId,
                  subject: 'Chat Message',
                  message_type: 'general',
                  is_admin_message: false,
                  attachments: [],
                  priority: lastMessage.metadata?.priority || 'normal' as const,
                  status: lastMessage.is_read ? 'read' as const : 'unread' as const,
                  created_at: lastMessage.created_at,
                  updated_at: lastMessage.updated_at
                },
                unreadCount: unreadCount,
                messages: messages,
                type: 'external' as const
              })
            }
          }
        } catch (error) {
          console.error(`Error loading messages for partner ${partner.name}:`, error)
        }
      }
      
      // Load real internal conversations from backend
      for (const member of members) {
        try {
          const response = await fetch(`/api/internal-messages?userId=${member.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data.messages && data.data.messages.length > 0) {
              const messages = data.data.messages
              const sortedMessages = messages.sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )
              const lastMessage = sortedMessages[0]
              const unreadCount = messages.filter((msg: any) => msg.status === 'unread').length
              
              allConversations.push({
                id: member.id,
                teamMember: member,
                lastMessage: {
                  id: lastMessage.id,
                  sender_id: lastMessage.sender_id,
                  recipient_id: lastMessage.recipient_id,
                  subject: lastMessage.subject || 'Internal Message',
                  content: lastMessage.content,
                  message_type: lastMessage.message_type || 'general',
                  priority: lastMessage.priority || 'normal',
                  status: lastMessage.status || 'unread',
                  is_admin_message: lastMessage.is_admin_message || false,
                  company_id: lastMessage.company_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                  attachments: lastMessage.attachments || [],
                  created_at: lastMessage.created_at,
                  updated_at: lastMessage.updated_at,
                  sender_name: lastMessage.sender_name || 'Unknown',
                  recipient_name: lastMessage.recipient_name || 'Unknown'
                },
                unreadCount: unreadCount,
                messages: messages,
                type: 'internal' as const
              })
            }
          }
        } catch (error) {
          console.error(`Error loading messages for team member ${member.full_name}:`, error)
        }
      }
      
      // Show all conversations
      setConversations(allConversations)
      console.log(`⚡ Real conversations loaded: ${allConversations.filter(c => c.type === 'external').length} partners, ${allConversations.filter(c => c.type === 'internal').length} team members in ${Date.now() - startTime}ms`)
      
    } catch (error) {
      console.error('Error loading conversations:', error)
      setIsLoading(false)
    }
  }

  // Helper function to load real conversation data
  const loadRealConversationData = async (partnersList: Partner[], members: TeamMember[], searchParams: URLSearchParams) => {
    try {
      const conversationsData: Conversation[] = []
      
      // Load external conversations (partners) - ENHANCED VERSION
      for (const partner of partnersList) {
        try {
          // First try to get enhanced conversation data
          const enhancedResponse = await fetch(`/api/enhanced-external-messages?userId=${currentUserId}`)
          const enhancedData = await enhancedResponse.json()
          
          if (enhancedData.success && enhancedData.data.conversations) {
            // Find conversation for this partner
            const enhancedConversation = enhancedData.data.conversations.find((conv: any) => 
              conv.partner_id === partner.id || conv.partner?.id === partner.id
            )
            
            if (enhancedConversation) {
              // Use enhanced conversation data with attachments
              const response = await fetch(`/api/enhanced-external-messages?conversationId=${enhancedConversation.id}&userId=${currentUserId}`)
              const data = await response.json()
              
              if (data.success && data.data.messages && data.data.messages.length > 0) {
                const messages = data.data.messages
                const sortedMessages = messages.sort((a: any, b: any) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                const lastMessage = sortedMessages[0]
                const unreadCount = messages.filter((msg: any) => !msg.is_read).length
                
                conversationsData.push({
                  id: partner.id,
                  conversationId: enhancedConversation.id,
                  partner: {
                    id: partner.id,
                    name: partner.name,
                    type: partner.type,
                    avatar_url: partner.avatar_url,
                    specialties: partner.specialties || [],
                    status: partner.status
                  },
                  lastMessage: {
                    id: lastMessage.id,
                    type: 'external',
                    content: lastMessage.content,
                    content_type: 'text',
                    sender_id: lastMessage.sender_id,
                    partner_id: partner.id,
                    priority: lastMessage.priority || 'normal',
                    category: lastMessage.category || 'general',
                    status: lastMessage.status || 'sent',
                    created_at: lastMessage.created_at,
                    updated_at: lastMessage.updated_at || lastMessage.created_at,
                    is_read: lastMessage.is_read,
                    tags: lastMessage.tags || [],
                    metadata: lastMessage.metadata || {}
                  },
                  unreadCount,
                  messages: messages.sort((a: any, b: any) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  ),
                  type: 'external',
                  // Enhanced properties
                  subject: enhancedConversation.subject || 'Business Discussion',
                  category: enhancedConversation.category || 'general',
                  priority: enhancedConversation.priority || 'normal',
                  status: enhancedConversation.status || 'active',
                  businessType: enhancedConversation.business_type || 'general',
                  tags: enhancedConversation.tags || [],
                  lastMessageAt: enhancedConversation.last_message_at,
                  participants: enhancedConversation.participants || []
                })
              } else {
                // Create enhanced conversation structure even without messages
                conversationsData.push({
                  id: partner.id,
                  conversationId: enhancedConversation.id,
                  partner: {
                    id: partner.id,
                    name: partner.name,
                    type: partner.type,
                    avatar_url: partner.avatar_url,
                    specialties: partner.specialties || [],
                    status: partner.status
                  },
                  lastMessage: {
                    id: 'empty',
                    type: 'external',
                    content: 'No messages yet',
                    content_type: 'text',
                    sender_id: currentUserId,
              partner_id: partner.id,
              priority: 'normal',
              category: 'general',
              status: 'sent',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_read: true,
                    tags: [],
                    metadata: {}
                  },
                  unreadCount: 0,
                  messages: [],
                  type: 'external',
                  // Enhanced properties
                  subject: enhancedConversation.subject || 'Business Discussion',
                  category: enhancedConversation.category || 'general',
                  priority: enhancedConversation.priority || 'normal',
                  status: enhancedConversation.status || 'active',
                  businessType: enhancedConversation.business_type || 'general',
                  tags: enhancedConversation.tags || [],
                  lastMessageAt: enhancedConversation.last_message_at,
                  participants: enhancedConversation.participants || []
                })
              }
            } else {
              // Fallback to original method if no enhanced conversation found
              const response = await fetch(`/api/external-messages?partnerId=${partner.id}`)
              const data = await response.json()
              
              if (data.success && data.data.messages.length > 0) {
                const messages = data.data.messages
                const sortedMessages = messages.sort((a: any, b: any) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                const lastMessage = sortedMessages[0]
                const unreadCount = messages.filter((msg: any) => !msg.is_read).length
                
                conversationsData.push({
                  id: partner.id,
                  partner: {
                    id: partner.id,
                    name: partner.name,
                    type: partner.type,
                    avatar_url: partner.avatar_url,
                    specialties: partner.specialties || [],
                    status: partner.status
                  },
                  lastMessage: {
                    id: lastMessage.id,
                    type: 'external',
                    content: lastMessage.content,
                    content_type: 'text',
                    sender_id: lastMessage.sender_id,
                    partner_id: partner.id,
                    priority: lastMessage.priority || 'normal',
                    category: lastMessage.category || 'general',
                    status: lastMessage.status || 'sent',
              created_at: lastMessage.created_at,
              updated_at: lastMessage.updated_at || lastMessage.created_at,
              is_read: lastMessage.is_read,
                    tags: lastMessage.tags || [],
                    metadata: lastMessage.metadata || {}
                  },
                  unreadCount,
                  messages: messages.sort((a: any, b: any) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  ),
                  type: 'external'
                })
              } else {
                conversationsData.push({
                  id: partner.id,
                  partner: {
                    id: partner.id,
                    name: partner.name,
                    type: partner.type,
                    avatar_url: partner.avatar_url,
                    specialties: partner.specialties || [],
                    status: partner.status
                  },
                  lastMessage: {
                    id: 'empty',
                    type: 'external',
                    content: 'No messages yet',
                    content_type: 'text',
                    sender_id: currentUserId,
                    partner_id: partner.id,
                    priority: 'normal',
                    category: 'general',
                    status: 'sent',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_read: true,
              tags: [],
                    metadata: {}
                  },
                  unreadCount: 0,
                  messages: [],
                  type: 'external'
                })
              }
            }
          } else {
            // Fallback to original method if enhanced API fails
            const response = await fetch(`/api/external-messages?partnerId=${partner.id}`)
            const data = await response.json()
            
            if (data.success && data.data.messages.length > 0) {
              const messages = data.data.messages
              const sortedMessages = messages.sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )
              const lastMessage = sortedMessages[0]
              const unreadCount = messages.filter((msg: any) => !msg.is_read).length
              
              conversationsData.push({
                id: partner.id,
                partner: {
                  id: partner.id,
                  name: partner.name,
                  type: partner.type,
                  avatar_url: partner.avatar_url,
                  specialties: partner.specialties || [],
                  status: partner.status
                },
                lastMessage: {
                  id: lastMessage.id,
                  type: 'external',
                  content: lastMessage.content,
                  content_type: 'text',
                  sender_id: lastMessage.sender_id,
                  partner_id: partner.id,
                  priority: lastMessage.priority || 'normal',
                  category: lastMessage.category || 'general',
                  status: lastMessage.status || 'sent',
                  created_at: lastMessage.created_at,
                  updated_at: lastMessage.updated_at || lastMessage.created_at,
                  is_read: lastMessage.is_read,
                  tags: lastMessage.tags || [],
              metadata: lastMessage.metadata || {}
            },
            unreadCount,
            messages: messages.sort((a: any, b: any) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            ),
            type: 'external'
          })
        } else {
              conversationsData.push({
                id: partner.id,
                partner: {
                  id: partner.id,
                  name: partner.name,
                  type: partner.type,
                  avatar_url: partner.avatar_url,
                  specialties: partner.specialties || [],
                  status: partner.status
                },
                lastMessage: {
                  id: 'empty',
                  type: 'external',
                  content: 'No messages yet',
                  content_type: 'text',
                  sender_id: currentUserId,
                  partner_id: partner.id,
                  priority: 'normal',
                  category: 'general',
                  status: 'sent',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  is_read: true,
                  tags: [],
                  metadata: {}
                },
                unreadCount: 0,
                messages: [],
                type: 'external'
              })
            }
          }
        } catch (error) {
          console.error(`Error loading conversation for partner ${partner.id}:`, error)
          // Add fallback conversation
          conversationsData.push({
            id: partner.id,
            partner: {
              id: partner.id,
              name: partner.name,
              type: partner.type,
              avatar_url: partner.avatar_url,
              specialties: partner.specialties || [],
              status: partner.status
            },
            lastMessage: {
              id: 'empty',
              type: 'external',
              content: 'No messages yet',
              content_type: 'text',
              sender_id: currentUserId,
              partner_id: partner.id,
              priority: 'normal',
              category: 'general',
              status: 'sent',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_read: true,
              tags: [],
              metadata: {}
            },
            unreadCount: 0,
            messages: [],
            type: 'external'
          })
        }
      }
      
      // Load internal conversations (team members)
      for (const member of members) {
        if (member.id === currentUserId) continue // Skip self
        
        try {
          // Load internal messages for this team member from the backend
          const response = await fetch(`/api/internal-messages?userId=${currentUserId}`)
          const data = await response.json()
          
          if (data.success && data.data && data.data.messages && data.data.messages.length > 0) {
            // Filter messages between current user and this team member
            const messages = data.data.messages.filter((msg: any) => 
              (msg.sender_id === currentUserId && msg.recipient_id === member.id) ||
              (msg.sender_id === member.id && msg.recipient_id === currentUserId)
            )
            
            if (messages.length > 0) {
              // Sort messages by created_at to get the most recent first for lastMessage
              const sortedMessages = messages.sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )
              
              const lastMessage = sortedMessages[0]
              const unreadCount = messages.filter((msg: any) => 
                msg.status === 'unread' && msg.recipient_id === currentUserId
              ).length
              
              conversationsData.push({
                id: member.id,
                teamMember: {
                  id: member.id,
                  full_name: member.full_name,
                  email: member.email,
                  role: member.role,
                  department: member.department,
                  avatar_url: member.avatar_url,
                  status: member.status
                },
                lastMessage: {
                  id: lastMessage.id,
                  type: 'external',
                  content: lastMessage.content,
                  content_type: 'text',
                  sender_id: lastMessage.sender_id,
                  recipient_id: lastMessage.recipient_id,
                  partner_id: lastMessage.partner_id || '',
                  priority: lastMessage.priority || 'normal',
                  category: 'general',
                  status: lastMessage.status || 'sent',
                  created_at: lastMessage.created_at,
                  updated_at: lastMessage.updated_at || lastMessage.created_at,
                  is_read: lastMessage.status === 'read',
                  tags: [],
                  metadata: lastMessage.metadata || {}
                },
                unreadCount,
                // Store messages in chronological order (oldest first) for proper display
                messages: messages.sort((a: any, b: any) => 
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                ),
                type: 'internal' as const
              })
              
              console.log(`✅ Loaded ${messages.length} messages for team member ${member.full_name}`)
            } else {
              // Don't create empty conversations - only show when there are actual messages
              console.log(`📝 No messages for team member ${member.full_name} - skipping empty conversation`)
            }
          } else {
            // Don't create empty conversations - only show when there are actual messages
            console.log(`📝 No API data for team member ${member.full_name} - skipping empty conversation`)
          }
        } catch (error) {
          console.error(`❌ Error loading internal messages for team member ${member.id}:`, error)
          // Don't add team member with empty conversation on error
        }
      }
      
      // Sort conversations by last message date
      conversationsData.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0
        if (!a.lastMessage) return 1
        if (!b.lastMessage) return -1
        const dateA = new Date(a.lastMessage.created_at).getTime()
        const dateB = new Date(b.lastMessage.created_at).getTime()
        return dateB - dateA
      })
      
      console.log('✅ Setting conversations:', conversationsData.length, 'conversations loaded')
      setConversations(conversationsData)
      setIsLoading(false)
      
      // Auto-select conversation from URL parameters
      const conversationId = searchParams.get('conversation')
      const messageId = searchParams.get('message')
      const senderId = searchParams.get('sender')
      const recipientId = searchParams.get('recipient')
      
      if (conversationId || messageId) {
        console.log('🎯 Auto-selecting conversation from URL params')
        
        // Handle mock conversations
        if (conversationId?.startsWith('mock-') || messageId?.startsWith('mock-')) {
          console.log('📱 Handling mock conversation navigation')
          
          // For mock conversations, try to find a real conversation that matches the sender/recipient
          if (senderId && recipientId) {
            let targetConversation = conversationsData.find(conv => {
              if (conv.partner) {
                return conv.partner.id === senderId || conv.partner.id === recipientId
              }
              if (conv.teamMember) {
                return conv.teamMember.id === senderId || conv.teamMember.id === recipientId
              }
              return false
            })
            
            if (targetConversation) {
              console.log('✅ Found real conversation for mock navigation:', targetConversation.id)
              setSelectedConversation(targetConversation)
            } else {
              console.log('📝 No real conversation found for mock navigation, will show first available')
              // If no specific conversation found, select the first one
              if (conversationsData.length > 0) {
                setSelectedConversation(conversationsData[0])
              }
            }
          } else {
            if (conversationsData.length > 0) {
              console.log('📝 Selecting first conversation for mock navigation')
              setSelectedConversation(conversationsData[0])
            }
          }
        } else {
          // Handle real conversation selection
          const targetConversation = conversationsData.find(conv => conv.id === conversationId)
          if (targetConversation) {
            console.log('✅ Found conversation for URL params:', targetConversation.id)
            setSelectedConversation(targetConversation)
          } else {
            console.log('❌ Could not find conversation for URL params')
          }
        }
      }
      
    } catch (error) {
      console.error('Error loading conversations:', error)
      setIsLoading(false)
    }
  }

  // Check for new messages periodically
  useEffect(() => {
    if (!selectedConversation) return

    const checkForNewMessages = async () => {
      try {
        if (selectedConversation.type === 'external' && selectedConversation.partner?.id) {
          const response = await fetch(
            `/api/external-messages?partnerId=${selectedConversation.partner.id}&last_check=${lastMessageCheck.toISOString()}`
          )
          if (response.ok) {
            const data = await response.json()
            if (data.hasNewMessages) {
              // Reload conversation messages
              await loadConversations(partners, teamMembers)
            }
          }
        } else if (selectedConversation.type === 'internal' && selectedConversation.teamMember?.id) {
          const response = await fetch(
            `/api/internal-messages?userId=${selectedConversation.teamMember.id}&last_check=${lastMessageCheck.toISOString()}`
          )
          if (response.ok) {
            const data = await response.json()
            if (data.hasNewMessages) {
              // Reload conversation messages
              await loadConversations(partners, teamMembers)
            }
          }
        }
      } catch (error) {
        console.error('Error checking for new messages:', error)
      }
    }

    const interval = setInterval(checkForNewMessages, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [selectedConversation, lastMessageCheck, partners, teamMembers])

  // Debug message rendering
  useEffect(() => {
    if (selectedConversation) {
      console.log('🔍 Selected conversation messages:', {
        conversationId: selectedConversation.id,
        messagesCount: selectedConversation.messages?.length,
        messages: selectedConversation.messages,
        lastMessage: selectedConversation.lastMessage
      })
    }
  }, [selectedConversation?.messages, selectedConversation?.lastMessage])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile sidebar management
  useEffect(() => {
    if (selectedConversation && isMobile) {
      setShowMobileSidebar(false)
    } else if (!selectedConversation && isMobile) {
      setShowMobileSidebar(true)
    }
  }, [selectedConversation, isMobile])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  // Generate unique message ID
  const generateMessageId = () => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
      // First, try to use file_path if available (for uploaded attachments)
      if (attachment.file_path) {
        // Check if this is a fallback mode attachment (no actual file storage)
        if (attachment.fallback_mode) {
          toast({
            title: "File Not Available",
            description: "This file is in metadata-only mode. Please contact an administrator to configure file storage.",
            variant: "destructive"
          })
          return
        }
        
        console.log('🔍 Raw file_path (view):', attachment.file_path)
        console.log('🔍 file_path length (view):', attachment.file_path.length)
        console.log('🔍 file_path type (view):', typeof attachment.file_path)
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
        console.log('🔍 Supabase URL (view):', supabaseUrl)
        console.log('🔍 Environment variable check:', {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          fallback: 'https://your-project.supabase.co'
        })
        
        const fileUrl = `${supabaseUrl}/storage/v1/object/public/message-attachments/${attachment.file_path}`
        console.log('🔗 Opening file URL from file_path:', fileUrl)
        console.log('🔍 Full URL length (view):', fileUrl.length)
        
        // Open in new tab for viewing
        window.open(fileUrl, '_blank')
        return
      }
      
      // Fallback for old attachment format - try to get file from storage
      if (attachment.message_id) {
        try {
          const response = await fetch(`/api/internal-messages/upload?messageId=${attachment.message_id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data && data.data.length > 0) {
              // Look for the attachment by name in both old and new format
              const fileAttachment = data.data.find((a: any) => 
                a.name === attachment.name || a.file_name === attachment.name
              )
              
              if (fileAttachment && fileAttachment.file_path) {
                // Check if this is a fallback mode attachment
                if (fileAttachment.fallback_mode) {
                  toast({
                    title: "File Not Available",
                    description: "This file is in metadata-only mode. Please contact an administrator to configure file storage.",
                    variant: "destructive"
                  })
                  return
                }
                
                // Get the actual file URL from Supabase Storage
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
                const fileUrl = `${supabaseUrl}/storage/v1/object/public/message-attachments/${fileAttachment.file_path}`
                console.log('🔗 Opening file URL from API lookup:', fileUrl)
                window.open(fileUrl, '_blank')
                return
              }
            }
          }
        } catch (apiError) {
          console.log('API call failed, trying alternative approach:', apiError)
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

  // NEW: Handle downloading attachments - REAL FILE STORAGE VERSION
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
      
      // First, try to use file_path if available (for uploaded attachments)
      if (attachment.file_path) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jplmmjcwwhjrltlevkoh.supabase.co'
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

  // Send message
  // Function to use a smart reply suggestion
  const useSmartReply = (suggestion: string) => {
    setMessageContent(suggestion)
    setShowSmartReply(false)
    setSmartReplySuggestions([])
    
    // Focus the textarea after a brief delay to allow state update
    setTimeout(() => {
      const textarea = document.querySelector('textarea[placeholder*="Type your message"]') as HTMLTextAreaElement
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(suggestion.length, suggestion.length)
      }
    }, 100)
    
    toast({
      title: "Smart Reply Selected",
      description: "You can edit the message before sending.",
      variant: "default"
    })
  }

  const handleSendMessage = async (content: string) => {
    console.log('🚀 handleSendMessage called with content:', content)
    console.log('🚀 selectedConversation:', selectedConversation)
    
    if (!selectedConversation || !content.trim()) {
      console.log('❌ Early return - no conversation or empty content')
      return
    }
    
    setSending(true)
    
    try {
      let newMessage: ExternalMessage | InternalMessage | null = null
      
      if (selectedConversation.type === 'external' && selectedConversation.partner) {
        // Send external message - ENHANCED VERSION
        let response: Response
        let data: any
        
        if (selectedConversation.conversationId) {
          // Use enhanced API if conversation exists
          const messageData = {
            action: 'send_message',
            message: {
              conversation_id: selectedConversation.conversationId,
              content: content.trim(),
              subject: selectedConversation.subject,
              priority: selectedConversation.priority || 'normal',
              category: selectedConversation.category || 'general',
              tags: selectedConversation.tags || [],
              metadata: {
                partner_id: selectedConversation.partner.id,
                attachments: selectedFiles.map(file => ({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  lastModified: file.lastModified
                }))
              }
            },
            userId: currentUserId
          }
          
          response = await fetch('/api/enhanced-external-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
          })
          
          data = await response.json()
          console.log('📥 Enhanced External API Response:', data)
        } else {
          // Fallback to original API
        const messageData = {
          partnerId: selectedConversation.partner.id,
          content: content.trim(),
          attachments: selectedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          }))
        }
        
          response = await fetch('/api/external-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData)
        })
        
          data = await response.json()
        console.log('📥 External API Response:', data)
        }
        
        if (data.success && data.data?.message?.id) {
          // Upload attachments if any
          let uploadedAttachments = []
          if (selectedFiles.length > 0) {
            console.log('📎 Uploading attachments for external message...')
            
            for (const file of selectedFiles) {
              try {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('messageId', data.data.message.id)
                
                const uploadResponse = await fetch('/api/external-messages/upload', {
                  method: 'POST',
                  body: formData,
                })
                
                if (uploadResponse.ok) {
                  const uploadData = await uploadResponse.json()
                  if (uploadData.success) {
                    uploadedAttachments.push(uploadData.data)
                    console.log('✅ External attachment uploaded:', uploadData.data.file_name)
                    
                    toast({
                      title: "File Uploaded Successfully",
                      description: `${uploadData.data.file_name} uploaded and ready for viewing/downloading.`,
                      variant: "default"
                    })
                  }
                } else {
                  console.error('❌ External file upload failed:', uploadResponse.status)
                  toast({
                    title: "File Upload Failed",
                    description: `Failed to upload ${file.name}. Please try again.`,
                    variant: "destructive"
                  })
                }
              } catch (uploadError) {
                console.error('❌ Error uploading external attachment:', uploadError)
                toast({
                  title: "Upload Error",
                  description: `Error uploading ${file.name}. Please try again.`,
                  variant: "destructive"
                })
              }
            }
          }
          
          newMessage = {
            id: data.data.message.id,
            type: 'external',
            partner_id: selectedConversation.partner.id,
            sender_id: currentUserId,
            content: content.trim(),
            content_type: 'text',
            priority: 'normal',
            category: 'general',
            status: 'sent',
            is_read: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: [],
            metadata: {
              partner_id: selectedConversation.partner.id,
              attachments: uploadedAttachments.map(attachment => ({
                id: attachment.id,
                message_id: data.data.message.id,
                file_name: attachment.file_name,
                file_type: attachment.file_type,
                file_size: attachment.file_size,
                file_path: attachment.file_path,
                mime_type: attachment.mime_type,
                uploaded_by: attachment.uploaded_by,
                created_at: attachment.created_at
              }))
            },
            sender: {
              id: currentUserId,
              full_name: 'You',
              email: '',
              avatar_url: undefined
            },
            partner: {
              id: selectedConversation.partner.id,
              name: selectedConversation.partner.name,
              company: selectedConversation.partner.type,
              avatar_url: selectedConversation.partner.avatar_url
            },
            attachments: uploadedAttachments.map(attachment => ({
              id: attachment.id,
              message_id: data.data.message.id,
              file_name: attachment.file_name,
              file_type: attachment.file_type,
              file_size: attachment.file_size,
              file_path: attachment.file_path,
              mime_type: attachment.mime_type,
              uploaded_by: currentUserId,
              created_at: new Date().toISOString()
            }))
          } as ExternalMessage
          
          console.log('✅ External message sent successfully')
        } else {
          throw new Error(data.error || 'Failed to send external message')
        }
      } else if (selectedConversation.type === 'internal' && selectedConversation.teamMember) {
        // Send internal message first
        const messageData = {
          sender_id: currentUserId,
          recipient_id: selectedConversation.teamMember.id,
          subject: 'Team Message',
          content: content.trim(),
          message_type: 'general',
          priority: 'normal',
          company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          attachments: [] // We'll handle attachments separately
        }
        
        const response = await fetch('/api/internal-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData)
        })
        
        const data = await response.json()
        console.log('📥 Internal API Response:', data)
        
        // Check if message was sent successfully
        if (data.success && data.data?.message) {
          console.log('✅ Internal message sent successfully')
          
          // Upload attachments if any
          let uploadedAttachments = []
          console.log('🔍 Debug - selectedFiles:', selectedFiles)
          console.log('🔍 Debug - selectedFiles.length:', selectedFiles.length)
          if (selectedFiles.length > 0) {
            console.log('📎 Uploading attachments:', selectedFiles.length)
            
            for (const file of selectedFiles) {
              try {
                const formData = new FormData()
                formData.append('messageId', data.data.message.id)
                formData.append('file', file)
                
                const uploadResponse = await fetch('/api/internal-messages/upload-file', {
                  method: 'POST',
                  body: formData
                })
                
                if (uploadResponse.ok) {
                  const uploadData = await uploadResponse.json()
                  if (uploadData.success) {
                    uploadedAttachments.push(uploadData.data)
                    console.log('✅ File uploaded:', uploadData.data.file_name)
                    
                    // Show user feedback about the upload
                    if (uploadData.data.fallback_mode) {
                      toast({
                        title: "File Metadata Stored",
                        description: `${uploadData.data.file_name} metadata stored. File will be accessible once storage is configured.`,
                        variant: "default"
                      })
                    } else {
                      toast({
                        title: "File Uploaded Successfully",
                        description: `${uploadData.data.file_name} uploaded and ready for viewing/downloading.`,
                        variant: "default"
                      })
                    }
                  }
                } else {
                  console.error('❌ File upload failed:', uploadResponse.status)
                  toast({
                    title: "File Upload Failed",
                    description: `Failed to upload ${file.name}. Please try again.`,
                    variant: "destructive"
                  })
                }
              } catch (uploadError) {
                console.error('❌ Error uploading file:', uploadError)
                toast({
                  title: "Upload Error",
                  description: `Error uploading ${file.name}. Please try again.`,
                  variant: "destructive"
                })
              }
            }
          }
          
          // Create new message object for local state with uploaded attachments
          newMessage = {
            id: data.data.message.id,
            sender_id: currentUserId, // ✅ FIX: Use currentUserId as sender
            recipient_id: selectedConversation.teamMember.id, // ✅ FIX: Use teamMember.id as recipient
            subject: 'Team Message',
            content: content.trim(),
            message_type: 'general',
            priority: 'normal',
            status: 'unread',
            is_admin_message: false,
            company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            attachments: uploadedAttachments.map(attachment => ({
              id: attachment.id,
              message_id: data.data.message.id,
              name: attachment.file_name,
              size: attachment.file_size,
              type: attachment.file_type,
              file_path: attachment.file_path, // This is the key for viewing/downloading
              lastModified: Date.now()
            })),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sender_name: 'You', // ✅ FIX: This is correct since currentUserId is the sender
            recipient_name: selectedConversation.teamMember.full_name // ✅ FIX: This is correct
          } as InternalMessage
          
          console.log('✅ Internal message with attachments created successfully')
        } else if (!data.data?.message?.id) {
          throw new Error('Backend did not return a valid message ID')
        } else {
          throw new Error(data.error || 'Failed to send internal message')
        }
      } else {
        throw new Error('Invalid conversation type')
      }
      
      // Check if we have a valid message before proceeding
      if (!newMessage) {
        throw new Error('Failed to create message object')
      }
      
      // Add message to local state
      console.log('📝 Before adding message - conversations:', conversations)
      console.log('📝 Adding message to conversation:', selectedConversation.id)
      console.log('📝 New message:', newMessage)
      
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, messages: [...conv.messages, newMessage!] }
            : conv
        )
        console.log('📝 Updated conversations:', updated)
        return updated
      })
      
      // Update conversation's last message
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: newMessage! }
            : conv
        )
        console.log('📝 Updated conversations with lastMessage:', updated)
        return updated
      })
      
      // Also update the selected conversation directly
      setSelectedConversation(prev => {
        if (prev) {
          const updated = {
            ...prev,
            messages: [...prev.messages, newMessage!],
            lastMessage: newMessage!
          }
          console.log('📝 Updated selected conversation:', updated)
          return updated
        }
        return prev
      })
      
      // Clear selected files
      setSelectedFiles([])
      
      // Clear input
      setMessageContent('')
      
      // Scroll to bottom after a short delay to ensure the new message is rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      
      toast({
        title: "Message Sent",
        description: `Your ${selectedConversation.type === 'external' ? 'external' : 'internal'} message has been sent successfully!`,
      })
      
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    console.log('📎 Files selected:', files.length, files.map(f => f.name))
    setSelectedFiles(prev => [...prev, ...files])
    
    // Show user feedback
    if (files.length > 0) {
      toast({
        title: "Files Selected",
        description: `${files.length} file(s) selected for upload`,
        variant: "default"
      })
    }
  }

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Helper function to organize partners by specialty and company
  const getOrganizedPartners = () => {
    const organized: { [key: string]: Partner[] } = {}
    
    // Remove duplicates first by creating a unique set based on partner ID
    const uniquePartners = partners.filter((partner, index, self) => 
      index === self.findIndex(p => p.id === partner.id)
    )
    
    uniquePartners.forEach(partner => {
      const specialty = partner.type || 'Other'
      if (!organized[specialty]) {
        organized[specialty] = []
      }
      organized[specialty].push(partner)
    })
    
    // Sort each specialty group by company name
    Object.keys(organized).forEach(specialty => {
      organized[specialty].sort((a, b) => a.name.localeCompare(b.name))
    })
    
    return organized
  }

  // Helper function to organize team members by department/position
  const getOrganizedTeamMembers = () => {
    const organized: { [key: string]: TeamMember[] } = {}
    
    // Remove duplicates first by creating a unique set based on member ID
    const uniqueMembers = teamMembers.filter((member, index, self) => 
      index === self.findIndex(m => m.id === member.id)
    )
    
    uniqueMembers.forEach(member => {
      const department = member.department || member.role || 'Other'
      if (!organized[department]) {
        organized[department] = []
      }
      organized[department].push(member)
    })
    
    // Sort each department group by name
    Object.keys(organized).forEach(department => {
      organized[department].sort((a, b) => a.full_name.localeCompare(b.full_name))
    })
    
    return organized
  }

  // Handle partner selection
  const handlePartnerSelection = (partnerId: string) => {
    if (partnerId === "all") {
      setSelectedPartner("all")
      setSelectedPartners([])
      setShowGroupOptions(false)
    } else {
      setSelectedPartner(partnerId)
      
      // Toggle partner in selected list (add if not present, remove if present)
      setSelectedPartners(prev => {
        if (prev.includes(partnerId)) {
          return prev.filter(id => id !== partnerId)
        } else {
          return [...prev, partnerId]
        }
      })
      
      // Check if there's an existing conversation with this partner
      const existingConversation = conversations.find(conv => 
        conv.type === 'external' && conv.partner?.id === partnerId
      )
      
      if (existingConversation) {
        setSelectedConversation(existingConversation)
      } else {
        // Create a new conversation
        const partner = partners.find(p => p.id === partnerId)
        if (partner) {
          const newConversation: Conversation = {
            id: `new-${partnerId}`,
            type: 'external',
            partner: partner,
            messages: [],
            lastMessage: null,
            unreadCount: 0,
            subject: `New conversation with ${partner.name}`,
            priority: 'normal',
            category: 'general',
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setSelectedConversation(newConversation)
        }
      }
    }
  }

  // Handle team member selection
  const handleTeamMemberSelection = (memberId: string) => {
    if (memberId === "all") {
      setSelectedTeamMember("all")
      setSelectedTeamMembers([])
      setShowGroupOptions(false)
    } else {
      setSelectedTeamMember(memberId)
      
      // Toggle team member in selected list (add if not present, remove if present)
      setSelectedTeamMembers(prev => {
        if (prev.includes(memberId)) {
          return prev.filter(id => id !== memberId)
        } else {
          return [...prev, memberId]
        }
      })
      
      // Check if there's an existing conversation with this team member
      const existingConversation = conversations.find(conv => 
        conv.type === 'internal' && conv.teamMember?.id === memberId
      )
      
      if (existingConversation) {
        setSelectedConversation(existingConversation)
      } else {
        // Create a new conversation
        const member = teamMembers.find(m => m.id === memberId)
        if (member) {
          const newConversation: Conversation = {
            id: `new-${memberId}`,
            type: 'internal',
            teamMember: member,
            messages: [],
            lastMessage: null,
            unreadCount: 0,
            subject: `New conversation with ${member.full_name}`,
            priority: 'normal',
            category: 'general',
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setSelectedConversation(newConversation)
        }
      }
    }
  }

  // Handle group conversation creation
  const handleGroupConversation = () => {
    if (activeTab === 'external' && selectedPartners.length > 1) {
      const selectedPartnerObjects = partners.filter(p => selectedPartners.includes(p.id))
      const groupName = selectedPartnerObjects.map(p => p.name).join(', ')
      
      // Check if there's an existing group conversation with ALL selected partners
      const existingGroupConversation = conversations.find(conv => 
        conv.type === 'external' && 
        conv.category === 'group' && 
        conv.groupMembers && 
        conv.groupMembers.length === selectedPartnerObjects.length &&
        selectedPartnerObjects.every(partner => 
          conv.groupMembers?.some(gm => gm.id === partner.id)
        )
      )
      
      if (existingGroupConversation) {
        setSelectedConversation(existingGroupConversation)
      } else {
        // Create a new group conversation
        const newConversation: Conversation = {
          id: `group-${selectedPartners.join('-')}`,
          type: 'external',
          partner: selectedPartnerObjects[0], // Use first partner as primary
          messages: [],
          lastMessage: null,
          unreadCount: 0,
          subject: `Group conversation: ${groupName}`,
          priority: 'normal',
          category: 'group',
          tags: ['group'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          groupMembers: selectedPartnerObjects
        }
        setSelectedConversation(newConversation)
      }
    } else if (activeTab === 'internal' && selectedTeamMembers.length > 1) {
      const selectedMemberObjects = teamMembers.filter(m => selectedTeamMembers.includes(m.id))
      const groupName = selectedMemberObjects.map(m => m.full_name).join(', ')
      
      // Check if there's an existing group conversation with ALL selected team members
      const existingGroupConversation = conversations.find(conv => 
        conv.type === 'internal' && 
        conv.category === 'group' && 
        conv.groupMembers && 
        conv.groupMembers.length === selectedMemberObjects.length &&
        selectedMemberObjects.every(member => 
          conv.groupMembers?.some(gm => gm.id === member.id)
        )
      )
      
      if (existingGroupConversation) {
        setSelectedConversation(existingGroupConversation)
      } else {
        // Create a new group conversation
        const newConversation: Conversation = {
          id: `group-${selectedTeamMembers.join('-')}`,
          type: 'internal',
          teamMember: selectedMemberObjects[0], // Use first member as primary
          messages: [],
          lastMessage: null,
          unreadCount: 0,
          subject: `Group conversation: ${groupName}`,
          priority: 'normal',
          category: 'group',
          tags: ['group'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          groupMembers: selectedMemberObjects
        }
        setSelectedConversation(newConversation)
      }
    }
  }

  // Filter conversations based on active tab and search/filter criteria
  const filteredConversations = conversations.filter(conversation => {
    // Only show conversations that have actual messages (not empty placeholders)
    if (!conversation || conversation.messages.length === 0) return false
    
    // First, filter by active tab - only show conversations matching the current tab
    if (activeTab === 'external' && conversation.type !== 'external') return false
    if (activeTab === 'internal' && conversation.type !== 'internal') return false
    
    // Then apply search and partner/team member filters
    if (conversation.type === 'external' && conversation.partner) {
      const matchesSearch = conversation.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           conversation.partner.type.toLowerCase().includes(searchQuery.toLowerCase())
      
      // For group conversations, check if ALL selected partners are in the conversation
      if (selectedPartners.length > 1) {
        if (conversation.category !== 'group' || !conversation.groupMembers) return false
        
        const conversationMemberIds = conversation.groupMembers.map(gm => gm.id)
        const allSelectedMembersInConversation = selectedPartners.every(selectedId => 
          conversationMemberIds.includes(selectedId)
        )
        
        return matchesSearch && allSelectedMembersInConversation
      }
      
      // For individual conversations
      const matchesPartner = selectedPartner === 'all' || conversation.partner.id === selectedPartner
      return matchesSearch && matchesPartner
    } else if (conversation.type === 'internal' && conversation.teamMember) {
      const matchesSearch = conversation.teamMember.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (conversation.teamMember.department || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      // For group conversations, check if ALL selected team members are in the conversation
      if (selectedTeamMembers.length > 1) {
        if (conversation.category !== 'group' || !conversation.groupMembers) return false
        
        const conversationMemberIds = conversation.groupMembers.map(gm => gm.id)
        const allSelectedMembersInConversation = selectedTeamMembers.every(selectedId => 
          conversationMemberIds.includes(selectedId)
        )
        
        return matchesSearch && allSelectedMembersInConversation
      }
      
      // For individual conversations
      const matchesTeamMember = selectedTeamMember === 'all' || conversation.teamMember.id === selectedTeamMember
      return matchesSearch && matchesTeamMember
    }
    return false
  })

  // Debug logging
  useEffect(() => {
    console.log('🔍 Current state:', {
      activeTab,
      conversationsCount: conversations.length,
      externalCount: conversations.filter(c => c.type === 'external').length,
      internalCount: conversations.filter(c => c.type === 'internal').length,
      teamMembersCount: teamMembers.length,
      partnersCount: partners.length,
      filteredCount: filteredConversations.length,
      filteredExternal: filteredConversations.filter(c => c.type === 'external').length,
      filteredInternal: filteredConversations.filter(c => c.type === 'internal').length
    })
  }, [activeTab, conversations, teamMembers, partners, filteredConversations])

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  // Add setup function
  const handleSetup = async () => {
    setSetupLoading(true)
    try {
      const response = await fetch('/api/setup-external-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Setup completed:', result)
        
        // Refresh the page to load the new data
        window.location.reload()
      } else {
        console.error('❌ Setup failed:', response.statusText)
        alert('Setup failed. Please check the console for details.')
      }
    } catch (error) {
      console.error('❌ Setup error:', error)
      alert('Setup failed. Please check the console for details.')
    } finally {
      setSetupLoading(false)
    }
  }

  // Update the loading state check
  useEffect(() => {
    if (conversations.length === 0 && !isLoading) {
      setNeedsSetup(true)
    }
  }, [conversations, isLoading])

  // Search functionality
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<Partner | TeamMember>>([])
  const [messages, setMessages] = useState<Array<ExternalMessage | InternalMessage>>([])

  // Handle search input
  const handleSearchInput = (query: string) => {
    setSearchQuery(query)
    
    if (query.trim().length > 0) {
      const results: Array<Partner | TeamMember> = []
      
      if (activeTab === 'external') {
        // Search through authorized partners only
        const getContactName = (partnerName: string) => {
          const contactNames: { [key: string]: string } = {
            'Gemstone Suppliers Inc.': 'Sarah Goldstein',
            'Precious Metals Co.': 'Michael Chen',
            'Jewelry Crafting Studio': 'Emma Rodriguez',
            'Luxury Watch Partners': 'David Thompson'
          }
          return contactNames[partnerName] || 'Contact Admin'
        }
        
        const authorizedPartners = partners.filter(partner => {
          if (partner.status !== 'active') return false
          
          const contactName = getContactName(partner.name)
          return partner.name.toLowerCase().includes(query.toLowerCase()) ||
                 partner.type.toLowerCase().includes(query.toLowerCase()) ||
                 contactName.toLowerCase().includes(query.toLowerCase())
        })
        results.push(...authorizedPartners)
      } else {
        // Search through team members
        const matchingTeamMembers = teamMembers.filter(member => 
          member.full_name.toLowerCase().includes(query.toLowerCase()) ||
          (member.department || '').toLowerCase().includes(query.toLowerCase())
        )
        results.push(...matchingTeamMembers)
      }
      
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  // Start new conversation from search
  const startNewConversation = (item: Partner | TeamMember) => {
    if (activeTab === 'external' && 'type' in item) {
      // Start conversation with business partner
      const newConversation: Conversation = {
        id: item.id,
        partner: item,
        lastMessage: {
          id: 'new',
          type: 'external',
          partner_id: item.id,
          sender_id: currentUserId,
          content: '',
          content_type: 'text',
          priority: 'normal',
          category: 'general',
          status: 'sent',
          is_read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: [],
          metadata: {},
          sender: {
            id: currentUserId,
            full_name: 'You',
            email: '',
            avatar_url: undefined
          },
          partner: {
            id: item.id,
            name: item.name,
            company: item.type,
            avatar_url: item.avatar_url
          },
          attachments: []
        },
        unreadCount: 0,
        messages: [],
        type: 'external'
      }
      
      setConversations(prev => [newConversation, ...prev])
      setSelectedConversation(newConversation)
      setMessages([])
    } else if (activeTab === 'internal' && 'full_name' in item) {
      // Start conversation with team member
      const newConversation: Conversation = {
        id: item.id,
        teamMember: item,
        lastMessage: {
          id: 'new',
          sender_id: currentUserId,
          recipient_id: item.id,
          subject: 'New Conversation',
          content: '',
          message_type: 'general',
          priority: 'normal',
          status: 'unread',
          is_admin_message: false,
          company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          attachments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender_name: 'You',
          recipient_name: item.full_name
        },
        unreadCount: 0,
        messages: [],
        type: 'internal'
      }
      
      setConversations(prev => [newConversation, ...prev])
      setSelectedConversation(newConversation)
      setMessages([])
    }
    
    // Clear search
    setSearchQuery('')
    setShowSearchResults(false)
    setSearchResults([])
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-container')) {
        setShowSearchResults(false)
        setSearchResults([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Function to create blob URLs for existing attachments
  const createBlobUrlForAttachment = async (attachment: any, messageId: string) => {
    try {
      // Try to get the file from the upload API
      const response = await fetch(`/api/internal-messages/upload?messageId=${messageId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && data.data.length > 0) {
          // Look for the attachment by name in both old and new format
          const fileAttachment = data.data.find((a: any) => 
            a.name === attachment.name || a.file_name === attachment.name
          )
          
          if (fileAttachment) {
            console.log('📎 Found attachment metadata:', fileAttachment)
            
            // If we have a file_path, we can create a proper URL
            if (fileAttachment.file_path) {
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
              const fileUrl = `${supabaseUrl}/storage/v1/object/public/message-attachments/${fileAttachment.file_path}`
              console.log('🔗 Created file URL from file_path:', fileUrl)
              return fileUrl
            }
            
            // Fallback: create a simple text blob as a placeholder
            const placeholderContent = `This is a placeholder for ${attachment.name} (${attachment.size || fileAttachment.file_size} bytes)`
            const blob = new Blob([placeholderContent], { type: 'text/plain' })
            const blobUrl = URL.createObjectURL(blob)
            
            return blobUrl
          }
        }
      }
    } catch (error) {
      console.log('Failed to create blob URL for attachment:', error)
    }
    return null
  }

  // Function to enhance attachments with blob URLs when loading messages
  const enhanceAttachmentsWithBlobUrls = async (message: any) => {
    if (message.attachments && message.attachments.length > 0) {
      const enhancedAttachments = await Promise.all(
        message.attachments.map(async (attachment: any) => {
          if (!attachment.blobUrl && attachment.message_id) {
            const blobUrl = await createBlobUrlForAttachment(attachment, attachment.message_id)
            if (blobUrl) {
              return { ...attachment, blobUrl }
            }
          }
          return attachment
        })
      )
      return { ...message, attachments: enhancedAttachments }
    }
    return message
  }

  if (loading && showLoadingScreen) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-3 text-base text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  // Update the main content area to show setup button when needed
  if (needsSetup) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
                </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">External Messaging System</h3>
            <p className="text-gray-600 mb-4">The external messaging system requires database setup with proper authentication.</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Setup Required</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    The database tables have Row Level Security (RLS) enabled. You need to either:
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                    <li>Log in with an admin account</li>
                    <li>Temporarily disable RLS for setup</li>
                    <li>Run the setup from Supabase Dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSetup}
              disabled={setupLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-4"
            >
              {setupLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting up...
                </div>
              ) : (
                'Try Setup (May Require Auth)'
              )}
            </button>
              </div>
              
          <div className="text-sm text-gray-500 space-y-2">
            <p>For now, you can:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Navigate to other working sections like Internal Messages</li>
              <li>Check the browser console for detailed error messages</li>
              <li>Contact your database administrator for RLS policy setup</li>
            </ul>
                  </div>
                  </div>
                </div>
    )
  }

  return (
    <div className={`${isMobile ? 'h-screen flex flex-col bg-white w-full overflow-hidden' : 'min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100'}`}>
      {/* Mobile Chat Header - Only show when conversation is selected on mobile */}
      {isMobile && selectedConversation && (
        <div className="bg-emerald-600 text-white px-4 py-3 flex items-center space-x-3 flex-shrink-0">
          <Button
            onClick={() => setSelectedConversation(null)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-emerald-700 p-1"
          >
            ←
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src={selectedConversation.partner?.avatar_url || selectedConversation.teamMember?.avatar_url} />
            <AvatarFallback className="bg-emerald-500 text-white text-sm">
              {selectedConversation.partner ? 
                selectedConversation.partner.name.charAt(0) : 
                selectedConversation.teamMember?.full_name.charAt(0)
              }
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {selectedConversation.partner ? selectedConversation.partner.name : selectedConversation.teamMember?.full_name}
            </div>
            <div className="text-xs text-emerald-100 truncate">
              {selectedConversation.partner ? 'B2B Partner' : 'Team Member'}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-emerald-700 p-1"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Header - Hidden on mobile when conversation is selected */}
      <div className={`${isMobile && selectedConversation ? 'hidden' : 'block'} bg-white border-b border-gray-200 ${isMobile ? 'flex-shrink-0 w-full' : 'shadow-lg'}`}>
        <div className={`${isMobile ? 'px-4 py-3 w-full' : 'max-w-7xl mx-auto px-6 py-4'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Messages
                </h1>
                {!isMobile && (
                  <p className="mt-1 text-sm text-gray-600">
                    Communicate with B2B partners and team members
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowNewMessageDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {isMobile ? "New" : "New Message"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={`${isMobile ? 'flex-1 flex overflow-hidden w-full' : 'max-w-7xl mx-auto px-6 py-6'}`}>
        <div className={`${isMobile ? 'flex h-full w-full' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}`}>
          {/* Sidebar - Partner List */}
          <div className={`${isMobile ? (showMobileSidebar ? 'flex w-full' : 'hidden') : 'lg:col-span-1'} ${isMobile ? 'flex-col bg-white w-full h-full' : ''}`}>
            <Card className={`${isMobile ? 'h-full w-full border-0 shadow-none bg-transparent' : 'h-full'}`}>
              <CardHeader className={`${isMobile ? 'pb-3 px-4 pt-4' : ''}`}>
                <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
                  <Building2 className="h-5 w-5" />
                  <span>Messages</span>
                </CardTitle>
                
                {/* Toggle between B2B Partners and Team Members */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'external' | 'internal')}>
                  <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-10' : ''}`}>
                    <TabsTrigger value="external" className={`flex items-center space-x-2 ${isMobile ? 'text-sm' : ''}`}>
                      <Briefcase className="h-4 w-4" />
                      <span>B2B Partners</span>
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {partners.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="internal" className={`flex items-center space-x-2 ${isMobile ? 'text-sm' : ''}`}>
                      <Users className="h-4 w-4" />
                      <span>Team Members</span>
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {teamMembers.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {/* Search and Filters */}
                <div className={`space-y-3 ${isMobile ? 'space-y-2' : ''}`}>
                  <div className="relative search-container">
                    <Input
                      placeholder={activeTab === 'external' ? "Search B2B partners..." : "Search team members..."}
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      className={`w-full ${isMobile ? 'h-9 text-sm' : ''}`}
                    />
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        {searchResults.map((item, index) => (
                          item && (
                            <div
                              key={item.id}
                              onClick={() => startNewConversation(item)}
                              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-medium text-emerald-800">
                                {'type' in item ? item.name?.charAt(0)?.toUpperCase() : item.full_name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {'type' in item ? item.name : item.full_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {'type' in item ? (
                                    (() => {
                                      const contactNames: { [key: string]: string } = {
                                        'Gemstone Suppliers Inc.': 'Sarah Goldstein',
                                        'Precious Metals Co.': 'Michael Chen',
                                        'Jewelry Crafting Studio': 'Emma Rodriguez',
                                        'Luxury Watch Partners': 'David Thompson'
                                      }
                                      const contactName = contactNames[item.name] || item.contact_name || 'Contact Admin'
                                      return `${contactName} • ${item.type} • ${item.status}`
                                    })()
                                  ) : `${item.role} • ${item.department}`}
                                </p>
                              </div>
                              <div className="text-xs text-emerald-600 font-medium">
                                New Chat
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {activeTab === 'external' ? (
                    <div className="flex gap-2">
                      <Select value={selectedPartner} onValueChange={handlePartnerSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select B2B Partner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All B2B Partners</SelectItem>
                          {Object.entries(getOrganizedPartners()).map(([specialty, partners]) => (
                            <div key={specialty}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {specialty}
                              </div>
                              {partners.map(partner => {
                                // Generate contact name based on partner name for demo
                                const getContactName = (partnerName: string) => {
                                  const contactNames: { [key: string]: string } = {
                                    'Gemstone Suppliers Inc.': 'Sarah Goldstein',
                                    'Precious Metals Co.': 'Michael Chen',
                                    'Jewelry Crafting Studio': 'Emma Rodriguez',
                                    'Luxury Watch Partners': 'David Thompson'
                                  }
                                  return contactNames[partnerName] || partner.contact_name || 'Contact Admin'
                                }
                                
                                return (
                                  <SelectItem key={partner.id} value={partner.id}>
                                    <div className="flex flex-col items-start space-y-1">
                                      <div className="font-medium text-gray-900">
                                        {partner.name}
                                      </div>
                                      <div className="text-sm text-gray-500 flex items-center space-x-1">
                                        <User className="h-3 w-3" />
                                        <span>{getContactName(partner.name)}</span>
                                      </div>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedPartners.length > 1 && (
                        <Button 
                          onClick={handleGroupConversation}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Create Group Chat ({selectedPartners.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select value={selectedTeamMember} onValueChange={handleTeamMemberSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Team Member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Team Members</SelectItem>
                          {Object.entries(getOrganizedTeamMembers()).map(([department, members]) => (
                            <div key={department}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {department}
                              </div>
                              {members.map(member => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.full_name}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedTeamMembers.length > 1 && (
                        <Button 
                          onClick={handleGroupConversation}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Create Group Chat ({selectedTeamMembers.length})
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Selected Partners/Team Members Indicator */}
                  {(selectedPartners.length > 0 || selectedTeamMembers.length > 0) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeTab === 'external' && selectedPartners.map(partnerId => {
                        const partner = partners.find(p => p.id === partnerId)
                        return partner ? (
                          <div key={partnerId} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm">
                            <span>{partner.name}</span>
                            <button
                              onClick={() => setSelectedPartners(prev => prev.filter(id => id !== partnerId))}
                              className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}
                      {activeTab === 'internal' && selectedTeamMembers.map(memberId => {
                        const member = teamMembers.find(m => m.id === memberId)
                        return member ? (
                          <div key={memberId} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            <span>{member.full_name}</span>
                            <button
                              onClick={() => setSelectedTeamMembers(prev => prev.filter(id => id !== memberId))}
                              className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className={`${isMobile ? 'p-0' : ''}`}>
                <ScrollArea className={`${isMobile ? 'h-[calc(100vh-180px)]' : 'h-[600px]'}`}>
                  {/* Conversation List */}
                  <div className={`space-y-2 ${isMobile ? 'mt-2 p-4' : 'mt-4'}`}>
                    {activeTab === 'external' ? (
                      // Show B2B Partners directly
                      partners.length > 0 ? (
                        partners.map((partner) => (
                          <div
                            key={partner.id}
                            onClick={() => {
                              // Create a conversation object for the partner
                              const conversation: Conversation = {
                                id: `partner-${partner.id}`,
                                type: 'external',
                                partner: partner,
                                lastMessage: null,
                                unreadCount: 0,
                                messages: [],
                                category: 'individual'
                              }
                              setSelectedConversation(conversation)
                            }}
                            className={`${isMobile ? 'p-3 mx-0' : 'p-3'} rounded-lg cursor-pointer transition-colors ${
                              selectedConversation?.partner?.id === partner.id
                                ? 'bg-emerald-100 border-emerald-300 border'
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                          >
                            <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                              <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}>
                                <AvatarImage src={partner.avatar_url} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-800">
                                  {partner.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-900 truncate`}>
                                    {partner.name}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {partner.type}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const conversation: Conversation = {
                                          id: `partner-${partner.id}`,
                                          type: 'external',
                                          partner: partner,
                                          lastMessage: null,
                                          unreadCount: 0,
                                          messages: [],
                                          category: 'individual'
                                        }
                                        setSelectedConversation(conversation)
                                      }}
                                      className="h-6 w-6 p-0 text-gray-500 hover:text-emerald-600"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 truncate`}>
                                  {partner.contact_name} • {partner.contact_email}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No B2B partners found</p>
                        </div>
                      )
                    ) : (
                      // Show Team Members directly
                      teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                          <div
                            key={member.id}
                            onClick={() => {
                              // Create a conversation object for the team member
                              const conversation: Conversation = {
                                id: `member-${member.id}`,
                                type: 'internal',
                                teamMember: member,
                                lastMessage: null,
                                unreadCount: 0,
                                messages: [],
                                category: 'individual'
                              }
                              setSelectedConversation(conversation)
                            }}
                            className={`${isMobile ? 'p-3 mx-0' : 'p-3'} rounded-lg cursor-pointer transition-colors ${
                              selectedConversation?.teamMember?.id === member.id
                                ? 'bg-emerald-100 border-emerald-300 border'
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                          >
                            <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                              <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}>
                                <AvatarImage src={member.avatar_url} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-800">
                                  {member.full_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-900 truncate`}>
                                    {member.full_name}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {member.role}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const conversation: Conversation = {
                                          id: `member-${member.id}`,
                                          type: 'internal',
                                          teamMember: member,
                                          lastMessage: null,
                                          unreadCount: 0,
                                          messages: [],
                                          category: 'individual'
                                        }
                                        setSelectedConversation(conversation)
                                      }}
                                      className="h-6 w-6 p-0 text-gray-500 hover:text-emerald-600"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 truncate`}>
                                  {member.department} • {member.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No team members found</p>
                        </div>
                      )
                    )}
                    
                    {/* Fallback for old conversation system */}
                    {filteredConversations.length > 0 && (
                      filteredConversations.map((conversation) => (
                        conversation && (
                          <div
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation)}
                            className={`${isMobile ? 'p-3 mx-0' : 'p-3'} rounded-lg cursor-pointer transition-colors ${
                              selectedConversation?.id === conversation.id
                                ? 'bg-emerald-100 border-emerald-300 border'
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                          >
                            <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                              <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}>
                                <AvatarImage 
                                  src={conversation.type === 'external' 
                                    ? conversation.partner?.avatar_url 
                                    : conversation.teamMember?.avatar_url
                                  } 
                                />
                                <AvatarFallback className="bg-emerald-100 text-emerald-800">
                                  {conversation.type === 'external' 
                                    ? conversation.partner?.name?.charAt(0)
                                    : conversation.teamMember?.full_name?.charAt(0)
                                  }
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-900 truncate`}>
                                    {conversation.type === 'external' 
                                      ? conversation.partner?.name
                                      : conversation.teamMember?.full_name
                                    }
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    {conversation.unreadCount > 0 && (
                                      <Badge variant="destructive" className="text-xs">
                                        {conversation.unreadCount}
                                      </Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedConversation(conversation)
                                      }}
                                      className="h-6 w-6 p-0 text-gray-500 hover:text-emerald-600"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  {conversation.type === 'external' && conversation.partner ? (
                                    <>
                                      <Badge variant="outline" className="text-xs">
                                        {conversation.partner.type}
                                      </Badge>
                                      <Badge 
                                        variant={conversation.partner.status === 'active' ? 'default' : 'secondary'} 
                                        className="text-xs"
                                      >
                                        {conversation.partner.status}
                                      </Badge>
                                      {/* Enhanced conversation features */}
                                      {conversation.priority && conversation.priority !== 'normal' && (
                                        <Badge 
                                          variant={conversation.priority === 'urgent' ? 'destructive' : 
                                                  conversation.priority === 'high' ? 'default' : 'secondary'} 
                                          className="text-xs"
                                        >
                                          {conversation.priority}
                                        </Badge>
                                      )}
                                      {conversation.category && conversation.category !== 'general' && (
                                        <Badge variant="outline" className="text-xs">
                                          {conversation.category}
                                        </Badge>
                                      )}
                                      {conversation.status && conversation.status !== 'active' && (
                                        <Badge 
                                          variant={conversation.status === 'resolved' ? 'default' : 
                                                  conversation.status === 'closed' ? 'secondary' : 'outline'} 
                                          className="text-xs"
                                        >
                                          {conversation.status}
                                        </Badge>
                                      )}
                                    </>
                                  ) : conversation.type === 'internal' && conversation.teamMember ? (
                                    <>
                                      <Badge variant="outline" className="text-xs">
                                        {conversation.teamMember.role}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {conversation.teamMember.department}
                                      </Badge>
                                    </>
                                  ) : null}
                                </div>
                                {conversation.lastMessage && conversation.lastMessage.id !== 'empty' ? (
                                  <p className="text-xs text-gray-600 truncate mt-1">
                                    {conversation.lastMessage.content}
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-500 italic mt-1">
                                    No messages yet - click to start conversation
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content - Messages */}
          <div className={`${isMobile ? (showMobileSidebar ? 'hidden' : 'flex w-full') : 'lg:col-span-2'} ${isMobile ? 'flex-col bg-white w-full h-full' : ''}`}>
            <Card className={`${isMobile ? 'h-full w-full border-0 shadow-none bg-transparent' : 'h-full'}`}>
              {selectedConversation ? (
                <>
                  {/* Conversation Header - Hidden on mobile */}
                  <CardHeader className={`${isMobile ? 'hidden' : 'block'} border-b`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={selectedConversation.type === 'external' 
                              ? selectedConversation.partner?.avatar_url 
                              : selectedConversation.teamMember?.avatar_url
                            } 
                          />
                          <AvatarFallback className="bg-emerald-100 text-emerald-800">
                            {selectedConversation.type === 'external' 
                              ? selectedConversation.partner?.name.charAt(0)
                              : selectedConversation.teamMember?.full_name.charAt(0)
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {selectedConversation.type === 'external' 
                              ? selectedConversation.partner?.name
                              : selectedConversation.teamMember?.full_name
                            }
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {selectedConversation.type === 'external' 
                              ? selectedConversation.partner?.type
                              : selectedConversation.teamMember?.role
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {selectedConversation.type === 'external' ? (
                          <>
                            {/* Enhanced conversation header */}
                            {selectedConversation.subject && (
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{selectedConversation.subject}</p>
                                {selectedConversation.businessType && selectedConversation.businessType !== 'general' && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {selectedConversation.businessType}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* Priority indicator */}
                            {selectedConversation.priority && selectedConversation.priority !== 'normal' && (
                              <Badge 
                                variant={selectedConversation.priority === 'urgent' ? 'destructive' : 
                                        selectedConversation.priority === 'high' ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                {selectedConversation.priority}
                              </Badge>
                            )}
                            
                            {/* Status indicator */}
                            {selectedConversation.status && selectedConversation.status !== 'active' && (
                              <Badge 
                                variant={selectedConversation.status === 'resolved' ? 'default' : 
                                        selectedConversation.status === 'closed' ? 'secondary' : 'outline'} 
                                className="text-xs"
                              >
                                {selectedConversation.status}
                              </Badge>
                            )}
                            
                            <Badge variant={selectedConversation.partner?.status === 'active' ? 'default' : 'secondary'}>
                              {selectedConversation.partner?.status}
                            </Badge>
                            
                            {selectedConversation.partner?.specialties && (
                              <div className="flex space-x-1">
                                {selectedConversation.partner.specialties.slice(0, 2).map((specialty) => (
                                  <Badge key={specialty} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* Tags */}
                            {selectedConversation.tags && selectedConversation.tags.length > 0 && (
                              <div className="flex space-x-1">
                                {selectedConversation.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <Badge variant="outline">
                              {selectedConversation.teamMember?.department}
                            </Badge>
                            <Badge variant="secondary">
                              Team Member
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className={`${isMobile ? 'p-0 flex-1' : 'p-0'}`}>
                    <ScrollArea className={`${isMobile ? 'h-[calc(100vh-200px)] p-0' : 'h-[500px] p-4'}`}>
                      <div className={`space-y-4 ${isMobile ? 'p-4' : ''}`}>
                        {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                          selectedConversation.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.sender_id === currentUserId
                                    ? selectedConversation.type === 'external' 
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs opacity-75">
                                    {selectedConversation.type === 'external' 
                                      ? (message as ExternalMessage).sender?.full_name || 'Unknown'
                                      : (message as InternalMessage).sender_name || 'Unknown'
                                    }
                                  </span>
                                  <span className="text-xs opacity-75">
                                    {formatTimestamp(message.created_at)}
                                  </span>
                                  {selectedConversation.type === 'external' && (message as ExternalMessage).is_read && message.sender_id === currentUserId && (
                                    <Check className="h-3 w-3" />
                                  )}
                                  {selectedConversation.type === 'internal' && (message as InternalMessage).status === 'read' && message.sender_id === currentUserId && (
                                    <Check className="h-3 w-3" />
                                  )}
                                </div>
                                <p className="text-sm">{message.content}</p>
                                
                                {/* Display attachments if they exist */}
                                {selectedConversation.type === 'external' && (message as any).attachments && (message as any).attachments.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                                    <div className="space-y-1">
                                      {(message as any).attachments.map((attachment: any, index: number) => (
                                        attachment && (
                                          <div key={index} className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                              {attachment.file_type === 'image/png' || attachment.file_type === 'image/jpg' || attachment.file_type === 'image/jpeg' || attachment.file_type === 'image/gif' ? '🖼️' :
                                               attachment.file_type === 'application/pdf' ? '📄' : '📎'}
                                              <span className="text-xs truncate">{attachment.file_name || attachment.name || 'Attachment'}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <button
                                                onClick={() => handleViewAttachment({ ...attachment, message_id: message.id, originalMessageId: message.id })}
                                                className="p-1 hover:bg-white/30 rounded text-xs"
                                                title="View attachment"
                                              >
                                                <Eye className="h-4 w-4" />
                                              </button>
                                              <button
                                                onClick={() => handleDownloadAttachment({ ...attachment, message_id: message.id, originalMessageId: message.id })}
                                                className="p-1 hover:bg-white/30 rounded text-xs"
                                                title="Download attachment"
                                              >
                                                <Download className="h-4 w-4" />
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {selectedConversation.type === 'internal' && (message as InternalMessage).attachments && (message as InternalMessage).attachments.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                                    <div className="space-y-1">
                                      {(message as InternalMessage).attachments.map((attachment: any, index: number) => (
                                        attachment && (
                                          <div key={index} className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                              {attachment.type === 'image/png' || attachment.type === 'image/jpg' || attachment.type === 'image/jpeg' || attachment.type === 'image/gif' ? '🖼️' :
                                               attachment.type === 'application/pdf' ? '📄' : '📎'}
                                              <span className="text-xs truncate">{attachment.name || attachment.file_name || 'Attachment'}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <button
                                                onClick={() => handleViewAttachment({ ...attachment, message_id: message.id, originalMessageId: message.id })}
                                                className="p-1 hover:bg-white/30 rounded text-xs"
                                                title="View attachment"
                                              >
                                                <Eye className="h-4 w-4" />
                                              </button>
                                              <button
                                                onClick={() => handleDownloadAttachment({ ...attachment, message_id: message.id, originalMessageId: message.id })}
                                                className="p-1 hover:bg-white/30 rounded text-xs"
                                                title="Download attachment"
                                              >
                                                <Download className="h-4 w-4" />
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm font-medium mb-1">No messages yet</p>
                            <p className="text-xs">Start the conversation by sending a message below</p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Message Input - Mobile optimized */}
                  <div className={`border-t ${isMobile ? 'p-4 bg-white w-full' : 'p-4'} ${isMobile ? 'fixed bottom-16 left-0 right-0 z-10 border-t-2 border-gray-200' : ''}`}>
                    {/* File Attachments */}
                    {selectedFiles.length > 0 && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Attachments ({selectedFiles.length})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFiles([])}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Clear All
                          </Button>
                        </div>
            <div className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex items-center space-x-2">
                                <Paperclip className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
              <Button 
                                variant="ghost"
                size="sm" 
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
              >
                                ×
              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    


                    {/* AI Reply Button - Modern Apple Style */}
                    <div className="mb-6 flex justify-center">
                      <Button
                        variant="ghost"
                        onClick={async () => {
                            if (!selectedConversation?.messages?.length) {
                              toast({
                                title: "No Messages",
                                description: "Start a conversation to get AI reply suggestions!",
                                variant: "destructive"
                              })
                              return
                            }
                            
                            try {
                              const lastMessage = selectedConversation.messages[selectedConversation.messages.length - 1]
                              const messageContent = 'content' in lastMessage ? lastMessage.content : ''
                              
                              const response = await fetch('/api/ai-messaging', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  action: 'generate_completions',
                                  conversationContext: selectedConversation.subject || 'Business Discussion',
                                  userInput: messageContent,
                                  messageHistory: selectedConversation.messages.map(msg => 
                                    'content' in msg ? msg.content : ''
                                  ),
                                  businessContext: selectedConversation.businessType || 'general',
                                  tone: 'professional',
                                  language: 'en'
                                })
                              })
                              
                              if (response.ok) {
                                const data = await response.json()
                                if (data.success && data.data.suggestions && data.data.suggestions.length > 0) {
                                  // Store smart reply suggestions
                                  setSmartReplySuggestions(data.data.suggestions)
                                  setShowSmartReply(true)
                                  toast({
                                    title: "AI Reply Generated",
                                    description: `Generated ${data.data.suggestions.length} smart reply suggestions! Click on any suggestion below to use it.`,
                                    variant: "default"
                                  })
                                } else {
                                  // Fallback with basic professional replies
                                  const fallbackReplies = [
                                    "Thank you for your message. I'll review this and get back to you shortly.",
                                    "I appreciate you reaching out. Let me gather some information and respond soon.",
                                    "Thank you for your inquiry. I'll look into this and provide you with an update.",
                                    "I've received your message and will respond with details as soon as possible."
                                  ]
                                  setSmartReplySuggestions(fallbackReplies)
                                  setShowSmartReply(true)
                                  toast({
                                    title: "AI Reply Generated",
                                    description: `Generated ${fallbackReplies.length} professional reply suggestions! Click on any suggestion below to use it.`,
                                    variant: "default"
                                  })
                                }
                              }
                            } catch (error) {
                              console.error('Error generating AI reply:', error)
                              toast({
                                title: "AI Reply Failed",
                                description: "Failed to generate AI reply. Please try again.",
                                variant: "destructive"
                              })
                            }
                          }}
                          className="group relative bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 rounded-2xl px-8 py-4 text-gray-700 hover:text-emerald-600 hover:bg-white/95 hover:border-emerald-200/50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                              <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-base">AI Reply</span>
                              <span className="text-xs text-gray-500 group-hover:text-emerald-500 transition-colors">Generate smart responses</span>
                            </div>
                          </div>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Button>
                    </div>



                    {/* Smart Reply Suggestions Panel */}
                    {showSmartReply && smartReplySuggestions.length > 0 && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-emerald-900 flex items-center">
                            <MessageSquare className="h-5 w-5 mr-2" />
                            Smart Reply Suggestions
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSmartReply(false)}
                            className="text-emerald-600 hover:text-emerald-800"
                          >
                            ×
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {smartReplySuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-3 bg-white rounded border cursor-pointer hover:bg-emerald-50 transition-colors group"
                              onClick={() => useSmartReply(suggestion)}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-700 flex-1">{suggestion}</p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 hover:text-emerald-800"
                                >
                                  Use This Reply
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 text-xs text-emerald-600 text-center">
                          Click on any suggestion to use it as your message
                        </div>
                      </div>
                    )}

                    {/* Mobile-Friendly Input Area */}
                    <div className={`${isMobile ? 'flex items-end space-x-2 bg-white w-full' : 'space-y-3'}`}>
                      {/* Attachment Button - Mobile */}
                      {isMobile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => document.getElementById('file-input')?.click()}
                          className="text-gray-500 hover:text-emerald-600 p-2 flex-shrink-0"
                        >
                          <Paperclip className="h-5 w-5" />
                        </Button>
                      )}
                      
                      {/* AI-Enhanced Message Input */}
                      <div className="flex-1">
                        <AIEnhancedMessageInput
                          onSendMessage={handleSendMessage}
                          conversationContext={selectedConversation?.subject || 'Business Discussion'}
                          businessContext={selectedConversation?.businessType || 'general'}
                          messageHistory={selectedConversation?.messages?.map(msg => 
                            'content' in msg ? msg.content : ''
                          ) || []}
                          placeholder={isMobile ? "Type a message..." : "Type your message with AI assistance..."}
                          disabled={sending}
                          value={messageContent}
                          onMessageChange={setMessageContent}
                        />
                      </div>
                      
                      {/* Send Button - Mobile */}
                      {isMobile && (
                        <Button
                          onClick={() => handleSendMessage(messageContent)}
                          disabled={!messageContent.trim()}
                          className="bg-emerald-600 hover:bg-emerald-700 p-2 flex-shrink-0"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Mobile File Preview */}
                    {isMobile && selectedFiles.length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Attachments ({selectedFiles.length})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFiles([])}
                            className="text-red-600 hover:text-red-700 p-1 h-6 w-6"
                          >
                            ×
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                              <div className="flex items-center space-x-2">
                                <Paperclip className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-700 truncate">{file.name}</span>
                                <span className="text-gray-500">
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-5 w-5"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* File Upload Controls - Desktop Only */}
                    <div className={`${isMobile ? 'hidden' : 'flex'} items-center justify-between mt-3`}>
                      <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                          onClick={() => document.getElementById('file-input')?.click()}
                          className="border-gray-300 hover:bg-gray-50"
              >
                          <Paperclip className="h-4 w-4" />
                          <span className="ml-2">Attach Files</span>
              </Button>
                        {selectedFiles.length > 0 && (
                          <span className="text-sm text-gray-500">
                            {selectedFiles.length} file(s) selected
                          </span>
                        )}
                      </div>
                      
                      {sending && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span>Sending message...</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Hidden file input */}
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                    />
                  </div>
                </>
              ) : (
                <CardContent className={`flex items-center justify-center ${isMobile ? 'h-[calc(100vh-200px)] w-full' : 'h-[600px]'}`}>
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversation Selected</h3>
                    <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                  </div>
                </CardContent>
              )}
            </Card>
            </div>
          </div>
        </div>

      {/* New Message Dialog */}
      {showNewMessageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Message</h3>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setShowNewMessageDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Type
                </label>
                <Select value={activeTab} onValueChange={(value) => setActiveTab(value as 'external' | 'internal')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4" />
                        <span>B2B Partner</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="internal">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Team Member</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select {activeTab === 'external' ? 'Partner' : 'Team Member'}
                </label>
                <Select onValueChange={(value) => {
                  if (activeTab === 'external') {
                    const partner = partners.find(p => p.id === value)
                    if (partner) {
                      setSelectedConversation({
                        id: partner.id,
                        partner: {
                          id: partner.id,
                          name: partner.name,
                          type: partner.type,
                          avatar_url: partner.avatar_url,
                          specialties: partner.specialties || [],
                          status: partner.status
                        },
                        lastMessage: {
                          id: 'new',
                          type: 'external',
                          content: 'Start a new conversation',
                          content_type: 'text',
                          sender_id: currentUserId,
                          partner_id: partner.id,
                          priority: 'normal',
                          category: 'general',
                          status: 'sent',
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          is_read: true,
                          tags: [],
                          metadata: {}
                        },
                        unreadCount: 0,
                        messages: [],
                        type: 'external'
                      })
                      setShowNewMessageDialog(false)
                    }
                  } else {
                    const member = teamMembers.find(m => m.id === value)
                    if (member) {
                      setSelectedConversation({
                        id: member.id,
                        teamMember: member,
                        lastMessage: {
                          id: 'new',
                          sender_id: currentUserId,
                          recipient_id: member.id,
                          subject: 'Start conversation',
                          content: 'Start a new conversation',
                          message_type: 'general',
                          priority: 'normal',
                          status: 'unread',
                          is_admin_message: false,
                          company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                          attachments: [],
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          sender_name: 'You',
                          recipient_name: member.full_name,
                          thread_id: undefined
                        },
                        unreadCount: 0,
                        messages: [],
                        type: 'internal'
                      })
                      setShowNewMessageDialog(false)
                    }
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Choose a ${activeTab === 'external' ? 'partner' : 'team member'}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === 'external' ? (
                      partners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={partner.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {partner.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{partner.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {partner.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {member.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Attachments</h3>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setShowAttachmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-3">
              {currentAttachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {attachment.file_type === 'image/png' || attachment.file_type === 'image/jpg' || attachment.file_type === 'image/jpeg' || attachment.file_type === 'image/gif' ? '🖼️' :
                     attachment.file_type === 'application/pdf' ? '📄' : '📎'}
                    <div>
                      <p className="font-medium">{attachment.file_name || attachment.name}</p>
                      <p className="text-sm text-gray-500">
                        {(attachment.file_size || attachment.size || 0 / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAttachment(attachment)}
                    >
                      👁️ View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAttachment(attachment)}
                    >
                      ⬇️ Download
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

