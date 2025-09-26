"use client"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useMemo } from 'react'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CheckCircle, AlertTriangle, Plus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import Link from "next/link"
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { ProductsTable, products as productsTableProducts } from '@/components/products/products-table'
import { useToast } from '@/components/ui/use-toast'

// Mock customer data and staff
const mockCustomers = [
  { id: '1', name: 'John Smith', email: 'john@example.com', phone: '555-1234', tradeInCount: 2 },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', phone: '555-5678', tradeInCount: 1 },
]
const mockStaff = [
  { id: 'staff1', name: 'Emma Wilson' },
  { id: 'staff2', name: 'Michael Chen' },
]
const currentUser = mockStaff[0]

const DRAFT_KEY = 'tradein_draft_basic'

const itemTypes = [
  'ring', 'necklace', 'bracelet', 'earrings', 'watch', 'loose stones', 'other'
]
const metalTypes = [
  'gold', 'silver', 'platinum', 'palladium', 'other'
]
const metalPurities = {
  gold: ['10k', '14k', '18k', '22k', '24k'],
  silver: ['sterling', 'fine'],
  platinum: ['950', '900'],
  palladium: ['950', 'other'],
  other: ['other'],
}
const weightUnits = ['grams', 'pennyweights', 'ounces']
const stoneTypes = ['diamond', 'ruby', 'sapphire', 'emerald', 'other']
const conditions = ['excellent', 'very good', 'good', 'fair', 'poor']

const categories = ['ring', 'necklace', 'bracelet', 'earrings', 'watch', 'other']

