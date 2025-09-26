"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter, Calendar, User, Package, DollarSign, FileText } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchCriteria {
  orderNumber?: string
  customerName?: string
  itemName?: string
  amount?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  paymentStatus?: string
}

interface EnhancedSearchProps {
  onSearch: (criteria: SearchCriteria) => void
  onClear: () => void
  placeholder?: string
  className?: string
  showAdvanced?: boolean
}

export function EnhancedSearch({ 
  onSearch, 
  onClear, 
  placeholder = "Search by order #, customer, item, amount...",
  className = "",
  showAdvanced = true 
}: EnhancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [criteria, setCriteria] = useState<SearchCriteria>({})
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Parse search query for quick filters
  useEffect(() => {
    if (searchQuery) {
      const newCriteria: SearchCriteria = {}
      const newActiveFilters: string[] = []

      // Check for order number pattern (ORD-xxx, #xxx, etc.)
      const orderNumberMatch = searchQuery.match(/(?:ORD-|#|order\s*#?)(\d+)/i)
      if (orderNumberMatch) {
        newCriteria.orderNumber = orderNumberMatch[1]
        newActiveFilters.push(`Order: ${orderNumberMatch[1]}`)
      }

      // Check for amount pattern ($xxx, xxx.xx, etc.)
      const amountMatch = searchQuery.match(/\$?(\d+(?:\.\d{2})?)/)
      if (amountMatch && !orderNumberMatch) {
        newCriteria.amount = amountMatch[1]
        newActiveFilters.push(`Amount: $${amountMatch[1]}`)
      }

      // Check for status keywords
      const statusKeywords = ['pending', 'completed', 'cancelled', 'processing', 'shipped', 'delivered']
      const foundStatus = statusKeywords.find(status => 
        searchQuery.toLowerCase().includes(status)
      )
      if (foundStatus) {
        newCriteria.status = foundStatus
        newActiveFilters.push(`Status: ${foundStatus}`)
      }

      // Check for payment status keywords
      const paymentKeywords = ['paid', 'pending', 'overdue', 'partial', 'refunded']
      const foundPaymentStatus = paymentKeywords.find(status => 
        searchQuery.toLowerCase().includes(status)
      )
      if (foundPaymentStatus) {
        newCriteria.paymentStatus = foundPaymentStatus
        newActiveFilters.push(`Payment: ${foundPaymentStatus}`)
      }

      // If no specific patterns found, treat as general search
      if (Object.keys(newCriteria).length === 0) {
        newCriteria.customerName = searchQuery
        newCriteria.itemName = searchQuery
        newActiveFilters.push(`General: ${searchQuery}`)
      }

      setCriteria(newCriteria)
      setActiveFilters(newActiveFilters)
      onSearch(newCriteria)
    } else {
      setCriteria({})
      setActiveFilters([])
      onClear()
    }
  }, [searchQuery, onSearch, onClear])

  const handleAdvancedSearch = (newCriteria: SearchCriteria) => {
    setCriteria(newCriteria)
    const filters: string[] = []
    
    if (newCriteria.orderNumber) filters.push(`Order: ${newCriteria.orderNumber}`)
    if (newCriteria.customerName) filters.push(`Customer: ${newCriteria.customerName}`)
    if (newCriteria.itemName) filters.push(`Item: ${newCriteria.itemName}`)
    if (newCriteria.amount) filters.push(`Amount: $${newCriteria.amount}`)
    if (newCriteria.status) filters.push(`Status: ${newCriteria.status}`)
    if (newCriteria.paymentStatus) filters.push(`Payment: ${newCriteria.paymentStatus}`)
    if (newCriteria.dateFrom) filters.push(`From: ${newCriteria.dateFrom}`)
    if (newCriteria.dateTo) filters.push(`To: ${newCriteria.dateTo}`)
    
    setActiveFilters(filters)
    onSearch(newCriteria)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setCriteria({})
    setActiveFilters([])
    onClear()
  }

  const removeFilter = (filterToRemove: string) => {
    const newFilters = activeFilters.filter(f => f !== filterToRemove)
    setActiveFilters(newFilters)
    
    // Rebuild criteria without the removed filter
    const newCriteria: SearchCriteria = {}
    newFilters.forEach(filter => {
      if (filter.startsWith('Order:')) newCriteria.orderNumber = filter.split(': ')[1]
      if (filter.startsWith('Customer:')) newCriteria.customerName = filter.split(': ')[1]
      if (filter.startsWith('Item:')) newCriteria.itemName = filter.split(': ')[1]
      if (filter.startsWith('Amount:')) newCriteria.amount = filter.split(': $')[1]
      if (filter.startsWith('Status:')) newCriteria.status = filter.split(': ')[1]
      if (filter.startsWith('Payment:')) newCriteria.paymentStatus = filter.split(': ')[1]
    })
    
    setCriteria(newCriteria)
    onSearch(newCriteria)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-20 w-full sm:w-[300px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 min-h-[44px] text-sm"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showAdvanced && (
            <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-emerald-50"
                >
                  <Filter className="h-4 w-4 text-emerald-600" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <AdvancedSearchForm 
                  criteria={criteria}
                  onSearch={handleAdvancedSearch}
                  onClose={() => setIsAdvancedOpen(false)}
                />
              </PopoverContent>
            </Popover>
          )}
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-50"
              onClick={clearAllFilters}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
              onClick={() => removeFilter(filter)}
            >
              {filter}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function AdvancedSearchForm({ 
  criteria, 
  onSearch, 
  onClose 
}: { 
  criteria: SearchCriteria
  onSearch: (criteria: SearchCriteria) => void
  onClose: () => void 
}) {
  const [formData, setFormData] = useState<SearchCriteria>(criteria)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Search className="h-4 w-4" />
          Advanced Search
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Order Number</label>
            <Input
              placeholder="ORD-123"
              value={formData.orderNumber || ""}
              onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Customer</label>
            <Input
              placeholder="John Doe"
              value={formData.customerName || ""}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Item Name</label>
            <Input
              placeholder="Gold Ring"
              value={formData.itemName || ""}
              onChange={(e) => setFormData({...formData, itemName: e.target.value})}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Amount</label>
            <Input
              placeholder="1000"
              value={formData.amount || ""}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
            <Select 
              value={formData.status || ""} 
              onValueChange={(value) => setFormData({...formData, status: value})}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Payment</label>
            <Select 
              value={formData.paymentStatus || ""} 
              onValueChange={(value) => setFormData({...formData, paymentStatus: value})}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Any payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any payment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Date From</label>
            <Input
              type="date"
              value={formData.dateFrom || ""}
              onChange={(e) => setFormData({...formData, dateFrom: e.target.value})}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Date To</label>
            <Input
              type="date"
              value={formData.dateTo || ""}
              onChange={(e) => setFormData({...formData, dateTo: e.target.value})}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-8"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="h-8 bg-emerald-600 hover:bg-emerald-700"
        >
          Search
        </Button>
      </div>
    </form>
  )
}
