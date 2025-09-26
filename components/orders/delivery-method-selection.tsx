"use client"

import { useState } from "react"
import { format, addBusinessDays, isBefore } from "date-fns"
import {
  Store,
  Truck,
  User,
  Calendar,
  Clock,
  Shield,
  FileText,
  Package,
  CheckCircle2,
  Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Sample data for demonstration
const storeLocations = [
  {
    id: "store-1",
    name: "Downtown Flagship Store",
    address: "123 Main Street, New York, NY 10001",
    hours: "Mon-Sat: 10am-8pm, Sun: 11am-6pm",
    phone: "(212) 555-1234",
  },
  {
    id: "store-2",
    name: "Westfield Mall Location",
    address: "456 Shopping Center Blvd, New York, NY 10002",
    hours: "Mon-Sat: 9am-9pm, Sun: 10am-7pm",
    phone: "(212) 555-5678",
  },
  {
    id: "store-3",
    name: "Brooklyn Boutique",
    address: "789 Atlantic Avenue, Brooklyn, NY 11217",
    hours: "Tue-Sat: 11am-7pm, Sun: 12pm-5pm, Closed Mondays",
    phone: "(718) 555-9012",
  },
]

const shippingServices = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 9.99,
    estimatedDays: { min: 5, max: 7 },
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 19.99,
    estimatedDays: { min: 2, max: 3 },
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day",
    price: 39.99,
    estimatedDays: { min: 1, max: 1 },
  },
]

const insuranceOptions = [
  {
    id: "basic",
    name: "Basic Coverage",
    description: "Up to $1,000 coverage",
    price: 0,
  },
  {
    id: "standard",
    name: "Standard Coverage",
    description: "Up to $5,000 coverage",
    price: 14.99,
  },
  {
    id: "premium",
    name: "Premium Coverage",
    description: "Up to $10,000 coverage",
    price: 29.99,
  },
  {
    id: "custom",
    name: "Custom Coverage",
    description: "Custom coverage amount",
    price: 0, // Calculated based on coverage amount
  },
]

const savedAddresses = [
  {
    id: "addr-1",
    name: "Home",
    recipient: "John Smith",
    street: "123 Residential Lane",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
    phone: "(212) 555-1234",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "Office",
    recipient: "John Smith",
    street: "456 Corporate Plaza",
    city: "New York",
    state: "NY",
    zip: "10002",
    country: "United States",
    phone: "(212) 555-5678",
    isDefault: false,
  },
  {
    id: "addr-3",
    name: "Summer House",
    recipient: "John Smith",
    street: "789 Beach Road",
    city: "East Hampton",
    state: "NY",
    zip: "11937",
    country: "United States",
    phone: "(631) 555-9012",
    isDefault: false,
  },
]

// Types
interface DeliveryMethodSelectionProps {
  orderValue?: number
  onDeliveryMethodSelected?: (method: DeliveryMethod) => void
}

interface DeliveryMethod {
  type: "pickup" | "shipping" | "personal"
  details: any
  cost: number
  estimatedDate: Date
}