export default function NewTradeInPage() {
  const router = useRouter()
  const { toast } = useToast()
  // Form state
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerOptions, setCustomerOptions] = useState(mockCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null)
  const [showCreateCustomer, setShowCreateCustomer] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [tradeInDate, setTradeInDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [staff, setStaff] = useState(currentUser.id)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [saving, setSaving] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [restored, setRestored] = useState(false)
  // Add state for wizard step
  const [step, setStep] = useState(1)
  // Trade-in items state
  const [items, setItems] = useState<any[]>([])
  const [itemErrors, setItemErrors] = useState<{ [key: number]: any }>({})
  const [expandedItem, setExpandedItem] = useState<number | null>(null)
  const fileInputs = useRef<{ [key: number]: HTMLInputElement | null }>({})
  // Add state for step 3
  const [newItemsTab, setNewItemsTab] = useState<'inventory' | 'custom'>('inventory')
  const [inventoryFilters, setInventoryFilters] = useState({
    search: '',
    category: 'all',
    priceMin: '',
    priceMax: '',
    metal: 'all',
    size: '',
    view: 'list',
  })
  const [selectedInventory, setSelectedInventory] = useState<any[]>([])
  const [customItems, setCustomItems] = useState<any[]>([])
  const [customForm, setCustomForm] = useState<any>({
    itemType: '',
    specs: '',
    metal: '',
    gems: '',
    size: '',
    notes: '',
    estPrice: '',
    dueDate: '',
    images: [],
  })
  const [customFormErrors, setCustomFormErrors] = useState<any>({})
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [priceOverrides, setPriceOverrides] = useState<{ [id: string]: { price: string, reason: string } }>({})
  const [discounts, setDiscounts] = useState<{ [id: string]: string }>({})
  const [taxRate, setTaxRate] = useState(0.08)
  // Add state for step 4
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // Add state for enhanced step 4
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [storeCredit, setStoreCredit] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signature, setSignature] = useState('')
  const [showPrint, setShowPrint] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const signaturePadRef = useRef<HTMLTextAreaElement | null>(null)
  // 2. Add CSV upload state and handler
  const [csvDialogOpen, setCsvDialogOpen] = useState(false)
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [csvError, setCsvError] = useState<string | null>(null)
  // Add state for products, loading, and error
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  // Add state for email
  const [emailSent, setEmailSent] = useState(false)

  // --- Selected items management ---
  const allSelectedItems = [...selectedInventory, ...customItems]

  // Auto-generate reference number on mount
  useEffect(() => {
    setReferenceNumber(`TI-${Date.now()}-${uuidv4().slice(0, 6)}`)
  }, [])

  // Auto-save draft
  useEffect(() => {
    if (restored) return
    const draft = {
      customerQuery,
      selectedCustomer,
      referenceNumber,
      tradeInDate,
      staff,
      notes,
      items,
      selectedInventory,
      customItems,
      priceOverrides,
      discounts,
      taxRate,
      paymentMethod,
      storeCredit,
      agreed,
      signature,
      allSelectedItems,
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [customerQuery, selectedCustomer, referenceNumber, tradeInDate, staff, notes, items, selectedInventory, customItems, priceOverrides, discounts, taxRate, paymentMethod, storeCredit, agreed, signature, allSelectedItems, restored])

  // Restore draft if exists
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft && !restored) {
      try {
        const data = JSON.parse(draft)
        setCustomerQuery(data.customerQuery || '')
        setSelectedCustomer(data.selectedCustomer || null)
        setReferenceNumber(data.referenceNumber || '')
        setTradeInDate(data.tradeInDate || format(new Date(), 'yyyy-MM-dd'))
        setStaff(data.staff || currentUser.id)
        setNotes(data.notes || '')
        setItems(data.items || [])
        setSelectedInventory(data.selectedInventory || [])
        setCustomItems(data.customItems || [])
        setPriceOverrides(data.priceOverrides || {})
        setDiscounts(data.discounts || {})
        setTaxRate(data.taxRate || 0.08)
        setPaymentMethod(data.paymentMethod || 'credit_card')
        setStoreCredit(data.storeCredit || false)
        setAgreed(data.agreed || false)
        setSignature(data.signature || '')
        setRestored(true)
      } catch {}
    }
  }, [restored])

  // Filter customers as user types
  useEffect(() => {
    if (!customerQuery) {
      setCustomerOptions(mockCustomers)
    } else {
      setCustomerOptions(
        mockCustomers.filter(c =>
          c.name.toLowerCase().includes(customerQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(customerQuery.toLowerCase()) ||
          c.phone.includes(customerQuery)
        )
      )
    }
  }, [customerQuery])

  // Fetch products on step 3
  // Commented out Supabase fetch for now; using mock data for consistency with ProductsTable
  // useEffect(() => {
  //   if (step === 3) {
  //     setProductsLoading(true)
  //     setProductsError(null)
  //     const supabase = createSupabaseBrowserClient()
  //     supabase.from('products').select('*').then(({ data, error }) => {
  //       if (error) setProductsError('Failed to load products')
  //       else setProducts(data || [])
  //       setProductsLoading(false)
  //     })
  //   }
  // }, [step])

  // --- Item logic ---
  function addItem() {
    setItems(items => [
      ...items,
      {
        id: uuidv4(),
        itemType: '',
        metalType: '',
        metalPurity: '',
        weight: '',
        weightUnit: 'grams',
        gemstone: {
          enabled: false,
          type: '',
          carat: '',
          quality: '',
          cert: '',
        },
        brand: '',
        condition: '',
        estValue: '',
        appraisalValue: '',
        acceptedValue: '',
        description: '',
        photos: [],
        // Watch-specific fields
        model: '',
        serial: '',
        year: '',
        box: false,
        papers: false,
        accessories: '',
        serviceHistory: '',
      },
    ])
    setExpandedItem(items.length)
  }
  function removeItem(idx: number) {
    setItems(items => items.filter((_, i) => i !== idx))
    setItemErrors(errs => {
      const copy = { ...errs }
      delete copy[idx]
      return copy
    })
  }
  function copyItem(idx: number) {
    setItems(items => [
      ...items.slice(0, idx + 1),
      { ...items[idx], id: uuidv4(), photos: [] },
      ...items.slice(idx + 1),
    ])
  }
  function updateItem(idx: number, field: string, value: any) {
    setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }
  function updateGemstone(idx: number, field: string, value: any) {
    setItems(items => items.map((item, i) => i === idx ? { ...item, gemstone: { ...item.gemstone, [field]: value } } : item))
  }
  function toggleGemstone(idx: number) {
    setItems(items => items.map((item, i) => i === idx ? { ...item, gemstone: { ...item.gemstone, enabled: !item.gemstone.enabled } } : item))
  }
  function handlePhotoUpload(idx: number, files: FileList | null) {
    if (!files) return
    setItems(items => items.map((item, i) => i === idx ? { ...item, photos: [...item.photos, ...Array.from(files)] } : item))
  }
  function removePhoto(idx: number, photoIdx: number) {
    setItems(items => items.map((item, i) => i === idx ? { ...item, photos: item.photos.filter((_: File, j: number) => j !== photoIdx) } : item))
  }
  // --- Validation ---
  function validateItems() {
    const errs: { [key: number]: any } = {}
    items.forEach((item, idx) => {
      const e: any = {}
      if (!item.itemType) e.itemType = 'Required'
      if (!item.metalType) e.metalType = 'Required'
      if (!item.metalPurity) e.metalPurity = 'Required'
      if (!item.weight || isNaN(Number(item.weight))) e.weight = 'Required'
      if (!item.condition) e.condition = 'Required'
      if (!item.acceptedValue || isNaN(Number(item.acceptedValue))) e.acceptedValue = 'Required'
      if (item.gemstone.enabled) {
        if (!item.gemstone.type) e.gemType = 'Required'
        if (!item.gemstone.carat || isNaN(Number(item.gemstone.carat))) e.gemCarat = 'Required'
      }
      errs[idx] = e
    })
    setItemErrors(errs)
    return Object.values(errs).every(e => Object.keys(e).length === 0)
  }
  // --- Navigation ---
  function handleNextStep2() {
    if (validateItems() && items.length > 0) {
      setStep(3)
      // Save draft, etc.
    }
  }
  function handlePrevStep2() {
    setStep(1)
  }
  // --- Calculation ---
  const totalTradeInValue = items.reduce((sum, item) => sum + (parseFloat(item.acceptedValue) || 0), 0)

  // Validation
  function validate() {
    const errs: { [key: string]: string } = {}
    if (!selectedCustomer) errs.customer = 'Customer is required.'
    if (!tradeInDate) errs.date = 'Trade-in date is required.'
    else if (new Date(tradeInDate) > new Date()) errs.date = 'Date cannot be in the future.'
    return errs
  }

  function handleNext() {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      setSaving(true)
      setTimeout(() => {
        setSaving(false)
        setStep(2)
      }, 800)
    }
  }

  function handleCancel() {
    setShowCancelDialog(true)
  }

  function confirmCancel() {
    localStorage.removeItem(DRAFT_KEY)
    router.push('/dashboard/trade-ins')
  }

  // --- Inventory filtering ---
  const filteredProducts = useMemo(() => {
    return productsTableProducts.filter(item => {
      if (inventoryFilters.search && item.name && !item.name.toLowerCase().includes(inventoryFilters.search.toLowerCase())) return false
      if (inventoryFilters.category !== 'all' && item.category && item.category.toLowerCase() !== inventoryFilters.category.toLowerCase()) return false
      if (inventoryFilters.priceMin && item.price < parseFloat(inventoryFilters.priceMin)) return false
      if (inventoryFilters.priceMax && item.price > parseFloat(inventoryFilters.priceMax)) return false
      return true
    })
  }, [productsTableProducts, inventoryFilters])

  // --- Add/Remove inventory items ---
  function addInventoryItem(item: any) {
    if (!selectedInventory.find((i: any) => i.id === item.id)) {
      setSelectedInventory([...selectedInventory, { ...item, quantity: 1 }])
    }
  }
  function removeInventoryItem(id: string) {
    setSelectedInventory(selectedInventory.filter(i => i.id !== id))
  }
  function updateInventoryQty(id: string, qty: number) {
    setSelectedInventory(selectedInventory.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  // --- Custom item form ---
  function handleCustomFormChange(field: string, value: any) {
    setCustomForm((f: any) => ({ ...f, [field]: value }))
  }
  function handleCustomImageUpload(files: FileList | null) {
    if (!files) return
    setCustomForm((f: any) => ({ ...f, images: [...(f.images || []), ...Array.from(files)] }))
  }
  function removeCustomImage(idx: number) {
    setCustomForm((f: any) => ({ ...f, images: f.images.filter((_: File, j: number) => j !== idx) }))
  }
  function addCustomItem() {
    // Simple validation
    const errs: any = {}
    if (!customForm.itemType) errs.itemType = 'Required'
    if (!customForm.estPrice || isNaN(Number(customForm.estPrice))) errs.estPrice = 'Required'
    setCustomFormErrors(errs)
    if (Object.keys(errs).length === 0) {
      setCustomItems([...customItems, { ...customForm, id: uuidv4(), quantity: 1 }])
      setCustomForm({ itemType: '', specs: '', metal: '', gems: '', size: '', notes: '', estPrice: '', dueDate: '', images: [] })
    }
  }
  function removeCustomItem(id: string) {
    setCustomItems(customItems.filter(i => i.id !== id))
  }
  function updateCustomQty(id: string, qty: number) {
    setCustomItems(customItems.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  // --- Selected items management ---
  function removeSelectedItem(id: string) {
    removeInventoryItem(id)
    removeCustomItem(id)
  }
  function updateSelectedQty(id: string, qty: number) {
    updateInventoryQty(id, qty)
    updateCustomQty(id, qty)
  }
  function setPriceOverride(id: string, price: string, reason: string) {
    setPriceOverrides(overrides => ({ ...overrides, [id]: { price, reason } }))
  }
  function setDiscount(id: string, discount: string) {
    setDiscounts(d => ({ ...d, [id]: discount }))
  }

  // --- Calculation summary ---
  const tradeInCredit = items.reduce((sum, item) => sum + (parseFloat(item.acceptedValue) || 0), 0)
  const newItemsCost = allSelectedItems.reduce((sum, item) => {
    const base = priceOverrides[item.id]?.price ? parseFloat(priceOverrides[item.id].price) : parseFloat(item.price || item.estPrice || 0)
    const discount = discounts[item.id] ? parseFloat(discounts[item.id]) : 0
    return sum + ((base - discount) * (item.quantity || 1))
  }, 0)
  const tax = newItemsCost * taxRate
  const netDifference = newItemsCost + tax - tradeInCredit

  // --- Navigation ---
  function handleNextStep3() {
    if (allSelectedItems.length > 0) {
      setStep(4)
    }
  }
  function handlePrevStep3() {
    setStep(2)
  }

  // --- Enhanced validation ---
  function validateFinal() {
    if (!agreed) return 'You must agree to the terms and conditions.'
    if (netDifference > 0 && !paymentMethod) return 'Select a payment method.'
    if (netDifference < 0 && !storeCredit) return 'Select how to store customer credit.'
    if (!signature) return 'Digital signature is required.'
    return null
  }

  async function handleEnhancedSubmit() {
    const err = validateFinal()
    if (err) {
      setSubmitError(err)
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false)
      setSubmitSuccess(true)
      // In real app: generate docs, email, POS, comm log, etc.
    }, 1500)
  }

  // 3. Add CSV upload handler
  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string
        // Simple CSV parse: type,brand,model,serial,year,metalType,metalPurity,weight,weightUnit,condition,estValue
        const lines = text.split(/\r?\n/).filter(Boolean)
        const headers = lines[0].split(',').map(h => h.trim())
        const items = lines.slice(1).map(line => {
          const values = line.split(',')
          const obj: any = {}
          headers.forEach((h, i) => { obj[h] = values[i] || '' })
          return {
            id: uuidv4(),
            itemType: obj.type || '',
            brand: obj.brand || '',
            model: obj.model || '',
            serial: obj.serial || '',
            year: obj.year || '',
            metalType: obj.metalType || '',
            metalPurity: obj.metalPurity || '',
            weight: obj.weight || '',
            weightUnit: obj.weightUnit || 'grams',
            condition: obj.condition || '',
            estValue: obj.estValue || '',
            appraisalValue: '',
            acceptedValue: '',
            description: '',
            photos: [],
            box: obj.box === 'true',
            papers: obj.papers === 'true',
            accessories: obj.accessories || '',
            serviceHistory: obj.serviceHistory || '',
            gemstone: { enabled: false, type: '', carat: '', quality: '', cert: '' },
          }
        })
        setCsvPreview(items)
        setCsvError(null)
      } catch (err) {
        setCsvError('Failed to parse CSV')
      }
    }
    reader.readAsText(file)
  }
  function confirmCsvImport() {
    setItems(items => [...items, ...csvPreview])
    setCsvDialogOpen(false)
    setCsvPreview([])
  }

  // 3. Add AI value suggestion (simulate with random value)
  function suggestValue(idx: number) {
    // Set loading state for this item
    updateItem(idx, 'aiLoading', true);
    const item = items[idx];
    fetch('/api/ai-estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemType: item.itemType,
        metalType: item.metalType,
        metalPurity: item.metalPurity,
        weight: item.weight,
        weightUnit: item.weightUnit,
        condition: item.condition,
        brand: item.brand,
        gemstone: item.gemstone?.enabled ? item.gemstone : null,
      }),
    })
      .then(res => res.json())
      .then(data => {
        updateItem(idx, 'estValue', data.value);
        updateItem(idx, 'aiExplanation', data.explanation);
        updateItem(idx, 'aiPrompt', data.prompt);
        updateItem(idx, 'aiLoading', false);
      })
      .catch(() => {
        updateItem(idx, 'aiLoading', false);
        updateItem(idx, 'aiExplanation', 'AI estimation failed. Please try again.');
      });
  }

  // Save as Draft handler
  function handleSaveDraft() {
    const draft = {
      customerQuery,
      selectedCustomer,
      referenceNumber,
      tradeInDate,
      staff,
      notes,
      items,
      selectedInventory,
      customItems,
      priceOverrides,
      discounts,
      taxRate,
      paymentMethod,
      storeCredit,
      agreed,
      signature,
      allSelectedItems,
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    toast({ title: 'Draft saved!', description: 'You can resume this trade-in later from your drafts.' })
  }

  // Print handler
  function handlePrint() {
    setTimeout(() => {
      window.print()
    }, 100)
  }

  // Email handler
  function handleSendEmail() {
    setEmailSent(true)
    setTimeout(() => {
      setShowEmail(false)
      setEmailSent(false)
      toast({ title: 'Email sent!', description: 'Summary sent to customer.' })
    }, 1200)
  }

  // --- Render ---
  if (step === 2) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/trade-ins">Trade-Ins</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Trade-In</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Trade-In</h1>
            <p className="text-muted-foreground">Step 2 of 4: Add Items Being Traded In</p>
          </div>
          <Progress value={50} className="w-full md:w-64" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Trade-In Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
              <Button onClick={addItem}>Add Item</Button>
              <Button variant="outline" onClick={() => setCsvDialogOpen(true)}>Bulk CSV Upload</Button>
              <div className="font-semibold">Total Trade-In Value: <span className="text-emerald-600">${Number(totalTradeInValue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
            </div>
            {/* CSV Dialog */}
            <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Import Trade-In Items (CSV)</DialogTitle>
                </DialogHeader>
                <input type="file" accept=".csv" onChange={handleCsvUpload} />
                {csvError && <div className="text-destructive text-xs mt-2">{csvError}</div>}
                {csvPreview.length > 0 && (
                  <div className="mt-4 max-h-40 overflow-auto border rounded p-2 bg-gray-50">
                    <div className="font-semibold mb-2">Preview:</div>
                    {csvPreview.map((item, i) => (
                      <div key={i} className="text-xs border-b py-1">{item.itemType} {item.brand} {item.model} {item.serial} {item.year}</div>
                    ))}
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={confirmCsvImport} disabled={csvPreview.length === 0}>Import</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {items.length === 0 && <div className="text-muted-foreground text-center py-8">No items added yet.</div>}
            <div className="space-y-4">
              {items.map((item, idx) => (
                <Card key={item.id} className="border-2 border-emerald-200">
                  <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setExpandedItem(expandedItem === idx ? null : idx)}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Item {idx + 1}</span>
                      <span className="text-xs text-muted-foreground">{item.itemType || 'No type selected'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); copyItem(idx) }}>Copy</Button>
                      <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); removeItem(idx) }}>Remove</Button>
                    </div>
                  </CardHeader>
                  {expandedItem === idx && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Item Type</label>
                          <Select value={item.itemType} onValueChange={v => updateItem(idx, 'itemType', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {itemTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {itemErrors[idx]?.itemType && <div className="text-destructive text-xs mt-1">{itemErrors[idx].itemType}</div>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Metal Type</label>
                          <Select value={item.metalType} onValueChange={v => updateItem(idx, 'metalType', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select metal" />
                            </SelectTrigger>
                            <SelectContent>
                              {metalTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {itemErrors[idx]?.metalType && <div className="text-destructive text-xs mt-1">{itemErrors[idx].metalType}</div>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Metal Purity</label>
                          <Select value={item.metalPurity} onValueChange={v => updateItem(idx, 'metalPurity', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select purity" />
                            </SelectTrigger>
                            <SelectContent>
                              {(metalPurities[item.metalType as keyof typeof metalPurities] || ['other']).map(purity => <SelectItem key={purity} value={purity}>{purity}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {itemErrors[idx]?.metalPurity && <div className="text-destructive text-xs mt-1">{itemErrors[idx].metalPurity}</div>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Weight</label>
                          <div className="flex gap-2">
                            <Input value={item.weight} onChange={e => updateItem(idx, 'weight', e.target.value)} placeholder="0.00" type="number" />
                            <Select value={item.weightUnit} onValueChange={v => updateItem(idx, 'weightUnit', v)}>
                              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {weightUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          {itemErrors[idx]?.weight && <div className="text-destructive text-xs mt-1">{itemErrors[idx].weight}</div>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Condition</label>
                          <Select value={item.condition} onValueChange={v => updateItem(idx, 'condition', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              {conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {itemErrors[idx]?.condition && <div className="text-destructive text-xs mt-1">{itemErrors[idx].condition}</div>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Brand/Designer (optional)</label>
                          <Input value={item.brand} onChange={e => updateItem(idx, 'brand', e.target.value)} placeholder="Brand/Designer" />
                        </div>
                      </div>
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => toggleGemstone(idx)}>
                          {item.gemstone.enabled ? 'Hide Gemstone Section' : 'Add Gemstone Details'}
                        </Button>
                        {item.gemstone.enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 p-2 border rounded bg-gray-50">
                            <div>
                              <label className="block text-sm font-medium mb-1">Stone Type</label>
                              <Select value={item.gemstone.type} onValueChange={v => updateGemstone(idx, 'type', v)}>
                                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                                <SelectContent>
                                  {stoneTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              {itemErrors[idx]?.gemType && <div className="text-destructive text-xs mt-1">{itemErrors[idx].gemType}</div>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Carat Weight</label>
                              <Input value={item.gemstone.carat} onChange={e => updateGemstone(idx, 'carat', e.target.value)} placeholder="0.00" type="number" />
                              {itemErrors[idx]?.gemCarat && <div className="text-destructive text-xs mt-1">{itemErrors[idx].gemCarat}</div>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Quality/Grade</label>
                              <Input value={item.gemstone.quality} onChange={e => updateGemstone(idx, 'quality', e.target.value)} placeholder="Quality/Grade" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Certification # (optional)</label>
                              <Input value={item.gemstone.cert} onChange={e => updateGemstone(idx, 'cert', e.target.value)} placeholder="Cert #" />
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Watch-specific fields */}
                      {item.itemType === 'watch' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1">Model</label>
                            <Input value={item.model} onChange={e => updateItem(idx, 'model', e.target.value)} placeholder="Model" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Serial Number</label>
                            <Input value={item.serial} onChange={e => updateItem(idx, 'serial', e.target.value)} placeholder="Serial Number" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Year</label>
                            <Input value={item.year} onChange={e => updateItem(idx, 'year', e.target.value)} placeholder="Year" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Box</label>
                            <Checkbox checked={item.box} onCheckedChange={v => updateItem(idx, 'box', !!v)} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Papers</label>
                            <Checkbox checked={item.papers} onCheckedChange={v => updateItem(idx, 'papers', !!v)} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Accessories</label>
                            <Input value={item.accessories} onChange={e => updateItem(idx, 'accessories', e.target.value)} placeholder="Accessories" />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium mb-1">Service History</label>
                            <Input value={item.serviceHistory} onChange={e => updateItem(idx, 'serviceHistory', e.target.value)} placeholder="Service history, last service date, etc." />
                          </div>
                        </>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">AI Estimated Offer</label>
                          <div className="flex gap-2 items-center">
                            <Input value={item.estValue} onChange={e => updateItem(idx, 'estValue', e.target.value)} placeholder="$0.00" type="number" />
                            <Button size="sm" variant="ghost" onClick={() => suggestValue(idx)} disabled={item.aiLoading}>
                              {item.aiLoading ? <span className="animate-spin mr-2">⏳</span> : null}AI Suggest
                            </Button>
                          </div>
                          {item.aiExplanation && (
                            <div className="text-xs text-muted-foreground mt-1">{item.aiExplanation}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Appraisal Value</label>
                          <Input value={item.appraisalValue} onChange={e => updateItem(idx, 'appraisalValue', e.target.value)} placeholder="$0.00" type="number" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Accepted Trade Value</label>
                          <Input value={item.acceptedValue} onChange={e => updateItem(idx, 'acceptedValue', e.target.value)} placeholder="$0.00" type="number" />
                          {itemErrors[idx]?.acceptedValue && <div className="text-destructive text-xs mt-1">{itemErrors[idx].acceptedValue}</div>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description/Notes</label>
                        <Input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Description or notes" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Photos</label>
                        <input
                          type="file"
                          multiple
                          ref={el => { fileInputs.current[idx] = el; }}
                          style={{ display: 'none' }}
                          onChange={e => handlePhotoUpload(idx, e.target.files)}
                        />
                        <Button variant="outline" size="sm" onClick={() => fileInputs.current[idx]?.click()}>
                          Upload Photos
                        </Button>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.photos.map((file: File, photoIdx: number) => (
                            <div key={photoIdx} className="relative border rounded p-1 bg-gray-50">
                              <span className="text-xs">{file.name}</span>
                              <Button size="icon" variant="ghost" className="absolute top-0 right-0" onClick={() => removePhoto(idx, photoIdx)}>
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2 justify-between">
          <Button variant="outline" onClick={handlePrevStep2}>Previous: Basic Info</Button>
          <Button onClick={handleNextStep2} disabled={items.length === 0}>Next: Select New Items</Button>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/trade-ins">Trade-Ins</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Trade-In</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Trade-In</h1>
            <p className="text-muted-foreground">Step 3 of 4: Select New Items</p>
          </div>
          <Progress value={75} className="w-full md:w-64" />
        </div>
        <Tabs value={newItemsTab} onValueChange={v => setNewItemsTab(v as 'inventory' | 'custom')}>
          <TabsList>
            <TabsTrigger value="inventory">Select from Inventory</TabsTrigger>
            <TabsTrigger value="custom">Custom/Special Order</TabsTrigger>
          </TabsList>
          <TabsContent value="inventory">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Input placeholder="Search products..." value={inventoryFilters.search} onChange={e => setInventoryFilters(f => ({ ...f, search: e.target.value }))} />
                  <Select value={inventoryFilters.category} onValueChange={v => setInventoryFilters(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={inventoryFilters.metal} onValueChange={v => setInventoryFilters(f => ({ ...f, metal: v }))}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Metal" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {metalTypes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Min Price" type="number" className="w-24" value={inventoryFilters.priceMin} onChange={e => setInventoryFilters(f => ({ ...f, priceMin: e.target.value }))} />
                  <Input placeholder="Max Price" type="number" className="w-24" value={inventoryFilters.priceMax} onChange={e => setInventoryFilters(f => ({ ...f, priceMax: e.target.value }))} />
                  <Input placeholder="Size" className="w-20" value={inventoryFilters.size} onChange={e => setInventoryFilters(f => ({ ...f, size: e.target.value }))} />
                  <Button variant={inventoryFilters.view === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setInventoryFilters(f => ({ ...f, view: 'grid' }))}>Grid</Button>
                  <Button variant={inventoryFilters.view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setInventoryFilters(f => ({ ...f, view: 'list' }))}>List</Button>
                </div>
                <div className={inventoryFilters.view === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : 'space-y-2'}>
                  <ProductsTable
                    products={filteredProducts}
                    actionButtonLabel="Add to Trade"
                    showCartButton={false}
                    selectedProductIds={selectedInventory.map(i => i.id)}
                    onSelectProduct={id => {
                      const product = productsTableProducts.find(p => p.id === id)
                      if (!product) return
                      if (selectedInventory.some(i => i.id === id)) {
                        setSelectedInventory(selectedInventory.filter(i => i.id !== id))
                      } else {
                        setSelectedInventory([...selectedInventory, { ...product, quantity: 1 }])
                      }
                    }}
                    onActionButtonClick={id => {
                      const product = productsTableProducts.find(p => p.id === id)
                      if (!product) return
                      if (!selectedInventory.some(i => i.id === id)) {
                        setSelectedInventory([...selectedInventory, { ...product, quantity: 1 }])
                      }
                    }}
                  />
                </div>
              </div>
              <div className="w-full md:w-80 border rounded p-4 bg-gray-50">
                <div className="font-semibold mb-2">Selected Items</div>
                {selectedInventory.length === 0 && <div className="text-xs text-muted-foreground">No items selected.</div>}
                {selectedInventory.map(item => (
                  <div key={item.id} className="flex items-center gap-2 mb-2 border-b pb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                      <div className="text-xs">${item.price ? Number(item.price).toLocaleString() : Number(item.estPrice || 0).toLocaleString()}</div>
                      <div className="flex gap-1 items-center mt-1">
                        <label className="text-xs">Qty:</label>
                        <Input type="number" className="w-16" value={item.quantity} min={1} max={item.stock} onChange={e => updateInventoryQty(item.id, Math.max(1, Math.min(item.stock, parseInt(e.target.value) || 1)))} />
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeInventoryItem(item.id)}>×</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="custom">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Item Type</label>
                    <Select value={customForm.itemType} onValueChange={v => handleCustomFormChange('itemType', v)}>
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {customFormErrors.itemType && <div className="text-destructive text-xs mt-1">{customFormErrors.itemType}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Price</label>
                    <Input value={customForm.estPrice} onChange={e => handleCustomFormChange('estPrice', e.target.value)} placeholder="$0.00" type="number" />
                    {customFormErrors.estPrice && <div className="text-destructive text-xs mt-1">{customFormErrors.estPrice}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Metal Preferences</label>
                    <Input value={customForm.metal} onChange={e => handleCustomFormChange('metal', e.target.value)} placeholder="Gold, Platinum, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gemstone Requirements</label>
                    <Input value={customForm.gems} onChange={e => handleCustomFormChange('gems', e.target.value)} placeholder="Diamond, Ruby, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Size Requirements</label>
                    <Input value={customForm.size} onChange={e => handleCustomFormChange('size', e.target.value)} placeholder="Ring size, length, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Completion Date</label>
                    <Input type="date" value={customForm.dueDate} onChange={e => handleCustomFormChange('dueDate', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Detailed Specifications</label>
                    <Input value={customForm.specs} onChange={e => handleCustomFormChange('specs', e.target.value)} placeholder="Describe the custom item in detail..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Special Requests/Notes</label>
                    <Input value={customForm.notes} onChange={e => handleCustomFormChange('notes', e.target.value)} placeholder="Any special requests or notes..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Reference Images</label>
                    <input type="file" multiple onChange={e => handleCustomImageUpload(e.target.files)} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {customForm.images && customForm.images.map((file: File, idx: number) => (
                        <div key={idx} className="relative border rounded p-1 bg-gray-50">
                          <span className="text-xs">{file.name}</span>
                          <Button size="icon" variant="ghost" className="absolute top-0 right-0" onClick={() => removeCustomImage(idx)}>×</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="mt-4" onClick={addCustomItem}>Add Custom Item</Button>
              </div>
              <div className="w-full md:w-80 border rounded p-4 bg-gray-50">
                <div className="font-semibold mb-2">Custom Items</div>
                {customItems.length === 0 && <div className="text-xs text-muted-foreground">No custom items added.</div>}
                {customItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 mb-2 border-b pb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.itemType}</div>
                      <div className="text-xs">${item.estPrice}</div>
                      <div className="flex gap-1 items-center mt-1">
                        <label className="text-xs">Qty:</label>
                        <Input type="number" className="w-16" value={item.quantity} min={1} onChange={e => updateCustomQty(item.id, Math.max(1, parseInt(e.target.value) || 1))} />
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeCustomItem(item.id)}>×</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Selected Items & Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 font-semibold">Selected Items</div>
            {allSelectedItems.length === 0 && <div className="text-xs text-muted-foreground">No items selected.</div>}
            {allSelectedItems.map(item => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-2 border-b pb-2 mb-2">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.name || item.itemType}</div>
                  <div className="text-xs text-muted-foreground">{item.sku ? `SKU: ${item.sku}` : ''}</div>
                  <div className="text-xs">${item.price ? Number(item.price).toLocaleString() : Number(item.estPrice || 0).toLocaleString()}</div>
                  <div className="flex gap-1 items-center mt-1">
                    <label className="text-xs">Qty:</label>
                    <Input type="number" className="w-16" value={item.quantity} min={1} onChange={e => updateSelectedQty(item.id, Math.max(1, parseInt(e.target.value) || 1))} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1 items-center">
                    <label className="text-xs">Price Override:</label>
                    <Input type="number" className="w-20" value={priceOverrides[item.id]?.price || ''} onChange={e => setPriceOverride(item.id, e.target.value, priceOverrides[item.id]?.reason || '')} placeholder="Override" />
                  </div>
                  <div className="flex gap-1 items-center">
                    <label className="text-xs">Reason:</label>
                    <Input className="w-32" value={priceOverrides[item.id]?.reason || ''} onChange={e => setPriceOverride(item.id, priceOverrides[item.id]?.price || '', e.target.value)} placeholder="Reason" />
                  </div>
                  <div className="flex gap-1 items-center">
                    <label className="text-xs">Discount:</label>
                    <Input type="number" className="w-20" value={discounts[item.id] || ''} onChange={e => setDiscount(item.id, e.target.value)} placeholder="Discount" />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeSelectedItem(item.id)}>×</Button>
                </div>
              </div>
            ))}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div>Trade-In Credit: <span className="font-semibold text-emerald-600">${Number(tradeInCredit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                <div>New Items Cost: <span className="font-semibold">${Number(newItemsCost || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                <div>Tax ({(taxRate * 100).toFixed(1)}%): <span className="font-semibold">${Number(tax || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                <div className="text-xs text-muted-foreground">{netDifference >= 0 ? 'Customer pays this amount' : 'Customer receives this credit'}</div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs">Tax Rate</label>
                <Input type="number" className="w-24" value={taxRate} min={0} max={1} step={0.01} onChange={e => setTaxRate(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))} />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2 justify-between mt-4">
          <Button variant="outline" onClick={handlePrevStep3}>Previous: Trade-In Items</Button>
          <Button onClick={handleNextStep3} disabled={allSelectedItems.length === 0}>Next: Review & Complete</Button>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/trade-ins">Trade-Ins</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Trade-In</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Trade-In</h1>
            <p className="text-muted-foreground">Step 4 of 4: Review & Complete</p>
          </div>
          <Progress value={100} className="w-full md:w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Trade-In Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Trade-In Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="font-semibold">Customer</div>
                {selectedCustomer && (
                  <div className="border rounded p-3 bg-emerald-50 mb-2">
                    <div className="font-semibold">{selectedCustomer.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedCustomer.email} • {selectedCustomer.phone}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="text-xs">Reference #: <span className="font-semibold">{referenceNumber}</span></div>
                  <div className="text-xs">Date: <span className="font-semibold">{tradeInDate}</span></div>
                  <div className="text-xs">Staff: <span className="font-semibold">{mockStaff.find(s => s.id === staff)?.name}</span></div>
                </div>
                <div className="font-semibold mt-2">Items Traded In</div>
                {items.length === 0 && <div className="text-xs text-muted-foreground">No items added.</div>}
                {items.map((item, idx) => (
                  <div key={item.id} className="border rounded p-3 mb-2 bg-gray-50">
                    <div className="font-semibold">{item.itemType} ({item.metalType}, {item.metalPurity})</div>
                    <div className="text-xs">Weight: {item.weight} {item.weightUnit}</div>
                    <div className="text-xs">Condition: {item.condition}</div>
                    <div className="text-xs">Accepted Value: <span className="font-semibold text-emerald-600">${Number(item.acceptedValue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                  </div>
                ))}
                <div className="font-semibold mt-2">New Items (to Acquire)</div>
                {allSelectedItems.length === 0 && <div className="text-xs text-muted-foreground">No new items selected.</div>}
                {allSelectedItems.map(item => (
                  <div key={item.id} className="border rounded p-3 mb-2 bg-gray-50">
                    <div className="font-semibold">{item.name || item.itemType}</div>
                    <div className="text-xs text-muted-foreground">{item.sku ? `SKU: ${item.sku}` : ''}</div>
                    <div className="text-xs">Qty: {item.quantity}</div>
                    <div className="text-xs">Price: ${item.price ? Number(item.price).toLocaleString() : Number(item.estPrice || 0).toLocaleString()}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Terms & Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <Checkbox checked={agreed} onCheckedChange={v => setAgreed(!!v)} id="agree" />
                  <label htmlFor="agree" className="text-sm">I agree to the trade-in policy, return/exchange policy, and condition assessment agreement.</label>
                </div>
                <div className="text-xs text-muted-foreground">
                  <ul className="list-disc ml-6">
                    <li>All trade-ins are final. Items are subject to inspection and authentication.</li>
                    <li>Accepted value is based on current market and condition assessment.</li>
                    <li>Custom/special orders are non-refundable once production begins.</li>
                    <li>Customer agrees to the terms and digital signature below.</li>
                  </ul>
                </div>
                <div className="mt-2">
                  <label className="block text-xs mb-1">Digital Signature (type your name)</label>
                  <Textarea ref={signaturePadRef} value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type your name as signature..." />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Financial Summary Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-lg font-bold text-emerald-600">Trade-In Credit: ${Number(tradeInCredit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div>New Items Cost: <span className="font-semibold">${Number(newItemsCost || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                <div>Subtotal: <span className="font-semibold">${Number(newItemsCost || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                <div>Tax ({(taxRate * 100).toFixed(1)}%): <span className="font-semibold">${Number(tax || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                <div className="text-lg font-bold mt-2">Final Amount {netDifference >= 0 ? 'Due' : 'Credit'}: <span className={netDifference >= 0 ? 'text-emerald-600' : 'text-blue-600'}>${Number(Math.abs(netDifference) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                {netDifference > 0 && (
                  <div className="mt-2">
                    <label className="block text-xs mb-1">Payment Method</label>
                    <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v)}>
                      <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="pos">POS System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {netDifference < 0 && (
                  <div className="mt-2">
                    <label className="block text-xs mb-1">Store Credit Option</label>
                    <Checkbox checked={storeCredit} onCheckedChange={v => setStoreCredit(!!v)} id="storeCredit" />
                    <label htmlFor="storeCredit" className="ml-2 text-sm">Store as customer credit for future use</label>
                  </div>
                )}
                <div className="mt-2 flex flex-col gap-2">
                  <label className="text-xs">Tax Rate</label>
                  <Input type="number" className="w-24" value={taxRate} min={0} max={1} step={0.01} onChange={e => setTaxRate(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))} />
                </div>
              </CardContent>
            </Card>
            {/* Final Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Final Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button onClick={handleEnhancedSubmit} disabled={submitting || submitSuccess} className="w-full">
                  {submitting ? 'Completing...' : 'Complete Trade-In'}
                </Button>
                <Button variant="outline" onClick={handleSaveDraft} className="w-full">Save as Draft</Button>
                <Button variant="outline" onClick={() => { setShowPrint(true); setTimeout(handlePrint, 300); }} className="w-full">Print Quote</Button>
                <Button variant="outline" onClick={() => setShowEmail(true)} className="w-full">Email Summary to Customer</Button>
              </CardContent>
            </Card>
            {submitError && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive rounded p-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{submitError}</span>
              </div>
            )}
            {submitSuccess && (
              <div className="flex flex-col items-center gap-2 p-8">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div className="font-semibold text-emerald-700">Trade-In successfully completed!</div>
                <Button onClick={() => router.push('/dashboard/trade-ins')}>Back to Trade-Ins</Button>
              </div>
            )}
          </div>
        </div>
        {/* Print/Email/Receipt/Follow-up/Comm Log/POS stubs */}
        {showPrint && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg">
              <CardHeader><CardTitle>Print Quote (Stub)</CardTitle></CardHeader>
              <CardContent>
                <div className="text-muted-foreground">This would generate a printable quote/receipt.</div>
                <Button className="mt-4" onClick={() => setShowPrint(false)}>Close</Button>
              </CardContent>
            </Card>
          </div>
        )}
        {showEmail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg">
              <CardHeader><CardTitle>Email Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4">Preview of email to <span className="font-semibold">{selectedCustomer?.email}</span>:</div>
                <div className="border rounded p-3 bg-gray-50 mb-4">
                  <div className="font-semibold">Trade-In Summary for {selectedCustomer?.name}</div>
                  <div>Reference #: {referenceNumber}</div>
                  <div>Date: {tradeInDate}</div>
                  <div>Items Traded In: {items.length}</div>
                  <div>New Items: {allSelectedItems.length}</div>
                  <div>Final Amount Due: ${Number(Math.abs(netDifference) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
                <Button className="w-full" onClick={handleSendEmail} disabled={emailSent}>{emailSent ? 'Sending...' : 'Send Email'}</Button>
                <Button className="w-full mt-2" variant="outline" onClick={() => setShowEmail(false)}>Cancel</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/trade-ins">Trade-Ins</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Trade-In</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Trade-In</h1>
          <p className="text-muted-foreground">Step 1 of 4: Basic Information</p>
        </div>
        <Progress value={25} className="w-full md:w-64" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <div className="flex gap-2 items-center">
              <Input
                value={customerQuery}
                onChange={e => {
                  setCustomerQuery(e.target.value)
                  setSelectedCustomer(null)
                }}
                placeholder="Search by name, phone, or email"
                className={errors.customer ? 'border-destructive' : ''}
                autoComplete="off"
              />
              <Link href="/dashboard/customers/new">
                <Button variant="outline" size="sm" title="Add New Customer" className="flex items-center gap-1">
                  <Plus className="h-5 w-5" />
                  New Customer
                </Button>
              </Link>
            </div>
            {customerQuery && customerOptions.length > 0 && !selectedCustomer && (
              <div className="border rounded bg-white shadow mt-1 max-h-40 overflow-auto z-10 relative">
                {customerOptions.map(c => (
                  <div
                    key={c.id}
                    className="px-4 py-2 hover:bg-emerald-50 cursor-pointer"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.email} • {c.phone}</div>
                  </div>
                ))}
              </div>
            )}
            {customerQuery && customerOptions.length === 0 && !selectedCustomer && (
              <div className="mt-2 text-sm text-muted-foreground">
                No customer found.
              </div>
            )}
            {selectedCustomer && (
              <div className="mt-2 border rounded p-3 bg-emerald-50">
                <div className="font-semibold">{selectedCustomer.name}</div>
                <div className="text-xs text-muted-foreground">{selectedCustomer.email} • {selectedCustomer.phone}</div>
                <div className="text-xs">Previous trade-ins: {selectedCustomer.tradeInCount}</div>
                <Button variant="link" size="sm" onClick={() => setSelectedCustomer(null)}>Change</Button>
              </div>
            )}
            {errors.customer && <div className="text-destructive text-xs mt-1">{errors.customer}</div>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Trade-In Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reference Number</label>
              <Input value={referenceNumber} readOnly className="bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trade-In Date</label>
              <Input
                type="date"
                value={tradeInDate}
                onChange={e => setTradeInDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && <div className="text-destructive text-xs mt-1">{errors.date}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Staff Member</label>
              <Select value={staff} onValueChange={v => setStaff(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Staff" />
                </SelectTrigger>
                <SelectContent>
                  {mockStaff.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes/Comments</label>
              <Input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
        <Button onClick={handleNext} disabled={saving}>
          {saving ? 'Saving...' : 'Next: Add Trade-In Items'}
        </Button>
      </div>
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Trade-In?</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to cancel? All progress will be lost.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Editing</Button>
            <Button variant="destructive" onClick={confirmCancel}>Cancel Trade-In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {restored && (
        <div className="text-xs text-muted-foreground text-center mt-2">Draft restored.</div>
      )}
    </div>
  )
} 