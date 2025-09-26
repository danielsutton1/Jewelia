"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  CheckCircle,
  Printer,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Award,
  Info,
  FileSpreadsheet,
  Download,
  Copy,
  Share2,
  Clock,
  User,
  MapPin,
  CreditCard,
  DollarSign,
  Gift,
  Store,
  FileCheck,
  ShoppingBag,
  Truck,
  AlertCircle,
  CheckCircle2,
  X,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'

// Sample data for demonstration
const sampleOrderItems = [
  {
    id: "item-1",
    name: "Diamond Solitaire Ring",
    sku: "DR-0123",
    price: 3499.99,
    quantity: 1,
    discount: 0,
    image: "/placeholder.svg?key=60kjm",
    description: "1.5 carat round brilliant diamond in 18k white gold setting",
    attributes: {
      metal: "18k White Gold",
      stone: "Diamond",
      carat: "1.5",
      cut: "Round Brilliant",
      clarity: "VS1",
      color: "F",
      length: "",
      pearlSize: "",
      clasp: "",
    },
  },
  {
    id: "item-2",
    name: "Pearl Necklace",
    sku: "NL-0456",
    price: 899.99,
    quantity: 2,
    discount: 50,
    image: "/placeholder.svg?key=n8jmx",
    description: "18-inch strand of 7-8mm Akoya pearls with 14k gold clasp",
    attributes: {
      metal: "14k Yellow Gold",
      stone: "Akoya Pearl",
      carat: "",
      cut: "",
      clarity: "",
      color: "White",
      length: "18 inches",
      pearlSize: "7-8mm",
      clasp: "",
    },
  },
  {
    id: "item-3",
    name: "Emerald Tennis Bracelet",
    sku: "BR-0789",
    price: 2199.99,
    quantity: 1,
    discount: 219.99,
    image: "/placeholder.svg?key=dh6hd",
    description: "7-inch bracelet with 3.5 total carat weight of emeralds in 14k white gold",
    attributes: {
      metal: "14k White Gold",
      stone: "Emerald",
      carat: "3.5 tcw",
      cut: "",
      clarity: "",
      color: "",
      length: "7 inches",
      pearlSize: "",
      clasp: "Box with Safety",
    },
  },
]

const sampleCustomer = {
  id: "cust-1234",
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  phone: "(555) 123-4567",
  address: {
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
  },
  preferences: {
    contactMethod: "email",
    marketingOptIn: true,
    birthdayReminders: true,
    anniversaryReminders: false,
  },
  notes: "Prefers white gold. Allergic to nickel.",
  vipStatus: "Gold",
  joinDate: "2020-05-15",
}

const samplePayments = [
  {
    id: "pay-1",
    method: "credit-card",
    description: "Visa ending in 4242",
    amount: 4000,
    status: "completed",
    date: "2023-06-15T14:30:00",
  },
  {
    id: "pay-2",
    method: "store-credit",
    description: "Store credit",
    amount: 500,
    status: "completed",
    date: "2023-06-15T14:30:00",
  },
]

const sampleDelivery = {
  method: "shipping",
  address: {
    recipient: "Sarah Johnson",
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
    phone: "(555) 123-4567",
  },
  service: {
    name: "Express Shipping",
    description: "2-3 business days",
    price: 19.99,
    estimatedDelivery: "2023-06-18",
  },
  insurance: {
    name: "Standard Coverage",
    description: "Up to $5,000 coverage",
    price: 14.99,
  },
  trackingNumber: "1Z999AA10123456784",
  carrier: "UPS",
  specialInstructions: "Please leave with doorman if not home.",
}

const sampleSpecialInstructions =
  "Gift wrap each item separately. Include gift message: 'Happy Anniversary, Love Always, John'"

// Types
interface OrderItem {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  discount: number
  image: string
  description: string
  attributes: Record<string, string>
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  preferences: {
    contactMethod: string
    marketingOptIn: boolean
    birthdayReminders: boolean
    anniversaryReminders: boolean
  }
  notes: string
  vipStatus: string
  joinDate: string
}

interface Payment {
  id: string
  method: string
  description: string
  amount: number
  status: string
  date: string
}

