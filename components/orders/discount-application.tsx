"use client"

import { useState } from "react"
import {
  Percent,
  DollarSign,
  Tag,
  Package,
  Users,
  ShoppingBag,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

// Sample data for demonstration
const sampleOrderItems = [
  {
    id: "item-1",
    name: "Diamond Solitaire Ring",
    sku: "DR-0123",
    category: "Rings",
    price: 3499.99,
    cost: 2100.0,
    quantity: 1,
    discount: 0,
  },
  {
    id: "item-2",
    name: "Pearl Necklace",
    sku: "NL-0456",
    category: "Necklaces",
    price: 899.99,
    cost: 450.0,
    quantity: 2,
    discount: 0,
  },
  {
    id: "item-3",
    name: "Emerald Tennis Bracelet",
    sku: "BR-0789",
    category: "Bracelets",
    price: 2199.99,
    cost: 1320.0,
    quantity: 1,
    discount: 0,
  },
]

const samplePromoCodes = [
  { code: "SUMMER2023", description: "Summer Sale 2023", type: "percentage", value: 15 },
  { code: "WELCOME50", description: "New Customer Discount", type: "amount", value: 50 },
  { code: "LOYALTY100", description: "Loyalty Program Reward", type: "amount", value: 100 },
  { code: "BOGO50", description: "Buy One Get One 50% Off", type: "special", value: 0 },
]

const sampleCategories = ["Rings", "Necklaces", "Bracelets", "Earrings", "Watches", "Pendants"]

const sampleCustomerTiers = [
  { id: "tier-1", name: "Standard", discount: 0 },
  { id: "tier-2", name: "Silver", discount: 5 },
  { id: "tier-3", name: "Gold", discount: 10 },
  { id: "tier-4", name: "Platinum", discount: 15 },
  { id: "tier-5", name: "Diamond", discount: 20 },
]

const sampleVolumeDiscounts = [
  { threshold: 2, discount: 5 },
  { threshold: 5, discount: 10 },
  { threshold: 10, discount: 15 },
]

// Types
interface OrderItem {
  id: string
  name: string
  sku: string
  category: string
  price: number
  cost: number
  quantity: number
  discount: number
}

interface DiscountApplicationProps {
  orderItems?: OrderItem[]
  onApplyDiscount?: (discountData: any) => void
}

export function DiscountApplication({
  orderItems = sampleOrderItems,
  onApplyDiscount = () => {},
}: DiscountApplicationProps) {
  const [activeTab, setActiveTab] = useState("percentage")
  const [discountType, setDiscountType] = useState("percentage")
  const [discountValue, setDiscountValue] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [validPromoCode, setValidPromoCode] = useState<any>(null)
  const [applicationMethod, setApplicationMethod] = useState("whole-order")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [requiresOverride, setRequiresOverride] = useState(false)
  const [overrideReason, setOverrideReason] = useState("")
  const [managerApprovalOpen, setManagerApprovalOpen] = useState(false)
  const [customerTier, setCustomerTier] = useState("")

  // Calculate original order total
  const originalOrderTotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)

  // Calculate original order cost
  const originalOrderCost = orderItems.reduce((total, item) => total + item.cost * item.quantity, 0)

  // Calculate original margin
  const originalMargin = originalOrderTotal - originalOrderCost
  const originalMarginPercent = (originalMargin / originalOrderTotal) * 100

  // Calculate discount amount based on current selections
  const calculateDiscountAmount = () => {
    let discountAmount = 0

    // Handle different discount types
    if (activeTab === "percentage") {
      const percentValue = Number.parseFloat(discountValue) || 0

      if (applicationMethod === "whole-order") {
        discountAmount = (percentValue / 100) * originalOrderTotal
      } else if (applicationMethod === "individual-items") {
        discountAmount = orderItems
          .filter((item) => selectedItems.includes(item.id))
          .reduce((total, item) => total + (item.price * item.quantity * percentValue) / 100, 0)
      } else if (applicationMethod === "categories") {
        discountAmount = orderItems
          .filter((item) => selectedCategories.includes(item.category))
          .reduce((total, item) => total + (item.price * item.quantity * percentValue) / 100, 0)
      }
    } else if (activeTab === "fixed-amount") {
      const fixedValue = Number.parseFloat(discountValue) || 0

      if (applicationMethod === "whole-order") {
        discountAmount = Math.min(fixedValue, originalOrderTotal)
      } else if (applicationMethod === "individual-items") {
        const selectedItemsTotal = orderItems
          .filter((item) => selectedItems.includes(item.id))
          .reduce((total, item) => total + item.price * item.quantity, 0)
        discountAmount = Math.min(fixedValue, selectedItemsTotal)
      } else if (applicationMethod === "categories") {
        const selectedCategoriesTotal = orderItems
          .filter((item) => selectedCategories.includes(item.category))
          .reduce((total, item) => total + item.price * item.quantity, 0)
        discountAmount = Math.min(fixedValue, selectedCategoriesTotal)
      }
    } else if (activeTab === "promo-code" && validPromoCode) {
      if (validPromoCode.type === "percentage") {
        discountAmount = (validPromoCode.value / 100) * originalOrderTotal
      } else if (validPromoCode.type === "amount") {
        discountAmount = Math.min(validPromoCode.value, originalOrderTotal)
      }
    } else if (activeTab === "volume-discount") {
      // Find the highest applicable volume discount
      const totalQuantity = orderItems.reduce((total, item) => total + item.quantity, 0)
      const applicableDiscount = [...sampleVolumeDiscounts]
        .sort((a, b) => b.threshold - a.threshold)
        .find((discount) => totalQuantity >= discount.threshold)

      if (applicableDiscount) {
        discountAmount = (applicableDiscount.discount / 100) * originalOrderTotal
      }
    } else if (activeTab === "customer-tier") {
      const selectedTier = sampleCustomerTiers.find((tier) => tier.id === customerTier)

      if (selectedTier) {
        discountAmount = (selectedTier.discount / 100) * originalOrderTotal
      }
    } else if (activeTab === "item-specific") {
      // This would be handled by the individual item discounts
      // For this example, we'll just use the selected items
      discountAmount = orderItems
        .filter((item) => selectedItems.includes(item.id))
        .reduce((total, item) => total + item.price * item.quantity * 0.1, 0) // 10% off selected items
    }

    return discountAmount
  }

  const discountAmount = calculateDiscountAmount()
  const discountedTotal = originalOrderTotal - discountAmount

  // Calculate new margin
  const newMargin = discountedTotal - originalOrderCost
  const newMarginPercent = (newMargin / discountedTotal) * 100
  const marginImpact = newMarginPercent - originalMarginPercent

  // Check if promo code is valid
  const checkPromoCode = () => {
    const foundPromo = samplePromoCodes.find((promo) => promo.code.toLowerCase() === promoCode.toLowerCase())

    setValidPromoCode(foundPromo || null)
  }

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    } else {
      setSelectedItems([...selectedItems, itemId])
    }
  }

  // Toggle category selection
  const toggleCategorySelection = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  // Handle discount application
  const handleApplyDiscount = () => {
    if (requiresOverride && !managerApprovalOpen) {
      setManagerApprovalOpen(true)
      return
    }

    // Prepare discount data
    const discountData = {
      type: activeTab,
      value: activeTab === "promo-code" ? validPromoCode : discountValue,
      applicationMethod,
      selectedItems: applicationMethod === "individual-items" ? selectedItems : [],
      selectedCategories: applicationMethod === "categories" ? selectedCategories : [],
      requiresOverride,
      overrideReason,
      discountAmount,
      originalTotal: originalOrderTotal,
      discountedTotal,
      marginImpact,
    }

    // Call the onApplyDiscount callback
    onApplyDiscount(discountData)

    // Reset form if needed
    // setDiscountValue("")
    // setPromoCode("")
    // setValidPromoCode(null)
    // setSelectedItems([])
    // setSelectedCategories([])
    setManagerApprovalOpen(false)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Apply Discount</CardTitle>
          <CardDescription>Select a discount type and application method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Discount Types */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Discount Type</h3>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                <TabsTrigger value="percentage" className="flex flex-col items-center gap-1 py-2">
                  <Percent className="h-4 w-4" />
                  <span className="text-xs">Percentage</span>
                </TabsTrigger>
                <TabsTrigger value="fixed-amount" className="flex flex-col items-center gap-1 py-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">Fixed Amount</span>
                </TabsTrigger>
                <TabsTrigger value="promo-code" className="flex flex-col items-center gap-1 py-2">
                  <Tag className="h-4 w-4" />
                  <span className="text-xs">Promo Code</span>
                </TabsTrigger>
                <TabsTrigger value="volume-discount" className="flex flex-col items-center gap-1 py-2">
                  <Package className="h-4 w-4" />
                  <span className="text-xs">Volume</span>
                </TabsTrigger>
                <TabsTrigger value="customer-tier" className="flex flex-col items-center gap-1 py-2">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Customer Tier</span>
                </TabsTrigger>
                <TabsTrigger value="item-specific" className="flex flex-col items-center gap-1 py-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-xs">Item Specific</span>
                </TabsTrigger>
              </TabsList>

              {/* Percentage Discount */}
              <TabsContent value="percentage" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="percentage-discount">Discount Percentage (%)</Label>
                  <div className="flex items-center">
                    <Input
                      id="percentage-discount"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </TabsContent>

              {/* Fixed Amount Discount */}
              <TabsContent value="fixed-amount" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="fixed-discount">Discount Amount</Label>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="fixed-discount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Promo Code */}
              <TabsContent value="promo-code" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="promo-code">Promotional Code</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="promo-code"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={checkPromoCode}>Verify</Button>
                  </div>

                  {promoCode && (
                    <div className="mt-2">
                      {validPromoCode ? (
                        <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            Valid: {validPromoCode.description}(
                            {validPromoCode.type === "percentage"
                              ? `${validPromoCode.value}% off`
                              : formatCurrency(validPromoCode.value)}
                            )
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                          <AlertCircle className="h-4 w-4" />
                          <span>Invalid promo code</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-md border">
                  <div className="bg-muted px-4 py-2 font-medium">Available Promo Codes</div>
                  <div className="divide-y">
                    {samplePromoCodes.map((promo) => (
                      <div key={promo.code} className="flex items-center justify-between p-3">
                        <div>
                          <div className="font-medium">{promo.code}</div>
                          <div className="text-sm text-muted-foreground">{promo.description}</div>
                        </div>
                        <Badge>
                          {promo.type === "percentage" ? `${promo.value}% off` : formatCurrency(promo.value)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Volume Discount */}
              <TabsContent value="volume-discount" className="space-y-4 pt-4">
                <div className="rounded-md border">
                  <div className="bg-muted px-4 py-2 font-medium">Volume Discount Tiers</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quantity Threshold</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleVolumeDiscounts.map((tier) => {
                        const totalQuantity = orderItems.reduce((total, item) => total + item.quantity, 0)
                        const isApplicable = totalQuantity >= tier.threshold

                        return (
                          <TableRow key={tier.threshold}>
                            <TableCell>{tier.threshold}+ items</TableCell>
                            <TableCell>{tier.discount}% off</TableCell>
                            <TableCell>
                              {isApplicable ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                >
                                  Applied
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-muted text-muted-foreground">
                                  Not Applicable
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="rounded-md bg-muted p-3">
                  <div className="text-sm">
                    Current Order:{" "}
                    <span className="font-medium">
                      {orderItems.reduce((total, item) => total + item.quantity, 0)} items
                    </span>
                  </div>
                </div>
              </TabsContent>

              {/* Customer Tier */}
              <TabsContent value="customer-tier" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-tier">Customer Loyalty Tier</Label>
                  <Select value={customerTier} onValueChange={setCustomerTier}>
                    <SelectTrigger id="customer-tier">
                      <SelectValue placeholder="Select customer tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleCustomerTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.name} ({tier.discount}% discount)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <div className="bg-muted px-4 py-2 font-medium">Customer Tier Discounts</div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {sampleCustomerTiers.map((tier) => (
                        <div key={tier.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                tier.id === "tier-1"
                                  ? "bg-gray-400"
                                  : tier.id === "tier-2"
                                    ? "bg-gray-500"
                                    : tier.id === "tier-3"
                                      ? "bg-yellow-400"
                                      : tier.id === "tier-4"
                                        ? "bg-gray-300"
                                        : "bg-blue-400"
                              }`}
                            />
                            <span>{tier.name}</span>
                          </div>
                          <Badge variant="outline">{tier.discount}% off</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Item Specific */}
              <TabsContent value="item-specific" className="space-y-4 pt-4">
                <div className="rounded-md border">
                  <div className="bg-muted px-4 py-2 font-medium">Select Items for Discount</div>
                  <div className="divide-y">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`item-${item.id}`}
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`item-${item.id}`} className="cursor-pointer">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {item.sku} | {formatCurrency(item.price)} × {item.quantity}
                            </div>
                          </Label>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                          <div className="text-sm text-muted-foreground">Category: {item.category}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-discount">Discount Percentage for Selected Items (%)</Label>
                  <div className="flex items-center">
                    <Input
                      id="item-discount"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="10"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Application Method */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Application Method</h3>
            <RadioGroup
              value={applicationMethod}
              onValueChange={setApplicationMethod}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <div>
                <RadioGroupItem value="whole-order" id="whole-order" className="peer sr-only" />
                <Label
                  htmlFor="whole-order"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <ShoppingBag className="mb-2 h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Whole Order</div>
                    <div className="text-xs text-muted-foreground">Apply to entire order</div>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="individual-items" id="individual-items" className="peer sr-only" />
                <Label
                  htmlFor="individual-items"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Tag className="mb-2 h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Individual Items</div>
                    <div className="text-xs text-muted-foreground">Apply to specific items</div>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="categories" id="categories" className="peer sr-only" />
                <Label
                  htmlFor="categories"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FileText className="mb-2 h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Categories</div>
                    <div className="text-xs text-muted-foreground">Apply to product categories</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {/* Individual Items Selection */}
            {applicationMethod === "individual-items" && activeTab !== "item-specific" && (
              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 font-medium">Select Items</div>
                <div className="divide-y">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`select-item-${item.id}`}
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor={`select-item-${item.id}`} className="cursor-pointer">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {item.sku} | {formatCurrency(item.price)} × {item.quantity}
                          </div>
                        </Label>
                      </div>
                      <div className="text-right font-medium">{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Selection */}
            {applicationMethod === "categories" && (
              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 font-medium">Select Categories</div>
                <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
                  {sampleCategories.map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategorySelection(category)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor={`category-${category}`} className="cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Override Section */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="override">
              <AccordionTrigger className="text-sm font-medium">Override & Approval</AccordionTrigger>
              <AccordionContent className="space-y-4 px-1">
                <div className="flex items-center space-x-2">
                  <Switch id="requires-override" checked={requiresOverride} onCheckedChange={setRequiresOverride} />
                  <Label htmlFor="requires-override" className="flex items-center gap-2">
                    Requires Manager Approval
                    {requiresOverride ? (
                      <Lock className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Unlock className="h-4 w-4 text-green-500" />
                    )}
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="override-reason">Reason for Override</Label>
                  <Select value={overrideReason} onValueChange={setOverrideReason} disabled={!requiresOverride}>
                    <SelectTrigger id="override-reason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer-satisfaction">Customer Satisfaction</SelectItem>
                      <SelectItem value="price-match">Price Match</SelectItem>
                      <SelectItem value="damaged-item">Damaged Item</SelectItem>
                      <SelectItem value="loyal-customer">Loyal Customer Reward</SelectItem>
                      <SelectItem value="bulk-purchase">Bulk Purchase Incentive</SelectItem>
                      <SelectItem value="special-event">Special Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {overrideReason === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="override-notes">Additional Notes</Label>
                    <Textarea
                      id="override-notes"
                      placeholder="Provide details about this override request"
                      disabled={!requiresOverride}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <div className="flex flex-col space-y-4">
          {/* Margin Impact */}
          <div className="w-full space-y-2 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-medium">
                <BarChart3 className="h-4 w-4" />
                Margin Impact
              </h3>
              <Badge
                variant="outline"
                className={`${
                  marginImpact < -5
                    ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : marginImpact < 0
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                }`}
              >
                {marginImpact.toFixed(2)}% change
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Original Margin:</span>
                <span className="font-medium">
                  {formatCurrency(originalMargin)} ({originalMarginPercent.toFixed(2)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>New Margin:</span>
                <span className="font-medium">
                  {formatCurrency(newMargin)} ({newMarginPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Low</span>
                <span>Target</span>
                <span>High</span>
              </div>
              <Progress value={newMarginPercent} max={60} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20%</span>
                <span>40%</span>
                <span>60%</span>
              </div>
            </div>
          </div>

          {/* Discount Summary */}
          <div className="w-full space-y-2 rounded-md border p-4">
            <h3 className="font-medium">Discount Summary</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Original Total:</span>
                <span className="font-medium">{formatCurrency(originalOrderTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Discount Amount:</span>
                <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>New Total:</span>
                <span>{formatCurrency(discountedTotal)}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleApplyDiscount}
            disabled={
              (activeTab === "percentage" && !discountValue) ||
              (activeTab === "fixed-amount" && !discountValue) ||
              (activeTab === "promo-code" && !validPromoCode) ||
              (activeTab === "customer-tier" && !customerTier) ||
              (activeTab === "item-specific" && (!selectedItems.length || !discountValue)) ||
              (applicationMethod === "individual-items" && !selectedItems.length) ||
              (applicationMethod === "categories" && !selectedCategories.length)
            }
            className="w-full"
          >
            Apply Discount
          </Button>
        </div>
      </Card>

      {/* Manager Approval Dialog */}
      <Dialog open={managerApprovalOpen} onOpenChange={setManagerApprovalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manager Approval Required</DialogTitle>
            <DialogDescription>This discount requires manager approval before it can be applied.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-muted p-3">
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Discount Type:</span>{" "}
                  {activeTab === "percentage"
                    ? `${discountValue}% off`
                    : activeTab === "fixed-amount"
                      ? formatCurrency(Number.parseFloat(discountValue) || 0)
                      : activeTab === "promo-code" && validPromoCode
                        ? validPromoCode.code
                        : activeTab === "volume-discount"
                          ? "Volume Discount"
                          : activeTab === "customer-tier"
                            ? "Customer Tier Pricing"
                            : "Item-specific Discount"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Discount Amount:</span> {formatCurrency(discountAmount)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Reason:</span>{" "}
                  {overrideReason
                    ? overrideReason.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                    : "Not specified"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-id">Manager ID</Label>
              <Input id="manager-id" type="text" placeholder="Enter manager ID" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-password">Password</Label>
              <Input id="manager-password" type="password" placeholder="Enter password" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManagerApprovalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyDiscount}>Approve Discount</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
