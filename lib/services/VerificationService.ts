import { createSupabaseServerClient } from '@/lib/supabase/server'
import { 
  Badge, 
  VerificationLevel, 
  VerificationStatus, 
  UserBadge, 
  ProfessionalProfile,
  PortfolioItem,
  Testimonial
} from '@/types/verification'

export class VerificationService {
  private supabase: any = null

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  // =====================================================
  // BADGE SYSTEM
  // =====================================================

  async getAvailableBadges(): Promise<Badge[]> {
    // Return predefined badge system
    return [
      {
        id: 'verified_business',
        name: 'Verified Business',
        description: 'Business license and registration verified',
        icon: '✅',
        category: 'verification',
        rarity: 'common',
        criteria: {
          type: 'verification',
          requirements: { business_license: true }
        },
        color: '#10B981'
      },
      {
        id: 'insured_professional',
        name: 'Insured Professional',
        description: 'Professional liability insurance verified',
        icon: '🛡️',
        category: 'verification',
        rarity: 'common',
        criteria: {
          type: 'verification',
          requirements: { insurance: true }
        },
        color: '#3B82F6'
      },
      {
        id: 'master_craftsman',
        name: 'Master Craftsman',
        description: '10+ years experience with portfolio verification',
        icon: '👑',
        category: 'expertise',
        rarity: 'epic',
        criteria: {
          type: 'milestone',
          requirements: { years_experience: 10, portfolio_items: 20 }
        },
        color: '#8B5CF6'
      },
      {
        id: 'network_connector',
        name: 'Network Connector',
        description: '50+ verified business connections',
        icon: '🌐',
        category: 'network',
        rarity: 'rare',
        criteria: {
          type: 'metric',
          requirements: { connections: 50 }
        },
        color: '#F59E0B'
      },
      {
        id: 'top_rated',
        name: 'Top Rated',
        description: '4.8+ average rating with 25+ reviews',
        icon: '⭐',
        category: 'achievement',
        rarity: 'rare',
        criteria: {
          type: 'metric',
          requirements: { rating: 4.8, review_count: 25 }
        },
        color: '#EF4444'
      },
      {
        id: 'industry_leader',
        name: 'Industry Leader',
        description: 'Elite status with 100+ connections and verified expertise',
        icon: '🏆',
        category: 'achievement',
        rarity: 'legendary',
        criteria: {
          type: 'milestone',
          requirements: { connections: 100, years_experience: 15, rating: 4.9 }
        },
        color: '#DC2626'
      }
    ]
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: userBadges, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) {
        console.error('Error fetching user badges:', error)
        return []
      }

