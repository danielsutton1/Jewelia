-- =====================================================
-- PHASE 4: ADVANCED SOCIAL FEATURES SETUP
-- Analytics, Monetization, PWA, CRM Integration
-- =====================================================

-- 1. SOCIAL ANALYTICS & INSIGHTS SYSTEM
-- =====================================================

-- Social engagement metrics tracking
CREATE TABLE IF NOT EXISTS social_engagement_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    
    -- Post engagement
    posts_created INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    comments_received INTEGER DEFAULT 0,
    shares_received INTEGER DEFAULT 0,
    views_received INTEGER DEFAULT 0,
    
    -- Engagement rates
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    like_rate DECIMAL(5,2) DEFAULT 0,
    comment_rate DECIMAL(5,2) DEFAULT 0,
    share_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Audience metrics
    followers_count INTEGER DEFAULT 0,
    new_followers INTEGER DEFAULT 0,
    unfollowers INTEGER DEFAULT 0,
    
    -- Content performance
    viral_posts_count INTEGER DEFAULT 0,
    trending_topics TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- Content performance tracking
CREATE TABLE IF NOT EXISTS social_content_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    
    -- Performance metrics
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    reach_multiplier DECIMAL(5,2) DEFAULT 1,
    is_viral BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    
    -- Time-based metrics
    time_to_viral_hours INTEGER,
    peak_engagement_time TIME,
    
    -- Audience insights
    audience_demographics JSONB,
    engagement_by_hour JSONB,
    top_engagers JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community analytics
CREATE TABLE IF NOT EXISTS social_community_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES social_communities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Growth metrics
    member_count INTEGER DEFAULT 0,
    new_members INTEGER DEFAULT 0,
    member_growth_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Engagement metrics
    active_members INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    average_engagement_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Content metrics
    total_posts INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    content_quality_score DECIMAL(3,2) DEFAULT 0,
    
    -- Retention metrics
    member_retention_rate DECIMAL(5,2) DEFAULT 0,
    churn_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Activity patterns
    peak_activity_hours INTEGER[],
    most_active_days TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(community_id, date)
);

-- Event analytics
CREATE TABLE IF NOT EXISTS social_event_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES social_events(id) ON DELETE CASCADE,
    
    -- Attendance metrics
    total_registrations INTEGER DEFAULT 0,
    actual_attendees INTEGER DEFAULT 0,
    attendance_rate DECIMAL(5,2) DEFAULT 0,
    no_show_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Engagement metrics
    pre_event_engagement INTEGER DEFAULT 0,
    during_event_engagement INTEGER DEFAULT 0,
    post_event_engagement INTEGER DEFAULT 0,
    
    -- Satisfaction metrics
    average_rating DECIMAL(3,2) DEFAULT 0,
    feedback_count INTEGER DEFAULT 0,
    recommendation_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Financial metrics
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    cost_per_attendee DECIMAL(8,2) DEFAULT 0,
    roi DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trending topics tracking
CREATE TABLE IF NOT EXISTS social_trending_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic TEXT NOT NULL,
    date DATE NOT NULL,
    
    -- Topic metrics
    mentions INTEGER DEFAULT 0,
    growth_rate DECIMAL(5,2) DEFAULT 0,
    related_posts INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(topic, date)
);

-- 2. MONETIZATION & CREATOR TOOLS SYSTEM
-- =====================================================

