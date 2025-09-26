"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  Award, 
  Shield, 
  Star, 
  Crown, 
  Zap, 
  Trophy,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from "lucide-react"

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'verification' | 'achievement' | 'expertise' | 'network'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  color: string
  earned_at?: string
}

interface VerificationStatus {
  overall_level: 'unverified' | 'basic' | 'verified' | 'premium' | 'elite'
  verification_score: number
  completed_requirements: string[]
  pending_requirements: string[]
  badges_earned: string[]
  next_level?: {
    name: string
    requirements: Array<{
      name: string
      description: string
      required: boolean
      verified?: boolean
    }>
  }
}

export function ProfileBadges({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBadgesAndStatus()
  }, [userId])

  const fetchBadgesAndStatus = async () => {
    try {
      // In production, these would be real API calls
      // For now, showing demo data
      const demoBadges: Badge[] = [
        {
          id: 'verified_business',
          name: 'Verified Business',
          description: 'Business license and registration verified',
          icon: '✅',
          category: 'verification',
          rarity: 'common',
          color: '#10B981',
          earned_at: '2024-01-15'
        },
        {
          id: 'master_craftsman',
          name: 'Master Craftsman',
          description: '10+ years experience with portfolio verification',
          icon: '👑',
          category: 'expertise',
          rarity: 'epic',
          color: '#8B5CF6',
          earned_at: '2024-03-20'
        },
        {
          id: 'top_rated',
          name: 'Top Rated',
          description: '4.8+ average rating with 25+ reviews',
          icon: '⭐',
          category: 'achievement',
          rarity: 'rare',
          color: '#EF4444',
          earned_at: '2024-02-10'
        }
      ]

      const demoStatus: VerificationStatus = {
        overall_level: 'verified',
        verification_score: 75,
        completed_requirements: ['email_verification', 'business_license', 'portfolio'],
        pending_requirements: ['insurance', 'references'],
        badges_earned: ['verified_business', 'master_craftsman', 'top_rated'],
        next_level: {
          name: 'Premium Partner',
          requirements: [
            {
              name: 'Professional Insurance',
              description: 'Upload professional liability insurance',
              required: true,
              verified: false
            },
            {
              name: 'Professional References',
              description: '3+ verified professional references',
              required: true,
              verified: false
            }
          ]
        }
      }

      setBadges(demoBadges)
      setVerificationStatus(demoStatus)
    } catch (error) {
      console.error('Error fetching badges and status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-indigo-500'
      default: return 'bg-gradient-to-r from-green-500 to-emerald-500'
    }
  }

  const getVerificationLevelIcon = (level: string) => {
    switch (level) {
      case 'elite': return <Crown className="h-5 w-5 text-yellow-600" />
      case 'premium': return <Shield className="h-5 w-5 text-purple-600" />
      case 'verified': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'basic': return <Star className="h-5 w-5 text-blue-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case 'elite': return 'from-yellow-100 to-orange-100 border-yellow-300'
      case 'premium': return 'from-purple-100 to-pink-100 border-purple-300'
      case 'verified': return 'from-green-100 to-emerald-100 border-green-300'
      case 'basic': return 'from-blue-100 to-indigo-100 border-blue-300'
      default: return 'from-gray-100 to-gray-200 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Professional Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      {verificationStatus && (
        <Card className={`border bg-gradient-to-r ${getVerificationLevelColor(verificationStatus.overall_level)}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getVerificationLevelIcon(verificationStatus.overall_level)}
              Verification Status
              <Badge variant="outline" className="ml-auto">
                {verificationStatus.overall_level.charAt(0).toUpperCase() + verificationStatus.overall_level.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Verification Score</span>
                  <span className="text-sm text-gray-600">{verificationStatus.verification_score}/100</span>
                </div>
                <Progress value={verificationStatus.verification_score} className="h-2" />
              </div>

              {verificationStatus.next_level && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Upgrade to {verificationStatus.next_level.name}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upgrade to {verificationStatus.next_level.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Complete these requirements to unlock the next verification level:
                      </p>
                      <div className="space-y-3">
                        {verificationStatus.next_level.requirements.map((req, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                            {req.verified ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                            )}
                            <div>
                              <h4 className="font-medium">{req.name}</h4>
                              <p className="text-sm text-gray-600">{req.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full">
                        Start Verification Process
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earned Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Professional Badges
            <Badge variant="secondary" className="ml-auto">
              {badges.length} earned
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No badges earned yet</p>
              <p className="text-sm text-gray-400">Complete verification steps to earn your first badge</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <Dialog key={badge.id}>
                  <DialogTrigger asChild>
                    <div className={`relative p-4 rounded-lg cursor-pointer transition-all hover:scale-105 ${getRarityColor(badge.rarity)}`}>
                      <div className="text-center">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <h3 className="font-semibold text-white text-sm">{badge.name}</h3>
                        <p className="text-xs text-white/80 mt-1">{badge.category}</p>
                      </div>
                      
                      {/* Rarity indicator */}
                      <div className="absolute top-2 right-2">
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-black/20 text-white border-none"
                        >
                          {badge.rarity}
                        </Badge>
                      </div>

                      {/* Earned date */}
                      {badge.earned_at && (
                        <div className="absolute bottom-2 left-2">
                          <span className="text-xs text-white/60">
                            {new Date(badge.earned_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <span className="text-2xl">{badge.icon}</span>
                        {badge.name}
                        <Badge 
                          variant="outline" 
                          className={`ml-auto ${getRarityColor(badge.rarity)} text-white border-none`}
                        >
                          {badge.rarity}
                        </Badge>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-gray-600">{badge.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Category:</span>
                          <span className="ml-2 capitalize">{badge.category}</span>
                        </div>
                        <div>
                          <span className="font-medium">Rarity:</span>
                          <span className="ml-2 capitalize">{badge.rarity}</span>
                        </div>
                        {badge.earned_at && (
                          <div className="col-span-2">
                            <span className="font-medium">Earned:</span>
                            <span className="ml-2">{new Date(badge.earned_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          Share Badge
                        </Button>
                        <Button variant="outline" className="flex-1">
                          View Criteria
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Badges to Earn */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Available Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Example available badges */}
            <div className="p-4 border rounded-lg border-dashed">
              <div className="text-center opacity-60">
                <div className="text-2xl mb-2">🛡️</div>
                <h3 className="font-semibold text-sm">Insured Professional</h3>
                <p className="text-xs text-gray-500 mt-1">Upload professional insurance</p>
                <Button size="sm" variant="outline" className="mt-3">
                  Complete Requirement
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg border-dashed">
              <div className="text-center opacity-60">
                <div className="text-2xl mb-2">🌐</div>
                <h3 className="font-semibold text-sm">Network Connector</h3>
                <p className="text-xs text-gray-500 mt-1">Connect with 50+ partners</p>
                <Button size="sm" variant="outline" className="mt-3">
                  View Progress
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
