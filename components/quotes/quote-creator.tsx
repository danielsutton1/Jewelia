"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Search, Plus, Trash2, Edit, Eye, Download, Mail, FileText, Loader2, Settings } from "lucide-react"
import { format, addDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

// Types
interface QuoteItem {
  id: string
  type: "product" | "custom" | "service"
  name: string
  description: string
  image?: string
  sku?: string
  quantity: number
  unitPrice: number
  discount: number
  discountType: "percentage" | "amount"
  total: number
  options?: {
    tier1?: { description: string; price: number }
    tier2?: { description: string; price: number }
    tier3?: { description: string; price: number }
  }
  customWork?: {
    description: string
    laborHours: number
    laborRate: number
    materialsCost: number
  }
}

interface QuoteDetails {
  quoteNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  createdDate: Date
  validUntil: Date
  notes: string
  termsAndConditions: string
  selectedTier: "tier1" | "tier2" | "tier3"
  discountTotal: number
  subtotal: number
  tax: number
  taxRate: number
  total: number
  depositRequired: boolean
  depositAmount: number
  depositType: "percentage" | "amount"
  status: "draft" | "sent" | "accepted" | "declined" | "expired"
  customer_id?: string
  assignee?: string
}

interface CompanyBranding {
  companyName: string
  companyLogo: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyWebsite: string
  primaryColor: string
  accentColor: string
  fontFamily: string
}

// Sample custom work options
const customWorkOptions = [
  {
    id: "custom-001",
    type: "custom" as const,
    name: "Custom Ring Design",
    description: "Personalized ring design based on customer specifications",
    customWork: {
      description: "Custom design with client's stones",
      laborHours: 8,
      laborRate: 75,
      materialsCost: 350,
    },
    unitPrice: 950, // Base price
  },
  {
    id: "custom-002",
    type: "custom" as const,
    name: "Jewelry Modification",
    description: "Modify existing jewelry piece to customer specifications",
    customWork: {
      description: "Resize and modify existing piece",
      laborHours: 3,
      laborRate: 65,
      materialsCost: 120,
    },
    unitPrice: 315, // Base price
  },
]

// Sample services
const serviceOptions = [
  {
    id: "service-001",
    type: "service" as const,
    name: "Ring Sizing",
    description: "Professional ring sizing service",
    sku: "SRV-001",
    unitPrice: 45,
  },
  {
    id: "service-002",
    type: "service" as const,
    name: "Jewelry Cleaning",
    description: "Professional ultrasonic cleaning and polishing",
    sku: "SRV-002",
    unitPrice: 35,
  },
  {
    id: "service-003",
    type: "service" as const,
    name: "Appraisal Service",
    description: "Professional jewelry appraisal with documentation",
    sku: "SRV-003",
    unitPrice: 120,
  },
]

// Default company branding
const defaultBranding: CompanyBranding = {
  companyName: "Jewelia Fine Jewelry",
  companyLogo: "/abstract-geometric-shapes.png",
  companyAddress: "123 Luxury Lane, Beverly Hills, CA 90210",
  companyPhone: "(555) 123-4567",
  companyEmail: "sales@jeweliajewelry.com",
  companyWebsite: "www.jeweliajewelry.com",
  primaryColor: "#4f46e5", // Indigo
  accentColor: "#f59e0b", // Amber
  fontFamily: "Inter, sans-serif",
}

// Default terms and conditions
const defaultTermsAndConditions = `
1. QUOTE VALIDITY: This quote is valid for the period specified above. Prices may be subject to change after the validity period.

2. PAYMENT TERMS: A deposit as specified in this quote is required to proceed with the order. The balance is due upon completion of the work or before delivery.

3. CUSTOM WORK: Custom designs require approval of final sketches or CAD renderings before production begins. Once production has started, design changes may incur additional charges.

4. MATERIALS: Prices for precious metals and gemstones are subject to market fluctuations. Significant changes in material costs may affect the final price.

5. DELIVERY: Estimated delivery times are provided as a guide only and are not guaranteed. Delays due to material sourcing or complexity of work may occur.

6. CANCELLATION: Cancellation of custom orders after production has begun will incur charges based on work completed and materials used.

7. RETURNS: Custom-made items cannot be returned unless there is a manufacturing defect. Standard products may be returned within 14 days in original condition.

8. WARRANTY: All jewelry comes with a limited warranty against manufacturing defects for a period of one year from the date of purchase.
`

export function QuoteCreator({ initialQuoteDetails, initialQuoteItems }: { initialQuoteDetails?: Partial<QuoteDetails>, initialQuoteItems?: QuoteItem[] } = {}) {
  const router = useRouter()
  const { user, session } = useAuth()
  
  // State for quote items
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>(initialQuoteItems || [])

  // State for quote details
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails>({
    quoteNumber: initialQuoteDetails?.quoteNumber || `Q-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: initialQuoteDetails?.customerName || "",
    customerEmail: initialQuoteDetails?.customerEmail || "",
    customerPhone: initialQuoteDetails?.customerPhone || "",
    customerAddress: initialQuoteDetails?.customerAddress || "",
    createdDate: initialQuoteDetails?.createdDate || new Date(),
    validUntil: initialQuoteDetails?.validUntil || addDays(new Date(), 30),
    notes: initialQuoteDetails?.notes || "",
    termsAndConditions: initialQuoteDetails?.termsAndConditions || defaultTermsAndConditions,
    selectedTier: initialQuoteDetails?.selectedTier || "tier1",
    discountTotal: initialQuoteDetails?.discountTotal || 0,
    subtotal: initialQuoteDetails?.subtotal || 0,
    tax: initialQuoteDetails?.tax || 0,
    taxRate: initialQuoteDetails?.taxRate || 8.25, // Default tax rate
    total: initialQuoteDetails?.total || 0,
    depositRequired: initialQuoteDetails?.depositRequired ?? true,
    depositAmount: initialQuoteDetails?.depositAmount || 30, // Default 30%
    depositType: initialQuoteDetails?.depositType || "percentage",
    status: initialQuoteDetails?.status || "draft",
    customer_id: initialQuoteDetails?.customer_id,
  })

  // State for company branding
  const [branding, setBranding] = useState<CompanyBranding>(defaultBranding)

  // State for active tab
  const [activeTab, setActiveTab] = useState("items")

  // State for search query
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // State for customer search
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([])
  const [showCustomerSearchResults, setShowCustomerSearchResults] = useState(false)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  // Debounce the customer search query
  const debouncedCustomerSearch = useDebounce(customerSearchQuery, 300)

  // State for custom item being added
  const [customItem, setCustomItem] = useState({
    name: "",
    description: "",
    laborHours: 1,
    laborRate: 75,
    materialsCost: 0,
    // Jewelry-specific fields
    jewelryType: "",
    metalType: "",
    stoneType: "",
    stoneCount: 0,
    stoneWeight: 0,
    settingType: "",
    size: "",
    finish: "",
    engraving: "",
    rushOrder: false,
    complexity: "standard", // standard, complex, very-complex
    specialInstructions: "",
    // Diamond-specific fields
    diamondClarity: "",
    diamondColor: "",
    diamondCut: "",
    diamondShape: "",
    diamondCertification: "",
    diamondOrigin: "",
    diamondTreatment: "",
  })

  // State for digital signature
  const [signature, setSignature] = useState<string | null>(null)
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // State for quote analytics
  const [analytics, setAnalytics] = useState({
    totalQuotes: 0,
    acceptedQuotes: 0,
    conversionRate: 0,
    averageQuoteValue: 0,
  })

  // State for preview mode
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoadingExistingQuote, setIsLoadingExistingQuote] = useState(false)

  // State for save loading
  const [isSaving, setIsSaving] = useState(false)

  // Load existing quote if quoteId is provided in URL, or handle URL parameters for new quotes
  useEffect(() => {
    const loadExistingQuote = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const quoteId = urlParams.get('quoteId')
      
      if (quoteId) {
        setIsLoadingExistingQuote(true)
        try {
          console.log('🔍 Loading existing quote with quoteId:', quoteId)
          console.log('🔍 Making API request to:', `/api/quotes?search=${quoteId}`)
          
          const response = await fetch(`/api/quotes?search=${quoteId}`)
          console.log('🔍 Load response status:', response.status)
          console.log('🔍 Load response ok:', response.ok)
          
          const result = await response.json()
          
          console.log('🔍 API response:', result)
          
          if (result.success && result.data.length > 0) {
            const quote = result.data[0]
            console.log('✅ Found existing quote:', quote)
            
            // Set edit mode when loading existing quote
            setIsEditMode(true)
            
            // Update quote details
            setQuoteDetails(prev => ({
              ...prev,
              quoteNumber: quote.quote_number,
              customerName: quote.customer_details?.full_name || quote.customer || quote.customer_name || '',
              customerEmail: quote.customer_details?.email || quote.customer_email || '',
              customerPhone: quote.customer_phone || '',
              customerAddress: quote.customer_address || '',
              createdDate: new Date(quote.created_at),
              validUntil: new Date(quote.valid_until),
              notes: quote.notes || '',
              status: quote.status || 'draft',
              customer_id: quote.customer_id,
              total: quote.total_amount || quote.total || 0,
              subtotal: quote.subtotal || (quote.total_amount || quote.total || 0),
              tax: quote.tax_amount || 0,
              taxRate: quote.tax_rate || 8.25,
              discountTotal: quote.discount_total || 0,
              depositRequired: quote.deposit_required ?? true,
              depositAmount: quote.deposit_amount || 30,
              depositType: quote.deposit_type || 'percentage',
              selectedTier: quote.selected_tier || 'tier1',
              termsAndConditions: quote.terms_and_conditions || defaultTermsAndConditions,
            }))
            
            // Load quote items if they exist
            console.log('🔍 Checking for quote items:', quote.items)
            console.log('🔍 Items type:', typeof quote.items)
            console.log('🔍 Items is array:', Array.isArray(quote.items))
            console.log('🔍 Items length:', quote.items?.length)
            
            if (quote.items && Array.isArray(quote.items) && quote.items.length > 0) {
              console.log('✅ Loaded quote items from items array:', quote.items)
              setQuoteItems(quote.items)
            } else if (quote.item && typeof quote.item === 'string' && quote.item !== 'N/A') {
              // If we have a single item as a string, create a quote item from it
              const singleItem: QuoteItem = {
                id: `item-${Date.now()}`,
                type: 'custom',
                name: quote.item,
                description: quote.item,
                quantity: 1,
                unitPrice: quote.total_amount || quote.total || 0,
                discount: 0,
                discountType: 'amount',
                total: quote.total_amount || quote.total || 0,
              }
              setQuoteItems([singleItem])
              console.log('✅ Created single quote item from item string:', singleItem)
            } else {
              console.log('❌ No quote items found in saved quote')
              setQuoteItems([])
            }
          } else {
            console.log('❌ Quote not found in API response, checking for URL parameters')
            console.log('❌ API returned data length:', result.data?.length || 0)
            
            // Try searching by quote number instead of quoteId
            console.log('🔍 Trying alternative search by quote number:', quoteId)
            const altResponse = await fetch(`/api/quotes?search=${quoteId}`)
            const altResult = await altResponse.json()
            
            if (altResult.success && altResult.data.length > 0) {
              console.log('✅ Found quote with alternative search:', altResult.data[0])
              const quote = altResult.data[0]
              
              // Set edit mode when loading existing quote
              setIsEditMode(true)
              
              // Update quote details
              setQuoteDetails(prev => ({
                ...prev,
                quoteNumber: quote.quote_number,
                customerName: quote.customer_details?.full_name || quote.customer || quote.customer_name || '',
                customerEmail: quote.customer_details?.email || quote.customer_email || '',
                customerPhone: quote.customer_phone || '',
                customerAddress: quote.customer_address || '',
                createdDate: new Date(quote.created_at),
                validUntil: new Date(quote.valid_until),
                notes: quote.notes || '',
                status: quote.status || 'draft',
                customer_id: quote.customer_id,
                total: quote.total_amount || quote.total || 0,
                subtotal: quote.subtotal || (quote.total_amount || quote.total || 0),
                tax: quote.tax_amount || 0,
                taxRate: quote.tax_rate || 8.25,
                discountTotal: quote.discount_total || 0,
                depositRequired: quote.deposit_required ?? true,
                depositAmount: quote.deposit_amount || 30,
                depositType: quote.deposit_type || 'percentage',
                selectedTier: quote.selected_tier || 'tier1',
                termsAndConditions: quote.terms_and_conditions || defaultTermsAndConditions,
              }))
              
              // Load quote items if they exist
              if (quote.items && Array.isArray(quote.items) && quote.items.length > 0) {
                console.log('✅ Loaded quote items from items array:', quote.items)
                setQuoteItems(quote.items)
              } else if (quote.item && typeof quote.item === 'string' && quote.item !== 'N/A') {
                const singleItem: QuoteItem = {
                  id: `item-${Date.now()}`,
                  type: 'custom',
                  name: quote.item,
                  description: quote.item,
                  quantity: 1,
                  unitPrice: quote.total_amount || quote.total || 0,
                  discount: 0,
                  discountType: 'amount',
                  total: quote.total_amount || quote.total || 0,
                }
                setQuoteItems([singleItem])
                console.log('✅ Created single quote item from item string:', singleItem)
              } else {
                console.log('❌ No quote items found in saved quote')
                setQuoteItems([])
              }
            } else {
              // If quote not found, check if we have URL parameters for a new quote
              const customerName = urlParams.get('customerName')
              const notes = urlParams.get('notes')
              const assignee = urlParams.get('assignee')
              
              if (customerName || notes || assignee) {
                console.log('📝 Found URL parameters for new quote:', { customerName, notes, assignee })
                // Update quote details with URL parameters
                setQuoteDetails(prev => ({
                  ...prev,
                  customerName: customerName || prev.customerName,
                  notes: notes || prev.notes,
                  // Note: assignee is not part of QuoteDetails interface, so we'll handle it separately
                }))
              } else {
                console.log('❌ No URL parameters found either. Quote may not exist.')
              }
            }
          }
        } catch (error: any) {
          console.error('❌ Error loading existing quote:', error)
          console.error('❌ Error details:', error.message)
          
          // Fallback to URL parameters if API call fails
          const customerName = urlParams.get('customerName')
          const notes = urlParams.get('notes')
          const assignee = urlParams.get('assignee')
          
          if (customerName || notes || assignee) {
            console.log('📝 Using URL parameters as fallback:', { customerName, notes, assignee })
            setQuoteDetails(prev => ({
              ...prev,
              customerName: customerName || prev.customerName,
              notes: notes || prev.notes,
            }))
          } else {
            console.log('❌ No fallback parameters available')
          }
        } finally {
          setIsLoadingExistingQuote(false)
        }
      } else {
        // No quoteId, check for URL parameters for new quote
        const customerName = urlParams.get('customerName')
        const notes = urlParams.get('notes')
        const assignee = urlParams.get('assignee')
        
        if (customerName || notes || assignee) {
          console.log('Found URL parameters for new quote:', { customerName, notes, assignee })
          setQuoteDetails(prev => ({
            ...prev,
            customerName: customerName || prev.customerName,
            notes: notes || prev.notes,
          }))
        }
      }
    }
    
    loadExistingQuote()
  }, [])

  // Fetch products from API
  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      // The API returns { success: true, data: { products: [], total, page, etc } }
      // So we need to access data.data.products
      setProducts(data.data?.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
      setProducts([]) // Ensure products is always an array
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Fetch next quote number from API
  const fetchNextQuoteNumber = async () => {
    try {
      const response = await fetch("/api/quotes/next-number")
      if (!response.ok) {
        throw new Error("Failed to fetch next quote number")
      }
      const data = await response.json()
      if (data.success && data.data?.nextQuoteNumber) {
        setQuoteDetails(prev => ({
          ...prev,
          quoteNumber: data.data.nextQuoteNumber
        }))
      }
    } catch (error) {
      console.error("Error fetching next quote number:", error)
      // Fallback to default format if API fails
      const fallbackNumber = `Q-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      setQuoteDetails(prev => ({
        ...prev,
        quoteNumber: fallbackNumber
      }))
    }
  }

  // Search for customers
  const searchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomerSearchResults([])
      setShowCustomerSearchResults(false)
      return
    }

    console.log('🔍 Searching for customers with query:', query)
    setIsLoadingCustomers(true)
    try {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch customers")
      }
      const data = await response.json()
      console.log('📋 Customer search results:', data)
      if (data.success) {
        console.log('✅ Found customers:', data.data?.length || 0)
        setCustomerSearchResults(data.data || [])
        setShowCustomerSearchResults(true)
      } else {
        console.log('❌ Search failed:', data.error)
      }
    } catch (error) {
      console.error("❌ Error searching customers:", error)
      toast.error("Failed to search customers")
      setCustomerSearchResults([])
    } finally {
      setIsLoadingCustomers(false)
    }
  }

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer)
    setQuoteDetails(prev => ({
      ...prev,
      customerName: customer.full_name || customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      customerAddress: customer.address || '',
      customer_id: customer.id
    }))
    setCustomerSearchQuery(customer.full_name || customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim())
    setShowCustomerSearchResults(false)
    setCustomerSearchResults([])
  }

  // Handle customer search input change
  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomerSearchQuery(value)
    setQuoteDetails(prev => ({ ...prev, customerName: value }))
    
    // Show dropdown immediately when user starts typing
    if (value.trim()) {
      setShowCustomerSearchResults(true)
    } else {
      setShowCustomerSearchResults(false)
    }
  }

  // Handle customer search input focus
  const handleCustomerSearchFocus = () => {
    if (customerSearchQuery.trim() && customerSearchResults.length > 0) {
      setShowCustomerSearchResults(true)
    }
  }

  // Create new customer
  const createNewCustomer = async () => {
    if (!customerSearchQuery.trim()) {
      toast.error("Please enter a customer name")
      return
    }

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: customerSearchQuery,
          email: quoteDetails.customerEmail,
          phone: quoteDetails.customerPhone,
          address: quoteDetails.customerAddress,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create customer")
      }

      const data = await response.json()
      if (data.success) {
        const newCustomer = data.data
        handleCustomerSelect(newCustomer)
        toast.success("Customer created successfully")
      }
    } catch (error) {
      console.error("Error creating customer:", error)
      toast.error("Failed to create customer")
    }
  }

  // Load products and next quote number on component mount
  useEffect(() => {
    fetchProducts()
    fetchNextQuoteNumber()
  }, [])

  // Trigger customer search when debounced query changes
  useEffect(() => {
    if (debouncedCustomerSearch.trim()) {
      searchCustomers(debouncedCustomerSearch)
    } else {
      setCustomerSearchResults([])
      setShowCustomerSearchResults(false)
    }
  }, [debouncedCustomerSearch])

  // Handle click outside to close customer search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.customer-search-container')) {
        setShowCustomerSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Recalculate totals whenever quoteItems changes, but not when loading existing quote
  useEffect(() => {
    // Only recalculate if we're not loading an existing quote
    if (!isLoadingExistingQuote) {
      calculateTotals()
    }
  }, [quoteItems, isLoadingExistingQuote])

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0
    let discountTotal = 0

    quoteItems.forEach((item) => {
      // Use the item's total property instead of recalculating
      const itemTotal = item.total
      let itemDiscount = 0

      if (item.discountType === "percentage") {
        itemDiscount = (itemTotal * item.discount) / 100
      } else {
        itemDiscount = item.discount
      }

      subtotal += itemTotal
      discountTotal += itemDiscount
    })

    const tax = ((subtotal - discountTotal) * quoteDetails.taxRate) / 100
    const total = subtotal - discountTotal + tax

    setQuoteDetails((prev) => ({
      ...prev,
      subtotal,
      discountTotal,
      tax,
      total,
    }))
  }

  // Handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Ensure products is an array before mapping
    const productsArray = Array.isArray(products) ? products : []

    const allItems = [
      ...productsArray.map(product => ({
        ...product,
        type: "product" as const,
        unitPrice: product.price,
        description: `${product.category} - ${product.name}`
      })),
      ...customWorkOptions,
      ...serviceOptions
    ]
    
    const results = allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        ('sku' in item && item.sku && item.sku.toLowerCase().includes(query.toLowerCase())),
    )

    setSearchResults(results)
    setShowSearchResults(true)
  }

  // Add item to quote
  const addItemToQuote = (item: any) => {
    const newItem: QuoteItem = {
      id: item.id,
      type: item.type,
      name: item.name,
      description: item.description,
      image: item.image || undefined,
      sku: item.sku || undefined,
      quantity: 1,
      unitPrice: item.unitPrice,
      discount: 0,
      discountType: "percentage",
      total: item.unitPrice, // This should be quantity * unitPrice
      customWork: item.type === "custom" ? { ...item.customWork } : undefined,
      options: {
        tier1: { description: "Standard", price: item.unitPrice },
        tier2: { description: "Premium", price: Math.round(item.unitPrice * 1.2 * 100) / 100 },
        tier3: { description: "Luxury", price: Math.round(item.unitPrice * 1.5 * 100) / 100 },
      },
    }

    setQuoteItems([...quoteItems, newItem])
    setShowSearchResults(false)
    setSearchQuery("")

    // Recalculate totals is now handled by useEffect
  }

  // Add custom item
  const addCustomItemToQuote = () => {
    if (!customItem.name) return

    // Calculate base labor cost
    let laborCost = customItem.laborHours * customItem.laborRate
    
    // Apply complexity multiplier
    const complexityMultiplier = {
      'standard': 1,
      'complex': 1.3,
      'very-complex': 1.6
    }[customItem.complexity] || 1
    
    laborCost *= complexityMultiplier
    
    // Apply rush order surcharge
    if (customItem.rushOrder) {
      laborCost *= 1.25
    }
    
    const totalPrice = laborCost + customItem.materialsCost

    // Create comprehensive description
    const descriptionParts = []
    if (customItem.jewelryType) descriptionParts.push(`${customItem.jewelryType.charAt(0).toUpperCase() + customItem.jewelryType.slice(1)}`)
    if (customItem.metalType) descriptionParts.push(customItem.metalType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
    if (customItem.stoneType && customItem.stoneType !== 'none') {
      const stoneDesc = customItem.stoneCount > 1 
        ? `${customItem.stoneCount} ${customItem.stoneType}s`
        : customItem.stoneType
      descriptionParts.push(stoneDesc)
      if (customItem.stoneWeight > 0) descriptionParts.push(`${customItem.stoneWeight}ct`)
      
      // Add diamond-specific specifications
      if (customItem.stoneType === 'diamond') {
        const diamondSpecs = []
        if (customItem.diamondClarity) diamondSpecs.push(`Clarity: ${customItem.diamondClarity}`)
        if (customItem.diamondColor) diamondSpecs.push(`Color: ${customItem.diamondColor}`)
        if (customItem.diamondCut) diamondSpecs.push(`Cut: ${customItem.diamondCut}`)
        if (customItem.diamondShape) diamondSpecs.push(`Shape: ${customItem.diamondShape}`)
        if (customItem.diamondCertification && customItem.diamondCertification !== 'none') diamondSpecs.push(`Cert: ${customItem.diamondCertification}`)
        if (customItem.diamondOrigin && customItem.diamondOrigin !== 'unknown') diamondSpecs.push(`Origin: ${customItem.diamondOrigin}`)
        if (customItem.diamondTreatment && customItem.diamondTreatment !== 'none') diamondSpecs.push(`Treatment: ${customItem.diamondTreatment}`)
        
        if (diamondSpecs.length > 0) {
          descriptionParts.push(`Diamond: ${diamondSpecs.join(', ')}`)
        }
      }
    }
    if (customItem.settingType && customItem.settingType !== 'none') descriptionParts.push(`${customItem.settingType} setting`)
    if (customItem.size) descriptionParts.push(`Size: ${customItem.size}`)
    if (customItem.finish) descriptionParts.push(`${customItem.finish} finish`)
    if (customItem.engraving) descriptionParts.push(`Engraved: "${customItem.engraving}"`)
    if (customItem.complexity !== 'standard') descriptionParts.push(`${customItem.complexity} complexity`)
    if (customItem.rushOrder) descriptionParts.push('Rush order')
    
    const comprehensiveDescription = descriptionParts.join(' • ')
    const finalDescription = customItem.description 
      ? `${customItem.description} | ${comprehensiveDescription}`
      : comprehensiveDescription

    const newItem: QuoteItem = {
      id: `custom-${Date.now()}`,
      type: "custom",
      name: customItem.name,
      description: finalDescription,
      quantity: 1,
      unitPrice: totalPrice,
      discount: 0,
      discountType: "percentage",
      total: totalPrice,
      customWork: {
        description: finalDescription,
        laborHours: customItem.laborHours,
        laborRate: customItem.laborRate,
        materialsCost: customItem.materialsCost,
      },
      options: {
        tier1: { description: "Standard", price: totalPrice },
        tier2: { description: "Premium", price: Math.round(totalPrice * 1.2 * 100) / 100 },
        tier3: { description: "Luxury", price: Math.round(totalPrice * 1.5 * 100) / 100 },
      },
    }

    setQuoteItems([...quoteItems, newItem])

    // Reset custom item form
    setCustomItem({
      name: "",
      description: "",
      laborHours: 1,
      laborRate: 75,
      materialsCost: 0,
      // Jewelry-specific fields
      jewelryType: "",
      metalType: "",
      stoneType: "",
      stoneCount: 0,
      stoneWeight: 0,
      settingType: "",
      size: "",
      finish: "",
      engraving: "",
      rushOrder: false,
      complexity: "standard",
      specialInstructions: "",
      // Diamond-specific fields
      diamondClarity: "",
      diamondColor: "",
      diamondCut: "",
      diamondShape: "",
      diamondCertification: "",
      diamondOrigin: "",
      diamondTreatment: "",
    })

    // Recalculate totals is now handled by useEffect
  }

  // Remove item from quote
  const removeItem = (itemId: string) => {
    setQuoteItems(quoteItems.filter((item) => item.id !== itemId))

    // Recalculate totals is now handled by useEffect
  }

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return

    const updatedItems = quoteItems.map((item) => {
      if (item.id === itemId) {
        const newItem = { ...item, quantity }
        newItem.total = newItem.quantity * newItem.unitPrice
        return newItem
      }
      return item
    })

    setQuoteItems(updatedItems)

    // Recalculate totals is now handled by useEffect
  }

  // Update item discount
  const updateItemDiscount = (itemId: string, discount: number, discountType: "percentage" | "amount") => {
    const updatedItems = quoteItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, discount, discountType }
      }
      return item
    })

    setQuoteItems(updatedItems)

    // Recalculate totals is now handled by useEffect
  }

  // Handle signature start
  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect()
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  // Handle signature drawing
  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect()
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.strokeStyle = "#000"

      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  // Handle signature end
  const handleSignatureEnd = () => {
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (canvas) {
      setSignature(canvas.toDataURL())
    }
  }

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setSignature(null)
    }
  }

  // Save signature
  const saveSignature = () => {
    setShowSignatureDialog(false)
  }

  // Generate PDF
  const generatePDF = () => {
    toast.success("PDF generation started")
    // PDF generation logic would go here
  }

  // Send quote email
  const sendQuoteEmail = () => {
    toast.success("Quote email sent")
    // Email sending logic would go here
  }

  // Convert to order
  const convertToOrder = () => {
    toast.success("Quote converted to order")
    // Order conversion logic would go here
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Calculate deposit
  const calculateDeposit = () => {
    if (quoteDetails.depositType === "percentage") {
      return (quoteDetails.total * quoteDetails.depositAmount) / 100
    }
    return quoteDetails.depositAmount
  }

  // Toggle preview mode
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  // Check if form fields should be disabled (when viewing existing quote but not in edit mode)
  const isFieldDisabled = (fieldName: string) => {
    // Always allow editing in edit mode
    if (isEditMode) return false
    
    // When viewing existing quote, disable most fields except for viewing
    const viewOnlyFields = ['quoteNumber', 'createdDate'] // These are always read-only
    return viewOnlyFields.includes(fieldName)
  }

  // Save quote
  async function handleSaveQuote() {
    if (isSaving) return; // Prevent multiple saves
    
    // Check if user is authenticated (but don't redirect for now)
    if (!user || !session) {
      console.log('User not authenticated, but continuing with quote save...');
      // Don't redirect to login for now - let the API handle it
    }
    
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!quoteDetails.customerName) {
        toast.error("Customer name is required")
        return
      }

      if (quoteItems.length === 0) {
        toast.error("At least one item is required")
        return
      }

      // Check if this is an existing quote (check URL for quoteId)
      const urlParams = new URLSearchParams(window.location.search)
      const quoteId = urlParams.get('quoteId')
      const isExistingQuote = !!quoteId

      // Generate a proper quote number
      let finalQuoteNumber = quoteDetails.quoteNumber
      if (!finalQuoteNumber || finalQuoteNumber === 'Q-0000-000') {
        const currentYear = new Date().getFullYear()
        const nextNumber = Math.max(1, ...(global.mutableMockQuotes || []).map(q => {
          const match = q.quoteNumber.match(new RegExp(`Q-${currentYear}-(\\d+)`))
          return match ? parseInt(match[1]) : 0
        })) + 1
        finalQuoteNumber = `Q-${currentYear}-${String(nextNumber).padStart(3, '0')}`
      }
      
      console.log('🔍 Final quote number:', finalQuoteNumber)
      console.log('🔍 Is existing quote:', isExistingQuote)
      console.log('🔍 Quote ID from URL:', quoteId)

      // Prepare quote data - only include fields that exist in the database schema
      console.log('🔍 Saving quote items:', quoteItems)
      console.log('🔍 Quote items JSON:', JSON.stringify(quoteItems))
      
      const quoteData = {
        quote_number: finalQuoteNumber,
        customer_id: null, // Set to null since we don't have a valid UUID
        total_amount: quoteDetails.total,
                      budget: quoteDetails.total, // Include budget field for new quotes
        status: 'draft', // Set status as draft when saving
        description: `Quote for ${quoteDetails.customerName}`,
        valid_until: quoteDetails.validUntil.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        notes: quoteDetails.notes,
        items: JSON.stringify(quoteItems), // Store items as JSONB
        customer_name: quoteDetails.customerName,
        assignee: quoteDetails.assignee || 'Unassigned',
        created_at: quoteDetails.createdDate.toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Saving quote with data:', quoteData)
      console.log('Is existing quote:', isExistingQuote)
      console.log('Using quote number:', finalQuoteNumber)

      // Save to database - use PUT for existing quotes, POST for new quotes
      const response = await fetch('/api/quotes', {
        method: isExistingQuote ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quoteData,
          quote_id: isExistingQuote ? quoteId : undefined, // Include quote_id for updates
        }),
      })

      console.log('🔍 Save response status:', response.status)
      console.log('🔍 Save response ok:', response.ok)

      if (!response.ok) {
        let errorMessage = 'Failed to save quote'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          console.error('Error parsing response:', parseError)
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      let result
      try {
        result = await response.json()
        console.log('API response:', result)
      } catch (parseError) {
        console.error('Error parsing API response:', parseError)
        throw new Error('Invalid response from server')
      }

      if (result && result.success) {
        const message = isExistingQuote ? "Quote updated successfully!" : "Quote saved successfully!"
        toast.success(`${message} Quote can now be viewed on the quotes page.`)
        console.log('Quote saved:', result.data)
        console.log('Quote number:', finalQuoteNumber)
        
        // Redirect to quotes page after successful save
        setTimeout(() => {
          router.push('/dashboard/quotes')
        }, 2000)
      } else {
        // Handle any remaining errors
        throw new Error(result.error || result.message || 'Failed to save quote')
      }

    } catch (error: any) {
      console.error('Error saving quote:', error)
      
      // If it's a table setup error, offer to set up the table
      if (error.message.includes('Quotes system not available') || error.message.includes('table does not exist')) {
        toast.error("Quotes system needs setup. Click 'Setup Quotes' to create the required database table.")
      } else {
        toast.error(error.message || "Failed to save quote")
      }
    } finally {
      setIsSaving(false);
    }
  }

  // Setup quotes table manually
  async function setupQuotesTable() {
    try {
      const response = await fetch('/api/setup-quotes-table', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Quotes table created successfully! You can now save quotes.")
      } else {
        toast.error(result.error || "Failed to setup quotes table")
      }
    } catch (error: any) {
      console.error('Error setting up quotes table:', error)
      toast.error("Failed to setup quotes table")
    }
  }

  if (isPreviewMode) {
    return (
      <QuotePreview
        quoteItems={quoteItems}
        quoteDetails={quoteDetails}
        branding={branding}
        signature={signature}
        onExitPreview={togglePreviewMode}
        onGeneratePDF={generatePDF}
        onSendEmail={sendQuoteEmail}
        onConvertToOrder={convertToOrder}
      />
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Quote' : 'Create Quote'}
          </h1>
          <p className="text-muted-foreground">Quote #{quoteDetails.quoteNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={setupQuotesTable}>
            <Settings className="mr-2 h-4 w-4" />
            Setup Quotes
          </Button>
          <Button variant="outline" onClick={togglePreviewMode}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          {!isEditMode && (
            <Button variant="outline" onClick={() => setIsEditMode(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Quote
            </Button>
          )}
          <Button onClick={handleSaveQuote} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                {isEditMode ? 'Update Quote' : 'Save Quote'}
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">Quote Items</TabsTrigger>
          <TabsTrigger value="details">Quote Details</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="signature">Signature</TabsTrigger>
        </TabsList>

        {/* Quote Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, services, or custom work..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {showSearchResults && (
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading products...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                          onClick={() => addItemToQuote(item)}
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(item.unitPrice)}</div>
                            <Badge variant="outline">{item.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No items found</p>
                  )}
                </div>
              )}

              {/* Custom Item Form */}
              <div className="border rounded-lg p-6">
                <h3 className="font-medium mb-6 text-lg">Add Custom Jewelry Item</h3>
                
                {/* Basic Information */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customName">Item Name</Label>
                      <Input
                        id="customName"
                        value={customItem.name}
                        onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                        placeholder="e.g., Custom Engagement Ring, Wedding Band"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jewelryType">Jewelry Type</Label>
                      <Select
                        value={customItem.jewelryType}
                        onValueChange={(value) => setCustomItem({ ...customItem, jewelryType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select jewelry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ring">Ring</SelectItem>
                          <SelectItem value="necklace">Necklace</SelectItem>
                          <SelectItem value="bracelet">Bracelet</SelectItem>
                          <SelectItem value="earrings">Earrings</SelectItem>
                          <SelectItem value="pendant">Pendant</SelectItem>
                          <SelectItem value="watch">Watch</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Materials & Stones */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Materials & Stones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="metalType">Metal Type</Label>
                      <Select
                        value={customItem.metalType}
                        onValueChange={(value) => setCustomItem({ ...customItem, metalType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select metal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="14k-yellow-gold">14K Yellow Gold</SelectItem>
                          <SelectItem value="14k-white-gold">14K White Gold</SelectItem>
                          <SelectItem value="14k-rose-gold">14K Rose Gold</SelectItem>
                          <SelectItem value="18k-yellow-gold">18K Yellow Gold</SelectItem>
                          <SelectItem value="18k-white-gold">18K White Gold</SelectItem>
                          <SelectItem value="18k-rose-gold">18K Rose Gold</SelectItem>
                          <SelectItem value="24k-yellow-gold">24K Yellow Gold</SelectItem>
                          <SelectItem value="24k-white-gold">24K White Gold</SelectItem>
                          <SelectItem value="24k-rose-gold">24K Rose Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                          <SelectItem value="palladium">Palladium</SelectItem>
                          <SelectItem value="sterling-silver">Sterling Silver</SelectItem>
                          <SelectItem value="titanium">Titanium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stoneType">Stone Type</Label>
                      <Select
                        value={customItem.stoneType}
                        onValueChange={(value) => setCustomItem({ ...customItem, stoneType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diamond">Diamond</SelectItem>
                          <SelectItem value="ruby">Ruby</SelectItem>
                          <SelectItem value="sapphire">Sapphire</SelectItem>
                          <SelectItem value="emerald">Emerald</SelectItem>
                          <SelectItem value="pearl">Pearl</SelectItem>
                          <SelectItem value="opal">Opal</SelectItem>
                          <SelectItem value="amethyst">Amethyst</SelectItem>
                          <SelectItem value="aquamarine">Aquamarine</SelectItem>
                          <SelectItem value="none">No Stones</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stoneCount">Number of Stones</Label>
                      <Input
                        id="stoneCount"
                        type="number"
                        value={customItem.stoneCount}
                        onChange={(e) => setCustomItem({ ...customItem, stoneCount: Number(e.target.value) })}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Diamond-specific options - only show when diamond is selected */}
                  {customItem.stoneType === "diamond" && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-4 text-sm text-blue-800 uppercase tracking-wide">Diamond Specifications</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="diamondClarity">Clarity</Label>
                          <Select
                            value={customItem.diamondClarity}
                            onValueChange={(value) => setCustomItem({ ...customItem, diamondClarity: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select clarity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FL">FL (Flawless)</SelectItem>
                              <SelectItem value="IF">IF (Internally Flawless)</SelectItem>
                              <SelectItem value="VVS1">VVS1 (Very Very Slightly Included 1)</SelectItem>
                              <SelectItem value="VVS2">VVS2 (Very Very Slightly Included 2)</SelectItem>
                              <SelectItem value="VS1">VS1 (Very Slightly Included 1)</SelectItem>
                              <SelectItem value="VS2">VS2 (Very Slightly Included 2)</SelectItem>
                              <SelectItem value="SI1">SI1 (Slightly Included 1)</SelectItem>
                              <SelectItem value="SI2">SI2 (Slightly Included 2)</SelectItem>
                              <SelectItem value="I1">I1 (Included 1)</SelectItem>
                              <SelectItem value="I2">I2 (Included 2)</SelectItem>
                              <SelectItem value="I3">I3 (Included 3)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="diamondColor">Color</Label>
                          <Select
                            value={customItem.diamondColor}
                            onValueChange={(value) => setCustomItem({ ...customItem, diamondColor: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="D">D (Colorless)</SelectItem>
                              <SelectItem value="E">E (Colorless)</SelectItem>
                              <SelectItem value="F">F (Colorless)</SelectItem>
                              <SelectItem value="G">G (Near Colorless)</SelectItem>
                              <SelectItem value="H">H (Near Colorless)</SelectItem>
                              <SelectItem value="I">I (Near Colorless)</SelectItem>
                              <SelectItem value="J">J (Near Colorless)</SelectItem>
                              <SelectItem value="K">K (Faint Yellow)</SelectItem>
                              <SelectItem value="L">L (Faint Yellow)</SelectItem>
                              <SelectItem value="M">M (Faint Yellow)</SelectItem>
                              <SelectItem value="N">N (Very Light Yellow)</SelectItem>
                              <SelectItem value="O">O (Very Light Yellow)</SelectItem>
                              <SelectItem value="P">P (Very Light Yellow)</SelectItem>
                              <SelectItem value="Q">Q (Very Light Yellow)</SelectItem>
                              <SelectItem value="R">R (Very Light Yellow)</SelectItem>
                              <SelectItem value="S-Z">S-Z (Light Yellow)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="diamondCut">Cut</Label>
                          <Select
                            value={customItem.diamondCut}
                            onValueChange={(value) => setCustomItem({ ...customItem, diamondCut: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select cut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="very-good">Very Good</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="diamondShape">Shape</Label>
                          <Select
                            value={customItem.diamondShape}
                            onValueChange={(value) => setCustomItem({ ...customItem, diamondShape: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select shape" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="round">Round Brilliant</SelectItem>
                              <SelectItem value="princess">Princess</SelectItem>
                              <SelectItem value="cushion">Cushion</SelectItem>
                              <SelectItem value="oval">Oval</SelectItem>
                              <SelectItem value="emerald">Emerald</SelectItem>
                              <SelectItem value="asscher">Asscher</SelectItem>
                              <SelectItem value="marquise">Marquise</SelectItem>
                              <SelectItem value="pear">Pear</SelectItem>
                              <SelectItem value="radiant">Radiant</SelectItem>
                              <SelectItem value="heart">Heart</SelectItem>
                              <SelectItem value="trillion">Trillion</SelectItem>
                              <SelectItem value="baguette">Baguette</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="diamondCertification">Certification</Label>
                          <Select
                            value={customItem.diamondCertification}
                            onValueChange={(value) => setCustomItem({ ...customItem, diamondCertification: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select certification" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GIA">GIA (Gemological Institute of America)</SelectItem>
                              <SelectItem value="IGI">IGI (International Gemological Institute)</SelectItem>
                              <SelectItem value="AGS">AGS (American Gem Society)</SelectItem>
                              <SelectItem value="GCAL">GCAL (Gem Certification & Assurance Lab)</SelectItem>
                              <SelectItem value="HRD">HRD (Hoge Raad voor Diamant)</SelectItem>
                              <SelectItem value="none">No Certification</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="diamondOrigin">Origin</Label>
                          <Select
                            value={customItem.diamondOrigin}
                            onValueChange={(value) => setCustomItem({ ...customItem, diamondOrigin: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select origin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="botswana">Botswana</SelectItem>
                              <SelectItem value="russia">Russia</SelectItem>
                              <SelectItem value="canada">Canada</SelectItem>
                              <SelectItem value="south-africa">South Africa</SelectItem>
                              <SelectItem value="namibia">Namibia</SelectItem>
                              <SelectItem value="angola">Angola</SelectItem>
                              <SelectItem value="australia">Australia</SelectItem>
                              <SelectItem value="brazil">Brazil</SelectItem>
                              <SelectItem value="china">China</SelectItem>
                              <SelectItem value="india">India</SelectItem>
                              <SelectItem value="unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="diamondTreatment">Treatment</Label>
                          <Select
                            value={customItem.diamondTreatment}
                            onValueChange={(value) => setCustomItem({ ...customItem, diamondTreatment: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select treatment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Treatment</SelectItem>
                              <SelectItem value="laser-drilling">Laser Drilling</SelectItem>
                              <SelectItem value="fracture-filling">Fracture Filling</SelectItem>
                              <SelectItem value="irradiation">Irradiation</SelectItem>
                              <SelectItem value="annealing">Annealing</SelectItem>
                              <SelectItem value="coating">Coating</SelectItem>
                              <SelectItem value="high-pressure-high-temperature">HPHT</SelectItem>
                              <SelectItem value="chemical-vapor-deposition">CVD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="stoneWeight">Total Stone Weight (ct)</Label>
                      <Input
                        id="stoneWeight"
                        type="number"
                        value={customItem.stoneWeight}
                        onChange={(e) => setCustomItem({ ...customItem, stoneWeight: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="settingType">Setting Type</Label>
                      <Select
                        value={customItem.settingType}
                        onValueChange={(value) => setCustomItem({ ...customItem, settingType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select setting" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prong">Prong</SelectItem>
                          <SelectItem value="bezel">Bezel</SelectItem>
                          <SelectItem value="pave">Pavé</SelectItem>
                          <SelectItem value="channel">Channel</SelectItem>
                          <SelectItem value="flush">Flush</SelectItem>
                          <SelectItem value="tension">Tension</SelectItem>
                          <SelectItem value="none">No Setting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="size">Size</Label>
                      <Input
                        id="size"
                        value={customItem.size}
                        onChange={(e) => setCustomItem({ ...customItem, size: e.target.value })}
                        placeholder="e.g., 7.5, 18mm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="finish">Finish</Label>
                      <Select
                        value={customItem.finish}
                        onValueChange={(value) => setCustomItem({ ...customItem, finish: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select finish" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="polished">Polished</SelectItem>
                          <SelectItem value="brushed">Brushed</SelectItem>
                          <SelectItem value="hammered">Hammered</SelectItem>
                          <SelectItem value="matte">Matte</SelectItem>
                          <SelectItem value="satin">Satin</SelectItem>
                          <SelectItem value="textured">Textured</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="complexity">Complexity Level</Label>
                      <Select
                        value={customItem.complexity}
                        onValueChange={(value) => setCustomItem({ ...customItem, complexity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="complex">Complex</SelectItem>
                          <SelectItem value="very-complex">Very Complex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Customization */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Customization</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="engraving">Engraving</Label>
                      <Input
                        id="engraving"
                        value={customItem.engraving}
                        onChange={(e) => setCustomItem({ ...customItem, engraving: e.target.value })}
                        placeholder="e.g., Forever & Always, 12.25.2024"
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialInstructions">Special Instructions</Label>
                      <Textarea
                        id="specialInstructions"
                        value={customItem.specialInstructions}
                        onChange={(e) => setCustomItem({ ...customItem, specialInstructions: e.target.value })}
                        placeholder="Any special requirements, design notes, or customer preferences..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Labor */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Pricing & Labor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="laborHours">Labor Hours</Label>
                      <Input
                        id="laborHours"
                        type="number"
                        value={customItem.laborHours}
                        onChange={(e) => setCustomItem({ ...customItem, laborHours: Number(e.target.value) })}
                        min="0"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
                      <Input
                        id="laborRate"
                        type="number"
                        value={customItem.laborRate}
                        onChange={(e) => setCustomItem({ ...customItem, laborRate: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="materialsCost">Materials Cost</Label>
                      <Input
                        id="materialsCost"
                        type="number"
                        value={customItem.materialsCost}
                        onChange={(e) => setCustomItem({ ...customItem, materialsCost: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Options</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rushOrder"
                      checked={customItem.rushOrder}
                      onChange={(e) => setCustomItem({ ...customItem, rushOrder: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="rushOrder">Rush Order (Additional 25% labor cost)</Label>
                  </div>
                </div>

                {/* Price Preview */}
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Price Preview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex justify-between">
                        <span>Base Labor ({customItem.laborHours}hrs × ${customItem.laborRate}/hr):</span>
                        <span>{formatCurrency(customItem.laborHours * customItem.laborRate)}</span>
                      </div>
                      {customItem.complexity !== 'standard' && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Complexity Multiplier ({customItem.complexity}):</span>
                          <span>×{customItem.complexity === 'complex' ? '1.3' : '1.6'}</span>
                        </div>
                      )}
                      {customItem.rushOrder && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Rush Order Surcharge:</span>
                          <span>+25%</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Materials Cost:</span>
                        <span>{formatCurrency(customItem.materialsCost)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        Total: {formatCurrency((() => {
                          let laborCost = customItem.laborHours * customItem.laborRate
                          const complexityMultiplier = {
                            'standard': 1,
                            'complex': 1.3,
                            'very-complex': 1.6
                          }[customItem.complexity] || 1
                          laborCost *= complexityMultiplier
                          if (customItem.rushOrder) laborCost *= 1.25
                          return laborCost + customItem.materialsCost
                        })())}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Button */}
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline"
                    onClick={() => setCustomItem({
                      name: "",
                      description: "",
                      laborHours: 1,
                      laborRate: 75,
                      materialsCost: 0,
                      jewelryType: "",
                      metalType: "",
                      stoneType: "",
                      stoneCount: 0,
                      stoneWeight: 0,
                      settingType: "",
                      size: "",
                      finish: "",
                      engraving: "",
                      rushOrder: false,
                      complexity: "standard",
                      specialInstructions: "",
                      // Diamond-specific fields
                      diamondClarity: "",
                      diamondColor: "",
                      diamondCut: "",
                      diamondShape: "",
                      diamondCertification: "",
                      diamondOrigin: "",
                      diamondTreatment: "",
                    })}
                  >
                    Clear Form
                  </Button>
                  <Button 
                    onClick={addCustomItemToQuote} 
                    disabled={!customItem.name || !isEditMode}
                    className="px-8"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Jewelry Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Items List */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Items ({quoteItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {quoteItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No items added to quote</p>
              ) : (
                <div className="space-y-4">
                  {quoteItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <Badge variant="outline">{item.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.unitPrice)}</div>
                          <div className="text-sm text-muted-foreground">each</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || !isEditMode}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            disabled={!isEditMode}
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.total)}</div>
                          {item.discount > 0 && (
                            <div className="text-xs text-red-600">
                              -{item.discountType === "percentage" ? `${item.discount}%` : formatCurrency(item.discount)}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={!isEditMode}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(quoteDetails.subtotal)}</span>
                </div>
                {quoteDetails.discountTotal > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(quoteDetails.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({quoteDetails.taxRate}%)</span>
                  <span>{formatCurrency(quoteDetails.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(quoteDetails.total)}</span>
                </div>
                {quoteDetails.depositRequired && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Deposit Required</span>
                    <span>{formatCurrency(calculateDeposit())}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quote Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative customer-search-container">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <div className="relative">
                    <Input
                      id="customerName"
                      value={customerSearchQuery}
                      onChange={handleCustomerSearchChange}
                      onFocus={handleCustomerSearchFocus}
                      placeholder="Search for existing customer or type to create new..."
                      className="pr-10"
                      disabled={!isEditMode}
                    />
                    {isLoadingCustomers && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Customer Search Results Dropdown */}
                  {showCustomerSearchResults && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingCustomers ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Searching customers...
                        </div>
                      ) : customerSearchResults.length > 0 ? (
                        <div className="py-2">
                          {customerSearchResults.map((customer) => (
                            <div
                              key={customer.id}
                              className="flex items-center justify-between px-4 py-2 hover:bg-muted cursor-pointer"
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <div>
                                <div className="font-medium">
                                  {customer.full_name || customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {customer.company && `${customer.company} • `}
                                  {customer.email && `${customer.email} • `}
                                  {customer.phone}
                                </div>
                              </div>
                              <Badge variant="outline">Existing</Badge>
                            </div>
                          ))}
                          <Separator className="my-2" />
                          <div
                            className="flex items-center justify-between px-4 py-2 hover:bg-muted cursor-pointer text-blue-600"
                            onClick={createNewCustomer}
                          >
                            <div>
                              <div className="font-medium">Create new customer</div>
                              <div className="text-sm text-muted-foreground">
                                "{customerSearchQuery}"
                              </div>
                            </div>
                            <Plus className="h-4 w-4" />
                          </div>
                        </div>
                      ) : customerSearchQuery.trim() ? (
                        <div className="py-4">
                          <div className="text-center text-muted-foreground mb-2">
                            No customers found
                          </div>
                          <div
                            className="flex items-center justify-center px-4 py-2 hover:bg-muted cursor-pointer text-blue-600"
                            onClick={createNewCustomer}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create new customer "{customerSearchQuery}"
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          Start typing to search customers
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={quoteDetails.customerEmail}
                    onChange={(e) => setQuoteDetails({ ...quoteDetails, customerEmail: e.target.value })}
                    disabled={!isEditMode}
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={quoteDetails.customerPhone}
                    onChange={(e) => setQuoteDetails({ ...quoteDetails, customerPhone: e.target.value })}
                    disabled={!isEditMode}
                  />
                </div>
                <div>
                  <Label htmlFor="customerAddress">Address</Label>
                  <Input
                    id="customerAddress"
                    value={quoteDetails.customerAddress}
                    onChange={(e) => setQuoteDetails({ ...quoteDetails, customerAddress: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quoteNumber">Quote Number (Auto-generated)</Label>
                  <Input
                    id="quoteNumber"
                    value={quoteDetails.quoteNumber}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                    title="Quote number is automatically generated"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={quoteDetails.status}
                    onValueChange={(value: any) => setQuoteDetails({ ...quoteDetails, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Created Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !quoteDetails.createdDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {quoteDetails.createdDate ? format(quoteDetails.createdDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quoteDetails.createdDate}
                        onSelect={(date) => date && setQuoteDetails({ ...quoteDetails, createdDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !quoteDetails.validUntil && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {quoteDetails.validUntil ? format(quoteDetails.validUntil, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quoteDetails.validUntil}
                        onSelect={(date) => date && setQuoteDetails({ ...quoteDetails, validUntil: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={quoteDetails.notes}
                  onChange={(e) => setQuoteDetails({ ...quoteDetails, notes: e.target.value })}
                  placeholder="Additional notes for the customer..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={quoteDetails.taxRate}
                    onChange={(e) => setQuoteDetails({ ...quoteDetails, taxRate: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deposit Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="depositType">Deposit Type</Label>
                  <Select
                    value={quoteDetails.depositType}
                    onValueChange={(value: any) => setQuoteDetails({ ...quoteDetails, depositType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="depositAmount">
                    {quoteDetails.depositType === "percentage" ? "Deposit Percentage (%)" : "Deposit Amount ($)"}
                  </Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    value={quoteDetails.depositAmount}
                    onChange={(e) => setQuoteDetails({ ...quoteDetails, depositAmount: Number(e.target.value) })}
                    min="0"
                    step={quoteDetails.depositType === "percentage" ? "1" : "0.01"}
                    placeholder={quoteDetails.depositType === "percentage" ? "Enter percentage (e.g., 30)" : "Enter amount"}
                  />
                </div>
              </div>
              {quoteDetails.depositType === "percentage" && quoteDetails.depositAmount > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">
                    Calculated Deposit Amount: {formatCurrency(calculateDeposit())}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    Based on {quoteDetails.depositAmount}% of total quote amount (${quoteDetails.total.toLocaleString()})
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={branding.companyName}
                    onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="companyLogo">Logo URL</Label>
                  <Input
                    id="companyLogo"
                    value={branding.companyLogo}
                    onChange={(e) => setBranding({ ...branding, companyLogo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={branding.companyPhone}
                    onChange={(e) => setBranding({ ...branding, companyPhone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={branding.companyEmail}
                    onChange={(e) => setBranding({ ...branding, companyEmail: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    value={branding.companyAddress}
                    onChange={(e) => setBranding({ ...branding, companyAddress: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={branding.companyWebsite}
                    onChange={(e) => setBranding({ ...branding, companyWebsite: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signature Tab */}
        <TabsContent value="signature" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Digital Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="border rounded cursor-crosshair"
                  onMouseDown={handleSignatureStart}
                  onMouseMove={handleSignatureMove}
                  onMouseUp={handleSignatureEnd}
                  onTouchStart={handleSignatureStart}
                  onTouchMove={handleSignatureMove}
                  onTouchEnd={handleSignatureEnd}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearSignature}>
                  Clear
                </Button>
                <Button onClick={saveSignature}>
                  Save Signature
                </Button>
              </div>
            </CardContent>
          </Card>
                 </TabsContent>
       </Tabs>
     </div>
   )
}

// Quote Preview Component
function QuotePreview({
  quoteItems,
  quoteDetails,
  branding,
  signature,
  onExitPreview,
  onGeneratePDF,
  onSendEmail,
  onConvertToOrder,
}: {
  quoteItems: QuoteItem[]
  quoteDetails: QuoteDetails
  branding: CompanyBranding
  signature: string | null
  onExitPreview: () => void
  onGeneratePDF: () => void
  onSendEmail: () => void
  onConvertToOrder: () => void
}) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Calculate deposit amount
  const calculateDeposit = () => {
    if (quoteDetails.depositType === "percentage") {
      return (quoteDetails.total * quoteDetails.depositAmount) / 100
    }
    return quoteDetails.depositAmount
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quote Preview</h2>
          <p className="text-muted-foreground">Review your quote before sending</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onExitPreview}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Quote
          </Button>
          <Button variant="outline" onClick={onGeneratePDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={onSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email Quote
          </Button>
          <Button onClick={onConvertToOrder}>
            Convert to Order
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white p-8 shadow-sm">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-2">
              <div className="relative h-20 w-40 overflow-hidden">
                <img
                  src={branding.companyLogo || "/placeholder.svg"}
                  alt="Company Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold">{branding.companyName}</h3>
                <p className="text-sm">{branding.companyAddress}</p>
                <p className="text-sm">
                  {branding.companyPhone} | {branding.companyEmail}
                </p>
                <p className="text-sm">{branding.companyWebsite}</p>
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-3xl font-bold" style={{ color: branding.primaryColor }}>
                QUOTE
              </h1>
              <p className="text-lg font-medium">{quoteDetails.quoteNumber}</p>
              <p>Date: {quoteDetails.createdDate ? format(quoteDetails.createdDate, "MMMM d, yyyy") : ""}</p>
              <p>Valid Until: {quoteDetails.validUntil ? format(quoteDetails.validUntil, "MMMM d, yyyy") : ""}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8">
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-medium">Bill To:</h3>
              <p className="font-medium">{quoteDetails.customerName}</p>
              <p>{quoteDetails.customerAddress}</p>
              <p>{quoteDetails.customerPhone}</p>
              <p>{quoteDetails.customerEmail}</p>
            </div>

            <div className="rounded-md p-4" style={{ backgroundColor: `${branding.primaryColor}10` }}>
              <h3 className="mb-2 font-medium">Quote Summary:</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(quoteDetails.subtotal)}</span>
                </div>
                {quoteDetails.discountTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Discounts:</span>
                    <span className="text-green-600">-{formatCurrency(quoteDetails.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({quoteDetails.taxRate}%):</span>
                  <span>{formatCurrency(quoteDetails.tax)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 text-lg font-bold">
                  <span>Total:</span>
                  <span style={{ color: branding.primaryColor }}>{formatCurrency(quoteDetails.total)}</span>
                </div>

                {quoteDetails.depositRequired && (
                  <div className="mt-2 rounded-md bg-white p-2 text-sm">
                    <div className="font-medium">Required Deposit:</div>
                    <div className="flex justify-between">
                      <span>
                        {quoteDetails.depositType === "percentage" ? `${quoteDetails.depositAmount}%` : "Fixed amount"}
                      </span>
                      <span>{formatCurrency(calculateDeposit())}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-8">
            <h3 className="mb-2 font-medium">Quote Items:</h3>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: branding.primaryColor, color: "white" }}>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="p-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                        {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
                      </td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {quoteDetails.notes && (
            <div className="mt-8">
              <h3 className="mb-2 font-medium">Notes:</h3>
              <div className="rounded-md border p-4">
                <p>{quoteDetails.notes}</p>
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="mt-8 flex justify-between">
            <div>
              <h3 className="mb-2 font-medium">Prepared By:</h3>
              <div className="space-y-2">
                {signature && (
                  <div className="h-20">
                    <img src={signature} alt="Signature" className="h-full" />
                  </div>
                )}
                <p className="font-medium">Sales Representative</p>
                <p>{branding.companyName}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Customer Acceptance:</h3>
              <div className="h-20 w-64 border-b"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Signature indicates acceptance of this quote.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 border-t pt-4 text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            <p>
              {branding.companyName} | {branding.companyPhone} | {branding.companyEmail} | {branding.companyWebsite}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
