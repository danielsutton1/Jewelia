'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Star, 
  Gem, 
  Heart,
  Share2,
  Bookmark,
  Globe,
  MapPin,
  Calendar
} from 'lucide-react'
import { SocialFeed } from '@/components/social/SocialFeed'
import { useAuth } from '@/components/providers/auth-provider'

export default function SocialNetworkPage() {
  const { user, userRole } = useAuth()
  const [activeTab, setActiveTab] = useState('feed')

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-2xl font-bold mb-4">Access Required</h1>
              <p className="text-muted-foreground mb-6">
                Please log in to access the social network features.
              </p>
              <Button asChild>
                <a href="/login">Sign In</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Extract user display information safely
  const userDisplayName = user.user_metadata?.full_name || 
                         user.user_metadata?.first_name || 
                         user.email?.split('@')[0] || 
                         'User'
  const userDisplayRole = userRole || user.user_metadata?.role || 'Member'
  const userInitial = userDisplayName.charAt(0).toUpperCase()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Gem className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Jewelry Social Network</h1>
            <p className="text-muted-foreground">Connect, share, and discover with the jewelry community</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">5,892</div>
              <div className="text-sm text-muted-foreground">Posts Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">23.4K</div>
              <div className="text-sm text-muted-foreground">Total Connections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-muted-foreground">New Members</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userInitial}
                </div>
                <div>
                  <div className="font-medium">{userDisplayName}</div>
                  <div className="text-sm text-muted-foreground">{userDisplayRole}</div>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/profile">Edit Profile</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/social/connections">
                  <Users className="h-4 w-4 mr-2" />
                  View Connections
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/social/discover">
                  <Globe className="h-4 w-4 mr-2" />
                  Discover People
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/social/bookmarks">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Saved Posts
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['#CustomDesigns', '#VintageJewelry', '#ModernTrends', '#DiamondRings', '#SustainableJewelry'].map((topic) => (
                <div key={topic} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <span className="text-sm">{topic}</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="showcase" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Showcase
              </TabsTrigger>
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Connections
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <SocialFeed showCreatePost={true} />
            </TabsContent>

            <TabsContent value="showcase" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Featured Showcases
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Discover amazing jewelry designs and craftsmanship from our community
                  </p>
                </CardHeader>
                <CardContent>
                  <SocialFeed 
                    initialFilters={{ content_types: ['showcase'] }}
                    showCreatePost={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discover" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Discover People
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Find and connect with jewelry professionals, designers, and enthusiasts
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2">People Discovery</h3>
                    <p className="text-muted-foreground mb-4">
                      Find people based on location, specialties, and interests
                    </p>
                    <Button>Coming Soon</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="connections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Your Connections
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Manage your professional network and connections
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🤝</div>
                    <h3 className="text-lg font-semibold mb-2">Connection Management</h3>
                    <p className="text-muted-foreground mb-4">
                      View and manage your professional connections
                    </p>
                    <Button>Coming Soon</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 pt-8 border-t">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">
            🚀 Phase 1 Foundation Complete - Social Network Features Active
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              Posts & Reactions
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3 text-blue-500" />
              Comments & Engagement
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="h-3 w-3 text-green-500" />
              Sharing & Discovery
            </span>
            <span className="flex items-center gap-1">
              <Bookmark className="h-3 w-3 text-purple-500" />
              Bookmarks & Collections
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 