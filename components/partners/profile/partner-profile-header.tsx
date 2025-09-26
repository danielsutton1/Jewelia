"use client"

import { useState } from "react"
import type { PartnerProfile } from "@/types/partner-profile"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Globe, MessageSquare, ShoppingBag, Star, StarHalf, Clock, FileText, MapPin } from "lucide-react"
import Image from "next/image"

interface PartnerProfileHeaderProps {
  partner: PartnerProfile
}

export function PartnerProfileHeader({ partner }: PartnerProfileHeaderProps) {
  const [messageOpen, setMessageOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)

  // Function to render star rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-yellow-400 text-yellow-400 w-4 h-4" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-yellow-400 text-yellow-400 w-4 h-4" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="text-gray-300 w-4 h-4" />)
    }

    return stars
  }

  // Get primary location
  const primaryLocation = partner.locations.find((loc) => loc.isPrimary)

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={partner.logo || "/placeholder.svg"}
              alt={`${partner.name} logo`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Main info */}
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{partner.name}</h1>
            <div className="flex items-center mt-2 md:mt-0">
              {renderStars(partner.rating)}
              <span className="ml-2 text-gray-600 font-medium">{partner.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {partner.category.map((cat) => {
              const categoryName = cat
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")

              return (
                <Badge key={cat} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {categoryName}
                </Badge>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {partner.contactName && (
              <div className="flex items-center text-gray-600">
                <span className="font-medium">Primary Contact:</span>
                <span className="ml-2">{partner.contactName}</span>
              </div>
            )}

            {primaryLocation && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span>
                  {primaryLocation.city}, {primaryLocation.state}
                </span>
              </div>
            )}

            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              <span>{partner.responseTime}h avg. response time</span>
            </div>

            <div className="flex items-center text-gray-600">
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              <span>{partner.recentOrderCount} recent orders</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {partner.specialties.slice(0, 5).map((specialty) => {
              const specialtyName = specialty
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")

              return (
                <Badge key={specialty} variant="secondary" className="bg-gray-100">
                  {specialtyName}
                </Badge>
              )
            })}
            {partner.specialties.length > 5 && (
              <Badge variant="secondary" className="bg-gray-100">
                +{partner.specialties.length - 5} more
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Call</span>
            </Button>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </Button>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Website</span>
            </Button>
            <Button
              size="sm"
              variant="default"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setMessageOpen(true)}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </Button>
            <Button size="sm" variant="default" className="flex items-center gap-2" onClick={() => setOrderOpen(true)}>
              <ShoppingBag className="w-4 h-4" />
              <span>Place Order</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