-- Creator profiles
CREATE TABLE IF NOT EXISTS social_creator_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    
    -- Creator stats
    followers_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    monthly_revenue DECIMAL(10,2) DEFAULT 0,
    creator_level TEXT DEFAULT 'bronze' CHECK (creator_level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    
    -- Content metrics
    total_posts INTEGER DEFAULT 0,
    average_engagement_rate DECIMAL(5,2) DEFAULT 0,
    viral_posts_count INTEGER DEFAULT 0,
    
    -- Monetization status
    is_monetized BOOLEAN DEFAULT false,
    monetization_date TIMESTAMP WITH TIME ZONE,
    revenue_share_percentage DECIMAL(5,2) DEFAULT 70,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator tools
CREATE TABLE IF NOT EXISTS social_creator_tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('content_creation', 'analytics', 'monetization', 'community_management', 'marketing', 'collaboration')),
    
    -- Tool features
    is_premium BOOLEAN DEFAULT false,
    price DECIMAL(8,2),
    subscription_required BOOLEAN DEFAULT false,
    features TEXT[],
    
    -- Usage limits
    daily_limit INTEGER,
    monthly_limit INTEGER,
    total_limit INTEGER,
    
    -- Analytics
    usage_count INTEGER DEFAULT 0,
    user_rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator subscriptions
CREATE TABLE IF NOT EXISTS social_creator_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES social_creator_profiles(user_id) ON DELETE CASCADE,
    
    -- Plan details
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro', 'premium', 'enterprise')),
    price DECIMAL(8,2) NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    
    -- Features and limits
    features TEXT[],
    limits JSONB,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    
    -- Payment info
    payment_method_id TEXT,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    total_paid DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue streams
CREATE TABLE IF NOT EXISTS social_revenue_streams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES social_creator_profiles(user_id) ON DELETE CASCADE,
    
    -- Stream details
    stream_type TEXT NOT NULL CHECK (stream_type IN ('content_subscription', 'community_membership', 'event_tickets', 'digital_products', 'sponsored_content', 'affiliate_marketing', 'consulting_services', 'merchandise')),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Revenue metrics
    total_revenue DECIMAL(12,2) DEFAULT 0,
    monthly_revenue DECIMAL(10,2) DEFAULT 0,
    revenue_growth_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Performance metrics
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    average_order_value DECIMAL(8,2) DEFAULT 0,
    customer_lifetime_value DECIMAL(8,2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content subscriptions
CREATE TABLE IF NOT EXISTS social_content_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES social_creator_profiles(user_id) ON DELETE CASCADE,
    subscriber_id TEXT NOT NULL,
    
    -- Subscription details
    subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('basic', 'premium', 'vip', 'founder')),
    price DECIMAL(8,2) NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    
    -- Access and benefits
    access_level TEXT DEFAULT 'basic' CHECK (access_level IN ('basic', 'premium', 'exclusive', 'vip')),
    exclusive_content_ids UUID[],
    early_access BOOLEAN DEFAULT false,
    benefits TEXT[],
    custom_badges BOOLEAN DEFAULT false,
    priority_support BOOLEAN DEFAULT false,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(creator_id, subscriber_id)
);

-- Community memberships (paid)
CREATE TABLE IF NOT EXISTS social_community_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES social_communities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    
    -- Membership details
    membership_tier TEXT NOT NULL CHECK (membership_tier IN ('free', 'basic', 'premium', 'vip', 'founder')),
    price DECIMAL(8,2) DEFAULT 0,
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    
    -- Benefits
    benefits TEXT[],
    role_permissions JSONB,
    exclusive_access BOOLEAN DEFAULT false,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    
    -- Analytics
    engagement_score DECIMAL(3,2) DEFAULT 0,
    contribution_count INTEGER DEFAULT 0,
    referral_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(community_id, user_id)
);

