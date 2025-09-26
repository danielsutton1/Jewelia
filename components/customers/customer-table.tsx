"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  Star, 
  Clock, 
  DollarSign, 
  ShoppingBag, 
  Heart, 
  AlertCircle, 
  Plus, 
  Download, 
  Filter, 
  Search, 
  RefreshCw,
  Send,
  Target,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Users,
  Info,
  Sparkles,
  Mic,
  Upload,
  ChevronRight,
  ChevronLeft,
  ClipboardList
} from "lucide-react"
// Remove direct database import - we'll use API instead
import type { Customer } from "@/types/database"
import Link from "next/link"
import { toast } from "sonner"
import { LogPhoneCallDialog } from "@/components/customers/log-phone-call-dialog"
import { useRouter } from "next/navigation"
import { ScheduleAppointmentDialog } from "@/components/customers/schedule-appointment-dialog"

// Helper function to get company from name
function getCompanyFromName(fullName: string): string {
  const nameParts = fullName.split(' ')
  if (nameParts.length >= 2) {
    return `${nameParts[nameParts.length - 1]} & Co.`
  }
  return `${fullName} & Co.`
}

// Helper function to truncate customer ID to 13 characters
function truncateCustomerId(id: string, maxLength: number = 13): string {
  if (id.length <= maxLength) {
    return id
  }
  return id.substring(0, maxLength - 3) + '...'
}

// Helper function to truncate address to 22 characters
function truncateAddress(address: string, maxLength: number = 22): string {
  if (!address || address === "N/A") {
    return "N/A"
  }
  if (address.length <= maxLength) {
    return address
  }
  return address.substring(0, maxLength - 3) + '...'
}

// Helper function to format phone number with dashes
function formatPhoneNumber(phone: string): string {
  if (!phone || phone === "N/A") {
    return "N/A"
  }
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Format based on length
  if (digits.length === 10) {
    // Standard US format: XXX-XXX-XXXX
    return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // US format with country code: 1-XXX-XXX-XXXX
    return `1-${digits.substring(1, 4)}-${digits.substring(4, 7)}-${digits.substring(7)}`
  } else if (digits.length === 7) {
    // Local format: XXX-XXXX
    return `${digits.substring(0, 3)}-${digits.substring(3)}`
  } else {
    // For other lengths, just return the original with basic formatting
    return phone
  }
}

interface CustomerTableProps {
  searchQuery?: string
  isCallLogDialogOpen?: boolean
  setIsCallLogDialogOpen?: (open: boolean) => void
}

