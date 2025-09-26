// =====================================================
// PHASE 4: MOBILE PWA & NATIVE APP TYPES
// =====================================================

export interface PWAConfig {
  name: string;
  short_name: string;
  description: string;
  theme_color: string;
  background_color: string;
  display: DisplayMode;
  orientation: Orientation;
  
  // Icons
  icons: PWAIcon[];
  splash_screens: SplashScreen[];
  
  // Features
  features: PWAFeature[];
  permissions: PWAPermission[];
  
  // Offline support
  offline_enabled: boolean;
  cache_strategy: CacheStrategy;
  service_worker: ServiceWorkerConfig;
}

export type DisplayMode = 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
export type Orientation = 'portrait' | 'landscape' | 'any';

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export interface SplashScreen {
  src: string;
  sizes: string;
  form_factor: 'narrow' | 'wide';
}

export interface PWAFeature {
  name: string;
  description: string;
  is_enabled: boolean;
  requires_permission: boolean;
  permission_name?: string;
}

export type PWAFeatureType = 
  | 'push_notifications'
  | 'background_sync'
  | 'offline_storage'
  | 'camera_access'
  | 'location_access'
  | 'file_access'
  | 'device_motion'
  | 'device_orientation';

export interface PWAPermission {
  name: string;
  description: string;
  is_granted: boolean;
  granted_at?: string;
  usage_count: number;
}

export type CacheStrategy = 'cache_first' | 'network_first' | 'stale_while_revalidate' | 'network_only';

export interface ServiceWorkerConfig {
  script_url: string;
  scope: string;
  update_via_cache: 'all' | 'none';
  skip_waiting: boolean;
  clients_claim: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  
  // Notification data
  data?: Record<string, any>;
  actions?: NotificationAction[];
  
  // Display options
  require_interaction: boolean;
  silent: boolean;
  tag?: string;
  
  // Timing
  created_at: string;
  scheduled_for?: string;
  expires_at?: string;
  
  // Status
  status: NotificationStatus;
  delivered_at?: string;
  clicked_at?: string;
  dismissed_at?: string;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export type NotificationStatus = 'pending' | 'delivered' | 'clicked' | 'dismissed' | 'expired';

export interface NotificationSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_token: string;
  
  // Subscription preferences
  categories: NotificationCategory[];
  is_active: boolean;
  created_at: string;
  last_updated: string;
}

export type NotificationCategory = 
  | 'social_updates'
  | 'community_notifications'
  | 'event_reminders'
  | 'content_recommendations'
  | 'monetization_alerts'
  | 'system_notifications';

export interface OfflineData {
  id: string;
  user_id: string;
  data_type: OfflineDataType;
  data_key: string;
  data_value: any;
  
  // Sync info
  is_synced: boolean;
  sync_priority: SyncPriority;
  created_at: string;
  last_synced?: string;
  
  // Storage
  size_bytes: number;
  compression_ratio?: number;
}

export type OfflineDataType = 
  | 'user_profile'
  | 'posts'
  | 'communities'
  | 'events'
  | 'messages'
  | 'analytics'
  | 'settings';

export type SyncPriority = 'low' | 'normal' | 'high' | 'critical';

export interface BackgroundSync {
  id: string;
  user_id: string;
  sync_type: BackgroundSyncType;
  
  // Sync details
  data: any;
  retry_count: number;
  max_retries: number;
  
  // Status
  status: BackgroundSyncStatus;
  created_at: string;
  last_attempt?: string;
  next_attempt?: string;
  
  // Error handling
  last_error?: string;
  error_count: number;
}

export type BackgroundSyncType = 
  | 'post_creation'
  | 'message_sending'
  | 'data_sync'
  | 'analytics_upload'
  | 'file_upload';

export type BackgroundSyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface DeviceCapabilities {
  user_id: string;
  
  // Hardware capabilities
  camera: boolean;
  microphone: boolean;
  gps: boolean;
  accelerometer: boolean;
  gyroscope: boolean;
  fingerprint: boolean;
  face_id: boolean;
  
  // Storage capabilities
  local_storage: boolean;
  indexed_db: boolean;
  cache_storage: boolean;
  service_worker: boolean;
  
  // Network capabilities
  offline_support: boolean;
  background_sync: boolean;
  push_notifications: boolean;
  
  // Performance
  device_memory_gb?: number;
  hardware_concurrency?: number;
  max_touch_points?: number;
  
  // Platform info
  platform: string;
  user_agent: string;
  screen_resolution: string;
  viewport_size: string;
}

export interface MobileAppConfig {
  // App store info
  app_store_id?: string;
  play_store_id?: string;
  
  // Version info
  version: string;
  build_number: string;
  minimum_os_version: string;
  
  // Features
  features: MobileAppFeature[];
  permissions: MobileAppPermission[];
  
  // Deep linking
  deep_links: DeepLink[];
  universal_links: string[];
  
  // App configuration
  theme: AppTheme;
  language: string;
  region: string;
}

export interface MobileAppFeature {
  name: string;
  description: string;
  is_enabled: boolean;
  requires_permission: boolean;
  permission_name?: string;
  platform_support: Platform[];
}

export type Platform = 'ios' | 'android' | 'web' | 'desktop';

export interface MobileAppPermission {
  name: string;
  description: string;
  is_granted: boolean;
  granted_at?: string;
  usage_count: number;
  platform: Platform;
}

export interface DeepLink {
  scheme: string;
  host: string;
  path: string;
  query_params?: Record<string, string>;
  description: string;
}

export interface AppTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  is_dark_mode: boolean;
  supports_dark_mode: boolean;
}

export interface AppPerformance {
  user_id: string;
  
  // Load times
  app_startup_time: number;
  page_load_time: number;
  api_response_time: number;
  
  // Memory usage
  memory_usage_mb: number;
  memory_peak_mb: number;
  
  // Battery impact
  battery_drain_percent: number;
  cpu_usage_percent: number;
  
  // Network performance
  data_usage_mb: number;
  offline_time_percent: number;
  
  // User experience
  crash_count: number;
  error_rate: number;
  user_satisfaction_score: number;
  
  // Timestamp
  recorded_at: string;
}

export interface AppAnalytics {
  user_id: string;
  
  // Usage metrics
  session_count: number;
  total_session_time: number;
  average_session_time: number;
  
  // Feature usage
  features_used: { [key: string]: number };
  most_used_feature: string;
  least_used_feature: string;
  
  // Engagement metrics
  screen_views: number;
  unique_screens: number;
  time_on_screen: { [key: string]: number };
  
  // Performance metrics
  crash_rate: number;
  error_rate: number;
  load_time_percentile: number;
  
  // User behavior
  retention_rate: number;
  churn_probability: number;
  user_journey: UserJourneyStep[];
  
  // Timestamp
  period_start: string;
  period_end: string;
}

export interface UserJourneyStep {
  step_name: string;
  step_order: number;
  completion_rate: number;
  average_time_seconds: number;
  drop_off_count: number;
  next_steps: string[];
} 