-- Event tickets
CREATE TABLE IF NOT EXISTS social_event_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES social_events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    
    -- Ticket details
    ticket_type TEXT NOT NULL CHECK (ticket_type IN ('general', 'vip', 'early_bird', 'group', 'student', 'sponsor')),
    price DECIMAL(8,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Event access
    access_level TEXT DEFAULT 'standard' CHECK (access_level IN ('standard', 'premium', 'vip', 'all_access')),
    special_perks TEXT[],
    vip_experience BOOLEAN DEFAULT false,
    
    -- Purchase info
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    refund_policy TEXT DEFAULT 'no_refund' CHECK (refund_policy IN ('no_refund', 'partial_refund', 'full_refund', 'conditional')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital products
CREATE TABLE IF NOT EXISTS social_digital_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES social_creator_profiles(user_id) ON DELETE CASCADE,
    
    -- Product details
    name TEXT NOT NULL,
    description TEXT,
    product_type TEXT NOT NULL CHECK (product_type IN ('ebook', 'course', 'template', 'software', 'audio', 'video', 'workshop', 'consultation')),
    
    -- Pricing
    price DECIMAL(8,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    is_subscription BOOLEAN DEFAULT false,
    subscription_cycle TEXT CHECK (subscription_cycle IN ('monthly', 'quarterly', 'yearly')),
    
    -- Content
    content_urls TEXT[],
    file_size_mb INTEGER,
    download_limit INTEGER,
    
    -- Sales metrics
    total_sales INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsored content
CREATE TABLE IF NOT EXISTS social_sponsored_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES social_creator_profiles(user_id) ON DELETE CASCADE,
    sponsor_id TEXT NOT NULL,
    content_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    
    -- Campaign details
    campaign_name TEXT NOT NULL,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('brand_awareness', 'lead_generation', 'sales', 'engagement', 'influencer')),
    budget DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    
    -- Performance metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    roi DECIMAL(5,2) DEFAULT 0,
    
    -- Payment
    payment_amount DECIMAL(8,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Compliance
    is_disclosed BOOLEAN DEFAULT false,
    disclosure_text TEXT,
    compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'rejected', 'under_review')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate programs
CREATE TABLE IF NOT EXISTS social_affiliate_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES social_creator_profiles(user_id) ON DELETE CASCADE,
    
    -- Program details
    program_name TEXT NOT NULL,
    program_type TEXT NOT NULL CHECK (program_type IN ('product', 'service', 'course', 'membership', 'event')),
    
    -- Commission structure
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_type TEXT NOT NULL CHECK (commission_type IN ('percentage', 'fixed', 'tiered')),
    minimum_payout DECIMAL(8,2) DEFAULT 0,
    
    -- Performance metrics
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Tracking
    affiliate_link TEXT NOT NULL,
    tracking_code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts
CREATE TABLE IF NOT EXISTS social_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES social_creator_profiles(user_id) ON DELETE CASCADE,
    
    -- Payout details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payout_method TEXT NOT NULL CHECK (payout_method IN ('bank_transfer', 'paypal', 'stripe', 'crypto', 'check')),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_date TIMESTAMP WITH TIME ZONE,
    reference_number TEXT,
    
    -- Fees and taxes
    processing_fee DECIMAL(8,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    tax_deducted DECIMAL(8,2) DEFAULT 0,
    tax_document_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PWA & MOBILE APP FEATURES
-- =====================================================

-- PWA configurations
CREATE TABLE IF NOT EXISTS social_pwa_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    
    -- App configuration
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    description TEXT,
    theme_color TEXT DEFAULT '#000000',
    background_color TEXT DEFAULT '#ffffff',
    display_mode TEXT DEFAULT 'standalone' CHECK (display_mode IN ('standalone', 'fullscreen', 'minimal-ui', 'browser')),
    orientation TEXT DEFAULT 'portrait' CHECK (orientation IN ('portrait', 'landscape', 'any')),
    
    -- Features
    offline_enabled BOOLEAN DEFAULT true,
    cache_strategy TEXT DEFAULT 'cache_first' CHECK (cache_strategy IN ('cache_first', 'network_first', 'stale_while_revalidate', 'network_only')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS social_push_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    
    -- Subscription details
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_token TEXT NOT NULL,
    
    -- Preferences
    categories TEXT[] DEFAULT ARRAY['social_updates', 'community_notifications', 'event_reminders'],
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, endpoint)
);

-- Push notification history
CREATE TABLE IF NOT EXISTS social_push_notification_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    
    -- Notification details
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    icon TEXT,
    badge TEXT,
    image TEXT,
    
    -- Data and actions
    data JSONB,
    actions JSONB,
    
    -- Display options
    require_interaction BOOLEAN DEFAULT false,
    silent BOOLEAN DEFAULT false,
    tag TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'clicked', 'dismissed', 'expired')),
    delivered_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Offline data storage
