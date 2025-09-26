"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send, UserPlus, Building2, MapPin, Star } from "lucide-react"

interface ConnectionRequestModalProps {
  isOpen: boolean
  onClose: () => void
  partner: {
    id: string
    name: string
    company: string
    avatar_url?: string
    location: string
    specialties: string[]
    rating: number
    description?: string
  }
  onRequestSent?: () => void
}

export function ConnectionRequestModal({
  isOpen,
  onClose,
  partner,
  onRequestSent
}: ConnectionRequestModalProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendRequest = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please add a personal message to your connection request",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/network/connection-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: partner.id,
          message: message.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Connection Request Sent!",
          description: `Your request to connect with ${partner.name} has been sent successfully.`,
          variant: "default"
        })
        onRequestSent?.()
        onClose()
      } else {
        throw new Error(data.error || 'Failed to send connection request')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const defaultMessage = `Hi ${partner.name}, I'd like to connect with you to explore potential business opportunities in the jewelry industry.`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Send Connection Request
          </DialogTitle>
          <DialogDescription>
            Send a personalized message to connect with {partner.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Partner Info Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={partner.avatar_url} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-semibold">
                  {partner.name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{partner.name}</h3>
                  {partner.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{partner.rating}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{partner.company}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{partner.location}</span>
                </div>
                
                {partner.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {partner.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {partner.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{partner.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700">
              Personal Message
            </label>
            <Textarea
              id="message"
              placeholder={defaultMessage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Make it personal to increase acceptance chances</span>
              <span>{message.length}/500</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={isLoading || !message.trim()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
