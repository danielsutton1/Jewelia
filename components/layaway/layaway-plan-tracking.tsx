"use client"

import { useState } from "react"
import { format, isBefore } from "date-fns"
import {
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Bell,
  FileText,
  MoreHorizontal,
  Printer,
  Mail,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data for demonstration
const mockLayawayPlan = {
  id: "LAY-12345",
  orderTotal: 1999.99,
  downPayment: 399.99,
  remainingBalance: 1600.0,
  paymentFrequency: "monthly",
  numberOfPayments: 4,
  paymentAmount: 400.0,
  startDate: new Date(2023, 4, 15),
  status: "active",
  customer: {
    id: "CUST-789",
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    phone: "(555) 123-4567",
  },
  payments: [
    { id: "PAY-1", date: new Date(2023, 4, 15), amount: 399.99, type: "down-payment", status: "completed" },
    { id: "PAY-2", date: new Date(2023, 5, 15), amount: 400.0, type: "installment", status: "completed" },
    { id: "PAY-3", date: new Date(2023, 6, 15), amount: 400.0, type: "installment", status: "pending" },
    { id: "PAY-4", date: new Date(2023, 7, 15), amount: 400.0, type: "installment", status: "scheduled" },
    { id: "PAY-5", date: new Date(2023, 8, 15), amount: 400.0, type: "installment", status: "scheduled" },
  ],
  lateFees: {
    enabled: true,
    type: "percentage",
    percentage: 5,
    amount: 20,
    gracePeriodDays: 3,
  },
  reminders: [
    { id: "REM-1", date: new Date(2023, 5, 12), type: "email", status: "sent" },
    { id: "REM-2", date: new Date(2023, 6, 12), type: "sms", status: "scheduled" },
  ],
  notes: [
    {
      id: "NOTE-1",
      date: new Date(2023, 4, 15),
      user: "Sarah Johnson",
      content: "Customer requested monthly payment plan with $400 installments.",
    },
    {
      id: "NOTE-2",
      date: new Date(2023, 5, 15),
      user: "Michael Chen",
      content: "First installment payment received on time.",
    },
  ],
  createdAt: new Date(2023, 4, 15),
  updatedAt: new Date(2023, 5, 15),
}

interface LayawayPlanTrackingProps {
  planId?: string
  plan?: any
}

export function LayawayPlanTracking({ planId, plan = mockLayawayPlan }: LayawayPlanTrackingProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showEarlyPayoffDialog, setShowEarlyPayoffDialog] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(plan.paymentAmount.toFixed(2))
  const [paymentNote, setPaymentNote] = useState("")
  const [reminderType, setReminderType] = useState<"email" | "sms">("email")
  const [reminderMessage, setReminderMessage] = useState("")

  // Calculate progress
  const totalPaid = plan.payments
    .filter((payment: any) => payment.status === "completed")
    .reduce((sum: number, payment: any) => sum + payment.amount, 0)

  const progressPercentage = (totalPaid / plan.orderTotal) * 100

  // Find next payment
  const nextPayment = plan.payments.find((payment: any) => payment.status === "pending")

  // Calculate days until next payment
  const daysUntilNextPayment = nextPayment
    ? Math.ceil((nextPayment.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Calculate remaining balance
  const remainingBalance = plan.orderTotal - totalPaid

  // Calculate early payoff amount (might include discounts in a real app)
  const earlyPayoffAmount = remainingBalance

  // Handle record payment
  const handleRecordPayment = () => {
    // In a real app, you would send this to your API
    console.log("Recording payment:", {
      amount: Number.parseFloat(paymentAmount),
      note: paymentNote,
      date: new Date(),
    })
    setShowPaymentDialog(false)
  }

  // Handle send reminder
  const handleSendReminder = () => {
    // In a real app, you would send this to your API
    console.log("Sending reminder:", {
      type: reminderType,
      message: reminderMessage,
      date: new Date(),
    })
    setShowReminderDialog(false)
  }

  // Handle process early payoff
  const handleProcessEarlyPayoff = () => {
    // In a real app, you would send this to your API
    console.log("Processing early payoff:", {
      amount: earlyPayoffAmount,
      date: new Date(),
    })
    setShowEarlyPayoffDialog(false)
  }

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "late":
        return <Badge className="bg-red-100 text-red-800">Late</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Layaway Plan {plan.id}</h2>
                  <p className="text-sm text-muted-foreground">Created on {format(plan.createdAt, "MMMM d, yyyy")}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{plan.status}</Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                <p className="font-medium">{plan.customer.name}</p>
                <p className="text-sm text-muted-foreground">{plan.customer.email}</p>
                <p className="text-sm text-muted-foreground">{plan.customer.phone}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold">${plan.orderTotal.toFixed(2)}</p>
                <div className="mt-1 flex items-center justify-end gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="text-sm font-medium text-green-600">${totalPaid.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-sm font-medium text-amber-600">${remainingBalance.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Progress</span>
                  <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 mt-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Payment Alert */}
      {nextPayment && (
        <Alert
          className={
            daysUntilNextPayment < 0
              ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              : daysUntilNextPayment <= 7
                ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                : "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
          }
        >
          <Clock className="h-4 w-4" />
          <AlertTitle>Next Payment Due</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              ${nextPayment.amount.toFixed(2)} due on {format(nextPayment.date, "MMMM d, yyyy")}
              {daysUntilNextPayment < 0
                ? ` (${Math.abs(daysUntilNextPayment)} days overdue)`
                : daysUntilNextPayment === 0
                  ? " (due today)"
                  : ` (in ${daysUntilNextPayment} days)`}
            </div>
            <div className="mt-2 flex gap-2 sm:mt-0">
              <Button size="sm" onClick={() => setShowPaymentDialog(true)}>
                Record Payment
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReminderDialog(true)}>
                Send Reminder
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main content with tabs */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
          <TabsTrigger value="details">Plan Details</TabsTrigger>
        </TabsList>

        {/* Payment History Tab */}
        <TabsContent value="payments" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track all payments made towards this layaway plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Amount</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.payments.map((payment: any) => (
                      <tr key={payment.id} className="border-b">
                        <td className="px-4 py-3">{format(payment.date, "MMM d, yyyy")}</td>
                        <td className="px-4 py-3">${payment.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 capitalize">{payment.type.replace("-", " ")}</td>
                        <td className="px-4 py-3">{getPaymentStatusBadge(payment.status)}</td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Print Receipt</DropdownMenuItem>
                              <DropdownMenuItem>Email Receipt</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowPaymentDialog(true)}>
                Record Payment
              </Button>
              <Button onClick={() => setShowEarlyPayoffDialog(true)}>Early Payoff</Button>
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Payment Reminders</CardTitle>
              <CardDescription>Manage payment reminders for this layaway plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.reminders.map((reminder: any) => (
                      <tr key={reminder.id} className="border-b">
                        <td className="px-4 py-3">{format(reminder.date, "MMM d, yyyy")}</td>
                        <td className="px-4 py-3 capitalize">{reminder.type}</td>
                        <td className="px-4 py-3 capitalize">{reminder.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <div>
              <Button variant="outline" className="w-full" onClick={() => setShowReminderDialog(true)}>
                Schedule Reminder
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Payment Schedule Tab */}
        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>View the complete payment schedule for this layaway plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 font-medium">Payment Schedule</div>
                <div className="divide-y">
                  {plan.payments.map((payment: any, index: number) => {
                    const isOverdue = payment.status === "pending" && isBefore(payment.date, new Date())
                    const isDueToday =
                      payment.status === "pending" &&
                      payment.date.getDate() === new Date().getDate() &&
                      payment.date.getMonth() === new Date().getMonth() &&
                      payment.date.getFullYear() === new Date().getFullYear()

                    return (
                      <div
                        key={payment.id}
                        className={`flex items-center justify-between p-4 ${
                          isOverdue ? "bg-red-50" : isDueToday ? "bg-yellow-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {payment.status === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isOverdue ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <div
                              className={`h-5 w-5 rounded-full border-2 ${
                                isDueToday ? "border-yellow-500" : "border-gray-300"
                              }`}
                            ></div>
                          )}
                          <div>
                            <div className="font-medium">
                              {format(payment.date, "MMMM d, yyyy")}
                              {isDueToday && <span className="ml-2 text-yellow-600">(Today)</span>}
                              {isOverdue && <span className="ml-2 text-red-600">(Overdue)</span>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.type === "down-payment" ? "Down Payment" : `Payment ${index}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${payment.amount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{getPaymentStatusBadge(payment.status)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
            <div className="flex justify-between">
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Schedule
              </Button>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Email Schedule
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Plan Details Tab */}
        <TabsContent value="details" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Layaway Plan Details</CardTitle>
              <CardDescription>View the details of this layaway plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Order Total</p>
                  <p className="font-medium">${plan.orderTotal.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Down Payment</p>
                  <p className="font-medium">${plan.downPayment.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Frequency</p>
                  <p className="font-medium capitalize">{plan.paymentFrequency}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Number of Payments</p>
                  <p className="font-medium">{plan.numberOfPayments}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Amount</p>
                  <p className="font-medium">${plan.paymentAmount.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{format(plan.startDate, "MMMM d, yyyy")}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <h3 className="font-medium">Late Fee Policy</h3>
                {plan.lateFees.enabled ? (
                  <div className="rounded-md border p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Late Fee Type</p>
                        <p className="font-medium capitalize">{plan.lateFees.type}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {plan.lateFees.type === "percentage" ? "Percentage" : "Amount"}
                        </p>
                        <p className="font-medium">
                          {plan.lateFees.type === "percentage"
                            ? `${plan.lateFees.percentage}%`
                            : `$${plan.lateFees.amount.toFixed(2)}`}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Grace Period</p>
                        <p className="font-medium">
                          {plan.lateFees.gracePeriodDays} {plan.lateFees.gracePeriodDays === 1 ? "day" : "days"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No late fees are applied to this plan.</p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <h3 className="font-medium">Notes</h3>
                <div className="space-y-2">
                  {plan.notes.map((note: any) => (
                    <div key={note.id} className="rounded-md border p-3">
                      <p className="text-sm">{note.content}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{note.user}</span>
                        <span>•</span>
                        <span>{format(note.date, "MMM d, yyyy h:mm a")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <div className="flex justify-between">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generate Agreement
              </Button>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Customer
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment for this layaway plan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-muted-foreground">$</span>
                <Input id="payment-amount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
              </div>
              {nextPayment && (
                <p className="text-xs text-muted-foreground">Scheduled amount: ${nextPayment.amount.toFixed(2)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-note">Note (Optional)</Label>
              <Textarea
                id="payment-note"
                placeholder="Add a note about this payment"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>Send a payment reminder to the customer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="email-reminder"
                    checked={reminderType === "email"}
                    onChange={() => setReminderType("email")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="email-reminder" className="cursor-pointer">
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sms-reminder"
                    checked={reminderType === "sms"}
                    onChange={() => setReminderType("sms")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="sms-reminder" className="cursor-pointer">
                    SMS
                  </Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-message">Custom Message (Optional)</Label>
              <Textarea
                id="reminder-message"
                placeholder="Add a custom message to the reminder"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave blank to use the default reminder template.</p>
            </div>
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertTitle>Reminder Preview</AlertTitle>
              <AlertDescription>
                {reminderType === "email" ? (
                  <p>
                    An email will be sent to <strong>{plan.customer.email}</strong> reminding them of their upcoming
                    payment of <strong>${nextPayment?.amount.toFixed(2)}</strong> due on
                    <strong> {format(nextPayment?.date || new Date(), "MMMM d, yyyy")}</strong>.
                  </p>
                ) : (
                  <p>
                    An SMS will be sent to <strong>{plan.customer.phone}</strong> reminding them of their upcoming
                    payment of <strong>${nextPayment?.amount.toFixed(2)}</strong> due on
                    <strong> {format(nextPayment?.date || new Date(), "MMMM d, yyyy")}</strong>.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminder}>Send Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Early Payoff Dialog */}
      <Dialog open={showEarlyPayoffDialog} onOpenChange={setShowEarlyPayoffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Early Payoff</DialogTitle>
            <DialogDescription>Process an early payoff for this layaway plan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertTitle>Early Payoff Amount</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span>Remaining Balance:</span>
                    <span className="font-medium">${remainingBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Early Payoff Discount:</span>
                    <span className="font-medium text-green-600">$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Payoff Amount:</span>
                    <span>${earlyPayoffAmount.toFixed(2)}</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            <div className="rounded-md border p-4">
              <h3 className="font-medium">Payment Method</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="radio" id="credit-card" name="payment-method" defaultChecked className="h-4 w-4" />
                  <Label htmlFor="credit-card" className="cursor-pointer">
                    Credit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="cash" name="payment-method" className="h-4 w-4" />
                  <Label htmlFor="cash" className="cursor-pointer">
                    Cash
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="other" name="payment-method" className="h-4 w-4" />
                  <Label htmlFor="other" className="cursor-pointer">
                    Other
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEarlyPayoffDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessEarlyPayoff}>Process Payoff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
