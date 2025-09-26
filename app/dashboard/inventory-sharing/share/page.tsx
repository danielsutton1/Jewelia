"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShareInventoryForm } from '@/components/inventory-sharing/ShareInventoryForm'

// =====================================================
// SHARE INVENTORY PAGE
// =====================================================

export default function ShareInventoryPage() {
  const router = useRouter()
  const [isSharing, setIsSharing] = useState(false)

  const handleSuccess = () => {
    setIsSharing(false)
    router.push('/dashboard/inventory-sharing')
  }

  const handleCancel = () => {
    router.push('/dashboard/inventory-sharing')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="w-full px-1 py-1">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory Sharing
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Share2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Share Your Inventory
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with other jewelry professionals by sharing your inventory. 
              Control who sees what and enable B2B opportunities.
            </p>
          </div>
        </div>

        {/* Sharing Form */}
        <ShareInventoryForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
