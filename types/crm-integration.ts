// =====================================================
// PHASE 4: CRM INTEGRATION TYPES
// =====================================================

export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual'

export interface CRMIntegration {
  id: string;
  integration_type: CRMIntegrationType;
  status: IntegrationStatus;
  
  // Connection details
  api_endpoint: string;
  api_key?: string;
  access_token?: string;
  refresh_token?: string;
  
  // Configuration
  config: CRMIntegrationConfig;
  mappings: CRMDataMapping[];
  
  // Sync settings
  sync_enabled: boolean;
  sync_frequency: SyncFrequency;
  last_sync: string;
  next_sync: string;
  
  // Performance
  sync_success_rate: number;
  error_count: number;
  last_error?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export type CRMIntegrationType = 
  | 'hubspot'
  | 'salesforce'
  | 'pipedrive'
  | 'zoho'
  | 'freshworks'
  | 'custom_api';

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'syncing' | 'disconnected';

export interface CRMIntegrationConfig {
  // Authentication
  auth_method: AuthMethod;
  oauth_config?: OAuthConfig;
  api_config?: APIConfig;
  
  // Sync preferences
  sync_direction: SyncDirection;
  conflict_resolution: ConflictResolution;
  batch_size: number;
  
  // Data filters
  filters: CRMDataFilter[];
  field_mappings: FieldMapping[];
  
  // Notifications
  notifications_enabled: boolean;
  notification_emails: string[];
  error_notifications: boolean;
}

export type AuthMethod = 'oauth2' | 'api_key' | 'basic_auth' | 'custom';
export type SyncDirection = 'bidirectional' | 'crm_to_social' | 'social_to_crm';
export type ConflictResolution = 'crm_wins' | 'social_wins' | 'most_recent' | 'manual';

export interface OAuthConfig {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope: string[];
  auth_url: string;
  token_url: string;
}

export interface APIConfig {
  rate_limit: number;
  timeout_ms: number;
  retry_attempts: number;
  retry_delay_ms: number;
}

export interface CRMDataFilter {
  entity_type: CRMEntityType;
  field: string;
  operator: FilterOperator;
  value: any;
  is_active: boolean;
}

export type CRMEntityType = 'contact' | 'lead' | 'deal' | 'company' | 'opportunity' | 'task';
export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';

export interface FieldMapping {
  social_field: string;
  crm_field: string;
  entity_type: CRMEntityType;
  data_type: FieldDataType;
  is_required: boolean;
  default_value?: any;
  transformation_rule?: string;
}

export type FieldDataType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'array' | 'object';

export interface CRMDataMapping {
  id: string;
  integration_id: string;
  entity_type: CRMEntityType;
  
  // Field mappings
  field_mappings: FieldMapping[];
  
  // Sync rules
  sync_rules: SyncRule[];
  
  // Validation rules
  validation_rules: ValidationRule[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface SyncRule {
  id: string;
  name: string;
  description: string;
  
  // Trigger conditions
  trigger_field: string;
  trigger_operator: FilterOperator;
  trigger_value: any;
  
  // Action
  action: SyncAction;
  target_field: string;
  target_value: any;
  
  // Status
  is_active: boolean;
  priority: number;
}

export type SyncAction = 'create' | 'update' | 'delete' | 'copy' | 'transform' | 'calculate';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  
  // Validation logic
  field: string;
  rule_type: ValidationRuleType;
  rule_value: any;
  error_message: string;
  
  // Status
  is_active: boolean;
  severity: ValidationSeverity;
}

export type ValidationRuleType = 'required' | 'min_length' | 'max_length' | 'pattern' | 'range' | 'custom';
export type ValidationSeverity = 'warning' | 'error' | 'critical';

export interface CRMSyncJob {
  id: string;
  integration_id: string;
  job_type: SyncJobType;
  
  // Job details
  status: SyncJobStatus;
  progress: number;
  total_records: number;
  processed_records: number;
  
  // Data
  source_entity: CRMEntityType;
  target_entity: CRMEntityType;
  sync_data: CRMSyncData[];
  
  // Timing
  started_at: string;
  completed_at?: string;
  estimated_completion?: string;
  
  // Results
  success_count: number;
  error_count: number;
  warnings: string[];
  errors: string[];
}

export type SyncJobType = 'full_sync' | 'incremental_sync' | 'manual_sync' | 'error_recovery';
export type SyncJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

export interface CRMSyncData {
  id: string;
  sync_job_id: string;
  
  // Source data
  source_id: string;
  source_type: CRMEntityType;
  source_data: Record<string, any>;
  
