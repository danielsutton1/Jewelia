"use client"

import { useState, useEffect } from "react"
import {
  CreditCard,
  DollarSign,
  Gift,
  Calendar,
  BanknoteIcon as Bank,
  FileCheck,
  Plus,
  Trash2,
  Receipt,
  CreditCardIcon,
  Percent,
  Printer,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  FileType2Icon as CreditCardIcon2,
  Wallet,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

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

const sampleSavedCards = [
  {
    id: "card-1",
    type: "visa",
    last4: "4242",
    expiry: "05/25",
    name: "John Smith",
  },
  {
    id: "card-2",
    type: "mastercard",
    last4: "5678",
    expiry: "08/26",
    name: "John Smith",
  },
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

interface PaymentMethod {
  id: string
  type: string
  amount: number
  details: any
  status: "pending" | "processing" | "completed" | "failed"
}

interface PaymentInterfaceProps {
  orderItems?: OrderItem[]
  orderTotal?: number
  taxAmount?: number
  discountAmount?: number
  onPaymentComplete?: (paymentData: any) => void
}

export function PaymentInterface({
  orderItems = sampleOrderItems,
  orderTotal: propOrderTotal,
  taxAmount: propTaxAmount = 0,
  discountAmount: propDiscountAmount = 0,
  onPaymentComplete = () => {},
}: PaymentInterfaceProps) {
  // Calculate order totals if not provided
  const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const discountAmount = propDiscountAmount || orderItems.reduce((total, item) => total + item.discount, 0)
  const taxRate = 0.0825 // 8.25% tax rate
  const taxAmount = propTaxAmount || (subtotal - discountAmount) * taxRate
  const orderTotal = propOrderTotal || subtotal - discountAmount + taxAmount

  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "payment-1",
      type: "credit-card",
      amount: orderTotal,
      details: {
        cardType: "new",
        processingMethod: "terminal",
      },
      status: "pending",
    },
  ])

  // State for current payment method being edited
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0)

  // State for remaining balance
  const [remainingBalance, setRemainingBalance] = useState(orderTotal)

  // State for cash payment
  const [cashTendered, setCashTendered] = useState("")
  const [changeDue, setChangeDue] = useState(0)

  // State for tip
  const [tipAmount, setTipAmount] = useState(0)
  const [tipType, setTipType] = useState<"none" | "amount" | "percentage">("none")
  const [tipPercentage, setTipPercentage] = useState(15)
  const [tipCustomAmount, setTipCustomAmount] = useState("")

  // State for receipt options
  const [receiptMethod, setReceiptMethod] = useState<"print" | "email" | "text" | "none">("print")
  const [receiptEmail, setReceiptEmail] = useState("")
  const [receiptPhone, setReceiptPhone] = useState("")

  // State for layaway
  const [layawayMonths, setLayawayMonths] = useState(3)
  const [layawayDownPayment, setLayawayDownPayment] = useState(orderTotal * 0.2) // 20% down payment

  // State for check
  const [checkNumber, setCheckNumber] = useState("")
  const [checkDate, setCheckDate] = useState("")

  // State for gift card
  const [giftCardNumber, setGiftCardNumber] = useState("")
  const [giftCardPin, setGiftCardPin] = useState("")
  const [giftCardBalance, setGiftCardBalance] = useState(0)
  const [giftCardVerified, setGiftCardVerified] = useState(false)

  // State for store credit
  const [storeCredit, setStoreCredit] = useState(150) // Sample store credit balance

  // State for credit card
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardName, setCardName] = useState("")
  const [saveCard, setSaveCard] = useState(false)

  // State for receipt preview
  const [showReceiptPreview, setShowReceiptPreview] = useState(false)

  // State for payment processing
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Update remaining balance when payment methods change
  useEffect(() => {
    const totalPaid = paymentMethods.reduce((total, method) => total + method.amount, 0)
    const newRemainingBalance = orderTotal + tipAmount - totalPaid
    setRemainingBalance(newRemainingBalance)

    // Calculate change due for cash payments
    if (paymentMethods.some((method) => method.type === "cash")) {
      const cashMethod = paymentMethods.find((method) => method.type === "cash")
      if (cashMethod && cashMethod.details.tendered > totalPaid) {
        setChangeDue(cashMethod.details.tendered - totalPaid)
      } else {
        setChangeDue(0)
      }
    }
  }, [paymentMethods, orderTotal, tipAmount])

  // Update tip amount when tip type or percentage changes
  useEffect(() => {
    if (tipType === "percentage") {
      setTipAmount((orderTotal * tipPercentage) / 100)
    } else if (tipType === "amount") {
      setTipAmount(Number(tipCustomAmount) || 0)
    } else {
      setTipAmount(0)
    }
  }, [tipType, tipPercentage, tipCustomAmount, orderTotal])

  // Handle adding a new payment method
  const addPaymentMethod = () => {
    if (remainingBalance <= 0) return

    const newPaymentMethod: PaymentMethod = {
      id: `payment-${paymentMethods.length + 1}`,
      type: "credit-card",
      amount: remainingBalance,
      details: {
        cardType: "new",
        processingMethod: "terminal",
      },
      status: "pending",
    }

    setPaymentMethods([...paymentMethods, newPaymentMethod])
    setCurrentPaymentIndex(paymentMethods.length)
  }

  // Handle removing a payment method
  const removePaymentMethod = (index: number) => {
    const updatedMethods = [...paymentMethods]
    updatedMethods.splice(index, 1)
    setPaymentMethods(updatedMethods)
    setCurrentPaymentIndex(Math.min(currentPaymentIndex, updatedMethods.length - 1))
  }

  // Handle payment method type change
  const handlePaymentTypeChange = (type: string) => {
    const updatedMethods = [...paymentMethods]
    updatedMethods[currentPaymentIndex] = {
      ...updatedMethods[currentPaymentIndex],
      type,
      details: getDefaultDetailsForType(type),
    }
    setPaymentMethods(updatedMethods)

    // Reset related state based on type
    if (type === "cash") {
      setCashTendered("")
      setChangeDue(0)
    } else if (type === "gift-card") {
      setGiftCardNumber("")
      setGiftCardPin("")
      setGiftCardBalance(0)
      setGiftCardVerified(false)
    } else if (type === "check") {
      setCheckNumber("")
      setCheckDate("")
    }
  }

  // Get default details for payment type
  const getDefaultDetailsForType = (type: string) => {
    switch (type) {
      case "cash":
        return { tendered: 0 }
      case "credit-card":
        return { cardType: "new", processingMethod: "terminal" }
      case "store-credit":
        return { available: storeCredit }
      case "gift-card":
        return { number: "", balance: 0, verified: false }
      case "layaway":
        return { months: 3, downPayment: orderTotal * 0.2, schedule: [] }
      case "wire-transfer":
        return { accountInfo: "", reference: "" }
      case "check":
        return { number: "", date: "" }
      default:
        return {}
    }
  }

  // Handle payment amount change
  const handlePaymentAmountChange = (amount: number) => {
    const updatedMethods = [...paymentMethods]
    updatedMethods[currentPaymentIndex] = {
      ...updatedMethods[currentPaymentIndex],
      amount: Math.min(amount, remainingBalance + updatedMethods[currentPaymentIndex].amount),
    }
    setPaymentMethods(updatedMethods)
  }

  // Handle cash tendered change
  const handleCashTenderedChange = (value: string) => {
    setCashTendered(value)
    const tendered = Number(value) || 0

    const updatedMethods = [...paymentMethods]
    updatedMethods[currentPaymentIndex] = {
      ...updatedMethods[currentPaymentIndex],
      details: { ...updatedMethods[currentPaymentIndex].details, tendered },
    }
    setPaymentMethods(updatedMethods)
  }

  // Verify gift card
  const verifyGiftCard = () => {
    // In a real app, this would make an API call to verify the gift card
    // For this demo, we'll simulate a successful verification
    setGiftCardVerified(true)
    setGiftCardBalance(500) // Sample balance

    const updatedMethods = [...paymentMethods]
    updatedMethods[currentPaymentIndex] = {
      ...updatedMethods[currentPaymentIndex],
      details: {
        ...updatedMethods[currentPaymentIndex].details,
        number: giftCardNumber,
        balance: 500,
        verified: true,
      },
      amount: Math.min(500, remainingBalance + updatedMethods[currentPaymentIndex].amount),
    }
    setPaymentMethods(updatedMethods)
  }

  // Handle layaway setup
  const handleLayawaySetup = (months: number, downPayment: number) => {
    setLayawayMonths(months)
    setLayawayDownPayment(downPayment)

    // Calculate payment schedule
    const remainingAmount = orderTotal - downPayment
    const monthlyPayment = remainingAmount / months
    const schedule = Array.from({ length: months }, (_, i) => ({
      date: new Date(new Date().setMonth(new Date().getMonth() + i + 1)),
      amount: monthlyPayment,
    }))

    const updatedMethods = [...paymentMethods]
    updatedMethods[currentPaymentIndex] = {
      ...updatedMethods[currentPaymentIndex],
      details: {
        ...updatedMethods[currentPaymentIndex].details,
        months,
        downPayment,
        schedule,
      },
      amount: downPayment,
    }
    setPaymentMethods(updatedMethods)
  }

  // Handle check details
  const handleCheckDetails = (number: string, date: string) => {
    setCheckNumber(number)
    setCheckDate(date)

    const updatedMethods = [...paymentMethods]
    updatedMethods[currentPaymentIndex] = {
      ...updatedMethods[currentPaymentIndex],
      details: {
        ...updatedMethods[currentPaymentIndex].details,
        number,
        date,
      },
    }
    setPaymentMethods(updatedMethods)
  }

  // Process payment
  const processPayment = () => {
    setIsProcessing(true)
    setPaymentError(null)

    // Simulate payment processing
    setTimeout(() => {
      // In a real app, this would make API calls to process each payment method
      const updatedMethods = paymentMethods.map((method) => ({
        ...method,
        status: "completed" as const,
      }))

      setPaymentMethods(updatedMethods)
      setIsProcessing(false)
      setPaymentComplete(true)

      // Call the onPaymentComplete callback
      onPaymentComplete({
        paymentMethods: updatedMethods,
        orderTotal,
        tipAmount,
        totalPaid: orderTotal + tipAmount,
        receiptMethod,
        receiptEmail: receiptMethod === "email" ? receiptEmail : undefined,
        receiptPhone: receiptMethod === "text" ? receiptPhone : undefined,
      })
    }, 2000)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Payment Methods Section */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Select one or more payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Tabs */}
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div
                    key={method.id}
                    className={`rounded-lg border ${
                      index === currentPaymentIndex ? "border-primary" : "border-border"
                    } overflow-hidden`}
                  >
                    <div
                      className={`flex items-center justify-between p-3 ${
                        index === currentPaymentIndex ? "bg-primary/10" : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setCurrentPaymentIndex(index)}
                        >
                          {index === currentPaymentIndex ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {method.type === "credit-card" && <CreditCard className="h-4 w-4" />}
                            {method.type === "cash" && <DollarSign className="h-4 w-4" />}
                            {method.type === "gift-card" && <Gift className="h-4 w-4" />}
                            {method.type === "layaway" && <Calendar className="h-4 w-4" />}
                            {method.type === "wire-transfer" && <Bank className="h-4 w-4" />}
                            {method.type === "check" && <FileCheck className="h-4 w-4" />}
                            {method.type === "store-credit" && <Store className="h-4 w-4" />}
                            {method.type === "credit-card" && "Credit/Debit Card"}
                            {method.type === "cash" && "Cash"}
                            {method.type === "gift-card" && "Gift Card"}
                            {method.type === "layaway" && "Layaway"}
                            {method.type === "wire-transfer" && "Wire Transfer"}
                            {method.type === "check" && "Check"}
                            {method.type === "store-credit" && "Store Credit"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {method.status === "completed" && "Payment completed"}
                            {method.status === "processing" && "Processing payment..."}
                            {method.status === "failed" && "Payment failed"}
                            {method.status === "pending" && "Pending payment"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(method.amount)}</div>
                          {method.type === "cash" && method.details.tendered > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Tendered: {formatCurrency(method.details.tendered)}
                            </div>
                          )}
                        </div>
                        {paymentMethods.length > 1 && !paymentComplete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removePaymentMethod(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {index === currentPaymentIndex && (
                      <div className="p-4 space-y-4">
                        {/* Payment Type Selection */}
                        <div className="space-y-2">
                          <Label>Payment Type</Label>
                          <RadioGroup
                            value={method.type}
                            onValueChange={handlePaymentTypeChange}
                            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                          >
                            <div>
                              <RadioGroupItem value="credit-card" id="credit-card" className="peer sr-only" />
                              <Label
                                htmlFor="credit-card"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <CreditCard className="mb-2 h-6 w-6" />
                                <span className="text-center text-sm">Credit/Debit</span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                              <Label
                                htmlFor="cash"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <DollarSign className="mb-2 h-6 w-6" />
                                <span className="text-center text-sm">Cash</span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="gift-card" id="gift-card" className="peer sr-only" />
                              <Label
                                htmlFor="gift-card"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Gift className="mb-2 h-6 w-6" />
                                <span className="text-center text-sm">Gift Card</span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="store-credit" id="store-credit" className="peer sr-only" />
                              <Label
                                htmlFor="store-credit"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Store className="mb-2 h-6 w-6" />
                                <span className="text-center text-sm">Store Credit</span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="layaway" id="layaway" className="peer sr-only" />
                              <Label
                                htmlFor="layaway"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Calendar className="mb-2 h-6 w-6" />
                                <span className="text-center text-sm">Layaway</span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="wire-transfer" id="wire-transfer" className="peer sr-only" />
                              <Label
                                htmlFor="wire-transfer"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Bank className="mb-2 h-6 w-6" />
                                <span className="text-center text-sm">Wire Transfer</span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="check" id="check" className="peer sr-only" />
                              <Label
                                htmlFor="check"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <FileCheck className="mb-2 h-6 w-6" />
                                <span className="text-center text-sm">Check</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Payment Amount */}
                        <div className="space-y-2">
                          <Label htmlFor={`payment-amount-${method.id}`}>Payment Amount</Label>
                          <div className="flex items-center">
                            <span className="mr-2 text-sm text-muted-foreground">$</span>
                            <Input
                              id={`payment-amount-${method.id}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={method.amount}
                              onChange={(e) => handlePaymentAmountChange(Number(e.target.value) || 0)}
                              className="w-full"
                              disabled={method.type === "layaway" || method.status !== "pending"}
                            />
                          </div>
                        </div>

                        {/* Payment Type Specific Fields */}
                        {method.type === "credit-card" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Card Processing Method</Label>
                              <RadioGroup
                                value={method.details.processingMethod}
                                onValueChange={(value) => {
                                  const updatedMethods = [...paymentMethods]
                                  updatedMethods[currentPaymentIndex] = {
                                    ...updatedMethods[currentPaymentIndex],
                                    details: {
                                      ...updatedMethods[currentPaymentIndex].details,
                                      processingMethod: value,
                                    },
                                  }
                                  setPaymentMethods(updatedMethods)
                                }}
                                className="grid grid-cols-3 gap-2"
                              >
                                <div>
                                  <RadioGroupItem value="terminal" id="terminal" className="peer sr-only" />
                                  <Label
                                    htmlFor="terminal"
                                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                  >
                                    <CreditCardIcon className="mb-2 h-6 w-6" />
                                    <span className="text-center text-sm">Terminal</span>
                                  </Label>
                                </div>
                                <div>
                                  <RadioGroupItem value="manual" id="manual" className="peer sr-only" />
                                  <Label
                                    htmlFor="manual"
                                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                  >
                                    <CreditCardIcon2 className="mb-2 h-6 w-6" />
                                    <span className="text-center text-sm">Manual Entry</span>
                                  </Label>
                                </div>
                                <div>
                                  <RadioGroupItem value="saved" id="saved" className="peer sr-only" />
                                  <Label
                                    htmlFor="saved"
                                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                  >
                                    <Wallet className="mb-2 h-6 w-6" />
                                    <span className="text-center text-sm">Saved Card</span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {method.details.processingMethod === "terminal" && (
                              <div className="rounded-md bg-muted p-4 text-center">
                                <p className="text-sm font-medium">Ready to process payment on terminal</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Please ask the customer to insert, tap, or swipe their card on the terminal
                                </p>
                              </div>
                            )}

                            {method.details.processingMethod === "manual" && (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label htmlFor="card-number">Card Number</Label>
                                  <Input
                                    id="card-number"
                                    placeholder="•••• •••• •••• ••••"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="card-expiry">Expiry Date</Label>
                                    <Input
                                      id="card-expiry"
                                      placeholder="MM/YY"
                                      value={cardExpiry}
                                      onChange={(e) => setCardExpiry(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="card-cvv">CVV</Label>
                                    <Input
                                      id="card-cvv"
                                      placeholder="•••"
                                      value={cardCvv}
                                      onChange={(e) => setCardCvv(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="card-name">Cardholder Name</Label>
                                  <Input
                                    id="card-name"
                                    placeholder="Name on card"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="save-card"
                                    checked={saveCard}
                                    onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                                  />
                                  <Label htmlFor="save-card">Save card for future purchases</Label>
                                </div>
                              </div>
                            )}

                            {method.details.processingMethod === "saved" && (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label>Select a saved card</Label>
                                  <div className="space-y-2">
                                    {sampleSavedCards.map((card) => (
                                      <div
                                        key={card.id}
                                        className="flex items-center justify-between rounded-md border p-3"
                                      >
                                        <div className="flex items-center gap-3">
                                          <RadioGroupItem
                                            value={card.id}
                                            id={card.id}
                                            checked={method.details.cardId === card.id}
                                            onClick={() => {
                                              const updatedMethods = [...paymentMethods]
                                              updatedMethods[currentPaymentIndex] = {
                                                ...updatedMethods[currentPaymentIndex],
                                                details: {
                                                  ...updatedMethods[currentPaymentIndex].details,
                                                  cardId: card.id,
                                                },
                                              }
                                              setPaymentMethods(updatedMethods)
                                            }}
                                          />
                                          <div>
                                            <div className="font-medium flex items-center gap-2">
                                              {card.type === "visa" && <span className="text-blue-600">Visa</span>}
                                              {card.type === "mastercard" && (
                                                <span className="text-red-600">Mastercard</span>
                                              )}
                                              •••• {card.last4}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              Expires {card.expiry} | {card.name}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {method.type === "cash" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="cash-tendered">Cash Tendered</Label>
                              <div className="flex items-center">
                                <span className="mr-2 text-sm text-muted-foreground">$</span>
                                <Input
                                  id="cash-tendered"
                                  type="number"
                                  min={method.amount}
                                  step="0.01"
                                  placeholder="0.00"
                                  value={cashTendered}
                                  onChange={(e) => handleCashTenderedChange(e.target.value)}
                                  className="w-full"
                                />
                              </div>
                            </div>

                            {Number(cashTendered) > 0 && (
                              <div className="rounded-md bg-muted p-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Change Due:</span>
                                  <span className="font-medium">
                                    {formatCurrency(Math.max(0, Number(cashTendered) - method.amount))}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-4 gap-2">
                              {[20, 50, 100, 200].map((amount) => (
                                <Button
                                  key={amount}
                                  variant="outline"
                                  onClick={() => handleCashTenderedChange(amount.toString())}
                                >
                                  ${amount}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {method.type === "gift-card" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="gift-card-number">Gift Card Number</Label>
                              <Input
                                id="gift-card-number"
                                placeholder="Enter gift card number"
                                value={giftCardNumber}
                                onChange={(e) => setGiftCardNumber(e.target.value)}
                                disabled={giftCardVerified}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="gift-card-pin">PIN (if applicable)</Label>
                              <Input
                                id="gift-card-pin"
                                placeholder="Enter PIN"
                                value={giftCardPin}
                                onChange={(e) => setGiftCardPin(e.target.value)}
                                disabled={giftCardVerified}
                              />
                            </div>

                            {!giftCardVerified ? (
                              <Button onClick={verifyGiftCard} disabled={!giftCardNumber} className="w-full">
                                Verify Gift Card
                              </Button>
                            ) : (
                              <div className="rounded-md bg-muted p-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Gift Card Balance:</span>
                                  <span className="font-medium">{formatCurrency(giftCardBalance)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-sm">Amount to Apply:</span>
                                  <span className="font-medium">
                                    {formatCurrency(Math.min(giftCardBalance, method.amount))}
                                  </span>
                                </div>
                                {giftCardBalance < method.amount && (
                                  <div className="mt-2 text-xs text-amber-600">
                                    Note: Gift card balance is less than the payment amount
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {method.type === "store-credit" && (
                          <div className="space-y-4">
                            <div className="rounded-md bg-muted p-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Available Store Credit:</span>
                                <span className="font-medium">{formatCurrency(storeCredit)}</span>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm">Amount to Apply:</span>
                                <span className="font-medium">
                                  {formatCurrency(Math.min(storeCredit, method.amount))}
                                </span>
                              </div>
                              {storeCredit < method.amount && (
                                <div className="mt-2 text-xs text-amber-600">
                                  Note: Store credit balance is less than the payment amount
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {method.type === "layaway" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="layaway-months">Layaway Period (months)</Label>
                              <Select
                                value={layawayMonths.toString()}
                                onValueChange={(value) => {
                                  const months = Number.parseInt(value)
                                  handleLayawaySetup(months, layawayDownPayment)
                                }}
                              >
                                <SelectTrigger id="layaway-months">
                                  <SelectValue placeholder="Select months" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3">3 months</SelectItem>
                                  <SelectItem value="6">6 months</SelectItem>
                                  <SelectItem value="9">9 months</SelectItem>
                                  <SelectItem value="12">12 months</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="down-payment">Down Payment</Label>
                              <div className="flex items-center">
                                <span className="mr-2 text-sm text-muted-foreground">$</span>
                                <Input
                                  id="down-payment"
                                  type="number"
                                  min={orderTotal * 0.1} // Minimum 10% down payment
                                  max={orderTotal * 0.5} // Maximum 50% down payment
                                  step="0.01"
                                  value={layawayDownPayment}
                                  onChange={(e) => {
                                    const downPayment = Number(e.target.value) || 0
                                    handleLayawaySetup(layawayMonths, downPayment)
                                  }}
                                  className="w-full"
                                />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Minimum: {formatCurrency(orderTotal * 0.1)} (10%) | Recommended:{" "}
                                {formatCurrency(orderTotal * 0.2)} (20%)
                              </div>
                            </div>

                            <div className="rounded-md border">
                              <div className="bg-muted px-4 py-2 font-medium text-sm">Payment Schedule</div>
                              <div className="divide-y">
                                <div className="flex justify-between items-center p-3">
                                  <span className="text-sm">Today (Down Payment)</span>
                                  <span className="font-medium">{formatCurrency(layawayDownPayment)}</span>
                                </div>
                                {method.details.schedule &&
                                  method.details.schedule.map((payment: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-3">
                                      <span className="text-sm">{formatDate(payment.date)}</span>
                                      <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {method.type === "wire-transfer" && (
                          <div className="space-y-4">
                            <div className="rounded-md bg-muted p-4">
                              <h4 className="font-medium mb-2">Wire Transfer Instructions</h4>
                              <div className="space-y-1 text-sm">
                                <p>Bank Name: First National Bank</p>
                                <p>Account Name: Jewelia Jewelry Store</p>
                                <p>Account Number: XXXX-XXXX-XXXX-1234</p>
                                <p>Routing Number: XXXXXXXXX</p>
                                <p>Reference: INV-{Math.floor(Math.random() * 10000)}</p>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Please provide these details to the customer. The order will be processed once the wire
                              transfer is confirmed.
                            </div>
                          </div>
                        )}

                        {method.type === "check" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="check-number">Check Number</Label>
                              <Input
                                id="check-number"
                                placeholder="Enter check number"
                                value={checkNumber}
                                onChange={(e) => handleCheckDetails(e.target.value, checkDate)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="check-date">Check Date</Label>
                              <Input
                                id="check-date"
                                type="date"
                                value={checkDate}
                                onChange={(e) => handleCheckDetails(checkNumber, e.target.value)}
                              />
                            </div>

                            <div className="text-sm text-muted-foreground">
                              Please verify the check details and ensure the check is properly signed before accepting.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Payment Method Button */}
                {remainingBalance > 0 && !paymentComplete && (
                  <Button onClick={addPaymentMethod} className="w-full" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tip Section */}
          <Card>
            <CardHeader>
              <CardTitle>Gratuity</CardTitle>
              <CardDescription>Add a tip to the order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={tipType}
                onValueChange={(value: "none" | "percentage" | "amount") => setTipType(value)}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem value="none" id="tip-none" className="peer sr-only" />
                  <Label
                    htmlFor="tip-none"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-center text-sm">No Tip</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="percentage" id="tip-percentage" className="peer sr-only" />
                  <Label
                    htmlFor="tip-percentage"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Percent className="mb-2 h-6 w-6" />
                    <span className="text-center text-sm">Percentage</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="amount" id="tip-amount" className="peer sr-only" />
                  <Label
                    htmlFor="tip-amount"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <DollarSign className="mb-2 h-6 w-6" />
                    <span className="text-center text-sm">Custom Amount</span>
                  </Label>
                </div>
              </RadioGroup>

              {tipType === "percentage" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 18, 20].map((percent) => (
                      <Button
                        key={percent}
                        variant={tipPercentage === percent ? "default" : "outline"}
                        onClick={() => setTipPercentage(percent)}
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{tipPercentage}% Tip:</span>
                      <span className="font-medium">{formatCurrency((orderTotal * tipPercentage) / 100)}</span>
                    </div>
                  </div>
                </div>
              )}

              {tipType === "amount" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-tip">Custom Tip Amount</Label>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-muted-foreground">$</span>
                      <Input
                        id="custom-tip"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={tipCustomAmount}
                        onChange={(e) => setTipCustomAmount(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Receipt Options */}
          <Card>
            <CardHeader>
              <CardTitle>Receipt Options</CardTitle>
              <CardDescription>Choose how to provide the receipt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={receiptMethod}
                onValueChange={(value: "print" | "email" | "text" | "none") => setReceiptMethod(value)}
                className="grid grid-cols-4 gap-2"
              >
                <div>
                  <RadioGroupItem value="print" id="receipt-print" className="peer sr-only" />
                  <Label
                    htmlFor="receipt-print"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Printer className="mb-2 h-6 w-6" />
                    <span className="text-center text-sm">Print</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="email" id="receipt-email" className="peer sr-only" />
                  <Label
                    htmlFor="receipt-email"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Mail className="mb-2 h-6 w-6" />
                    <span className="text-center text-sm">Email</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="text" id="receipt-text" className="peer sr-only" />
                  <Label
                    htmlFor="receipt-text"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <MessageSquare className="mb-2 h-6 w-6" />
                    <span className="text-center text-sm">Text</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="none" id="receipt-none" className="peer sr-only" />
                  <Label
                    htmlFor="receipt-none"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-center text-sm">No Receipt</span>
                  </Label>
                </div>
              </RadioGroup>

              {receiptMethod === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="receipt-email-address">Email Address</Label>
                  <Input
                    id="receipt-email-address"
                    type="email"
                    placeholder="customer@example.com"
                    value={receiptEmail}
                    onChange={(e) => setReceiptEmail(e.target.value)}
                  />
                </div>
              )}

              {receiptMethod === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="receipt-phone">Phone Number</Label>
                  <Input
                    id="receipt-phone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    value={receiptPhone}
                    onChange={(e) => setReceiptPhone(e.target.value)}
                  />
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setShowReceiptPreview(true)}>
                <Receipt className="mr-2 h-4 w-4" />
                Preview Receipt
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review order details before payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span className="text-red-600 dark:text-red-400">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tip</span>
                    <span>{formatCurrency(tipAmount)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(orderTotal + tipAmount)}</span>
              </div>

              {remainingBalance > 0 && (
                <div className="rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                  <div className="flex justify-between">
                    <span>Remaining Balance:</span>
                    <span className="font-medium">{formatCurrency(remainingBalance)}</span>
                  </div>
                </div>
              )}

              {remainingBalance < 0 && (
                <div className="rounded-md bg-red-50 p-3 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <div className="flex justify-between">
                    <span>Overpayment:</span>
                    <span className="font-medium">{formatCurrency(Math.abs(remainingBalance))}</span>
                  </div>
                </div>
              )}

              {remainingBalance === 0 && (
                <div className="rounded-md bg-green-50 p-3 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Payment amount matches order total</span>
                  </div>
                </div>
              )}
            </CardContent>
            <div>
              <Button
                className="w-full"
                disabled={remainingBalance !== 0 || isProcessing || paymentComplete}
                onClick={processPayment}
              >
                {isProcessing ? (
                  <>Processing Payment...</>
                ) : paymentComplete ? (
                  <>Payment Complete</>
                ) : (
                  <>Process Payment ({formatCurrency(orderTotal + tipAmount)})</>
                )}
              </Button>
            </div>
          </Card>

          {paymentComplete && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                  <h3 className="text-xl font-medium text-green-800 dark:text-green-400">Payment Complete</h3>
                  <p className="text-green-700 dark:text-green-500">The payment has been processed successfully.</p>
                  {receiptMethod !== "none" && (
                    <p className="text-sm text-green-700 dark:text-green-500">
                      {receiptMethod === "print" && "Receipt will be printed."}
                      {receiptMethod === "email" && `Receipt will be sent to ${receiptEmail}.`}
                      {receiptMethod === "text" && `Receipt will be sent to ${receiptPhone}.`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {paymentError && (
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                  <h3 className="text-xl font-medium text-red-800 dark:text-red-400">Payment Failed</h3>
                  <p className="text-red-700 dark:text-red-500">{paymentError}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Receipt Preview Dialog */}
      <Dialog open={showReceiptPreview} onOpenChange={setShowReceiptPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 font-mono text-sm">
            <div className="text-center space-y-1">
              <div className="font-bold text-base">Jewelia Jewelry Store</div>
              <div>123 Main Street, Anytown, USA</div>
              <div>Tel: (555) 123-4567</div>
              <div>
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </div>
              <div>Order #: ORD-{Math.floor(Math.random() * 10000)}</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="font-bold">Items</div>
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    {item.name} × {item.quantity}
                    {item.discount > 0 && <span className="text-xs ml-1">(Discounted)</span>}
                  </div>
                  <div>{formatCurrency(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="flex justify-between">
                <div>Subtotal</div>
                <div>{formatCurrency(subtotal)}</div>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <div>Discount</div>
                  <div>-{formatCurrency(discountAmount)}</div>
                </div>
              )}
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxAmount)}</div>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between">
                  <div>Tip</div>
                  <div>{formatCurrency(tipAmount)}</div>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between font-bold">
              <div>Total</div>
              <div>{formatCurrency(orderTotal + tipAmount)}</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="font-bold">Payment Methods</div>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex justify-between">
                  <div>
                    {method.type === "credit-card" && "Credit/Debit Card"}
                    {method.type === "cash" && "Cash"}
                    {method.type === "gift-card" && "Gift Card"}
                    {method.type === "layaway" && "Layaway"}
                    {method.type === "wire-transfer" && "Wire Transfer"}
                    {method.type === "check" && "Check"}
                    {method.type === "store-credit" && "Store Credit"}
                  </div>
                  <div>{formatCurrency(method.amount)}</div>
                </div>
              ))}
            </div>

            <div className="text-center text-xs mt-6 space-y-1">
              <div>Thank you for your purchase!</div>
              <div>Return policy: 30 days with receipt</div>
              <div>www.jeweliajewelry.com</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
