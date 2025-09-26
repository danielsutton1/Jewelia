// =====================================================
// PHASE 4: SOCIAL MONETIZATION & CREATOR TOOLS TYPES
// =====================================================

import { ContentPerformanceMetrics } from './social-analytics'

export interface CreatorProfile {
  user_id: string;
  username: string;
  avatar_url?: string;
  
  // Creator stats
  followers_count: number;
  total_revenue: number;
  monthly_revenue: number;
  creator_level: CreatorLevel;
  
  // Content metrics
  total_posts: number;
  average_engagement_rate: number;
  viral_posts_count: number;
  
  // Monetization status
  is_monetized: boolean;
  monetization_date?: string;
  revenue_share_percentage: number;
  
  // Creator tools
  available_tools: CreatorTool[];
  active_subscriptions: CreatorSubscription[];
  payment_methods: PaymentMethod[];
}

export type CreatorLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface CreatorTool {
  id: string;
  name: string;
  description: string;
  category: CreatorToolCategory;
  is_premium: boolean;
  price?: number;
  subscription_required: boolean;
  
  // Tool features
  features: string[];
  usage_limits?: {
    daily?: number;
    monthly?: number;
    total?: number;
  };
  
  // Analytics
  usage_count: number;
  user_rating: number;
  reviews_count: number;
}

export type CreatorToolCategory = 
  | 'content_creation'
  | 'analytics'
  | 'monetization'
  | 'community_management'
  | 'marketing'
  | 'collaboration';

export interface CreatorSubscription {
  id: string;
  plan_name: string;
  plan_type: SubscriptionPlanType;
  price: number;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  
  // Plan details
  features: string[];
  limits: SubscriptionLimits;
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  
  // Payment info
  payment_method_id: string;
  next_billing_date: string;
  total_paid: number;
}

export type SubscriptionPlanType = 'basic' | 'pro' | 'premium' | 'enterprise';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export interface SubscriptionLimits {
  posts_per_month?: number;
  communities_created?: number;
  events_per_month?: number;
  analytics_export_limit?: number;
  api_calls_per_day?: number;
  storage_gb?: number;
}

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  last_four_digits?: string;
  expiry_date?: string;
  is_default: boolean;
  
  // Payment details
  billing_address?: BillingAddress;
  payment_processor: PaymentProcessor;
  is_verified: boolean;
}

export type PaymentType = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto';
export type PaymentProcessor = 'stripe' | 'paypal' | 'square' | 'coinbase';

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface RevenueStream {
  id: string;
  creator_id: string;
  stream_type: RevenueStreamType;
  name: string;
  description: string;
  
  // Revenue metrics
  total_revenue: number;
  monthly_revenue: number;
  revenue_growth_rate: number;
  
  // Performance metrics
  conversion_rate: number;
  average_order_value: number;
  customer_lifetime_value: number;
  
  // Status
  is_active: boolean;
  created_at: string;
  last_updated: string;
}

export type RevenueStreamType = 
  | 'content_subscription'
  | 'community_membership'
  | 'event_tickets'
  | 'digital_products'
  | 'sponsored_content'
  | 'affiliate_marketing'
  | 'consulting_services'
  | 'merchandise';

export interface ContentSubscription {
  id: string;
  creator_id: string;
  subscriber_id: string;
  subscription_tier: SubscriptionTier;
  
  // Subscription details
  price: number;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  start_date: string;
  end_date?: string;
  
  // Content access
  access_level: AccessLevel;
  exclusive_content_ids: string[];
  early_access: boolean;
  
  // Benefits
  benefits: string[];
  custom_badges: boolean;
  priority_support: boolean;
}

export type SubscriptionTier = 'basic' | 'premium' | 'vip' | 'founder';
export type AccessLevel = 'basic' | 'premium' | 'exclusive' | 'vip';

export interface CommunityMembership {
  id: string;
  community_id: string;
  user_id: string;
  membership_tier: MembershipTier;
  
  // Membership details
  price: number;
  billing_cycle: BillingCycle;
  status: MembershipStatus;
  join_date: string;
  expiry_date?: string;
  
  // Benefits
  benefits: string[];
  role_permissions: RolePermission[];
  exclusive_access: boolean;
  
  // Analytics
  engagement_score: number;
  contribution_count: number;
  referral_count: number;
}

