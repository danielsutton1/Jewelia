"use client"

import { useState, useEffect } from "react"
import {
  Receipt,
  Printer,
  Mail,
  Download,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  DollarSign,
  Gift,
  Store,
  FileCheck,
  Truck,
  ShoppingBag,
  Tag,
  Percent,
  Calculator,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Sample data for demonstration
const sampleOrderItems = [
  {
    id: "item-1",
    name: "Diamond Solitaire Ring",
    sku: "DR-0123",
    price: 3499.99,
    quantity: 1,
    discount: 0,
  },
  {
    id: "item-2",
    name: "Pearl Necklace",
    sku: "NL-0456",
    price: 899.99,
    quantity: 2,
    discount: 50,
  },
  {
    id: "item-3",
    name: "Emerald Tennis Bracelet",
    sku: "BR-0789",
    price: 2199.99,
    quantity: 1,
    discount: 219.99,
  },
]

const sampleDiscounts: Discount[] = [
  { id: "disc-1", type: "item" as const, description: "Seasonal promotion", amount: 50 },
  { id: "disc-2", type: "item" as const, description: "Loyalty discount", amount: 219.99 },
  { id: "disc-3", type: "order" as const, description: "Coupon SUMMER2023", amount: 100 },
]

const samplePayments = [
  { id: "pay-1", method: "credit-card", description: "Visa ending in 4242", amount: 4000 },
  { id: "pay-2", method: "store-credit", description: "Store credit", amount: 500 },
]

// Types
interface OrderItem {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  discount: number
}

interface Discount {
  id: string
  type: "item" | "order"
  description: string
  amount: number
}

interface Payment {
  id: string
  method: string
  description: string
  amount: number
}

interface OrderSummaryProps {
  orderId?: string
  orderDate?: string
  orderItems?: OrderItem[]
  discounts?: Discount[]
  payments?: Payment[]
  taxRate?: number
  shipping?: number
  orderStatus?: "pending" | "processing" | "completed" | "cancelled" | "on-hold"
}

export function OrderSummarySidebar({
  orderId,
  orderDate,
  orderItems = sampleOrderItems,
  discounts = sampleDiscounts,
  payments = samplePayments,
  taxRate = 0.0825, // 8.25% tax rate
  shipping = 0,
  orderStatus = "processing",
}: OrderSummaryProps) {
  // State for collapsible sections
  const [isDiscountsOpen, setIsDiscountsOpen] = useState(false)
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false)

  // State for sticky behavior
  const [isSticky, setIsSticky] = useState(false)

  // Calculate order totals
  const itemCount = orderItems.reduce((total, item) => total + item.quantity, 0)
  const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const itemDiscounts = orderItems.reduce((total, item) => total + item.discount, 0)
  const orderDiscounts = discounts
    .filter((discount) => discount.type === "order")
    .reduce((total, discount) => total + discount.amount, 0)
  const totalDiscounts = itemDiscounts + orderDiscounts
  const taxableAmount = subtotal - totalDiscounts
  const taxAmount = taxableAmount * taxRate
  const totalDue = taxableAmount + taxAmount + shipping
  const totalPaid = payments.reduce((total, payment) => total + payment.amount, 0)
  const balanceRemaining = Math.max(0, totalDue - totalPaid)
  const paymentProgress = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsSticky(scrollPosition > 100) // Start sticking after scrolling 100px
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      case "on-hold":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit-card":
        return <CreditCard className="h-4 w-4" />
      case "cash":
        return <DollarSign className="h-4 w-4" />
      case "gift-card":
        return <Gift className="h-4 w-4" />
      case "store-credit":
        return <Store className="h-4 w-4" />
      case "check":
        return <FileCheck className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  return (
    <div className={`transition-all duration-200 ${isSticky ? "sticky top-4" : ""}`}>
      <Card className="w-full max-w-sm border shadow-md">
        <CardContent className="p-0">
          {/* Order Status Header */}
          <div className="relative">
            <div className={`absolute left-0 top-0 h-1 w-full ${getStatusColor(orderStatus)}`} />
            <div className="flex items-center justify-between p-4 pt-5">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(orderStatus)}`} />
                <span className="font-medium capitalize">{orderStatus}</span>
              </div>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Print Order</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Receipt</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      <span>Share Order</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 p-4 pt-0">
            {/* Order ID and Date */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>{orderId}</div>
              <div>{orderDate}</div>
            </div>

            {/* Item Count */}
            <div className="flex items-center gap-2 rounded-md bg-muted p-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {itemCount} {itemCount === 1 ? "item" : "items"} in order
              </span>
            </div>

            {/* Order Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {/* Discounts */}
              <Collapsible open={isDiscountsOpen} onOpenChange={setIsDiscountsOpen} className="space-y-2">
                <div className="flex justify-between">
                  <CollapsibleTrigger className="flex items-center gap-1 text-muted-foreground hover:underline">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Discounts</span>
                    {isDiscountsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </CollapsibleTrigger>
                  <span className="text-green-600">-{formatCurrency(totalDiscounts)}</span>
                </div>
                <CollapsibleContent className="space-y-1 rounded-md bg-muted/50 p-2">
                  {discounts.map((discount) => (
                    <div key={discount.id} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{discount.description}</span>
                      <span className="text-green-600">-{formatCurrency(discount.amount)}</span>
                    </div>
                  ))}
                  {itemDiscounts > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Item-specific discounts</span>
                      <span className="text-green-600">-{formatCurrency(itemDiscounts)}</span>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Tax */}
              <div className="flex justify-between">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calculator className="h-3.5 w-3.5" />
                  <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
                </div>
                <span>{formatCurrency(taxAmount)}</span>
              </div>

              {/* Shipping */}
              {shipping > 0 && (
                <div className="flex justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" />
                    <span>Shipping</span>
                  </div>
                  <span>{formatCurrency(shipping)}</span>
                </div>
              )}

              <Separator />

              {/* Total Due */}
              <div className="flex justify-between font-medium">
                <span>Total Due</span>
                <span>{formatCurrency(totalDue)}</span>
              </div>

              {/* Payments */}
              <Collapsible open={isPaymentsOpen} onOpenChange={setIsPaymentsOpen} className="space-y-2">
                <div className="flex justify-between">
                  <CollapsibleTrigger className="flex items-center gap-1 text-muted-foreground hover:underline">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Payments</span>
                    {isPaymentsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </CollapsibleTrigger>
                  <span className="text-blue-600">{formatCurrency(totalPaid)}</span>
                </div>
                <CollapsibleContent className="space-y-1 rounded-md bg-muted/50 p-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        {getPaymentMethodIcon(payment.method)}
                        <span>{payment.description}</span>
                      </span>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Balance Remaining */}
              <div className="flex justify-between font-medium">
                <span>Balance Remaining</span>
                <span className={balanceRemaining > 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(balanceRemaining)}
                </span>
              </div>
            </div>

            {/* Payment Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Payment Progress</span>
                <span>
                  {paymentProgress.toFixed(0)}% ({formatCurrency(totalPaid)} of {formatCurrency(totalDue)})
                </span>
              </div>
              <Progress value={paymentProgress} className="h-2" />
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap gap-2">
              {balanceRemaining === 0 ? (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                >
                  <CheckCircle className="h-3 w-3" />
                  <span>Paid in Full</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>Payment Required</span>
                </Badge>
              )}

              {totalDiscounts > 0 && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                >
                  <Percent className="h-3 w-3" />
                  <span>Discounts Applied</span>
                </Badge>
              )}

              {shipping > 0 && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  <Truck className="h-3 w-3" />
                  <span>Shipping</span>
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Add Payment</span>
              </Button>
              <Button variant="outline" className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                <span>Print Receipt</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
