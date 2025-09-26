"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Address } from "@/types/purchase-order"

interface DeliveryInstructionsFormProps {
  initialAddress?: Address
  initialInstructions?: string
  initialDeliveryDate?: string
  onSave: (data: { address: Address; instructions?: string; deliveryDate: string }) => void
}

export function DeliveryInstructionsForm({
  initialAddress,
  initialInstructions,
  initialDeliveryDate,
  onSave,
}: DeliveryInstructionsFormProps) {
  const [address, setAddress] = useState<Address>(
    initialAddress || {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      attention: "",
    },
  )
  const [instructions, setInstructions] = useState(initialInstructions || "")
  const [deliveryDate, setDeliveryDate] = useState(initialDeliveryDate || "")

  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress)
    }
    if (initialInstructions) {
      setInstructions(initialInstructions)
    }
    if (initialDeliveryDate) {
      setDeliveryDate(initialDeliveryDate)
    }
  }, [initialAddress, initialInstructions, initialDeliveryDate])

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      address,
      instructions,
      deliveryDate,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deliveryDate">Delivery Date</Label>
        <Input
          id="deliveryDate"
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attention">Attention</Label>
        <Input
          id="attention"
          value={address.attention || ""}
          onChange={(e) => handleAddressChange("attention", e.target.value)}
          placeholder="Receiving Department"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Textarea
          id="street"
          value={address.street}
          onChange={(e) => handleAddressChange("street", e.target.value)}
          placeholder="123 Main St, Suite 100"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={address.city}
            onChange={(e) => handleAddressChange("city", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            value={address.state}
            onChange={(e) => handleAddressChange("state", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={address.postalCode}
            onChange={(e) => handleAddressChange("postalCode", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={address.country}
            onChange={(e) => handleAddressChange("country", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Special Instructions</Label>
        <Textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Any special delivery instructions"
          rows={4}
        />
      </div>

      <Button type="submit">Save Delivery Information</Button>
    </form>
  )
}
