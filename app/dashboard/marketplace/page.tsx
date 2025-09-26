"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  Gem, 
  Plus, 
  Users, 
  TrendingUp, 
  ShoppingCart, 
  Building,
  ArrowRight,
  Star,
  Eye,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AIRecommendations } from '@/components/inventory-sharing/AIRecommendations'

// =====================================================
// MARKETPLACE LANDING PAGE
// =====================================================

export default function MarketplacePage() {
  const router = useRouter()
  const [currentUserId, setCurrentUserId] = useState<string>('')

  // Fetch current user ID
  useState(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const user = await response.json()
          setCurrentUserId(user.id)
        }
      } catch (error) {
        console.error('Error fetching current user:', error)
      }
    }
    fetchCurrentUser()
  })

  const handleShareInventory = () => {
    router.push('/dashboard/inventory-sharing/share')
  }

  const handleManageInventory = () => {
    router.push('/dashboard/inventory-sharing')
  }

  const handleBrowseNetwork = () => {
    router.push('/dashboard/shared-inventory')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <div className="w-full px-1 py-1">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full mb-6">
            <ShoppingCart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Jewelry Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with jewelry professionals worldwide. Share your inventory, discover new pieces, 
            and build lasting business relationships in our trusted network.
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Share Your Inventory */}
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Package className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">Share Your Inventory</CardTitle>
              <CardDescription className="text-emerald-700">
                Make your jewelry available to other professionals in the network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-800">Control visibility and pricing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-800">Set B2B terms and conditions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-800">Manage professional connections</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-800">Track performance and analytics</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleShareInventory}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Share New Item
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleManageInventory}
                  className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Manage Shared
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Browse Network Inventory */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Gem className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-900">Browse Network Inventory</CardTitle>
              <CardDescription className="text-blue-700">
                Discover jewelry from trusted professionals worldwide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Search by category, metal, and gemstone</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Request quotes and place orders</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Connect with inventory owners</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">AI-powered recommendations</span>
                </div>
              </div>
              
              <Button 
                onClick={handleBrowseNetwork}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Browse Inventory
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/60 backdrop-blur-sm text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Professional Network</h3>
            <p className="text-sm text-gray-600">Connect with verified jewelry professionals worldwide</p>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">B2B Ready</h3>
            <p className="text-sm text-gray-600">Professional terms, bulk pricing, and wholesale options</p>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Analytics</h3>
            <p className="text-sm text-gray-600">Track performance and optimize your sharing strategy</p>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Direct Communication</h3>
            <p className="text-sm text-gray-600">Request quotes and negotiate directly with owners</p>
          </Card>
        </div>

        {/* AI Recommendations */}
        {currentUserId && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                AI-Powered Recommendations
              </h2>
              <p className="text-gray-600">
                Discover inventory tailored to your preferences and business needs
              </p>
            </div>
            <AIRecommendations 
              userId={currentUserId}
              showFeedback={true}
              showActions={true}
              maxItems={8}
            />
          </div>
        )}

        {/* How It Works */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">How the Marketplace Works</CardTitle>
            <CardDescription>
              A simple 3-step process to start sharing and discovering inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-emerald-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Share Your Inventory</h3>
                <p className="text-gray-600">
                  Select items to share, set visibility levels, and configure B2B options
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Connect with Professionals</h3>
                <p className="text-gray-600">
                  Build your network and manage who can see your inventory
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Grow Your Business</h3>
                <p className="text-gray-600">
                  Receive requests, negotiate deals, and expand your professional reach
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Join the Professional Jewelry Marketplace?
              </h2>
              <p className="text-emerald-100 mb-6">
                Start sharing your inventory today and connect with jewelry professionals worldwide
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleShareInventory}
                  variant="secondary"
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-gray-100"
                >
                  <Package className="h-5 w-5 mr-2" />
                  Start Sharing
                </Button>
                <Button 
                  onClick={handleBrowseNetwork}
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-emerald-600"
                >
                  <Gem className="h-5 w-5 mr-2" />
                  Browse Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