      return userBadges || []
    } catch (error) {
      console.error('Error in getUserBadges:', error)
      return []
    }
  }

  async awardBadge(userId: string, badgeId: string, metadata?: any): Promise<UserBadge | null> {
    try {
      const supabase = await this.getSupabase()
      
      // Check if user already has this badge
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .single()

      if (existing) {
        console.log('User already has this badge:', badgeId)
        return null
      }

      const { data: userBadge, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          earned_at: new Date().toISOString(),
          is_featured: false,
          metadata
        })
        .select()
        .single()

      if (error) {
        console.error('Error awarding badge:', error)
        return null
      }

      return userBadge
    } catch (error) {
      console.error('Error in awardBadge:', error)
      return null
    }
  }

  // =====================================================
  // VERIFICATION SYSTEM
  // =====================================================

  async getVerificationLevels(): Promise<any[]> {
    return [
      {
        id: 'basic',
        name: 'Basic Verification',
        description: 'Email and phone number verified',
        level: 1,
        requirements: [
          {
            type: 'document',
            name: 'Email Verification',
            description: 'Verify your email address',
            required: true
          },
          {
            type: 'document',
            name: 'Phone Verification',
            description: 'Verify your phone number',
            required: true
          }
        ],
        benefits: [
          'Profile visibility boost',
          'Basic networking features',
          'Access to public marketplace'
        ]
      },
      {
        id: 'verified',
        name: 'Verified Professional',
        description: 'Business credentials verified',
        level: 2,
        requirements: [
          {
            type: 'business_license',
            name: 'Business License',
            description: 'Upload valid business license or registration',
            required: true
          },
          {
            type: 'portfolio',
            name: 'Portfolio Submission',
            description: 'Submit 5+ portfolio items',
            required: true
          }
        ],
        benefits: [
          'Verified badge display',
          'Premium networking features',
          'Priority in search results',
          'Access to verified-only groups'
        ]
      },
      {
        id: 'premium',
        name: 'Premium Partner',
        description: 'Insurance and references verified',
        level: 3,
        requirements: [
          {
            type: 'insurance',
            name: 'Professional Insurance',
            description: 'Upload professional liability insurance',
            required: true
          },
          {
            type: 'references',
            name: 'Professional References',
            description: '3+ verified professional references',
            required: true
          }
        ],
        benefits: [
          'Premium badge display',
          'Advanced collaboration tools',
          'Enhanced marketplace features',
          'Direct client matching'
        ]
      },
      {
        id: 'elite',
        name: 'Elite Partner',
        description: 'Industry recognition and excellence',
        level: 4,
        requirements: [
          {
            type: 'social_proof',
            name: 'Industry Recognition',
            description: 'Awards, certifications, or media mentions',
            required: true
          },
          {
            type: 'portfolio',
            name: 'Master Portfolio',
            description: '20+ high-quality portfolio items',
            required: true
          }
        ],
        benefits: [
          'Elite status badge',
          'Exclusive networking events',
          'Priority customer support',
          'Advanced analytics and insights'
        ]
      }
    ]
  }

  async getUserVerificationStatus(userId: string): Promise<VerificationStatus> {
    try {
      const supabase = await this.getSupabase()
      
      // Get user's verification data
      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      const { data: badges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId)

      // Calculate verification score and level
      const verificationScore = this.calculateVerificationScore(profile, badges)
      const overallLevel = this.determineVerificationLevel(verificationScore)
      
      return {
        user_id: userId,
        overall_level: overallLevel,
        verification_score: verificationScore,
        completed_requirements: profile?.completed_requirements || [],
        pending_requirements: profile?.pending_requirements || [],
        badges_earned: badges?.map((b: any) => b.badge_id) || [],
        verification_date: profile?.verification_date,
        next_level: await this.getNextVerificationLevel(overallLevel)
      }
    } catch (error) {
      console.error('Error getting verification status:', error)
      return {
        user_id: userId,
        overall_level: 'unverified',
        verification_score: 0,
        completed_requirements: [],
        pending_requirements: [],
        badges_earned: []
      }
    }
  }

  private calculateVerificationScore(profile: any, badges: any[]): number {
    let score = 0
    
    if (profile?.email_verified) score += 10
    if (profile?.phone_verified) score += 10
    if (profile?.business_license_verified) score += 20
    if (profile?.insurance_verified) score += 20
    if (profile?.portfolio_items >= 5) score += 15
    if (profile?.portfolio_items >= 20) score += 10
    if (profile?.references_count >= 3) score += 15
    
    // Badge bonuses
    const badgeBonus = Math.min(badges?.length * 2 || 0, 20)
    score += badgeBonus
    
    return Math.min(score, 100)
  }

  private determineVerificationLevel(score: number): 'unverified' | 'basic' | 'verified' | 'premium' | 'elite' {
    if (score >= 80) return 'elite'
    if (score >= 60) return 'premium'
    if (score >= 40) return 'verified'
    if (score >= 20) return 'basic'
    return 'unverified'
  }

  private async getNextVerificationLevel(currentLevel: string): Promise<VerificationLevel | undefined> {
    const levels = await this.getVerificationLevels()
    const currentIndex = levels.findIndex(l => l.id === currentLevel)
    return currentIndex >= 0 && currentIndex < levels.length - 1 ? levels[currentIndex + 1] : undefined
  }

  // =====================================================
  // PORTFOLIO MANAGEMENT
  // =====================================================

  async getUserPortfolio(userId: string): Promise<PortfolioItem[]> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: portfolioItems, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('user_id', userId)
        .order('completion_date', { ascending: false })

      if (error) {
        console.error('Error fetching portfolio:', error)
        return []
      }

      return portfolioItems || []
    } catch (error) {
      console.error('Error in getUserPortfolio:', error)
      return []
    }
  }

  async addPortfolioItem(userId: string, item: Omit<PortfolioItem, 'id' | 'user_id'>): Promise<PortfolioItem | null> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: portfolioItem, error } = await supabase
        .from('portfolio_items')
        .insert({
          ...item,
          user_id: userId
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding portfolio item:', error)
        return null
      }

      // Check for badge eligibility
      await this.checkBadgeEligibility(userId)

      return portfolioItem
    } catch (error) {
      console.error('Error in addPortfolioItem:', error)
      return null
    }
  }

  // =====================================================
  // BADGE ELIGIBILITY CHECKING
  // =====================================================

  async checkBadgeEligibility(userId: string): Promise<void> {
    try {
      const verificationStatus = await this.getUserVerificationStatus(userId)
      const availableBadges = await this.getAvailableBadges()
      
      for (const badge of availableBadges) {
        if (!verificationStatus.badges_earned.includes(badge.id)) {
          const isEligible = await this.checkBadgeCriteria(userId, badge)
          if (isEligible) {
            await this.awardBadge(userId, badge.id)
            console.log(`🏆 Awarded badge ${badge.name} to user ${userId}`)
          }
        }
      }
    } catch (error) {
      console.error('Error checking badge eligibility:', error)
    }
  }

  private async checkBadgeCriteria(userId: string, badge: Badge): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      // Get user data for criteria checking
      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      const { data: connections } = await supabase
        .from('partner_relationships')
        .select('id')
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
        .eq('status', 'accepted')

      const { data: portfolio } = await supabase
        .from('portfolio_items')
        .select('id')
        .eq('user_id', userId)

      const requirements = badge.criteria.requirements
      
      switch (badge.id) {
        case 'verified_business':
          return profile?.business_license_verified === true
          
        case 'insured_professional':
          return profile?.insurance_verified === true
          
        case 'master_craftsman':
          return (profile?.years_experience || 0) >= 10 && (portfolio?.length || 0) >= 20
          
        case 'network_connector':
          return (connections?.length || 0) >= 50
          
        case 'top_rated':
          return (profile?.rating || 0) >= 4.8 && (profile?.review_count || 0) >= 25
          
        case 'industry_leader':
          return (connections?.length || 0) >= 100 && 
                 (profile?.years_experience || 0) >= 15 && 
                 (profile?.rating || 0) >= 4.9
          
        default:
          return false
      }
    } catch (error) {
      console.error('Error checking badge criteria:', error)
      return false
    }
  }
}