interface Delivery {
  method: string
  address?: {
    recipient: string
    street: string
    city: string
    state: string
    zip: string
    country: string
    phone: string
  }
  service?: {
    name: string
    description: string
    price: number
    estimatedDelivery: string
  }
  insurance?: {
    name: string
    description: string
    price: number
  }
  trackingNumber?: string
  carrier?: string
  specialInstructions?: string
  pickupLocation?: {
    name: string
    address: string
    hours: string
    phone: string
  }
  pickupDate?: string
  pickupTime?: string
  pickupContact?: string
}

interface OrderCompletionProps {
  orderItems?: OrderItem[]
  customer?: Customer
  payments?: Payment[]
  delivery?: Delivery
  specialInstructions?: string
  taxRate?: number
  orderNumber?: string
  orderDate?: string
  onComplete?: (data: any) => void
}

export function OrderCompletion({
  orderItems = sampleOrderItems,
  customer = sampleCustomer,
  payments = samplePayments,
  delivery = sampleDelivery,
  specialInstructions = sampleSpecialInstructions,
  taxRate = 0.0825, // 8.25% tax rate
  orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
  orderDate = new Date().toISOString(),
  onComplete = () => {},
}: OrderCompletionProps) {
  // State for document generation
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, boolean>>({
    receipt: true,
    warranty: true,
    careInstructions: true,
    certificates: true,
    appraisals: false,
  })

  // State for action dialogs
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showSmsDialog, setShowSmsDialog] = useState(false)
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // State for email dialog
  const [emailRecipient, setEmailRecipient] = useState(customer.email)
  const [emailCc, setEmailCc] = useState("")
  const [emailBcc, setEmailBcc] = useState("")
  const [emailSubject, setEmailSubject] = useState(`Your Jewelia Order #${orderNumber}`)
  const [emailMessage, setEmailMessage] = useState(
    `Dear ${customer.name},\n\nThank you for your purchase! Your order #${orderNumber} has been completed and is being processed.\n\nPlease find attached your receipt and other important documents.\n\nBest regards,\nJewelia Jewelry`,
  )

  // State for SMS dialog
  const [smsRecipient, setSmsRecipient] = useState(customer.phone)
  const [smsMessage, setSmsMessage] = useState(
    `Thank you for your Jewelia purchase! Your order #${orderNumber} is confirmed. Track your shipment with ${delivery.trackingNumber} via ${delivery.carrier}.`,
  )

  // State for follow-up dialog
  const [followUpType, setFollowUpType] = useState("satisfaction-check")
  const [followUpDate, setFollowUpDate] = useState(
    format(new Date(new Date().setDate(new Date().getDate() + 7)), "yyyy-MM-dd"),
  )
  const [followUpNotes, setFollowUpNotes] = useState("Follow up with customer to ensure satisfaction with purchase.")
  const [followUpAssignee, setFollowUpAssignee] = useState("current-user")

  // State for document preview
  const [previewDocument, setPreviewDocument] = useState<string | null>(null)

  // Calculate order totals
  const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const discountAmount = orderItems.reduce((total, item) => total + item.discount, 0)
  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * taxRate
  const shippingAmount = delivery.service?.price || 0
  const insuranceAmount = delivery.insurance?.price || 0
  const totalDue = taxableAmount + taxAmount + shippingAmount + insuranceAmount
  const totalPaid = payments.reduce((total, payment) => total + payment.amount, 0)
  const balanceRemaining = Math.max(0, totalDue - totalPaid)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy")
  }

  // Format time
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a")
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

  // Handle document selection
  const handleDocumentSelection = (document: string, checked: boolean) => {
    setSelectedDocuments({
      ...selectedDocuments,
      [document]: checked,
    })
  }

  // Handle print documents
  const handlePrintDocuments = () => {
    // In a real app, this would generate and print the selected documents
    toast({
      title: "Printing documents",
      description: `Printing ${Object.keys(selectedDocuments).filter((key) => selectedDocuments[key]).length} documents`,
    })
  }

  // Handle email receipt
  const handleEmailReceipt = () => {
    setShowEmailDialog(true)
  }

  // Handle send email
  const handleSendEmail = () => {
    // In a real app, this would send the email with attachments
    toast({
      title: "Email sent",
      description: `Email sent to ${emailRecipient}`,
    })
    setShowEmailDialog(false)
  }

  // Handle SMS confirmation
  const handleSmsConfirmation = () => {
    setShowSmsDialog(true)
  }

  // Handle send SMS
  const handleSendSms = () => {
    // In a real app, this would send the SMS
    toast({
      title: "SMS sent",
      description: `SMS sent to ${smsRecipient}`,
    })
    setShowSmsDialog(false)
  }

  // Handle follow-up task
  const handleFollowUpTask = () => {
    setShowFollowUpDialog(true)
  }

  // Handle create follow-up
  const handleCreateFollowUp = () => {
    // In a real app, this would create a follow-up task
    toast({
      title: "Follow-up task created",
      description: `Task scheduled for ${format(new Date(followUpDate), "MMMM d, yyyy")}`,
    })
    setShowFollowUpDialog(false)
  }

  // Handle complete order
  const handleCompleteOrder = () => {
    // In a real app, this would finalize the order in the system
    setShowSuccessDialog(true)
    onComplete({
      orderNumber,
      orderDate,
      customer,
      orderItems,
      payments,
      delivery,
      specialInstructions,
      documents: selectedDocuments,
    })
  }

  // Handle document preview
  const handleDocumentPreview = (documentType: string) => {
    setPreviewDocument(documentType)
  }

  // Handle close preview
  const handleClosePreview = () => {
    setPreviewDocument(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Order Completion</h3>
        <p className="text-sm text-muted-foreground">Review and finalize order details</p>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-5 md:grid-cols-5">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Order Summary</span>
            <span className="sm:hidden">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Customer Info</span>
            <span className="sm:hidden">Customer</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
            <span className="sm:hidden">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Delivery</span>
            <span className="sm:hidden">Delivery</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
        </TabsList>

        {/* Order Summary Tab */}
        <TabsContent value="summary" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Order #{orderNumber}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(orderDate)} at {formatTime(orderDate)}
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            >
              Pending Completion
            </Badge>
          </div>

          <Separator />

          <div className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                  <Image 
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between text-base font-medium">
                    <h3>{item.name}</h3>
                    <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <p className="text-muted-foreground">Qty {item.quantity}</p>
                    <div className="flex">
                      {item.discount > 0 && (
                        <p className="text-green-600">Discount: -{formatCurrency(item.discount)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discounts</span>
                <span className="text-green-600">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(2)}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            {shippingAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(shippingAmount)}</span>
              </div>
            )}
            {insuranceAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Insurance</span>
                <span>{formatCurrency(insuranceAmount)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(totalDue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span>{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Balance</span>
              <span className={balanceRemaining > 0 ? "text-red-600" : "text-green-600"}>
                {formatCurrency(balanceRemaining)}
              </span>
            </div>
          </div>

          {specialInstructions && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Special Instructions</h4>
                <div className="rounded-md bg-muted p-3 text-sm">{specialInstructions}</div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Customer Info Tab */}
        <TabsContent value="customer" className="space-y-4 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{customer.name}</span>
                  <Badge variant="outline">{customer.vipStatus} Member</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {customer.address.street}, {customer.address.city}, {customer.address.state}{" "}
                      {customer.address.zip}, {customer.address.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Customer since {formatDate(customer.joinDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Preferred Contact Method</span>
                    <span className="font-medium capitalize">{customer.preferences.contactMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing Communications</span>
                    <span className="font-medium">{customer.preferences.marketingOptIn ? "Opted In" : "Opted Out"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Birthday Reminders</span>
                    <span className="font-medium">{customer.preferences.birthdayReminders ? "Enabled" : "Disabled"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Anniversary Reminders</span>
                    <span className="font-medium">
                      {customer.preferences.anniversaryReminders ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Customer Notes</h4>
                  <div className="rounded-md bg-muted p-3 text-sm">{customer.notes}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Details</CardTitle>
              <CardDescription>
                {payments.length} payment method{payments.length !== 1 && "s"} used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      }`}
                    >
                      {getPaymentMethodIcon(payment.method)}
                    </div>
                    <div>
                      <div className="font-medium">{payment.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(payment.date)} at {formatTime(payment.date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(payment.amount)}</div>
                    <div
                      className={`text-xs ${
                        payment.status === "completed"
                          ? "text-green-600 dark:text-green-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {payment.status === "completed" ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-md bg-muted p-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Due</span>
                    <span>{formatCurrency(totalDue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span>{formatCurrency(totalPaid)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Balance</span>
                    <span className={balanceRemaining > 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(balanceRemaining)}
                    </span>
                  </div>
                </div>
              </div>

              {balanceRemaining > 0 && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Payment Required</p>
                      <p className="text-sm">
                        A balance of {formatCurrency(balanceRemaining)} is still due on this order.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {balanceRemaining === 0 && (
                <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Payment Complete</p>
                      <p className="text-sm">This order has been paid in full.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery Information</CardTitle>
              <CardDescription>
                {delivery.method === "shipping"
                  ? "Shipping to customer address"
                  : delivery.method === "pickup"
                    ? "In-store pickup"
                    : "Personal delivery"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {delivery.method === "shipping" && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium">Shipping Address</h4>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <div>{delivery.address?.recipient}</div>
                      <div>{delivery.address?.street}</div>
                      <div>
                        {delivery.address?.city}, {delivery.address?.state} {delivery.address?.zip}
                      </div>
                      <div>{delivery.address?.country}</div>
                      <div>{delivery.address?.phone}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Shipping Method</h4>
                      <div className="rounded-md bg-muted p-3 text-sm">
                        <div className="font-medium">{delivery.service?.name}</div>
                        <div className="text-muted-foreground">{delivery.service?.description}</div>
                        <div className="mt-1">Cost: {formatCurrency(delivery.service?.price || 0)}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Insurance</h4>
                      <div className="rounded-md bg-muted p-3 text-sm">
                        <div className="font-medium">{delivery.insurance?.name}</div>
                        <div className="text-muted-foreground">{delivery.insurance?.description}</div>
                        <div className="mt-1">Cost: {formatCurrency(delivery.insurance?.price || 0)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Tracking Information</h4>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <div>
                        <span className="font-medium">Carrier:</span> {delivery.carrier}
                      </div>
                      <div>
                        <span className="font-medium">Tracking Number:</span> {delivery.trackingNumber}
                      </div>
                      <div>
                        <span className="font-medium">Estimated Delivery:</span>{" "}
                        {formatDate(delivery.service?.estimatedDelivery || "")}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {delivery.method === "pickup" && delivery.pickupLocation && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium">Pickup Location</h4>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <div className="font-medium">{delivery.pickupLocation.name}</div>
                      <div>{delivery.pickupLocation.address}</div>
                      <div>
                        <span className="font-medium">Hours:</span> {delivery.pickupLocation.hours}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {delivery.pickupLocation.phone}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Pickup Date & Time</h4>
                      <div className="rounded-md bg-muted p-3 text-sm">
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(delivery.pickupDate || "")}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {delivery.pickupTime}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Pickup Contact</h4>
                      <div className="rounded-md bg-muted p-3 text-sm">
                        <div>{delivery.pickupContact}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {delivery.specialInstructions && (
                <div className="space-y-2">
                  <h4 className="font-medium">Delivery Instructions</h4>
                  <div className="rounded-md bg-muted p-3 text-sm">{delivery.specialInstructions}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents to Generate</CardTitle>
              <CardDescription>Select the documents to generate for this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="receipt"
                    checked={selectedDocuments.receipt}
                    onCheckedChange={(checked) => handleDocumentSelection("receipt", checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="receipt" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Receipt/Invoice
                    </Label>
                    <p className="text-sm text-muted-foreground">Detailed receipt with all order information</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => handleDocumentPreview("receipt")}
                  >
                    Preview
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="warranty"
                    checked={selectedDocuments.warranty}
                    onCheckedChange={(checked) => handleDocumentSelection("warranty", checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="warranty" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Warranty Cards
                    </Label>
                    <p className="text-sm text-muted-foreground">Warranty information for purchased items</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => handleDocumentPreview("warranty")}
                  >
                    Preview
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="care-instructions"
                    checked={selectedDocuments.careInstructions}
                    onCheckedChange={(checked) => handleDocumentSelection("careInstructions", checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="care-instructions" className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Care Instructions
                    </Label>
                    <p className="text-sm text-muted-foreground">Instructions for proper care of jewelry items</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => handleDocumentPreview("careInstructions")}
                  >
                    Preview
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="certificates"
                    checked={selectedDocuments.certificates}
                    onCheckedChange={(checked) => handleDocumentSelection("certificates", checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="certificates" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Certificates
                    </Label>
                    <p className="text-sm text-muted-foreground">Authenticity certificates for gemstones and metals</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => handleDocumentPreview("certificates")}
                  >
                    Preview
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="appraisals"
                    checked={selectedDocuments.appraisals}
                    onCheckedChange={(checked) => handleDocumentSelection("appraisals", checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="appraisals" className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Appraisals
                    </Label>
                    <p className="text-sm text-muted-foreground">Professional appraisal documents for insurance</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => handleDocumentPreview("appraisals")}
                  >
                    Preview
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Document Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handlePrintDocuments}
                    disabled={!Object.values(selectedDocuments).some((value) => value)}
                  >
                    <Printer className="h-4 w-4" />
                    Print Documents
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleEmailReceipt}
                    disabled={!Object.values(selectedDocuments).some((value) => value)}
                  >
                    <Mail className="h-4 w-4" />
                    Email Documents
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={handlePrintDocuments}>
            <Printer className="h-4 w-4" />
            Print Documents
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleEmailReceipt}>
            <Mail className="h-4 w-4" />
            Email Receipt
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleSmsConfirmation}>
            <MessageSquare className="h-4 w-4" />
            Send SMS
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleFollowUpTask}>
            <Calendar className="h-4 w-4" />
            Create Follow-up
          </Button>
        </div>
        <Button onClick={handleCompleteOrder} className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Complete Order
        </Button>
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Email Receipt</DialogTitle>
            <DialogDescription>Send order documents via email to the customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">To</Label>
              <Input id="email-to" value={emailRecipient} onChange={(e) => setEmailRecipient(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-cc">CC</Label>
                <Input id="email-cc" value={emailCc} onChange={(e) => setEmailCc(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-bcc">BCC</Label>
                <Input id="email-bcc" value={emailBcc} onChange={(e) => setEmailBcc(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input id="email-subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                rows={5}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="rounded-md border p-3">
                <div className="space-y-2">
                  {Object.entries(selectedDocuments).map(
                    ([key, value]) =>
                      value && (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {key === "receipt" && "Receipt/Invoice.pdf"}
                              {key === "warranty" && "Warranty Cards.pdf"}
                              {key === "careInstructions" && "Care Instructions.pdf"}
                              {key === "certificates" && "Certificates.pdf"}
                              {key === "appraisals" && "Appraisals.pdf"}
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ),
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>Send Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={showSmsDialog} onOpenChange={setShowSmsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send SMS Confirmation</DialogTitle>
            <DialogDescription>Send a text message confirmation to the customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sms-to">To</Label>
              <Input id="sms-to" value={smsRecipient} onChange={(e) => setSmsRecipient(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                rows={3}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{smsMessage.length} characters</span>
                <span>Max 160 characters per SMS</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="include-tracking" defaultChecked />
              <Label htmlFor="include-tracking">Include tracking information</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSmsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendSms}>Send SMS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={showFollowUpDialog} onOpenChange={setShowFollowUpDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Follow-up Task</DialogTitle>
            <DialogDescription>Schedule a follow-up task for this order</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="follow-up-type">Follow-up Type</Label>
              <Select value={followUpType} onValueChange={setFollowUpType}>
                <SelectTrigger id="follow-up-type">
                  <SelectValue placeholder="Select follow-up type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="satisfaction-check">Customer Satisfaction Check</SelectItem>
                  <SelectItem value="delivery-confirmation">Delivery Confirmation</SelectItem>
                  <SelectItem value="review-request">Request Review</SelectItem>
                  <SelectItem value="maintenance-reminder">Maintenance Reminder</SelectItem>
                  <SelectItem value="anniversary">Purchase Anniversary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow-up-date">Follow-up Date</Label>
              <Input
                id="follow-up-date"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow-up-notes">Notes</Label>
              <Textarea
                id="follow-up-notes"
                rows={3}
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow-up-assignee">Assign To</Label>
              <Select value={followUpAssignee} onValueChange={setFollowUpAssignee}>
                <SelectTrigger id="follow-up-assignee">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-user">Me (Current User)</SelectItem>
                  <SelectItem value="sales-rep">Original Sales Rep</SelectItem>
                  <SelectItem value="customer-service">Customer Service Team</SelectItem>
                  <SelectItem value="manager">Store Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFollowUpDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFollowUp}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
            <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-semibold">Order Completed Successfully!</h2>
            <p className="text-muted-foreground">
              Order #{orderNumber} has been processed and is now complete.
            </p>
            <div className="rounded-md bg-muted p-3 text-center">
              <p className="font-medium">Order Reference Number</p>
              <p className="text-2xl font-bold tracking-wider">{orderNumber}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copy Order Number
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDocument} onOpenChange={handleClosePreview}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {previewDocument === "receipt" && "Receipt/Invoice Preview"}
              {previewDocument === "warranty" && "Warranty Card Preview"}
              {previewDocument === "careInstructions" && "Care Instructions Preview"}
              {previewDocument === "certificates" && "Certificate Preview"}
              {previewDocument === "appraisals" && "Appraisal Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[500px] overflow-auto border p-4">
            {previewDocument === "receipt" && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Jewelia Jewelry</h3>
                    <p className="text-sm text-muted-foreground">123 Main Street, New York, NY 10001</p>
                    <p className="text-sm text-muted-foreground">Tel: (555) 123-4567</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-medium">INVOICE</h4>
                    <p className="text-sm">Order #: {orderNumber}</p>
                    <p className="text-sm">Date: {formatDate(orderDate)}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium">Bill To:</h4>
                    <p>{customer.name}</p>
                    <p>{customer.address.street}</p>
                    <p>
                      {customer.address.city}, {customer.address.state} {customer.address.zip}
                    </p>
                    <p>{customer.address.country}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Ship To:</h4>
                    <p>{delivery.address?.recipient}</p>
                    <p>{delivery.address?.street}</p>
                    <p>
                      {delivery.address?.city}, {delivery.address?.state} {delivery.address?.zip}
                    </p>
                    <p>{delivery.address?.country}</p>
                  </div>
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Item</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Discount</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                        </td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="py-2 text-right">
                          {item.discount > 0 ? `-${formatCurrency(item.discount)}` : "-"}
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(item.price * item.quantity - item.discount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-64 space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({(taxRate * 100).toFixed(2)}%):</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatCurrency(shippingAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insurance:</span>
                      <span>{formatCurrency(insuranceAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(totalDue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span>{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Balance Due:</span>
                      <span>{formatCurrency(balanceRemaining)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <p className="font-medium">Payment Information:</p>
                  {payments.map((payment) => (
                    <p key={payment.id}>
                      {payment.description}: {formatCurrency(payment.amount)} on {formatDate(payment.date)}
                    </p>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-medium">Terms & Conditions:</p>
                  <p>
                    All sales are final. Returns accepted within 30 days with receipt. Custom items are non-refundable.
                    See warranty card for coverage details.
                  </p>
                </div>

                <div className="text-center text-sm">
                  <p>Thank you for your business!</p>
                </div>
              </div>
            )}

            {previewDocument === "warranty" && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold">Jewelia Jewelry Warranty Certificate</h3>
                  <p className="text-sm text-muted-foreground">Lifetime Craftsmanship Guarantee</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Customer Name:</span> {customer.name}
                  </p>
                  <p>
                    <span className="font-medium">Purchase Date:</span> {formatDate(orderDate)}
                  </p>
                  <p>
                    <span className="font-medium">Order Number:</span> {orderNumber}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Covered Items:</h4>
                  {orderItems.map((item) => (
                    <div key={item.id} className="rounded-md border p-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Coverage:</span> Lifetime craftsmanship warranty
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Includes:</span> Free cleaning, inspection, and repairs for
                        manufacturing defects
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Warranty Terms:</h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    <li>
                      This warranty covers manufacturing defects in materials and workmanship for the lifetime of the
                      product.
                    </li>
                    <li>
                      Regular maintenance is required to maintain warranty coverage (recommended every 6 months).
                    </li>
                    <li>
                      This warranty does not cover damage resulting from accidents, misuse, or normal wear and tear.
                    </li>
                    <li>Stone loss is covered for the first year from purchase date with proper maintenance.</li>
                    <li>Proof of purchase and this warranty card are required for all warranty services.</li>
                  </ul>
                </div>

                <div className="rounded-md bg-muted p-3 text-center text-sm">
                  <p>To claim warranty service, please bring this card and your item to any Jewelia location.</p>
                  <p className="font-medium mt-2">Warranty ID: WR-{orderNumber.replace("ORD-", "")}</p>
                </div>
              </div>
            )}

            {previewDocument === "careInstructions" && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold">Jewelry Care Instructions</h3>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p>Product-specific care guidelines, cleaning recommendations, storage advice, and maintenance schedule.</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