CREATE TABLE IF NOT EXISTS social_offline_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    
    -- Data details
    data_type TEXT NOT NULL CHECK (data_type IN ('user_profile', 'posts', 'communities', 'events', 'messages', 'analytics', 'settings')),
    data_key TEXT NOT NULL,
    data_value JSONB NOT NULL,
    
    -- Sync info
    is_synced BOOLEAN DEFAULT false,
    sync_priority TEXT DEFAULT 'normal' CHECK (sync_priority IN ('low', 'normal', 'high', 'critical')),
    
    -- Storage
    size_bytes INTEGER DEFAULT 0,
    compression_ratio DECIMAL(3,2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, data_type, data_key)
);

-- Background sync jobs
CREATE TABLE IF NOT EXISTS social_background_sync (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    
    -- Sync details
    sync_type TEXT NOT NULL CHECK (sync_type IN ('post_creation', 'message_sending', 'data_sync', 'analytics_upload', 'file_upload')),
    data JSONB NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt TIMESTAMP WITH TIME ZONE,
    next_attempt TIMESTAMP WITH TIME ZONE,
    
    -- Error handling
    last_error TEXT,
    error_count INTEGER DEFAULT 0
);

-- Device capabilities
CREATE TABLE IF NOT EXISTS social_device_capabilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    
    -- Hardware capabilities
    camera BOOLEAN DEFAULT false,
    microphone BOOLEAN DEFAULT false,
    gps BOOLEAN DEFAULT false,
    accelerometer BOOLEAN DEFAULT false,
    gyroscope BOOLEAN DEFAULT false,
    fingerprint BOOLEAN DEFAULT false,
    face_id BOOLEAN DEFAULT false,
    
    -- Storage capabilities
    local_storage BOOLEAN DEFAULT false,
    indexed_db BOOLEAN DEFAULT false,
    cache_storage BOOLEAN DEFAULT false,
    service_worker BOOLEAN DEFAULT false,
    
    -- Network capabilities
    offline_support BOOLEAN DEFAULT false,
    background_sync BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT false,
    
    -- Performance
    device_memory_gb INTEGER,
    hardware_concurrency INTEGER,
    max_touch_points INTEGER,
    
    -- Platform info
    platform TEXT,
    user_agent TEXT,
    screen_resolution TEXT,
    viewport_size TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 4. CRM INTEGRATION SYSTEM
-- =====================================================

-- CRM integrations
CREATE TABLE IF NOT EXISTS social_crm_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    
    -- Integration details
    integration_type TEXT NOT NULL CHECK (integration_type IN ('hubspot', 'salesforce', 'pipedrive', 'zoho', 'freshworks', 'custom_api')),
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'syncing', 'disconnected')),
    
    -- Connection details
    api_endpoint TEXT,
    api_key TEXT,
    access_token TEXT,
    refresh_token TEXT,
    
    -- Configuration
    auth_method TEXT DEFAULT 'oauth2' CHECK (auth_method IN ('oauth2', 'api_key', 'basic_auth', 'custom')),
    sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('bidirectional', 'crm_to_social', 'social_to_crm')),
    conflict_resolution TEXT DEFAULT 'most_recent' CHECK (conflict_resolution IN ('crm_wins', 'social_wins', 'most_recent', 'manual')),
    
    -- Sync settings
    sync_enabled BOOLEAN DEFAULT false,
    sync_frequency TEXT DEFAULT 'daily' CHECK (sync_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
    batch_size INTEGER DEFAULT 100,
    
    -- Performance
    sync_success_rate DECIMAL(5,2) DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    last_sync TIMESTAMP WITH TIME ZONE,
    next_sync TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM data mappings
CREATE TABLE IF NOT EXISTS social_crm_data_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id UUID NOT NULL REFERENCES social_crm_integrations(id) ON DELETE CASCADE,
    
    -- Mapping details
    entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'lead', 'deal', 'company', 'opportunity', 'task')),
    
    -- Field mappings
    field_mappings JSONB NOT NULL,
    sync_rules JSONB,
    validation_rules JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM sync jobs
