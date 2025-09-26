'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Users, 
  UserPlus, 
  Settings, 
  Globe, 
  MapPin, 
  Building, 
  Briefcase,
  Calendar,
  MessageCircle,
  Heart,
  Share2,
  Edit3
} from 'lucide-react'
import { toast } from 'sonner'
import { SocialProfileService } from '@/lib/services/SocialProfileService'
import { SocialProfile, UserConnection } from '@/types/social-profile'
import SocialFeed from '@/components/social/social-feed'

export default function SocialNetworkPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<SocialProfile | null>(null)
  const [connections, setConnections] = useState<UserConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    loadProfile()
    loadConnections()
  }, [])

  const loadProfile = async () => {
    try {
      // Fetch real profile from API
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        if (userData.success) {
          // Create profile from user data
          const userProfile: SocialProfile = {
            id: userData.data.id,
            user_id: userData.data.id,
            display_name: userData.data.full_name || 'Jewelry Professional',
            username: userData.data.email?.split('@')[0] || 'jewelry_pro',
            bio: 'Passionate about creating beautiful jewelry and connecting with industry professionals. Specializing in custom designs and vintage restoration.',
            avatar_url: userData.data.avatar_url || '/diverse-avatars.png',
            cover_image_url: '/assorted-jewelry-display.png',
            website_url: 'https://jewelrypro.com',
            location: 'New York, NY',
            company: 'Jewelry Pro Studio',
            job_title: 'Master Jeweler & Designer',
            industry: 'Jewelry Design',
            follower_count: 127,
            following_count: 89,
            post_count: 23,
            like_count: 156,
            social_links: {
              linkedin: 'https://linkedin.com/in/jewelrypro',
              instagram: 'https://instagram.com/jewelrypro',
              website: 'https://jewelrypro.com'
            },
            is_public: true,
            show_online_status: true,
            allow_messages: true,
            allow_follows: true,
            is_verified: true,
            badges: ['Verified Professional', 'Active User'],
            created_at: userData.data.created_at || new Date().toISOString(),
            updated_at: userData.data.updated_at || new Date().toISOString(),
            last_active_at: new Date().toISOString()
          }
          setProfile(userProfile)
        } else {
          throw new Error('Failed to load user data')
        }
      } else {
        throw new Error('Failed to authenticate user')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const loadConnections = async () => {
    try {
      // Fetch real connections from API
      const response = await fetch('/api/network/connections')
      if (response.ok) {
        const connectionsData = await response.json()
        if (connectionsData.success) {
          // Transform API data to match our interface
          const transformedConnections: UserConnection[] = connectionsData.data.map((conn: any) => ({
            id: conn.id,
            follower_id: conn.user_id,
            following_id: conn.partner_id,
            status: conn.status,
            created_at: conn.created_at,
            updated_at: conn.updated_at,
            follower: {
              id: conn.partner.id,
              user_id: conn.partner.id,
              display_name: conn.partner.name,
              username: conn.partner.name.toLowerCase().replace(/\s+/g, '_'),
              bio: 'Professional in the jewelry industry.',
              avatar_url: conn.partner.avatar_url || '/diverse-avatars.png',
              cover_image_url: '',
              industry: conn.partner.industry || 'Jewelry',
              follower_count: 0,
              following_count: 0,
            post_count: 0,
            like_count: 0,
            social_links: {},
            is_public: true,
            show_online_status: true,
            allow_messages: true,
            allow_follows: true,
            is_verified: true,
            badges: ['Professional'],
            created_at: conn.partner.created_at || new Date().toISOString(),
            updated_at: conn.partner.updated_at || new Date().toISOString(),
            last_active_at: conn.partner.lastSeen || new Date().toISOString()
          }
        }))
        setConnections(transformedConnections)
      } else {
        throw new Error('Failed to load connections')
      }
    } else {
      throw new Error('Failed to fetch connections')
    }
    } catch (error) {
      console.error('Error loading connections:', error)
      toast.error('Failed to load connections')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your social profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">You need to create a social profile first.</p>
            <Button onClick={() => router.push('/dashboard/profile-setup')}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Social Network</h1>
            <p className="text-gray-600">Connect with jewelry industry professionals</p>
          </div>
          <Button onClick={() => router.push('/dashboard/profile-setup')}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            {profile.cover_image_url && (
              <img 
                src={profile.cover_image_url} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
          
          <CardContent className="relative pt-0">
            <div className="flex items-end justify-between -mt-16 mb-4">
              <div className="flex items-end space-x-4">
                <Avatar className="h-24 w-24 border-4 border-white">
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                  <AvatarFallback className="text-2xl">
                    {profile.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.display_name}</h2>
                  <p className="text-gray-600">@{profile.username}</p>
                  {profile.is_verified && (
                    <Badge variant="secondary" className="mt-1">
                      ✓ Verified Professional
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-gray-700">{profile.bio}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  {profile.company && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {profile.company}
                    </div>
                  )}
                  {profile.job_title && (
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {profile.job_title}
                    </div>
                  )}
                </div>

                {profile.website_url && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-gray-600" />
                    <a 
                      href={profile.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.website_url}
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profile.follower_count}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profile.following_count}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profile.post_count}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{profile.like_count}</div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                </div>

                {profile.badges.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.badges.map((badge, index) => (
                        <Badge key={index} variant="outline">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="connections">Connections ({connections.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your professional details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Industry</label>
                    <p className="text-gray-900">{profile.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Profile Visibility</label>
                    <p className="text-gray-900 capitalize">{profile.is_public ? 'Public' : 'Private'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Online Status</label>
                    <p className="text-gray-900">{profile.show_online_status ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allow Messages</label>
                    <p className="text-gray-900">{profile.allow_messages ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Feed</CardTitle>
                <CardDescription>Connect with the jewelry community and share your expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <SocialFeed userId={profile.user_id} userProfile={profile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Connections</CardTitle>
                <CardDescription>People you're connected with in the jewelry industry</CardDescription>
              </CardHeader>
              <CardContent>
                {connections.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
                    <p className="text-gray-600 mb-4">Start connecting with other jewelry professionals</p>
                    <Button onClick={() => router.push('/dashboard/discover')}>
                      Discover People
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {connections.map((connection) => (
                      <div key={connection.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Avatar>
                          <AvatarImage src={connection.follower?.avatar_url} />
                          <AvatarFallback>
                            {connection.follower?.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{connection.follower?.display_name}</h4>
                          <p className="text-sm text-gray-600">@{connection.follower?.username}</p>
                          <p className="text-sm text-gray-500">{connection.follower?.industry}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button variant="outline" size="sm">
                            <User className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest social interactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                  <p className="text-gray-600">Start posting and engaging with the community</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 