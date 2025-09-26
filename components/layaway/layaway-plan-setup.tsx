"use client"

import { useState, useEffect } from "react"
import { format, addDays, addWeeks, addMonths, isBefore } from "date-fns"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface LayawayPlanSetupProps {
  orderTotal: number
  onPlanCreated?: (plan: any) => void
}

export function LayawayPlanSetup({ orderTotal = 1999.99, onPlanCreated }: LayawayPlanSetupProps) {
  // State for down payment
  const [downPaymentType, setDownPaymentType] = useState<"percentage" | "fixed">("percentage")
  const [downPaymentPercentage, setDownPaymentPercentage] = useState(20)
  const [downPaymentAmount, setDownPaymentAmount] = useState(orderTotal * 0.2)

  // State for payment schedule
  const [paymentFrequency, setPaymentFrequency] = useState<"weekly" | "biweekly" | "monthly">("monthly")
  const [numberOfPayments, setNumberOfPayments] = useState(3)
  const [startDate, setStartDate] = useState<Date>(addDays(new Date(), 30))

  // State for late fees
  const [enableLateFees, setEnableLateFees] = useState(true)
  const [lateFeeType, setLateFeeType] = useState<"percentage" | "fixed">("percentage")
  const [lateFeePercentage, setLateFeePercentage] = useState(5)
  const [lateFeeAmount, setLateFeeAmount] = useState(10)
  const [gracePeriodDays, setGracePeriodDays] = useState(3)

  // State for payment schedule
  const [paymentSchedule, setPaymentSchedule] = useState<Array<{ date: Date; amount: number }>>([])

  // Calculate payment schedule
  useEffect(() => {
    const downPayment =
      downPaymentType === "percentage" ? orderTotal * (downPaymentPercentage / 100) : downPaymentAmount

    const remainingBalance = orderTotal - downPayment
    const paymentAmount = remainingBalance / numberOfPayments

    const schedule = []
    let currentDate = startDate

    for (let i = 0; i < numberOfPayments; i++) {
      schedule.push({
        date: new Date(currentDate),
        amount: paymentAmount,
      })

      if (paymentFrequency === "weekly") {
        currentDate = addWeeks(currentDate, 1)
      } else if (paymentFrequency === "biweekly") {
        currentDate = addWeeks(currentDate, 2)
      } else {
        currentDate = addMonths(currentDate, 1)
      }
    }

    setPaymentSchedule(schedule)
  }, [
    orderTotal,
    downPaymentType,
    downPaymentPercentage,
    downPaymentAmount,
    paymentFrequency,
    numberOfPayments,
    startDate,
  ])

  // Calculate total with fees
  const calculateTotalWithFees = () => {
    // In a real app, you might include potential late fees in the calculation
    return orderTotal
  }

  // Handle down payment type change
  const handleDownPaymentTypeChange = (value: "percentage" | "fixed") => {
    setDownPaymentType(value)
    if (value === "percentage") {
      setDownPaymentAmount(orderTotal * (downPaymentPercentage / 100))
    } else {
      setDownPaymentPercentage((downPaymentAmount / orderTotal) * 100)
    }
  }

  // Handle down payment percentage change
  const handleDownPaymentPercentageChange = (value: number[]) => {
    const percentage = value[0]
    setDownPaymentPercentage(percentage)
    setDownPaymentAmount(orderTotal * (percentage / 100))
  }

  // Handle down payment amount change
  const handleDownPaymentAmountChange = (value: string) => {
    const amount = Number.parseFloat(value) || 0
    setDownPaymentAmount(amount)
    setDownPaymentPercentage((amount / orderTotal) * 100)
  }

  // Handle create plan
  const handleCreatePlan = () => {
    const plan = {
      orderTotal,
      downPayment: downPaymentType === "percentage" ? orderTotal * (downPaymentPercentage / 100) : downPaymentAmount,
      downPaymentType,
      downPaymentPercentage,
      paymentFrequency,
      numberOfPayments,
      startDate,
      enableLateFees,
      lateFeeType,
      lateFeePercentage,
      lateFeeAmount,
      gracePeriodDays,
      paymentSchedule,
      totalWithFees: calculateTotalWithFees(),
      createdAt: new Date(),
      status: "active",
    }

    if (onPlanCreated) {
      onPlanCreated(plan)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Layaway Plan</CardTitle>
        <CardDescription>Configure a layaway payment plan for this order</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Plan Setup</TabsTrigger>
            <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
            <TabsTrigger value="fees">Late Fees</TabsTrigger>
          </TabsList>

          {/* Plan Setup Tab */}
          <TabsContent value="setup" className="space-y-6 pt-4">
            {/* Order Total */}
            <div className="space-y-2">
              <Label>Order Total</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                <span className="text-muted-foreground">$</span>
                <span className="ml-1 font-medium">{orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Down Payment */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Down Payment</Label>
                <RadioGroup
                  defaultValue={downPaymentType}
                  onValueChange={(value) => handleDownPaymentTypeChange(value as "percentage" | "fixed")}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage" className="cursor-pointer">
                      Percentage
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="cursor-pointer">
                      Fixed Amount
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {downPaymentType === "percentage" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{downPaymentPercentage}%</span>
                    <span className="text-sm text-muted-foreground">
                      ${(orderTotal * (downPaymentPercentage / 100)).toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[downPaymentPercentage]}
                    max={50}
                    step={5}
                    onValueChange={handleDownPaymentPercentageChange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10%</span>
                    <span>20%</span>
                    <span>30%</span>
                    <span>40%</span>
                    <span>50%</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={downPaymentAmount}
                    onChange={(e) => handleDownPaymentAmountChange(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Payment Frequency */}
            <div className="space-y-2">
              <Label>Payment Frequency</Label>
              <Select value={paymentFrequency} onValueChange={(value) => setPaymentFrequency(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number of Payments */}
            <div className="space-y-2">
              <Label>Number of Payments</Label>
              <Select
                value={numberOfPayments.toString()}
                onValueChange={(value) => setNumberOfPayments(Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of payments" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 6, 9, 12].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} payments
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* First Payment Date */}
            <div className="space-y-2">
              <Label>First Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    disabled={(date) => isBefore(date, new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Payment Summary */}
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-medium">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order Total</span>
                  <span className="font-medium">${orderTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Down Payment</span>
                  <span className="font-medium">
                    $
                    {downPaymentType === "percentage"
                      ? (orderTotal * (downPaymentPercentage / 100)).toFixed(2)
                      : downPaymentAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Remaining Balance</span>
                  <span className="font-medium">
                    $
                    {(
                      orderTotal -
                      (downPaymentType === "percentage"
                        ? orderTotal * (downPaymentPercentage / 100)
                        : downPaymentAmount)
                    ).toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {numberOfPayments} {paymentFrequency} payments of
                  </span>
                  <span className="font-medium">
                    $
                    {(
                      (orderTotal -
                        (downPaymentType === "percentage"
                          ? orderTotal * (downPaymentPercentage / 100)
                          : downPaymentAmount)) /
                      numberOfPayments
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Payment Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6 pt-4">
            <div className="rounded-md border">
              <div className="bg-muted px-4 py-2 font-medium">Payment Schedule</div>
              <div className="divide-y">
                <div className="flex justify-between p-4">
                  <span className="font-medium">Today</span>
                  <div className="text-right">
                    <div className="font-medium">
                      $
                      {downPaymentType === "percentage"
                        ? (orderTotal * (downPaymentPercentage / 100)).toFixed(2)
                        : downPaymentAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Down Payment</div>
                  </div>
                </div>
                {paymentSchedule.map((payment, index) => (
                  <div key={index} className="flex justify-between p-4">
                    <span>{format(payment.date, "MMMM d, yyyy")}</span>
                    <div className="text-right">
                      <div className="font-medium">${payment.amount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Payment {index + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment Schedule</AlertTitle>
              <AlertDescription>
                This schedule is an estimate. The actual payment dates may vary based on processing times and weekends.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Late Fees Tab */}
          <TabsContent value="fees" className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-late-fees">Enable Late Fees</Label>
              <Switch id="enable-late-fees" checked={enableLateFees} onCheckedChange={setEnableLateFees} />
            </div>

            {enableLateFees && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Late Fee Type</Label>
                    <RadioGroup
                      defaultValue={lateFeeType}
                      onValueChange={(value) => setLateFeeType(value as "percentage" | "fixed")}
                      className="flex space-x-2"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="percentage" id="late-percentage" />
                        <Label htmlFor="late-percentage" className="cursor-pointer">
                          Percentage
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="fixed" id="late-fixed" />
                        <Label htmlFor="late-fixed" className="cursor-pointer">
                          Fixed Amount
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {lateFeeType === "percentage" ? (
                    <div className="space-y-2">
                      <Label>Late Fee Percentage</Label>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={lateFeePercentage}
                          onChange={(e) => setLateFeePercentage(Number.parseFloat(e.target.value) || 0)}
                          className="w-full"
                        />
                        <span className="ml-2 text-sm text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lateFeePercentage}% of the payment amount ($
                        {(
                          ((orderTotal -
                            (downPaymentType === "percentage"
                              ? orderTotal * (downPaymentPercentage / 100)
                              : downPaymentAmount)) /
                            numberOfPayments) *
                          (lateFeePercentage / 100)
                        ).toFixed(2)}{" "}
                        per late payment)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Late Fee Amount</Label>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={lateFeeAmount}
                          onChange={(e) => setLateFeeAmount(Number.parseFloat(e.target.value) || 0)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Grace Period (Days)</Label>
                    <Select
                      value={gracePeriodDays.toString()}
                      onValueChange={(value) => setGracePeriodDays(Number.parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grace period" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 5, 7, 10].map((days) => (
                          <SelectItem key={days} value={days.toString()}>
                            {days} {days === 1 ? "day" : "days"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Late fees will be applied {gracePeriodDays} days after the due date.
                    </p>
                  </div>
                </div>

                <Alert variant="destructive" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Ensure that your late fee policy complies with local regulations and is clearly communicated to the
                    customer.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <div className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleCreatePlan}>Create Layaway Plan</Button>
      </div>
    </Card>
  )
}