export function CustomerTable({ searchQuery = "", isCallLogDialogOpen, setIsCallLogDialogOpen }: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchQuery)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkActionsDialogOpen, setIsBulkActionsDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [internalCallLogDialogOpen, setInternalCallLogDialogOpen] = useState(false)
  const callLogDialogOpen = typeof isCallLogDialogOpen === 'boolean' ? isCallLogDialogOpen : internalCallLogDialogOpen
  const setCallLogDialogOpen = setIsCallLogDialogOpen || setInternalCallLogDialogOpen
  const [callType, setCallType] = useState("")
  const [callNotes, setCallNotes] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [aiSentiment, setAiSentiment] = useState<string | null>(null)
  const [aiTags, setAiTags] = useState<string[]>([])
  const [aiNextSteps, setAiNextSteps] = useState<string[]>([])
  const [showNextSteps, setShowNextSteps] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiChatInput, setAiChatInput] = useState("")
  const [aiChatHistory, setAiChatHistory] = useState<{role: string, content: string}[]>([])
  const [followUpDate, setFollowUpDate] = useState("")
  const [voiceInput, setVoiceInput] = useState("")
  const [transcript, setTranscript] = useState("")
  const [templateType, setTemplateType] = useState("")
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const router = useRouter();

  const aiTemplates = [
    { label: "Inbound Product Inquiry", value: "inbound", notes: "Customer called about a product. Interested in pricing and availability. Recommend sending product catalog and personalized offer." },
    { label: "Outbound Follow-up", value: "outbound", notes: "Followed up with customer regarding previous inquiry. Customer is considering a purchase. Suggest scheduling a demo or appointment." },
    { label: "Complaint Resolution", value: "complaint", notes: "Customer called with a complaint. Addressed the issue and offered a resolution. Recommend follow-up to ensure satisfaction." }
  ]

  function handleTemplateSelect(val: string) {
    setTemplateType(val)
    const template = aiTemplates.find(t => t.value === val)
    if (template) {
      setCallType(template.label)
      setCallNotes(template.notes)
      setAiSentiment("neutral")
      setAiTags(["template", template.label])
      setAiNextSteps(["Send follow-up email", "Schedule next call"])
      setFollowUpDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16))
    }
  }

  function handleAIAssist() {
    setAiLoading(true)
    setTimeout(() => {
      setAiSuggestion("AI Summary: Customer is interested in a diamond ring, asked about pricing and customization. Recommend sending product catalog and scheduling a follow-up call.")
      setShowSuggestion(true)
      setAiSentiment("positive")
      setAiTags(["hot lead", "product interest"])
      setAiNextSteps(["Send product catalog", "Schedule follow-up call", "Add to VIP segment if high value"])
      setFollowUpDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16))
      setAiLoading(false)
    }, 1200)
  }

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch("/api/customers")
        if (!response.ok) {
          throw new Error("Failed to fetch customers")
        }
        const result = await response.json()
        setCustomers(result.data || [])
      } catch (error) {
        console.error("Failed to load customers:", error)
        toast.error("Failed to load customers")
      } finally {
        setLoading(false)
      }
    }
    loadCustomers()
  }, [])

  useEffect(() => {
    setSearch(searchQuery)
  }, [searchQuery])

  const filteredCustomers = customers.filter(customer => {
    const customerCompany = customer.company || getCompanyFromName(customer.full_name);
    const matchesSearch = (customer.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
                         (customer.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
                         (customer.phone || '').includes(search) ||
                         (customerCompany.toLowerCase() || '').includes(search.toLowerCase())
    
    if (filter === "all") return matchesSearch
    if (filter === "vip") return matchesSearch && customer.id.startsWith("VIP")
    if (filter === "new") return matchesSearch && customer.id.includes("NEW")
    if (filter === "active") return matchesSearch && customer.id.includes("ACTIVE")
    if (filter === "inactive") return matchesSearch && customer.id.includes("INACTIVE")
    
    return matchesSearch
  })

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy) {
      case "name":
        aValue = a.full_name || ""
        bValue = b.full_name || ""
        break
      case "email":
        aValue = a.email || ""
        bValue = b.email || ""
        break
      case "phone":
        aValue = a.phone || ""
        bValue = b.phone || ""
        break
      case "company":
        aValue = a.company || getCompanyFromName(a.full_name) || ""
        bValue = b.company || getCompanyFromName(b.full_name) || ""
        break
      case "address":
        aValue = a.address || ""
        bValue = b.address || ""
        break
      default:
        aValue = a.full_name || ""
        bValue = b.full_name || ""
    }

    if (sortOrder === "asc") {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/customers")
      if (!response.ok) {
        throw new Error("Failed to fetch customers")
      }
      const result = await response.json()
      setCustomers(result.data || [])
      toast.success("Customer data refreshed!")
    } catch (error) {
      toast.error("Failed to refresh customer data")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = () => {
    toast.success("Customer table exported successfully!")
  }

  const handleSendEmail = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEmailDialogOpen(true)
  }

  const handleCallCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsCallDialogOpen(true)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCustomer = async () => {
    if (!selectedCustomer) return
    
    try {
      // Simulate delete process
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id))
      toast.success(`Customer ${selectedCustomer.full_name} deleted successfully`)
    } catch (error) {
      toast.error("Failed to delete customer")
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedCustomer(null)
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select customers first")
      return
    }
    
    toast.success(`${action} initiated for ${selectedCustomers.length} customers`)
    setIsBulkActionsDialogOpen(false)
    setSelectedCustomers([])
  }

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === sortedCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(sortedCustomers.map(c => c.id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button 
            size="sm"
            onClick={() => setIsBulkActionsDialogOpen(true)}
            disabled={selectedCustomers.length === 0}
          >
            <Target className="h-4 w-4 mr-2" />
            Bulk Actions ({selectedCustomers.length})
          </Button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedCustomers.length === sortedCustomers.length && sortedCustomers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/80 px-4 py-3 font-semibold text-slate-700"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Customer
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/80 px-4 py-3 font-semibold text-slate-700 min-w-[150px]"
                onClick={() => handleSort("company")}
              >
                <div className="flex items-center gap-1">
                  Company
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/80 px-4 py-3 font-semibold text-slate-700 min-w-[200px]"
                onClick={() => handleSort("address")}
              >
                <div className="flex items-center gap-1">
                  Address
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/80 px-4 py-3 font-semibold text-slate-700 min-w-[180px]"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center gap-1">
                  Email
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/80 px-4 py-3 font-semibold text-slate-700 min-w-[120px]"
                onClick={() => handleSort("phone")}
              >
                <div className="flex items-center gap-1">
                  Phone
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right px-4 py-3 font-semibold text-slate-700 w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCustomers.map((customer) => {
              const isSelected = selectedCustomers.includes(customer.id)
              
              return (
                <Link href={`/dashboard/customers/${customer.id}`} key={customer.id} passHref legacyBehavior>
                  <TableRow
                    className={`${isSelected ? "bg-slate-50/80" : "hover:bg-slate-50/50"} cursor-pointer transition-colors duration-200`}
                    onClick={e => {
                      // Prevent navigation if clicking on checkbox or actions
                      if (
                        (e.target as HTMLElement).closest('input[type="checkbox"]') ||
                        (e.target as HTMLElement).closest('button') ||
                        (e.target as HTMLElement).closest('a')
                      ) {
                        e.stopPropagation()
                        return
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`View details for ${customer.full_name}`}
                  >
                    <TableCell onClick={e => e.stopPropagation()} className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectCustomer(customer.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src="/diverse-group-avatars.png" alt={customer.full_name} />
                          <AvatarFallback className="text-sm font-medium">{customer.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-900 truncate">{customer.full_name}</div>
                          <div className="text-sm text-slate-500 truncate" title={`Full ID: ${customer.id}`}>
                            ID: {truncateCustomerId(customer.id)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-sm text-slate-700 truncate" title={customer.company || getCompanyFromName(customer.full_name)}>
                        {customer.company || getCompanyFromName(customer.full_name)}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-sm text-slate-700 truncate" title={customer.address || "N/A"}>
                        {truncateAddress(customer.address || "")}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <div className="text-sm text-slate-700 truncate" title={customer.email || "N/A"}>
                          {customer.email || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <div className="text-sm text-slate-700 truncate" title={customer.phone || "N/A"}>
                          {formatPhoneNumber(customer.phone || "")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-4 py-3" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/customers/${customer.id}`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/customers/${customer.id}/edit`} className="flex items-center gap-2">
                              <Edit className="h-4 w-4" />
                              Edit Customer
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-2"
                            onClick={() => handleSendEmail(customer)}
                          >
                            <Mail className="h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() => router.push(`/dashboard/customers/${customer.id}/call-log?new=1`)}
                          >
                            <Plus className="h-4 w-4" />
                            New Call Log
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/customers/${customer.id}/call-log`} className="flex items-center gap-2">
                              <ClipboardList className="h-4 w-4" />
                              View Call Log
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsScheduleDialogOpen(true);
                            }}
                          >
                            <Calendar className="h-4 w-4" />
                            Schedule Meeting
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Mark as VIP
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Add to Favorites
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 flex items-center gap-2"
                            onClick={() => handleDeleteCustomer(customer)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </Link>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {sortedCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No customers found</h3>
          <p className="text-muted-foreground mb-4">
            {search || filter !== "all" 
              ? "Try adjusting your search or filters"
              : "Get started by adding your first customer"
            }
          </p>
          {!search && filter === "all" && (
            <Link href="/dashboard/customers/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to {selectedCustomer?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="Enter email subject" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <textarea 
                className="w-full h-32 p-3 border rounded-md resize-none"
                placeholder="Enter your message..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success(`Email sent to ${selectedCustomer?.full_name}`)
              setIsEmailDialogOpen(false)
            }}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Call Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call {selectedCustomer?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{selectedCustomer?.phone}</div>
              <p className="text-muted-foreground">Ready to make the call?</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Call Notes</label>
              <textarea 
                className="w-full h-20 p-3 border rounded-md resize-none"
                placeholder="Add notes for this call..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCallDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success(`Call initiated to ${selectedCustomer?.full_name}`)
              setIsCallDialogOpen(false)
            }}>
              <Phone className="h-4 w-4 mr-2" />
              Start Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete {selectedCustomer?.full_name}? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCustomer}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={isBulkActionsDialogOpen} onOpenChange={setIsBulkActionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Select an action to perform on {selectedCustomers.length} customers
            </p>
            <div className="grid gap-2">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleBulkAction("Email Campaign")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email Campaign
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleBulkAction("SMS Campaign")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send SMS Campaign
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleBulkAction("Export Data")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Customer Data
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleBulkAction("Add to Segment")}
              >
                <Target className="h-4 w-4 mr-2" />
                Add to Segment
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleBulkAction("Mark as VIP")}
              >
                <Star className="h-4 w-4 mr-2" />
                Mark as VIP
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleBulkAction("Schedule Follow-up")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkActionsDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Call Log Dialog */}
      <LogPhoneCallDialog open={callLogDialogOpen} onOpenChange={setCallLogDialogOpen} customer={selectedCustomer} />

      <ScheduleAppointmentDialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen} />
    </div>
  )
}