export type MembershipTier = 'free' | 'basic' | 'premium' | 'vip' | 'founder';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'suspended';

export interface RolePermission {
  permission: string;
  is_granted: boolean;
  granted_at?: string;
  granted_by?: string;
}

export interface EventTicket {
  id: string;
  event_id: string;
  user_id: string;
  ticket_type: TicketType;
  
  // Ticket details
  price: number;
  currency: string;
  quantity: number;
  total_amount: number;
  
  // Event access
  access_level: EventAccessLevel;
  special_perks: string[];
  vip_experience: boolean;
  
  // Purchase info
  purchase_date: string;
  payment_status: PaymentStatus;
  refund_policy: RefundPolicy;
}

export type TicketType = 'general' | 'vip' | 'early_bird' | 'group' | 'student' | 'sponsor';
export type EventAccessLevel = 'standard' | 'premium' | 'vip' | 'all_access';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type RefundPolicy = 'no_refund' | 'partial_refund' | 'full_refund' | 'conditional';

export interface DigitalProduct {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  product_type: DigitalProductType;
  
  // Product details
  price: number;
  currency: string;
  is_subscription: boolean;
  subscription_cycle?: BillingCycle;
  
  // Content
  content_urls: string[];
  file_size_mb: number;
  download_limit?: number;
  
  // Sales metrics
  total_sales: number;
  revenue_generated: number;
  average_rating: number;
  reviews_count: number;
  
  // Status
  is_active: boolean;
  created_at: string;
  last_updated: string;
}

export type DigitalProductType = 
  | 'ebook'
  | 'course'
  | 'template'
  | 'software'
  | 'audio'
  | 'video'
  | 'workshop'
  | 'consultation';

export interface SponsoredContent {
  id: string;
  creator_id: string;
  sponsor_id: string;
  content_id: string;
  
  // Campaign details
  campaign_name: string;
  campaign_type: CampaignType;
  budget: number;
  duration_days: number;
  
  // Performance metrics
  impressions: number;
  clicks: number;
  engagement_rate: number;
  conversion_rate: number;
  roi: number;
  
  // Payment
  payment_amount: number;
  payment_status: PaymentStatus;
  payment_date?: string;
  
  // Compliance
  is_disclosed: boolean;
  disclosure_text: string;
  compliance_status: ComplianceStatus;
}

export type CampaignType = 'brand_awareness' | 'lead_generation' | 'sales' | 'engagement' | 'influencer';
export type ComplianceStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export interface AffiliateProgram {
  id: string;
  creator_id: string;
  program_name: string;
  program_type: AffiliateProgramType;
  
  // Commission structure
  commission_rate: number;
  commission_type: CommissionType;
  minimum_payout: number;
  
  // Performance metrics
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
  conversion_rate: number;
  
  // Tracking
  affiliate_link: string;
  tracking_code: string;
  is_active: boolean;
}

export type AffiliateProgramType = 'product' | 'service' | 'course' | 'membership' | 'event';
export type CommissionType = 'percentage' | 'fixed' | 'tiered';

export interface Payout {
  id: string;
  creator_id: string;
  amount: number;
  currency: string;
  payout_method: PayoutMethod;
  
  // Payout details
  status: PayoutStatus;
  requested_date: string;
  processed_date?: string;
  reference_number: string;
  
  // Fees
  processing_fee: number;
  net_amount: number;
  
  // Tax info
  tax_deducted: number;
  tax_document_url?: string;
}

export type PayoutMethod = 'bank_transfer' | 'paypal' | 'stripe' | 'crypto' | 'check';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface CreatorAnalytics {
  creator_id: string;
  time_period: string;
  
  // Revenue metrics
  total_revenue: number;
  revenue_growth: number;
  average_monthly_revenue: number;
  
  // Audience metrics
  followers_growth: number;
  engagement_rate: number;
  content_performance: ContentPerformanceMetrics[];
  
  // Monetization metrics
  active_revenue_streams: number;
  conversion_rates: { [key: string]: number };
  customer_acquisition_cost: number;
  
  // Top performing content
  top_revenue_generators: RevenueStream[];
  viral_content: ContentPerformanceMetrics[];
  
  // Recommendations
  growth_opportunities: string[];
  optimization_suggestions: string[];
  monetization_strategies: string[];
} 