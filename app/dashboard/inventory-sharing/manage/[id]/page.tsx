"use client"

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ManageSharingSettings } from '@/components/inventory-sharing/ManageSharingSettings'

// =====================================================
// MANAGE SHARING SETTINGS PAGE
// =====================================================

export default function ManageSharingPage() {
  const params = useParams()
  const router = useRouter()
  const sharingId = params.id as string

  const handleSuccess = () => {
    router.push('/dashboard/inventory-sharing')
  }

  const handleCancel = () => {
    router.push('/dashboard/inventory-sharing')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
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
              <Settings className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Sharing Settings
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Control who can see your inventory and what they can do with it. 
              Manage visibility, permissions, and connections.
            </p>
          </div>
        </div>

        {/* Management Form */}
        <ManageSharingSettings
          sharingId={sharingId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