export function DeliveryMethodSelection({
  orderValue = 5000, // Sample order value for insurance calculation
  onDeliveryMethodSelected = () => {},
}: DeliveryMethodSelectionProps) {
  // State for selected delivery method
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "shipping" | "personal">("pickup")

  // State for in-store pickup
  const [pickupLocation, setPickupLocation] = useState(storeLocations[0].id)
  const [pickupDate, setPickupDate] = useState<Date | undefined>(addBusinessDays(new Date(), 2))
  const [pickupTime, setPickupTime] = useState("12:00")
  const [pickupContact, setPickupContact] = useState("")
  const [pickupPhone, setPickupPhone] = useState("")
  const [pickupEmail, setPickupEmail] = useState("")
  const [pickupNotes, setPickupNotes] = useState("")

  // State for shipping
  const [addressType, setAddressType] = useState<"saved" | "new">("saved")
  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0].id)
  const [newAddress, setNewAddress] = useState({
    recipient: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
  })
  const [saveNewAddress, setSaveNewAddress] = useState(false)
  const [newAddressName, setNewAddressName] = useState("")
  const [shippingService, setShippingService] = useState(shippingServices[0].id)
  const [insuranceOption, setInsuranceOption] = useState(insuranceOptions[0].id)
  const [customInsuranceAmount, setCustomInsuranceAmount] = useState(orderValue.toString())
  const [trackingNotifications, setTrackingNotifications] = useState(true)
  const [shippingNotes, setShippingNotes] = useState("")
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)

  // State for personal delivery
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(addBusinessDays(new Date(), 3))
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("morning")
  const [deliveryAddress, setDeliveryAddress] = useState(savedAddresses[0].id)
  const [deliveryContact, setDeliveryContact] = useState("")
  const [deliveryPhone, setDeliveryPhone] = useState("")
  const [deliverySpecialInstructions, setDeliverySpecialInstructions] = useState("")
  const [signatureRequired, setSignatureRequired] = useState(true)
  const [deliveryInsurance, setDeliveryInsurance] = useState(true)

  // Calculate estimated dates and costs
  const getEstimatedPickupDate = () => {
    return pickupDate || addBusinessDays(new Date(), 2)
  }

  const getEstimatedShippingDate = () => {
    const selectedService = shippingServices.find((service) => service.id === shippingService)
    if (!selectedService) return addBusinessDays(new Date(), 7)
    return addBusinessDays(new Date(), selectedService.estimatedDays.max)
  }

  const getEstimatedDeliveryDate = () => {
    return deliveryDate || addBusinessDays(new Date(), 3)
  }

  const getShippingCost = () => {
    const selectedService = shippingServices.find((service) => service.id === shippingService)
    return selectedService ? selectedService.price : 0
  }

  const getInsuranceCost = () => {
    if (insuranceOption === "custom") {
      // Calculate custom insurance cost (e.g., 1% of the insured value)
      const insuredValue = Number.parseFloat(customInsuranceAmount) || orderValue
      return Math.round(insuredValue * 0.01 * 100) / 100
    }
    const selectedInsurance = insuranceOptions.find((option) => option.id === insuranceOption)
    return selectedInsurance ? selectedInsurance.price : 0
  }

  const getPersonalDeliveryCost = () => {
    // Base cost for personal delivery
    let cost = 49.99

    // Add insurance if selected
    if (deliveryInsurance) {
      cost += 19.99
    }

    return cost
  }

  const getTotalCost = () => {
    switch (deliveryMethod) {
      case "pickup":
        return 0 // In-store pickup is free
      case "shipping":
        return getShippingCost() + getInsuranceCost()
      case "personal":
        return getPersonalDeliveryCost()
      default:
        return 0
    }
  }

  // Format date range
  const formatDateRange = (minDays: number, maxDays: number) => {
    const minDate = addBusinessDays(new Date(), minDays)
    const maxDate = addBusinessDays(new Date(), maxDays)
    return `${format(minDate, "MMM d")} - ${format(maxDate, "MMM d")}`
  }

  // Handle form submission
  const handleSubmit = () => {
    let details: any = {}
    let estimatedDate: Date = new Date()

    switch (deliveryMethod) {
      case "pickup":
        details = {
          location: storeLocations.find((loc) => loc.id === pickupLocation),
          date: pickupDate,
          time: pickupTime,
          contact: {
            name: pickupContact,
            phone: pickupPhone,
            email: pickupEmail,
          },
          notes: pickupNotes,
        }
        estimatedDate = getEstimatedPickupDate()
        break
      case "shipping":
        details = {
          address:
            addressType === "saved"
              ? savedAddresses.find((addr) => addr.id === selectedAddress)
              : { ...newAddress, name: newAddressName, isDefault: false },
          service: shippingServices.find((service) => service.id === shippingService),
          insurance:
            insuranceOption === "custom"
              ? { name: "Custom Coverage", amount: Number.parseFloat(customInsuranceAmount) || orderValue }
              : insuranceOptions.find((option) => option.id === insuranceOption),
          trackingNotifications,
          notes: shippingNotes,
        }
        estimatedDate = getEstimatedShippingDate()
        break
      case "personal":
        details = {
          address: savedAddresses.find((addr) => addr.id === deliveryAddress),
          date: deliveryDate,
          timeSlot: deliveryTimeSlot,
          contact: {
            name: deliveryContact,
            phone: deliveryPhone,
          },
          specialInstructions: deliverySpecialInstructions,
          signatureRequired,
          insurance: deliveryInsurance,
        }
        estimatedDate = getEstimatedDeliveryDate()
        break
    }

    const selectedMethod: DeliveryMethod = {
      type: deliveryMethod,
      details,
      cost: getTotalCost(),
      estimatedDate,
    }

    onDeliveryMethodSelected(selectedMethod)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Get available time slots
  const getAvailableTimeSlots = () => {
    // In a real app, this would be dynamic based on store hours and availability
    return [
      { value: "10:00", label: "10:00 AM" },
      { value: "11:00", label: "11:00 AM" },
      { value: "12:00", label: "12:00 PM" },
      { value: "13:00", label: "1:00 PM" },
      { value: "14:00", label: "2:00 PM" },
      { value: "15:00", label: "3:00 PM" },
      { value: "16:00", label: "4:00 PM" },
      { value: "17:00", label: "5:00 PM" },
    ]
  }

  // Get delivery time slots
  const getDeliveryTimeSlots = () => {
    return [
      { value: "morning", label: "Morning (9:00 AM - 12:00 PM)" },
      { value: "afternoon", label: "Afternoon (12:00 PM - 4:00 PM)" },
      { value: "evening", label: "Evening (4:00 PM - 7:00 PM)" },
    ]
  }

  // Disable past dates in calendar
  const disablePastDates = (date: Date) => {
    return isBefore(date, new Date()) || date.getDay() === 0 // Disable Sundays
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Delivery Method</h3>
        <p className="text-sm text-muted-foreground">Choose how you want to receive your order</p>
      </div>

      <Tabs value={deliveryMethod} onValueChange={(value) => setDeliveryMethod(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pickup" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>In-Store Pickup</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Shipping</span>
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Personal Delivery</span>
          </TabsTrigger>
        </TabsList>

        {/* In-Store Pickup */}
        <TabsContent value="pickup" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup-location">Select Store Location</Label>
                <Select value={pickupLocation} onValueChange={setPickupLocation}>
                  <SelectTrigger id="pickup-location">
                    <SelectValue placeholder="Select store location" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {pickupLocation && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="font-medium">{storeLocations.find((loc) => loc.id === pickupLocation)?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {storeLocations.find((loc) => loc.id === pickupLocation)?.address}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Hours: </span>
                        <span className="text-muted-foreground">
                          {storeLocations.find((loc) => loc.id === pickupLocation)?.hours}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Phone: </span>
                        <span className="text-muted-foreground">
                          {storeLocations.find((loc) => loc.id === pickupLocation)?.phone}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label>Pickup Date & Time</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={pickupDate}
                        onSelect={setPickupDate}
                        disabled={disablePastDates}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Select value={pickupTime} onValueChange={setPickupTime}>
                    <SelectTrigger>
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTimeSlots().map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup-notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="pickup-notes"
                  placeholder="Add any special instructions for pickup"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup-contact">Contact Person</Label>
                <Input
                  id="pickup-contact"
                  placeholder="Full name"
                  value={pickupContact}
                  onChange={(e) => setPickupContact(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup-phone">Contact Phone</Label>
                <Input
                  id="pickup-phone"
                  placeholder="Phone number"
                  value={pickupPhone}
                  onChange={(e) => setPickupPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup-email">Contact Email</Label>
                <Input
                  id="pickup-email"
                  type="email"
                  placeholder="Email address"
                  value={pickupEmail}
                  onChange={(e) => setPickupEmail(e.target.value)}
                />
              </div>

              <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-green-800 dark:text-green-400">Pickup Summary</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-1 text-sm text-green-800 dark:text-green-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Free in-store pickup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Available for pickup on{" "}
                        {pickupDate
                          ? format(pickupDate, "EEEE, MMMM d")
                          : format(addBusinessDays(new Date(), 2), "EEEE, MMMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Pickup time:{" "}
                        {pickupTime
                          ? `${Number.parseInt(pickupTime) > 12 ? Number.parseInt(pickupTime) - 12 : pickupTime}:00 ${Number.parseInt(pickupTime) >= 12 ? "PM" : "AM"}`
                          : "12:00 PM"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <div>
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-900/30 dark:text-green-400"
                  >
                    No additional cost
                  </Badge>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Shipping */}
        <TabsContent value="shipping" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Shipping Address</Label>
                <RadioGroup
                  value={addressType}
                  onValueChange={(value) => setAddressType(value as "saved" | "new")}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="saved" id="saved-address" />
                    <Label htmlFor="saved-address" className="font-normal">
                      Use a saved address
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new-address" />
                    <Label htmlFor="new-address" className="font-normal">
                      Enter a new address
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {addressType === "saved" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="saved-address-select">Select Address</Label>
                    <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                      <SelectTrigger id="saved-address-select">
                        <SelectValue placeholder="Select address" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedAddresses.map((address) => (
                          <SelectItem key={address.id} value={address.id}>
                            {address.name} - {address.street}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAddress && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {savedAddresses.find((addr) => addr.id === selectedAddress)?.name}
                              {savedAddresses.find((addr) => addr.id === selectedAddress)?.isDefault && (
                                <Badge variant="outline" className="ml-2">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {savedAddresses.find((addr) => addr.id === selectedAddress)?.recipient}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {savedAddresses.find((addr) => addr.id === selectedAddress)?.street}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {savedAddresses.find((addr) => addr.id === selectedAddress)?.city},{" "}
                              {savedAddresses.find((addr) => addr.id === selectedAddress)?.state}{" "}
                              {savedAddresses.find((addr) => addr.id === selectedAddress)?.zip}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {savedAddresses.find((addr) => addr.id === selectedAddress)?.country}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {savedAddresses.find((addr) => addr.id === selectedAddress)?.phone}
                            </div>
                          </div>
                          <div>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Collapsible open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Enter Shipping Address</span>
                      {isAddressFormOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Name</Label>
                      <Input
                        id="recipient"
                        placeholder="Full name"
                        value={newAddress.recipient}
                        onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        placeholder="Street address"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          placeholder="ZIP code"
                          value={newAddress.zip}
                          onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={newAddress.country}
                          onValueChange={(value) => setNewAddress({ ...newAddress, country: value })}
                        >
                          <SelectTrigger id="country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Phone number"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="save-address"
                        checked={saveNewAddress}
                        onCheckedChange={(checked) => setSaveNewAddress(checked as boolean)}
                      />
                      <Label htmlFor="save-address" className="font-normal">
                        Save this address for future orders
                      </Label>
                    </div>

                    {saveNewAddress && (
                      <div className="space-y-2">
                        <Label htmlFor="address-name">Address Name</Label>
                        <Input
                          id="address-name"
                          placeholder="e.g., Home, Office, etc."
                          value={newAddressName}
                          onChange={(e) => setNewAddressName(e.target.value)}
                        />
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="space-y-2">
                <Label>Shipping Service</Label>
                <RadioGroup
                  value={shippingService}
                  onValueChange={setShippingService}
                  className="flex flex-col space-y-2"
                >
                  {shippingServices.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={service.id} id={`service-${service.id}`} />
                      <Label htmlFor={`service-${service.id}`} className="flex flex-1 justify-between font-normal">
                        <div>
                          <span>{service.name}</span>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <span>{formatCurrency(service.price)}</span>
                          <p className="text-xs text-muted-foreground">
                            Est. delivery: {formatDateRange(service.estimatedDays.min, service.estimatedDays.max)}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping-notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="shipping-notes"
                  placeholder="Add any special instructions for shipping"
                  value={shippingNotes}
                  onChange={(e) => setShippingNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Insurance Options</Label>
                <RadioGroup
                  value={insuranceOption}
                  onValueChange={setInsuranceOption}
                  className="flex flex-col space-y-2"
                >
                  {insuranceOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={`insurance-${option.id}`} />
                      <Label htmlFor={`insurance-${option.id}`} className="flex flex-1 justify-between font-normal">
                        <div>
                          <span>{option.name}</span>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <div className="text-right">
                          {option.id === "custom" ? (
                            <span>Varies</span>
                          ) : (
                            <span>{option.price === 0 ? "Included" : formatCurrency(option.price)}</span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {insuranceOption === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-insurance">Coverage Amount</Label>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="custom-insurance"
                      type="number"
                      min="1000"
                      step="100"
                      value={customInsuranceAmount}
                      onChange={(e) => setCustomInsuranceAmount(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Custom insurance cost: {formatCurrency(getInsuranceCost())} (1% of coverage amount)
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="tracking-notifications"
                  checked={trackingNotifications}
                  onCheckedChange={setTrackingNotifications}
                />
                <Label htmlFor="tracking-notifications" className="font-normal">
                  Send tracking notifications
                </Label>
              </div>

              <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-blue-800 dark:text-blue-400">Shipping Summary</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span>
                        {shippingServices.find((service) => service.id === shippingService)?.name} (
                        {shippingServices.find((service) => service.id === shippingService)?.description})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Estimated delivery:{" "}
                        {formatDateRange(
                          shippingServices.find((service) => service.id === shippingService)?.estimatedDays.min || 0,
                          shippingServices.find((service) => service.id === shippingService)?.estimatedDays.max || 0,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>
                        {insuranceOption === "custom"
                          ? `Custom insurance: Up to ${formatCurrency(Number.parseFloat(customInsuranceAmount) || orderValue)}`
                          : insuranceOptions.find((option) => option.id === insuranceOption)?.description}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <div>
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    Total: {formatCurrency(getShippingCost() + getInsuranceCost())}
                  </Badge>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Personal Delivery */}
        <TabsContent value="personal" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delivery-address">Delivery Address</Label>
                <Select value={deliveryAddress} onValueChange={setDeliveryAddress}>
                  <SelectTrigger id="delivery-address">
                    <SelectValue placeholder="Select address" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedAddresses.map((address) => (
                      <SelectItem key={address.id} value={address.id}>
                        {address.name} - {address.street}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {deliveryAddress && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {savedAddresses.find((addr) => addr.id === deliveryAddress)?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {savedAddresses.find((addr) => addr.id === deliveryAddress)?.recipient}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {savedAddresses.find((addr) => addr.id === deliveryAddress)?.street}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {savedAddresses.find((addr) => addr.id === deliveryAddress)?.city},{" "}
                        {savedAddresses.find((addr) => addr.id === deliveryAddress)?.state}{" "}
                        {savedAddresses.find((addr) => addr.id === deliveryAddress)?.zip}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {savedAddresses.find((addr) => addr.id === deliveryAddress)?.country}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {savedAddresses.find((addr) => addr.id === deliveryAddress)?.phone}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label>Delivery Date & Time</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        disabled={disablePastDates}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Select value={deliveryTimeSlot} onValueChange={setDeliveryTimeSlot}>
                    <SelectTrigger>
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDeliveryTimeSlots().map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-contact">Contact Person</Label>
                <Input
                  id="delivery-contact"
                  placeholder="Full name"
                  value={deliveryContact}
                  onChange={(e) => setDeliveryContact(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-phone">Contact Phone</Label>
                <Input
                  id="delivery-phone"
                  placeholder="Phone number"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delivery-instructions">Special Instructions</Label>
                <Textarea
                  id="delivery-instructions"
                  placeholder="Add any special instructions for delivery"
                  value={deliverySpecialInstructions}
                  onChange={(e) => setDeliverySpecialInstructions(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="signature-required" checked={signatureRequired} onCheckedChange={setSignatureRequired} />
                  <Label htmlFor="signature-required" className="font-normal">
                    Signature required upon delivery
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="delivery-insurance" checked={deliveryInsurance} onCheckedChange={setDeliveryInsurance} />
                  <Label htmlFor="delivery-insurance" className="font-normal">
                    Add delivery insurance (+{formatCurrency(19.99)})
                  </Label>
                </div>
              </div>

              <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-purple-800 dark:text-purple-400">
                    Personal Delivery Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-1 text-sm text-purple-800 dark:text-purple-400">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>White glove personal delivery service</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Delivery on{" "}
                        {deliveryDate
                          ? format(deliveryDate, "EEEE, MMMM d")
                          : format(addBusinessDays(new Date(), 3), "EEEE, MMMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Time slot: {getDeliveryTimeSlots().find((slot) => slot.value === deliveryTimeSlot)?.label}
                      </span>
                    </div>
                    {signatureRequired && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Signature required upon delivery</span>
                      </div>
                    )}
                    {deliveryInsurance && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Delivery insurance included</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <div>
                  <Badge
                    variant="outline"
                    className="border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-900 dark:bg-purple-900/30 dark:text-purple-400"
                  >
                    Total: {formatCurrency(getPersonalDeliveryCost())}
                  </Badge>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="font-medium">
              Delivery Method:{" "}
              {deliveryMethod === "pickup"
                ? "In-Store Pickup"
                : deliveryMethod === "shipping"
                  ? "Shipping"
                  : "Personal Delivery"}
            </div>
            <div className="text-sm text-muted-foreground">
              {deliveryMethod === "pickup" && "Ready for pickup on "}
              {deliveryMethod === "shipping" && "Estimated delivery: "}
              {deliveryMethod === "personal" && "Scheduled delivery on "}
              {deliveryMethod === "pickup" && pickupDate
                ? format(pickupDate, "EEEE, MMMM d")
                : deliveryMethod === "pickup"
                  ? format(addBusinessDays(new Date(), 2), "EEEE, MMMM d")
                  : deliveryMethod === "shipping"
                    ? formatDateRange(
                        shippingServices.find((service) => service.id === shippingService)?.estimatedDays.min || 0,
                        shippingServices.find((service) => service.id === shippingService)?.estimatedDays.max || 0,
                      )
                    : deliveryDate
                      ? format(deliveryDate, "EEEE, MMMM d")
                      : format(addBusinessDays(new Date(), 3), "EEEE, MMMM d")}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium">{getTotalCost() === 0 ? "Free" : formatCurrency(getTotalCost())}</div>
          <Button onClick={handleSubmit} className="mt-2">
            Continue to Payment
          </Button>
        </div>
      </div>
    </div>
  )
}
