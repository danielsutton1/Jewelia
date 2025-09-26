"use client"

import { useState } from 'react'
import { MessageSquare, DollarSign, Package, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface QuoteRequestModalProps {
  isOpen: boolean
  onClose: () => void
  inventory: {
    id: string
    name: string
    sku: string
    price: number
    partner: {
      id: string
      name: string
      company: string
    }
  }
}

export function QuoteRequestModal({ isOpen, onClose, inventory }: QuoteRequestModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    requested_quantity: 1,
    requested_price: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.requested_quantity < 1) {
      toast({
        title: "Error",
        description: "Requested quantity must be at least 1",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partner_id: inventory.partner.id,
          inventory_id: inventory.id,
          requested_quantity: formData.requested_quantity,
          requested_price: formData.requested_price ? parseFloat(formData.requested_price) : undefined,
          message: formData.message
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Quote request sent successfully"
        })
        onClose()
        setFormData({
          requested_quantity: 1,
          requested_price: '',
          message: ''
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send quote request')
      }
    } catch (error: any) {
      console.error('Error sending quote request:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to send quote request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-emerald-900">Request Quote</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Inventory Info */}
        <div className="bg-emerald-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-emerald-900 mb-2">{inventory.name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-emerald-700">
            <div>
              <span className="font-medium">SKU:</span> {inventory.sku}
            </div>
            <div>
              <span className="font-medium">Current Price:</span> ${inventory.price.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Partner:</span> {inventory.partner.name}
            </div>
            <div>
              <span className="font-medium">Company:</span> {inventory.partner.company}
            </div>
          </div>
        </div>

        {/* Quote Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requested_quantity" className="text-emerald-700">
                Requested Quantity *
              </Label>
              <Input
                id="requested_quantity"
                type="number"
                min="1"
                value={formData.requested_quantity}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  requested_quantity: parseInt(e.target.value) || 1 
                }))}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="requested_price" className="text-emerald-700">
                Suggested Price (Optional)
              </Label>
              <Input
                id="requested_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.requested_price}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  requested_price: e.target.value 
                }))}
                className="mt-1"
                placeholder="Enter your suggested price"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="text-emerald-700">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                message: e.target.value 
              }))}
              className="mt-1"
              rows={4}
              placeholder="Add any specific requirements or questions..."
            />
          </div>

          {/* Quote Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Quote Summary</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div>Quantity: {formData.requested_quantity} units</div>
              {formData.requested_price && (
                <div>Suggested Price: ${parseFloat(formData.requested_price).toLocaleString()} per unit</div>
              )}
              <div className="font-medium">
                Total Suggested Value: ${formData.requested_price 
                  ? (parseFloat(formData.requested_price) * formData.requested_quantity).toLocaleString()
                  : 'TBD'
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Quote Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