CREATE TABLE IF NOT EXISTS social_crm_sync_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id UUID NOT NULL REFERENCES social_crm_integrations(id) ON DELETE CASCADE,
    
    -- Job details
    job_type TEXT NOT NULL CHECK (job_type IN ('full_sync', 'incremental_sync', 'manual_sync', 'error_recovery')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused')),
    
    -- Progress
    progress INTEGER DEFAULT 0,
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    
    -- Data
    source_entity TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    sync_data JSONB,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Results
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    warnings TEXT[],
    errors TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM webhooks
CREATE TABLE IF NOT EXISTS social_crm_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id UUID NOT NULL REFERENCES social_crm_integrations(id) ON DELETE CASCADE,
    
    -- Webhook details
    webhook_type TEXT NOT NULL CHECK (webhook_type IN ('incoming', 'outgoing')),
    url TEXT NOT NULL,
    method TEXT DEFAULT 'POST' CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE')),
    headers JSONB,
    
    -- Triggers
    trigger_events TEXT[],
    trigger_conditions JSONB,
    
    -- Security
    secret_key TEXT,
    is_verified BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM data quality
CREATE TABLE IF NOT EXISTS social_crm_data_quality (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id UUID NOT NULL REFERENCES social_crm_integrations(id) ON DELETE CASCADE,
    
    -- Quality metrics
    entity_type TEXT NOT NULL,
    total_records INTEGER DEFAULT 0,
    complete_records INTEGER DEFAULT 0,
    incomplete_records INTEGER DEFAULT 0,
    completeness_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Accuracy and consistency
    validated_records INTEGER DEFAULT 0,
    invalid_records INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0,
    consistent_records INTEGER DEFAULT 0,
    inconsistent_records INTEGER DEFAULT 0,
    consistency_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Freshness
    up_to_date_records INTEGER DEFAULT 0,
    outdated_records INTEGER DEFAULT 0,
    freshness_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Issues and recommendations
    data_issues JSONB,
    recommendations TEXT[],
    
    -- Timestamp
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM workflows
CREATE TABLE IF NOT EXISTS social_crm_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id UUID NOT NULL REFERENCES social_crm_integrations(id) ON DELETE CASCADE,
    
    -- Workflow details
    name TEXT NOT NULL,
    description TEXT,
    
    -- Configuration
    trigger JSONB NOT NULL,
    conditions JSONB,
    actions JSONB NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT false,
    
    -- Execution
    execution_count INTEGER DEFAULT 0,
    last_executed TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_user_date ON social_engagement_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_content_performance_post_id ON social_content_performance(post_id);
CREATE INDEX IF NOT EXISTS idx_community_analytics_community_date ON social_community_analytics(community_id, date);
CREATE INDEX IF NOT EXISTS idx_event_analytics_event_id ON social_event_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_trending_topics_topic_date ON social_trending_topics(topic, date);

-- Monetization indexes
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON social_creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_tools_category ON social_creator_tools(category);
CREATE INDEX IF NOT EXISTS idx_creator_subscriptions_creator_id ON social_creator_subscriptions(creator_id);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_creator_id ON social_revenue_streams(creator_id);
CREATE INDEX IF NOT EXISTS idx_content_subscriptions_creator_subscriber ON social_content_subscriptions(creator_id, subscriber_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_community_user ON social_community_memberships(community_id, user_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_event_user ON social_event_tickets(event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_digital_products_creator_id ON social_digital_products(creator_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_content_creator_id ON social_sponsored_content(creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_creator_id ON social_affiliate_programs(creator_id);
CREATE INDEX IF NOT EXISTS idx_payouts_creator_id ON social_payouts(creator_id);

-- PWA indexes
CREATE INDEX IF NOT EXISTS idx_pwa_configs_user_id ON social_pwa_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_user_id ON social_push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notification_history_user_id ON social_push_notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_data_user_type_key ON social_offline_data(user_id, data_type, data_key);
CREATE INDEX IF NOT EXISTS idx_background_sync_user_id ON social_background_sync(user_id);
CREATE INDEX IF NOT EXISTS idx_device_capabilities_user_id ON social_device_capabilities(user_id);

-- CRM integration indexes
CREATE INDEX IF NOT EXISTS idx_crm_integrations_user_id ON social_crm_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_integrations_type ON social_crm_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_crm_data_mappings_integration_id ON social_crm_data_mappings(integration_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_jobs_integration_id ON social_crm_sync_jobs(integration_id);
CREATE INDEX IF NOT EXISTS idx_crm_webhooks_integration_id ON social_crm_webhooks(integration_id);
CREATE INDEX IF NOT EXISTS idx_crm_data_quality_integration_id ON social_crm_data_quality(integration_id);
CREATE INDEX IF NOT EXISTS idx_crm_workflows_integration_id ON social_crm_workflows(integration_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update engagement metrics when posts are created/updated
CREATE OR REPLACE FUNCTION update_engagement_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily engagement metrics
    INSERT INTO social_engagement_metrics (user_id, date, posts_created)
    VALUES (NEW.user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET 
        posts_created = social_engagement_metrics.posts_created + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_engagement_metrics
    AFTER INSERT ON social_posts
    FOR EACH ROW EXECUTE FUNCTION update_engagement_metrics();

-- Update creator profile when user engagement changes
CREATE OR REPLACE FUNCTION update_creator_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Update creator profile stats
    UPDATE social_creator_profiles 
    SET 
        total_posts = (
            SELECT COUNT(*) FROM social_posts WHERE user_id = NEW.user_id
        ),
        average_engagement_rate = (
            SELECT AVG(engagement_rate) FROM social_engagement_metrics 
            WHERE user_id = NEW.user_id AND engagement_rate > 0
        ),
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_creator_profile
    AFTER INSERT OR UPDATE ON social_engagement_metrics
    FOR EACH ROW EXECUTE FUNCTION update_creator_profile();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE social_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_community_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_creator_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_creator_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_content_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_sponsored_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_pwa_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_push_notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_offline_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_background_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_device_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_crm_data_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_crm_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_crm_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_crm_data_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_crm_workflows ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for user data
CREATE POLICY "Users can view their own engagement metrics" ON social_engagement_metrics
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view their own content performance" ON social_content_performance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_posts 
            WHERE id = social_content_performance.post_id 
            AND user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can view their own creator profile" ON social_creator_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own creator profile" ON social_creator_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view their own PWA config" ON social_pwa_configs
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view their own CRM integrations" ON social_crm_integrations
    FOR ALL USING (auth.uid()::text = user_id);

-- Public read policies for trending topics and tools
CREATE POLICY "Everyone can view trending topics" ON social_trending_topics
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view creator tools" ON social_creator_tools
    FOR SELECT USING (true);

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON social_engagement_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_content_performance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_community_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_event_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_trending_topics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_creator_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_creator_tools TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_creator_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_revenue_streams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_content_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_community_memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_event_tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_digital_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_sponsored_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_affiliate_programs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_payouts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_pwa_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_push_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_push_notification_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_offline_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_background_sync TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_device_capabilities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_crm_integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_crm_data_mappings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_crm_sync_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_crm_webhooks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_crm_data_quality TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_crm_workflows TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '🎉 PHASE 4 ADVANCED FEATURES SETUP COMPLETE!' as status;
SELECT '📊 Social analytics and insights are ready!' as analytics;
SELECT '💰 Monetization and creator tools are active!' as monetization;
SELECT '📱 PWA and mobile app features are configured!' as pwa;
SELECT '🔗 CRM integration system is ready!' as crm;
SELECT '🚀 Test the new advanced features!' as next_step; 