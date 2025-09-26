export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'verification' | 'achievement' | 'expertise' | 'network'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  criteria: BadgeCriteria
  color: string
  earned_at?: string
}

export interface BadgeCriteria {
  type: 'metric' | 'verification' | 'milestone' | 'activity'
  requirements: {
    [key: string]: any
  }
}


export interface VerificationRequirement {
  type: 'document' | 'business_license' | 'insurance' | 'portfolio' | 'references' | 'social_proof'
  name: string
  description: string
  required: boolean
  verified?: boolean
  submitted_at?: string
  verified_at?: string
  documents?: VerificationDocument[]
}

export interface VerificationDocument {
  id: string
  type: string
  filename: string
  file_path: string
  uploaded_at: string
  status: 'pending' | 'approved' | 'rejected'
  reviewer_notes?: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  is_featured: boolean
  metadata?: any
  badge?: Badge
}

export interface VerificationStatus {
  user_id: string
  overall_level: 'unverified' | 'basic' | 'verified' | 'premium' | 'elite'
  verification_score: number // 0-100
  completed_requirements: string[]
  pending_requirements: string[]
  badges_earned: string[]
  verification_date?: string
  next_level?: VerificationLevel
}

export interface ProfessionalProfile {
  user_id: string
  business_name?: string
  license_number?: string
  insurance_provider?: string
  years_experience: number
  certifications: string[]
  portfolio_items: PortfolioItem[]
  testimonials: Testimonial[]
  verification_status: VerificationStatus
  badges: UserBadge[]
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  images: string[]
  category: string
  tags: string[]
  completion_date: string
  client_name?: string
  value_range?: string
  featured: boolean
}

export interface Testimonial {
  id: string
  client_name: string
  client_company?: string
  rating: number
  comment: string
  project_type: string
  verified: boolean
  created_at: string
}

export type BadgeCategory = 'verification' | 'achievement' | 'expertise' | 'network'
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type VerificationLevel = 'unverified' | 'basic' | 'verified' | 'premium' | 'elite'
