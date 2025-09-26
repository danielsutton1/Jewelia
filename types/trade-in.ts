// Trade-In System Types
// Comprehensive type definitions for the trade-in system

export interface TradeIn {
  id: string;
  customer_id: string;
  item_type: string;
  description?: string;
  photos?: string[];
  estimated_value?: number;
  appraised_value?: number;
  status: TradeInStatus;
  created_at: string;
  updated_at: string;
  credited_order_id?: string;
  notes?: string;
  condition?: TradeInCondition;
  appraiser_id?: string;
  approved_at?: string;
  rejected_at?: string;
  credited_at?: string;
}

export interface TradeInStatusHistory {
  id: string;
  trade_in_id: string;
  status: TradeInStatus;
  changed_by?: string;
  changed_at: string;
  notes?: string;
  previous_status?: TradeInStatus;
}

export interface TradeInValuation {
  id: string;
  trade_in_id: string;
  appraiser_id: string;
  valuation_amount: number;
  valuation_date: string;
  valuation_notes?: string;
  valuation_method?: ValuationMethod;
  confidence_level?: number;
}

export interface TradeInCredit {
  id: string;
  trade_in_id: string;
  order_id?: string;
  credit_amount: number;
  applied_amount: number;
  remaining_amount: number;
  created_at: string;
  expires_at?: string;
  status: CreditStatus;
  notes?: string;
}

export type TradeInStatus = 
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'credited';

export type TradeInCondition = 
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor';

export type ValuationMethod = 
  | 'market_comparison'
  | 'expert_assessment'
  | 'certified_appraisal'
  | 'online_valuation'
  | 'historical_data';

export type CreditStatus = 
  | 'active'
  | 'used'
  | 'expired'
  | 'cancelled';

// Request/Response types for API
export interface CreateTradeInRequest {
  customer_id: string;
  item_type: string;
  description?: string;
  photos?: string[];
  estimated_value?: number;
  condition?: TradeInCondition;
  notes?: string;
}

export interface UpdateTradeInRequest {
  item_type?: string;
  description?: string;
  photos?: string[];
  estimated_value?: number;
  appraised_value?: number;
  status?: TradeInStatus;
  notes?: string;
  condition?: TradeInCondition;
  appraiser_id?: string;
}

export interface CreateValuationRequest {
  trade_in_id: string;
  appraiser_id: string;
  valuation_amount: number;
  valuation_notes?: string;
  valuation_method?: ValuationMethod;
  confidence_level?: number;
}

export interface CreateCreditRequest {
  trade_in_id: string;
  order_id?: string;
  credit_amount: number;
  expires_at?: string;
  notes?: string;
}

export interface UpdateCreditRequest {
  applied_amount?: number;
  status?: CreditStatus;
  notes?: string;
}

// Filter and query types
export interface TradeInFilters {
  customer_id?: string;
  status?: TradeInStatus;
  item_type?: string;
  condition?: TradeInCondition;
  appraiser_id?: string;
  date_from?: string;
  date_to?: string;
  min_value?: number;
  max_value?: number;
  search?: string;
}

export interface TradeInListResponse {
  success: boolean;
  data: TradeIn[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  filters?: TradeInFilters;
}

export interface TradeInDetailResponse {
  success: boolean;
  data: TradeIn & {
    status_history: TradeInStatusHistory[];
    valuations: TradeInValuation[];
    credits: TradeInCredit[];
    customer?: {
      id: string;
      name: string;
      email: string;
    };
    appraiser?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface TradeInAnalytics {
  total_trade_ins: number;
  total_value: number;
  avg_value: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  credited_count: number;
  top_item_types: Array<{
    item_type: string;
    count: number;
    avg_value: number;
  }>;
}

export interface TradeInAnalyticsResponse {
  success: boolean;
  data: TradeInAnalytics;
  period: {
    start_date?: string;
    end_date?: string;
  };
}

// Dashboard and reporting types
export interface TradeInDashboardStats {
  total_trade_ins: number;
  total_value: number;
  pending_reviews: number;
  approved_this_month: number;
  total_credits_issued: number;
  avg_processing_time: number; // in days
  recent_trade_ins: TradeIn[];
  top_customers: Array<{
    customer_id: string;
    customer_name: string;
    total_trade_ins: number;
    total_value: number;
  }>;
}

export interface TradeInDashboardResponse {
  success: boolean;
  data: TradeInDashboardStats;
}

// Export types
export interface TradeInExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  filters?: TradeInFilters;
  include_history?: boolean;
  include_valuations?: boolean;
  include_credits?: boolean;
}

export interface TradeInExportResponse {
  success: boolean;
  data: {
    download_url: string;
    expires_at: string;
    record_count: number;
  };
}

// Notification and alert types
export interface TradeInAlert {
  id: string;
  trade_in_id: string;
  type: 'status_change' | 'valuation_complete' | 'credit_issued' | 'expiring_credit';
  message: string;
  created_at: string;
  read_at?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface TradeInAlertResponse {
  success: boolean;
  data: TradeInAlert[];
  unread_count: number;
}

// Bulk operations
export interface BulkTradeInUpdateRequest {
  trade_in_ids: string[];
  updates: Partial<UpdateTradeInRequest>;
  notes?: string;
}

export interface BulkTradeInResponse {
  success: boolean;
  data: {
    updated_count: number;
    failed_count: number;
    errors: Array<{
      trade_in_id: string;
      error: string;
    }>;
  };
}

// Validation schemas (for Zod if needed)
export const TradeInStatusOptions: TradeInStatus[] = [
  'pending',
  'under_review',
  'approved',
  'rejected',
  'credited'
];

export const TradeInConditionOptions: TradeInCondition[] = [
  'excellent',
  'good',
  'fair',
  'poor'
];

export const ValuationMethodOptions: ValuationMethod[] = [
  'market_comparison',
  'expert_assessment',
  'certified_appraisal',
  'online_valuation',
  'historical_data'
];

export const CreditStatusOptions: CreditStatus[] = [
  'active',
  'used',
  'expired',
  'cancelled'
];

// Utility types
export type TradeInWithRelations = TradeIn & {
  status_history: TradeInStatusHistory[];
  valuations: TradeInValuation[];
  credits: TradeInCredit[];
};

export type TradeInSummary = Pick<TradeIn, 
  'id' | 'item_type' | 'status' | 'estimated_value' | 'appraised_value' | 'created_at'
> & {
  customer_name: string;
  condition: TradeInCondition;
};

// API Error types
export interface TradeInError {
  code: string;
  message: string;
  details?: any;
}

export interface TradeInErrorResponse {
  success: false;
  error: TradeInError;
} 