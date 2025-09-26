"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Calendar, CheckCircle, XCircle, Send, DollarSign, Plus, Download, Users, Paperclip, ArrowRight, ArrowLeft, MoreHorizontal, Clock, Printer, FileText, PlusCircle, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MessageAssigneeDialog } from "@/components/orders/message-assignee-dialog";
import { mockQuotes } from "@/data/mock-quotes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Import the global mutable quotes array
declare global {
  var mutableMockQuotes: typeof mockQuotes;
}

// API functions for quotes management
const fetchQuotes = async (params?: {
  search?: string
  status?: string
  customerId?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}) => {
  const searchParams = new URLSearchParams()
  
  if (params?.search) searchParams.append('search', params.search)
  if (params?.status) searchParams.append('status', params.status)
  if (params?.customerId) searchParams.append('customerId', params.customerId)
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)
  
  // Add cache-busting parameter
  searchParams.append('_t', Date.now().toString())
  searchParams.append('_cb', Math.random().toString())
  
  const response = await fetch(`/api/quotes?${searchParams.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch quotes')
  }
  return response.json()
}

// Customer ID mapping for linking to customer detail pages
const customerIdMap: { [key: string]: string } = {
  "Sophia Chen": "VIP-001",
  "Ethan Davis": "VIP-002", 
  "Ava Martinez": "VIP-003",
  "Liam Smith": "VIP-004",
  "Emma Wilson": "VIP-005",
};

const statusColors = {
  sent: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  expired: "bg-yellow-100 text-yellow-800",
};

function uniqueCustomers(quotes: any[]) {
  return [...new Set(quotes.map(q => q.customer).filter(Boolean))]
}

export default function QuotesPage() {
  const router = useRouter()
  
  // Add state for real quotes data from API
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100, // Show all quotes for now
    total: 0,
    totalPages: 0
  })

  // Add filter state here
  const [status, setStatus] = useState("all")
  const [customer, setCustomer] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [amountRange, setAmountRange] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  
  // Add missing state variables
  const [exporting, setExporting] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [activeSummary, setActiveSummary] = useState("all")
  const [contactAssigneeDialog, setContactAssigneeDialog] = useState<{ open: boolean; quote: any | null }>({ open: false, quote: null })
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Load quotes immediately on component mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const loadQuotes = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchQuotes({ limit: pagination.limit })
        
        // Map API data to frontend expected format
        const mappedQuotes = (result.data || []).map((quote: any) => ({
          id: quote.id,
          quoteNumber: quote.quote_number || quote.quoteNumber,
          customerId: quote.customer_id,
          customer: quote.customer?.full_name || quote.customer || `Customer ${quote.customer_id?.slice(0, 8)}...`,
          total: quote.total_amount || quote.total || 0,
          budget: quote.budget || 0, // Use actual budget field from database
          status: quote.status || 'draft',
          description: quote.description || '',
          validUntil: quote.valid_until || quote.validUntil || '',
          notes: quote.notes || '',
          item: quote.item || 'N/A',
          items: (() => {
            try {
              if (!quote.items) return [];
              if (typeof quote.items === 'string') {
                return JSON.parse(quote.items);
              }
              return Array.isArray(quote.items) ? quote.items : [];
            } catch (error) {
              console.warn('Failed to parse items for quote:', quote.id, error);
              return [];
            }
          })(),
          assigneeId: quote.assignee_id,
          assignee: quote.assignee_name || quote.assignee || (quote.assignee_id ? `User ${quote.assignee_id?.slice(0, 8)}...` : 'Unassigned'),
          sent: quote.sent_at || quote.sent || 'N/A',
          acceptedAt: quote.accepted_at,
          declinedAt: quote.declined_at,
          createdAt: quote.created_at,
          updatedAt: quote.updated_at,
          files: quote.files || []
        }))
        
        setQuotes(mappedQuotes)
        setPagination(result.pagination || { page: 1, limit: 100, total: 0, totalPages: 0 })
        
        // Debug: Log the quotes that were loaded
        console.log('📊 Quotes loaded:', mappedQuotes.length);
        console.log('📊 Sample quote:', mappedQuotes[0]);
        console.log('📊 All quote numbers:', mappedQuotes.map((q: any) => q.quoteNumber));
        console.log('📊 Looking for test quote Q-2025-TEST-UPLOAD:', mappedQuotes.find((q: any) => q.quoteNumber === 'Q-2025-TEST-UPLOAD'));
      } catch (err: any) {
        console.error('Error loading quotes:', err)
        setError(err.message || 'Failed to load quotes')
        toast({
          title: "Error",
          description: "Failed to load quotes data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    // Load quotes immediately
    loadQuotes()
  }, [])

  // Reload quotes when pagination changes
  useEffect(() => {
    if (typeof window !== 'undefined' && pagination.page > 1) {
      const loadQuotesForPage = async () => {
        try {
          setLoading(true)
          setError(null)
          const result = await fetchQuotes({ 
            limit: pagination.limit,
            page: pagination.page 
          })
          
          // Map API data to frontend expected format
          const mappedQuotes = (result.data || []).map((quote: any) => ({
            id: quote.id,
            quoteNumber: quote.quote_number || quote.quoteNumber,
            customerId: quote.customer_id,
            customer: quote.customer?.full_name || quote.customer || `Customer ${quote.customer_id?.slice(0, 8)}...`,
            total: quote.total_amount || quote.total || 0,
            budget: quote.budget || 0, // Use actual budget field from database
            status: quote.status || 'draft',
            description: quote.description || '',
            validUntil: quote.valid_until || quote.validUntil || '',
            notes: quote.notes || '',
            item: quote.item || 'N/A',
            items: (() => {
              try {
                if (!quote.items) return [];
                if (typeof quote.items === 'string') {
                  return JSON.parse(quote.items);
                }
                return Array.isArray(quote.items) ? quote.items : [];
              } catch (error) {
                console.warn('Failed to parse items for quote:', quote.id, error);
                return [];
              }
            })(),
            assigneeId: quote.assignee_id,
            assignee: quote.assignee_name || quote.assignee || (quote.assignee_id ? `User ${quote.assignee_id?.slice(0, 8)}...` : 'Unassigned'),
            sent: quote.sent_at || quote.sent || 'N/A',
            acceptedAt: quote.accepted_at,
            declinedAt: quote.declined_at,
            createdAt: quote.created_at,
            updatedAt: quote.updated_at,
            files: quote.files || []
          }))
          
          setQuotes(mappedQuotes)
          setPagination(result.pagination || { page: pagination.page, limit: pagination.limit, total: 0, totalPages: 0 })
        } catch (err: any) {
          console.error('Error loading quotes for page:', err)
          setError(err.message || 'Failed to load quotes')
        } finally {
          setLoading(false)
        }
      }

      loadQuotesForPage()
    }
  }, [pagination.page])

  // Refresh quotes when returning to the page or when a new quote is created
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focus detected, refreshing quotes...');
      refreshQuotes()
    }

    const handleQuoteCreated = (event: CustomEvent) => {
      console.log('🔄 Quote created event received:', event.detail);
      refreshQuotes()
    }

    // Also refresh on page load
    console.log('🔄 Page loaded, refreshing quotes...');
    refreshQuotes()

    // Add a periodic refresh every 3 seconds to catch any missed updates
    const intervalId = setInterval(() => {
      console.log('🔄 Periodic refresh triggered...');
      refreshQuotes()
    }, 3000);

    // Add a more aggressive refresh for the first 30 seconds
    const initialRefreshInterval = setInterval(() => {
      console.log('🔄 Initial aggressive refresh triggered...');
      refreshQuotes()
    }, 1000);

    // Stop the aggressive refresh after 30 seconds
    setTimeout(() => {
      clearInterval(initialRefreshInterval);
      console.log('🔄 Stopped aggressive refresh');
    }, 30000);

    window.addEventListener('focus', handleFocus)
    window.addEventListener('quoteCreated', handleQuoteCreated as EventListener)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('quoteCreated', handleQuoteCreated as EventListener)
      clearInterval(intervalId)
      clearInterval(initialRefreshInterval)
    }
  }, [])

  const refreshQuotes = async () => {
    try {
      console.log('🔄 refreshQuotes called');
      const result = await fetchQuotes({ limit: pagination.limit })
      console.log('🔄 fetchQuotes result:', result);
      console.log('🔄 fetchQuotes data length:', result.data?.length);
      
      // Map API data to frontend expected format
      const mappedQuotes = (result.data || []).map((quote: any) => ({
        id: quote.id,
        quoteNumber: quote.quote_number || quote.quoteNumber,
        customerId: quote.customer_id,
        customer: quote.customer?.full_name || quote.customer || `Customer ${quote.customer_id?.slice(0, 8)}...`,
        total: quote.total_amount || quote.total || 0,
        budget: quote.budget || 0, // Use actual budget field from database
        status: quote.status || 'draft',
        description: quote.description || '',
        validUntil: quote.valid_until || quote.validUntil || '',
        notes: quote.notes || '',
        item: quote.item || 'N/A',
        items: (() => {
          try {
            if (!quote.items) return [];
            if (typeof quote.items === 'string') {
              return JSON.parse(quote.items);
            }
            return Array.isArray(quote.items) ? quote.items : [];
          } catch (error) {
            console.warn('Failed to parse items for quote:', quote.id, error);
            return [];
          }
        })(),
        assigneeId: quote.assignee_id,
        assignee: quote.assignee_name || quote.assignee || (quote.assignee_id ? `User ${quote.assignee_id?.slice(0, 8)}...` : 'Unassigned'),
        sent: quote.sent_at || quote.sent || 'N/A',
        acceptedAt: quote.accepted_at,
        declinedAt: quote.declined_at,
        createdAt: quote.created_at,
        updatedAt: quote.updated_at,
        files: quote.files || []
      }))
      
      // Always update quotes, even if empty, to ensure new quotes appear
      setQuotes(mappedQuotes)
      setPagination(result.pagination || { page: pagination.page, limit: pagination.limit, total: 0, totalPages: 0 })
      
      // Debug: Log the quotes that were refreshed
      console.log('🔄 Quotes refreshed:', mappedQuotes.length);
      console.log('🔄 Sample refreshed quote:', mappedQuotes[0]);
      console.log('🔄 All refreshed quote numbers:', mappedQuotes.map((q: any) => q.quoteNumber));
      console.log('🔄 Looking for test quote Q-2025-TEST-UPLOAD in refresh:', mappedQuotes.find((q: any) => q.quoteNumber === 'Q-2025-TEST-UPLOAD'));
      
      if (mappedQuotes.length === 0) {
        console.warn('⚠️ No quotes returned from API');
      }
    } catch (err: any) {
      console.error('Error refreshing quotes:', err)
      toast({
        title: "Error",
        description: "Failed to refresh quotes data",
        variant: "destructive"
      })
    }
  }

  const handleSendQuote = async (quote: typeof mockQuotes[0]) => {
    try {
      // Update quote status in backend and locally
      try {
        // Update quote status in backend
        const updateResponse = await fetch('/api/quotes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quote_id: quote.quoteNumber,
            status: 'sent',
            sent_at: new Date().toISOString(),
          }),
        });

        if (updateResponse.ok) {
          console.log('Quote status updated in backend');
        } else {
          console.warn('Failed to update quote status in backend');
        }
      } catch (error) {
        console.warn('Error updating quote status in backend:', error);
      }

      // Update quote status locally
      const updatedQuotes = quotes.map(q =>
        q.quoteNumber === quote.quoteNumber
          ? { ...q, status: 'sent' as 'sent', sent: new Date().toISOString().split('T')[0] }
          : q
      );
      setQuotes(updatedQuotes);

      // Show success message
      toast({
        title: "Quote Sent Successfully",
        description: `Quote ${quote.quoteNumber} has been sent to ${quote.customer || 'the customer'}.`,
      });
    } catch (error) {
      console.error('Error sending quote:', error);
      toast({
        title: "Error",
        description: "Failed to send quote",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = (quote: typeof mockQuotes[0]) => {
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text('Jewelia CRM', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Quote: ${quote.quoteNumber}`, 20, 40);
    doc.text(`Customer: ${quote.customer}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Total: $${quote.total.toLocaleString()}`, 20, 70);
    
    doc.save(`quote-${quote.quoteNumber}.pdf`);
  };

  const handleConvertToOrder = (quote: typeof mockQuotes[0]) => {
    toast({
      title: "Convert to Order",
      description: `Converting quote ${quote.quoteNumber} to order...`,
    });
  };

  function handleExport(type: 'csv' | 'pdf') {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast({
        title: "Export Complete",
        description: `Quotes exported as ${type.toUpperCase()}`,
      });
    }, 2000);
  }

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => {
      setPrinting(false);
      window.print();
    }, 1000);
  }

  const handleQuoteResponse = (quoteNumber: string, action: 'accept' | 'decline') => {
    const updatedQuotes = quotes.map(q =>
      q.quoteNumber === quoteNumber
        ? { ...q, status: action === 'accept' ? 'accepted' : 'declined' }
        : q
    );
    setQuotes(updatedQuotes);
    
    toast({
      title: `Quote ${action === 'accept' ? 'Accepted' : 'Declined'}`,
      description: `Quote ${quoteNumber} has been ${action === 'accept' ? 'accepted' : 'declined'}.`,
    });
  };

  // Check for quote responses periodically
  useEffect(() => {
    const checkQuoteResponses = async () => {
      try {
        const response = await fetch('/api/quotes/check-responses');
        if (response.ok) {
          const data = await response.json();
          // Handle any quote response updates
        }
      } catch (error) {
        // Silently handle errors for this background check
      }
    };

    const interval = setInterval(checkQuoteResponses, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getFilteredQuotes = () => {
    let filtered = quotes; // Show all quotes including drafts

    if (status !== "all") {
      filtered = filtered.filter(q => q.status === status);
    }
    if (customer !== "all") {
      filtered = filtered.filter(q => q.customer === customer);
    }
    if (searchInput) {
      filtered = filtered.filter(q =>
        q.quoteNumber.toLowerCase().includes(searchInput.toLowerCase()) ||
        q.customer.toLowerCase().includes(searchInput.toLowerCase()) ||
        q.notes.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    return filtered;
  };

  const summaryBoxClass = (key: string, color: string) =>
    `${color} flex flex-col items-center justify-center p-4 cursor-pointer border-2 transition-all ${activeSummary === key ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-transparent'}`;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4" />;
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600 h-8 w-8"></div>
          <p className="mt-4 text-emerald-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredQuotes = getFilteredQuotes();
  const uniqueCustomerList = uniqueCustomers(quotes);
  
  // Debug: Log what quotes are being displayed
  console.log('🎯 Current quotes state:', quotes.length);
  console.log('🎯 Filtered quotes:', filteredQuotes.length);
  console.log('🎯 All quote numbers in state:', quotes.map((q: any) => q.quoteNumber));
  console.log('🎯 Looking for Q-2025-007:', quotes.find((q: any) => q.quoteNumber === 'Q-2025-007'));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 pt-10 pb-4">
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-200/50 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">Quotes</h1>
              <p className="text-md text-emerald-600 font-medium">
                Manage and track all your quotes
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[160px]">
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" 
                title="Refresh Quotes"
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  setLoading(true);
                  setTimeout(() => {
                    refreshQuotes();
                  }, 100);
                }}
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Link href="/dashboard/designs/status">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" title="Back to Designs Status">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                onClick={() => router.push('/dashboard/quotes/create')}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-md px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Quote
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="relative z-10 max-w-7xl mx-auto mb-8 flex justify-center">
        <div className="flex justify-center gap-4 flex-wrap px-4 md:px-0">
          <Card className="w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-blue-100 transition-all duration-300 hover:border-blue-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <FileText className="w-7 h-7 mb-2 text-blue-600" />
              <div className="text-2xl font-extrabold text-blue-900">
                {loading ? '...' : filteredQuotes.filter(q => q.status === 'draft').length}
              </div>
              <div className="text-xs font-medium mt-1 text-blue-700">Draft</div>
            </CardContent>
          </Card>
          <Card className="w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-green-100 transition-all duration-300 hover:border-green-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <Send className="w-7 h-7 mb-2 text-green-600" />
              <div className="text-2xl font-extrabold text-green-900">
                {loading ? '...' : filteredQuotes.filter(q => q.status === 'sent').length}
              </div>
              <div className="text-xs font-medium mt-1 text-green-700">Sent</div>
            </CardContent>
          </Card>
          <Card className="w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-purple-100 transition-all duration-300 hover:border-purple-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <CheckCircle className="w-7 h-7 mb-2 text-purple-600" />
              <div className="text-2xl font-extrabold text-purple-900">
                {loading ? '...' : filteredQuotes.filter(q => q.status === 'accepted').length}
              </div>
              <div className="text-xs font-medium mt-1 text-purple-700">Accepted</div>
            </CardContent>
          </Card>
          <Card className="w-52 flex flex-col items-center justify-center p-2 cursor-pointer border-2 shadow-xl rounded-2xl bg-emerald-100 transition-all duration-300 hover:border-emerald-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <DollarSign className="w-7 h-7 mb-2 text-emerald-600" />
              <div className="text-2xl font-extrabold text-emerald-900">
                {loading ? '...' : `$${filteredQuotes.reduce((sum, q) => sum + (q.total || 0), 0).toLocaleString()}`}
              </div>
              <div className="text-xs font-medium mt-1 text-emerald-700">Total Value</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 max-w-7xl mx-auto mb-8 px-4 md:px-0">
        <Card className="p-6 shadow-xl rounded-2xl bg-white/80 border-emerald-100 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Search quotes or customers..."
              className="w-48 bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <select
              className="w-32 bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl px-3 py-2 text-sm"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
            </select>
            
            <select
              className="w-40 bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl px-3 py-2 text-sm"
              value={customer}
              onChange={e => setCustomer(e.target.value)}
            >
              <option value="all">All Customers</option>
              {uniqueCustomerList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 rounded-xl">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4" /> Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </div>

      {/* Table */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-0 mb-6 sm:mb-8 lg:mb-12">
        <Card className="shadow-2xl rounded-2xl bg-white/80 border-emerald-100">
          <CardContent className="p-0">
            <div className="rounded-2xl overflow-hidden luxury-table-wrapper responsive-table">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white/60 luxury-table">
                  <thead className="sticky top-0 z-20 shadow-md bg-gradient-to-r from-emerald-50 to-green-50">
                    <tr>
                      <th
                        className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => handleSort("quoteNumber")}
                      >
                        <div className="flex items-center">
                          Quote Number
                          {getSortIcon("quoteNumber")}
                        </div>
                      </th>
                      <th
                        className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => handleSort("customer")}
                      >
                        <div className="flex items-center">
                          Customer
                          {getSortIcon("customer")}
                        </div>
                      </th>
                      <th
                        className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          {getSortIcon("status")}
                        </div>
                      </th>
                      <th
                        className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => handleSort("total")}
                      >
                        <div className="flex items-center">
                          Budget
                          {getSortIcon("total")}
                        </div>
                      </th>
                      <th
                        className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => handleSort("total")}
                      >
                        <div className="flex items-center">
                          Quote
                          {getSortIcon("total")}
                        </div>
                      </th>
                      <th
                        className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => handleSort("assignee")}
                      >
                        <div className="flex items-center">
                          Assignee
                          {getSortIcon("assignee")}
                        </div>
                      </th>
                      <th
                        className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => handleSort("validUntil")}
                      >
                        <div className="flex items-center">
                          Valid Until
                          {getSortIcon("validUntil")}
                        </div>
                      </th>
                      <th
                        className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => handleSort("sent")}
                      >
                        <div className="flex items-center">
                          Sent Date
                          {getSortIcon("sent")}
                        </div>
                      </th>
                      <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Files</th>
                      <th
                        className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => handleSort("notes")}
                      >
                        <div className="flex items-center">
                          Notes
                          {getSortIcon("notes")}
                        </div>
                      </th>
                      <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-6 sm:py-8 text-emerald-400 text-sm sm:text-base">No quotes found.</td>
                      </tr>
                    ) : (
                      filteredQuotes.map((q, index) => (
                        <tr key={`${q.quoteNumber}-${index}-${q.customer}`} className="border-b border-emerald-100 hover:bg-emerald-50/60 transition luxury-row">
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 font-semibold text-emerald-900 whitespace-nowrap text-xs sm:text-sm">
                            <Link href={`/dashboard/quotes/${q.quoteNumber}`} className="hover:text-emerald-600 hover:underline transition-colors">
                              {q.quoteNumber}
                            </Link>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <Link href={`/dashboard/customers/${q.customerId}`} className="hover:text-emerald-600 hover:underline transition-colors font-medium">
                              {q.customer}
                            </Link>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                            {q.status === 'draft' ? (
                              <Badge className="bg-gray-100 text-gray-800 px-2 py-1 rounded-xl text-xs font-semibold">
                                Draft
                              </Badge>
                            ) : q.status === 'sent' ? (
                              <Badge className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-xl text-xs font-semibold">
                                Sent
                              </Badge>
                            ) : (
                              <Badge className={`${q.status === 'sent' ? 'bg-blue-100 text-blue-800' : q.status === 'accepted' ? 'bg-green-100 text-green-800' : q.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded-xl text-xs font-semibold`}>
                                {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                              </Badge>
                            )}
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap font-semibold text-emerald-900 text-xs sm:text-sm">
                            ${q.budget.toLocaleString()}
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap font-semibold text-emerald-900 text-xs sm:text-sm">
                            ${q.total.toLocaleString()}
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{q.assignee}</td>
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{q.validUntil}</td>
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{q.sent ? q.sent : "N/A"}</td>
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 text-center whitespace-nowrap">
                            {q.files && q.files.length > 0 ? (
                              <Paperclip className="h-4 w-4 text-emerald-600 mx-auto" />
                            ) : (
                              <span className="text-emerald-300 text-xs">No file</span>
                            )}
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs truncate" title={q.notes}>
                            {q.notes || "—"}
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="default" className="text-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-2 rounded-xl shadow-md min-h-[44px] min-w-[44px]">
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 sm:w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                  <div className="px-2 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 border-b">Required Actions</div>
                                  
                                  {/* Create Quote - Always show for creating new quotes */}
                                  <DropdownMenuItem className="text-xs sm:text-sm" onClick={async () => {
                                    try {
                                      // Check if this quote already has content
                                      if (!q.item || q.item === 'N/A' || q.total === 0) {
                                        // Create a new quote entry if it doesn't exist
                                        const newQuoteNumber = `Q-${new Date().getFullYear()}-${String(Math.max(...quotes.map(q => parseInt(q.quoteNumber.split('-')[2]) || 0)) + 1).padStart(3, '0')}`;
                                        
                                        const newQuote = {
                                          id: `quote-${Date.now()}`,
                                          quoteNumber: newQuoteNumber,
                                          customerId: q.customerId || 'unknown',
                                          customer: q.customer || 'New Customer',
                                          client: q.customer || 'New Customer',
                                          total: 0,
                                          status: 'draft' as 'draft',
                                          description: '',
                                          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                          notes: q.notes || '',
                                          item: 'N/A',
                                          items: [],
                                          assigneeId: q.assigneeId,
                                          assignee: q.assignee || 'Unassigned',
                                          sent: 'N/A',
                                          acceptedAt: null,
                                          declinedAt: null,
                                          createdAt: new Date().toISOString(),
                                          updatedAt: new Date().toISOString(),
                                          created: new Date().toISOString(),
                                          stage: 'draft',
                                          convertedToOrder: false,
                                          files: []
                                        };
                                        
                                        // Add to mock data
                                        if (typeof global !== 'undefined' && global.mutableMockQuotes) {
                                          global.mutableMockQuotes.push(newQuote);
                                        }
                                        
                                        // Refresh quotes list to show the new quote
                                        await refreshQuotes();
                                        
                                        // Show success message
                                        toast({
                                          title: "New Quote Created",
                                          description: `Quote ${newQuoteNumber} has been created and is ready for editing.`,
                                        });
                                        
                                        // Navigate to create quote page with the new quote number
                                        router.push(`/dashboard/quotes/create?quoteId=${newQuoteNumber}&customerName=${encodeURIComponent(q.customer || "")}&notes=${encodeURIComponent(q.notes || "")}&assignee=${encodeURIComponent(q.assignee || "")}`);
                                      } else {
                                        // Navigate to create quote page with existing quote data
                                        router.push(`/dashboard/quotes/create?customerName=${encodeURIComponent(q.customer || "")}&notes=${encodeURIComponent(q.notes || "")}&assignee=${encodeURIComponent(q.assignee || "")}`);
                                      }
                                    } catch (error) {
                                      console.error('Error creating new quote:', error);
                                      // Fallback to direct navigation
                                      router.push(`/dashboard/quotes/create?customerName=${encodeURIComponent(q.customer || "")}&notes=${encodeURIComponent(q.notes || "")}&assignee=${encodeURIComponent(q.assignee || "")}`);
                                    }
                                  }}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Quote
                                  </DropdownMenuItem>
                                  
                                  {/* View Quote - Always show between Create and Send */}
                                  <DropdownMenuItem className="text-xs sm:text-sm" onClick={() => {
                                    // Always route to the view page for all quotes
                                    router.push(`/dashboard/quotes/view?quoteId=${q.quoteNumber}`)
                                  }}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Quote
                                  </DropdownMenuItem>
                                  
                                  {/* Send Quote - Show for quotes that can be sent */}
                                  {(q.status === 'draft' || q.status === 'sent' || !q.sent || q.sent === 'N/A') && (
                                    <DropdownMenuItem className="text-xs sm:text-sm" onClick={() => handleSendQuote(q)}>
                                      <Send className="w-4 h-4 mr-2" />
                                      Send Quote
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-xs px-2 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-md min-h-[44px] min-w-[44px]">
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 sm:w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                  <DropdownMenuItem className="text-xs sm:text-sm" onClick={() => setContactAssigneeDialog({ open: true, quote: q })}>
                                    <Users className="w-4 h-4 mr-2" />
                                    Contact Assignee
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs sm:text-sm" onClick={() => handleConvertToOrder(q)}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Create Order
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quote Count Display */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 mb-6">
        <Card className="p-4 shadow-xl rounded-2xl bg-white/80 border-emerald-100">
          <div className="text-sm text-emerald-700 text-center">
            Showing {quotes.length} quotes total
          </div>
        </Card>
      </div>
      
      {/* Contact Assignee Dialog */}
      {contactAssigneeDialog.quote && (
        <MessageAssigneeDialog
          open={contactAssigneeDialog.open}
          onOpenChange={(open) => setContactAssigneeDialog({ open, quote: open ? contactAssigneeDialog.quote : null })}
          orderId={contactAssigneeDialog.quote.quoteNumber}
          assigneeName={contactAssigneeDialog.quote.assignee}
          assignee={contactAssigneeDialog.quote.assignee}
        />
      )}
    </div>
  );
} 