  // Target data
  target_id?: string;
  target_type: CRMEntityType;
  target_data?: Record<string, any>;
  
  // Sync status
  status: SyncDataStatus;
  sync_operation: SyncOperation;
  
  // Processing
  processed_at?: string;
  error_message?: string;
  retry_count: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export type SyncDataStatus = 'pending' | 'synced' | 'failed' | 'skipped' | 'conflict';
export type SyncOperation = 'create' | 'update' | 'delete' | 'upsert';

export interface CRMAnalytics {
  integration_id: string;
  time_period: string;
  
  // Sync metrics
  total_sync_jobs: number;
  successful_syncs: number;
  failed_syncs: number;
  sync_success_rate: number;
  
  // Data metrics
  total_records_synced: number;
  records_created: number;
  records_updated: number;
  records_deleted: number;
  
  // Performance metrics
  average_sync_duration: number;
  fastest_sync: number;
  slowest_sync: number;
  
  // Error metrics
  total_errors: number;
  error_types: { [key: string]: number };
  resolution_time: number;
  
  // User engagement
  active_users: number;
  sync_frequency: number;
  user_satisfaction_score: number;
}

export interface CRMWebhook {
  id: string;
  integration_id: string;
  webhook_type: WebhookType;
  
  // Webhook details
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  
  // Triggers
  trigger_events: WebhookTriggerEvent[];
  trigger_conditions: WebhookTriggerCondition[];
  
  // Security
  secret_key?: string;
  is_verified: boolean;
  
  // Status
  is_active: boolean;
  last_triggered?: string;
  success_count: number;
  failure_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export type WebhookType = 'incoming' | 'outgoing';
export type WebhookTriggerEvent = 'record_created' | 'record_updated' | 'record_deleted' | 'sync_completed' | 'error_occurred';

export interface WebhookTriggerCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  logical_operator: 'AND' | 'OR';
}

export interface CRMDataQuality {
  integration_id: string;
  entity_type: CRMEntityType;
  
  // Data completeness
  total_records: number;
  complete_records: number;
  incomplete_records: number;
  completeness_rate: number;
  
  // Data accuracy
  validated_records: number;
  invalid_records: number;
  accuracy_rate: number;
  
  // Data consistency
  consistent_records: number;
  inconsistent_records: number;
  consistency_rate: number;
  
  // Data freshness
  up_to_date_records: number;
  outdated_records: number;
  freshness_rate: number;
  
  // Issues
  data_issues: DataIssue[];
  recommendations: string[];
  
  // Timestamp
  assessed_at: string;
}

export interface DataIssue {
  id: string;
  issue_type: DataIssueType;
  severity: DataIssueSeverity;
  description: string;
  
  // Affected data
  affected_records: number;
  affected_fields: string[];
  
  // Resolution
  is_resolved: boolean;
  resolution_notes?: string;
  resolved_at?: string;
  
  // Timestamps
  detected_at: string;
  updated_at: string;
}

export type DataIssueType = 'missing_data' | 'invalid_format' | 'duplicate_records' | 'inconsistent_data' | 'outdated_data';
export type DataIssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CRMWorkflow {
  id: string;
  integration_id: string;
  name: string;
  description: string;
  
  // Workflow configuration
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  
  // Status
  is_active: boolean;
  is_template: boolean;
  
  // Execution
  execution_count: number;
  last_executed?: string;
  success_rate: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface WorkflowTrigger {
  type: TriggerType;
  entity_type: CRMEntityType;
  event: string;
  schedule?: string;
}

export type TriggerType = 'event_based' | 'scheduled' | 'manual' | 'webhook';

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  logical_operator: 'AND' | 'OR';
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  target: string;
  parameters: Record<string, any>;
  order: number;
}

export type ActionType = 'create_record' | 'update_record' | 'delete_record' | 'send_notification' | 'call_api' | 'execute_script';

export interface CRMReporting {
  integration_id: string;
  report_type: ReportType;
  
  // Report configuration
  filters: CRMDataFilter[];
  group_by: string[];
  sort_by: string[];
  limit: number;
  
  // Data
  data: ReportData[];
  summary: ReportSummary;
  
  // Export
  export_format: ExportFormat;
  export_url?: string;
  
  // Timestamps
  generated_at: string;
  expires_at?: string;
}

export type ReportType = 'sync_summary' | 'data_quality' | 'user_activity' | 'performance_metrics' | 'error_analysis';
export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf' | 'html';

export interface ReportData {
  [key: string]: any;
}

export interface ReportSummary {
  total_records: number;
  metrics: Record<string, number>;
  trends: Record<string, any[]>;
} 