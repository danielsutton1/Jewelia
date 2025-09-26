"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Save, SendHorizonal, FileText, Truck, CreditCard, ClipboardList, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { SupplierSelector } from "./supplier-selector"
import { CustomItemForm } from "./custom-item-form"
import { LineItemsTable } from "./line-items-table"
import { DeliveryInstructionsForm } from "./delivery-instructions-form"
import { TermsSelection } from "./terms-selection"
import { CatalogBrowser } from "./catalog-browser"

import type { PurchaseOrder, PurchaseOrderLineItem, Address, ApprovalStep } from "@/types/purchase-order"

interface POCreationFormProps {
  initialData?: Partial<PurchaseOrder>
  onSubmit: (po: PurchaseOrder, action: "save" | "send") => Promise<void>
}

export function POCreationForm({ initialData, onSubmit }: POCreationFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("items")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // PO Data
  const [poNumber, setPONumber] = useState("")
  const [supplier, setSupplier] = useState<{ id: string; name: string } | null>(null)
  const [lineItems, setLineItems] = useState<PurchaseOrderLineItem[]>([])
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    attention: "",
  })
  const [deliveryInstructions, setDeliveryInstructions] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [notes, setNotes] = useState("")
  const [currency, setCurrency] = useState("USD")

  // Initialize form with data if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.poNumber) setPONumber(initialData.poNumber)
      if (initialData.supplierId && initialData.supplierName) {
        setSupplier({ id: initialData.supplierId, name: initialData.supplierName })
      }
      if (initialData.lineItems) setLineItems(initialData.lineItems)
      if (initialData.deliveryAddress) setDeliveryAddress(initialData.deliveryAddress)
      if (initialData.deliveryInstructions) setDeliveryInstructions(initialData.deliveryInstructions)
      if (initialData.deliveryDate) setDeliveryDate(initialData.deliveryDate)
      if (initialData.paymentTerms) setPaymentTerms(initialData.paymentTerms)
      if (initialData.notes) setNotes(initialData.notes)
      if (initialData.currency) setCurrency(initialData.currency)
    } else {
      // Generate a new PO number for new POs
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, "0")
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      setPONumber(`PO-${year}${month}-${randomNum}`)
    }
  }, [initialData])

  const handleSupplierSelect = (selectedSupplier: { id: string; name: string }) => {
    setSupplier(selectedSupplier)
  }

  const handleAddCustomItem = (item: Omit<PurchaseOrderLineItem, "id" | "status" | "receivedQuantity">) => {
    const newItem: PurchaseOrderLineItem = {
      id: uuidv4(),
      ...item,
      status: "pending",
      receivedQuantity: 0,
    }
    setLineItems((prev) => [...prev, newItem])
    setActiveTab("review")
  }

  const handleAddCatalogItem = (item: any) => {
    // Convert catalog item to line item
    const newItem: PurchaseOrderLineItem = {
      id: uuidv4(),
      productId: item.id,
      catalogItemId: item.id,
      description: item.name,
      quantity: 1,
      unit: item.unit || "piece",
      unitPrice: item.price,
      totalPrice: item.price,
      tax: item.price * 0.05, // Example tax calculation
      status: "pending",
      receivedQuantity: 0,
    }
    setLineItems((prev) => [...prev, newItem])
  }

  const handleUpdateLineItem = (id: string, updates: Partial<PurchaseOrderLineItem>) => {
    setLineItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleDeliveryInfoSave = (data: { address: Address; instructions?: string; deliveryDate: string }) => {
    setDeliveryAddress(data.address)
    setDeliveryInstructions(data.instructions || "")
    setDeliveryDate(data.deliveryDate)
    setActiveTab("terms")
  }

  const handleTermsSave = (data: { terms: string; notes?: string }) => {
    setPaymentTerms(data.terms)
    setNotes(data.notes || "")
    setActiveTab("review")
  }

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.totalPrice + (item.tax || 0)), 0)
  }

  const handleSubmitPO = async (action: "save" | "send") => {
    if (!supplier) return

    setIsSubmitting(true)

    try {
      // Create approval chain
      const approvalChain: ApprovalStep[] = [
        {
          id: uuidv4(),
          approverName: "Jane Doe",
          approverEmail: "jane.doe@jewelia.com",
          approverRole: "Purchasing Manager",
          status: "pending",
          order: 1,
        },
        {
          id: uuidv4(),
          approverName: "Michael Johnson",
          approverEmail: "michael.johnson@jewelia.com",
          approverRole: "Finance Director",
          status: "pending",
          order: 2,
        },
      ]

      // Construct the PO object
      const purchaseOrder: PurchaseOrder = {
        id: initialData?.id || uuidv4(),
        poNumber,
        supplierId: supplier.id,
        supplierName: supplier.name,
        status: action === "save" ? "draft" : "pending_approval",
        createdAt: initialData?.createdAt || new Date().toISOString(),
        createdBy: "Current User", // In a real app, this would be the current user
        updatedAt: new Date().toISOString(),
        totalAmount: calculateTotal(),
        currency,
        deliveryDate,
        deliveryAddress,
        deliveryInstructions,
        paymentTerms,
        approvalChain,
        lineItems,
        notes,
      }

      await onSubmit(purchaseOrder, action)

      // Navigate to the PO detail page or list page
      router.push("/dashboard/purchase-orders")
    } catch (error) {
      console.error("Error submitting PO:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return (
      supplier &&
      lineItems.length > 0 &&
      deliveryAddress.street &&
      deliveryAddress.city &&
      deliveryAddress.state &&
      deliveryAddress.postalCode &&
      deliveryAddress.country &&
      deliveryDate &&
      paymentTerms
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Purchase Order</CardTitle>
            <CardDescription>Create a new purchase order for your supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="po-number">PO Number</Label>
                <Input
                  id="po-number"
                  value={poNumber}
                  onChange={(e) => setPONumber(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <SupplierSelector onSelect={handleSupplierSelect} selectedSupplierId={supplier?.id} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="items" className="flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Items
                </TabsTrigger>
                <TabsTrigger value="delivery" className="flex items-center">
                  <Truck className="mr-2 h-4 w-4" />
                  Delivery
                </TabsTrigger>
                <TabsTrigger value="terms" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Terms
                </TabsTrigger>
                <TabsTrigger value="review" className="flex items-center">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Catalog Items</h3>
                    <CatalogBrowser supplierId={supplier?.id} onAddItem={handleAddCatalogItem} />
                  </div>
                  <div>
                    <CustomItemForm onAddItem={handleAddCustomItem} />
                  </div>
                </div>

                {lineItems.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Added Items</h3>
                    <LineItemsTable
                      items={lineItems}
                      onUpdateItem={handleUpdateLineItem}
                      onRemoveItem={handleRemoveLineItem}
                      currency={currency}
                    />

                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => setActiveTab("delivery")}>Continue to Delivery</Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="delivery" className="pt-4">
                <h3 className="text-lg font-medium mb-4">Delivery Information</h3>
                <DeliveryInstructionsForm
                  initialAddress={deliveryAddress}
                  initialInstructions={deliveryInstructions}
                  initialDeliveryDate={deliveryDate}
                  onSave={handleDeliveryInfoSave}
                />
              </TabsContent>

              <TabsContent value="terms" className="pt-4">
                <h3 className="text-lg font-medium mb-4">Payment Terms</h3>
                <TermsSelection initialTerms={paymentTerms} initialNotes={notes} onSave={handleTermsSave} />
              </TabsContent>

              <TabsContent value="review" className="pt-4">
                <h3 className="text-lg font-medium mb-4">Review Purchase Order</h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">PO Details</h4>
                      <p className="text-sm">PO Number: {poNumber}</p>
                      <p className="text-sm">Supplier: {supplier?.name || "Not selected"}</p>
                      <p className="text-sm">Currency: {currency}</p>
                    </div>

                    <div>
                      <h4 className="font-medium">Delivery Information</h4>
                      <p className="text-sm">Delivery Date: {deliveryDate || "Not set"}</p>
                      {deliveryAddress.street && (
                        <p className="text-sm">
                          Address: {deliveryAddress.street}, {deliveryAddress.city}, {deliveryAddress.state},{" "}
                          {deliveryAddress.postalCode}, {deliveryAddress.country}
                        </p>
                      )}
                      {deliveryInstructions && <p className="text-sm">Instructions: {deliveryInstructions}</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Payment Terms</h4>
                    <p className="text-sm">{paymentTerms || "Not set"}</p>
                    {notes && (
                      <div className="mt-2">
                        <h4 className="font-medium">Additional Notes</h4>
                        <p className="text-sm">{notes}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Line Items</h4>
                    <LineItemsTable
                      items={lineItems}
                      onUpdateItem={handleUpdateLineItem}
                      onRemoveItem={handleRemoveLineItem}
                      currency={currency}
                      editable={false}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => handleSubmitPO("save")}
                      disabled={!isFormValid() || isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save as Draft
                    </Button>
                    <Button onClick={() => handleSubmitPO("send")} disabled={!isFormValid() || isSubmitting}>
                      <SendHorizonal className="mr-2 h-4 w-4" />
                      Submit for Approval
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{lineItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {currency} {lineItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>
                    {currency} {lineItems.reduce((sum, item) => sum + (item.tax || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>
                    {currency} {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
