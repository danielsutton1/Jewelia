// Quality Control System Types
// Phase 5.5, Priority 4: Quality Control System

export interface QualityStandard {
  id: string;
  name: string;
  description?: string;
  category: 'incoming' | 'in_process' | 'final' | 'packaging';
  criteria: Record<string, any>;
  pass_threshold: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
}

export interface QualityCheckpoint {
  id: string;
  name: string;
  description?: string;
  standard_id: string;
  production_step?: string;
  equipment_id?: string;
  inspector_role: string;
  estimated_duration?: number;
  is_required: boolean;
  order_sequence: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
}

export interface QualityInspection {
  id: string;
  inspection_number: string;
  checkpoint_id: string;
  batch_id?: string;
  order_id?: string;
  inspector_id: string;
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'rework';
  score?: number;
  notes?: string;
  photos?: string[];
  evidence?: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface QualityDefect {
  id: string;
  inspection_id: string;
  defect_type: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location?: string;
  photos?: string[];
  root_cause?: string;
  corrective_action?: string;
  supplier_id?: string;
  cost_impact?: number;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assigned_to?: string;
  due_date?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface QualityCertificate {
  id: string;
  certificate_number: string;
  certificate_type: 'authenticity' | 'quality' | 'compliance';
  order_id?: string;
  batch_id?: string;
  issued_by: string;
  issued_date: string;
  expiry_date?: string;
  certificate_data: Record<string, any>;
  digital_signature?: string;
  is_valid: boolean;
  revoked_at?: string;
  revoked_reason?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface QualityCompliance {
  id: string;
  standard_name: string;
  compliance_type: 'ISO' | 'industry' | 'custom';
  audit_date: string;
  auditor_id: string;
  score?: number;
  status: 'compliant' | 'non_compliant' | 'pending';
  findings?: string;
  corrective_actions?: string;
  next_audit_date?: string;
  documentation?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface QualityMetric {
  id: string;
  metric_date: string;
  metric_type: 'defect_rate' | 'pass_rate' | 'rework_rate' | 'cost_of_quality';
  value: number;
  target_value?: number;
  category?: string;
  category_id?: string;
  created_at: string;
}

// Extended interfaces with relationships
export interface QualityInspectionWithDetails extends QualityInspection {
  checkpoint?: QualityCheckpoint;
  batch?: {
    id: string;
    batch_number: string;
    product_name: string;
  };
  order?: {
    id: string;
    order_number: string;
    customer_name: string;
  };
  inspector?: {
    id: string;
    full_name: string;
    email: string;
  };
  defects?: QualityDefect[];
}

export interface QualityDefectWithDetails extends QualityDefect {
  inspection?: {
    id: string;
    inspection_number: string;
    checkpoint_name: string;
  };
  supplier?: {
    id: string;
    name: string;
    contact_email: string;
  };
  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface QualityCertificateWithDetails extends QualityCertificate {
  order?: {
    id: string;
    order_number: string;
    customer_name: string;
  };
  batch?: {
    id: string;
    batch_number: string;
    product_name: string;
  };
  issued_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

// Analytics interfaces
export interface QualityAnalytics {
  overview: {
    total_inspections: number;
    passed_inspections: number;
    failed_inspections: number;
    pass_rate: number;
    defect_rate: number;
    rework_rate: number;
  };
  trends: {
    daily_metrics: QualityMetric[];
    weekly_metrics: QualityMetric[];
    monthly_metrics: QualityMetric[];
  };
  defects: {
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
    by_supplier: Record<string, number>;
    recent_defects: QualityDefectWithDetails[];
  };
  compliance: {
    current_status: QualityCompliance[];
    upcoming_audits: QualityCompliance[];
    compliance_score: number;
  };
  performance: {
    inspector_performance: Array<{
      inspector_id: string;
      inspector_name: string;
      inspections_count: number;
      pass_rate: number;
      average_score: number;
    }>;
    checkpoint_performance: Array<{
      checkpoint_id: string;
      checkpoint_name: string;
      inspections_count: number;
      pass_rate: number;
      average_duration: number;
    }>;
  };
}

// Form interfaces
export interface CreateQualityStandardRequest {
  name: string;
  description?: string;
  category: 'incoming' | 'in_process' | 'final' | 'packaging';
  criteria: Record<string, any>;
  pass_threshold: number;
}

export interface CreateQualityCheckpointRequest {
  name: string;
  description?: string;
  standard_id: string;
  production_step?: string;
  equipment_id?: string;
  inspector_role: string;
  estimated_duration?: number;
  is_required?: boolean;
  order_sequence: number;
}

export interface CreateQualityInspectionRequest {
  checkpoint_id: string;
  batch_id?: string;
  order_id?: string;
  inspector_id: string;
  notes?: string;
}

export interface UpdateQualityInspectionRequest {
  status?: 'pending' | 'in_progress' | 'passed' | 'failed' | 'rework';
  score?: number;
  notes?: string;
  photos?: string[];
  evidence?: Record<string, any>;
  started_at?: string;
  completed_at?: string;
}

export interface CreateQualityDefectRequest {
  inspection_id: string;
  defect_type: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location?: string;
  photos?: string[];
  root_cause?: string;
  corrective_action?: string;
  supplier_id?: string;
  cost_impact?: number;
  assigned_to?: string;
  due_date?: string;
}

export interface CreateQualityCertificateRequest {
  certificate_type: 'authenticity' | 'quality' | 'compliance';
  order_id?: string;
  batch_id?: string;
  issued_by: string;
  issued_date: string;
  expiry_date?: string;
  certificate_data: Record<string, any>;
  digital_signature?: string;
}

export interface CreateQualityComplianceRequest {
  standard_name: string;
  compliance_type: 'ISO' | 'industry' | 'custom';
  audit_date: string;
  auditor_id: string;
  score?: number;
  status: 'compliant' | 'non_compliant' | 'pending';
  findings?: string;
  corrective_actions?: string;
  next_audit_date?: string;
  documentation?: Record<string, any>;
}

// Filter interfaces
export interface QualityInspectionFilters {
  status?: 'pending' | 'in_progress' | 'passed' | 'failed' | 'rework';
  inspector_id?: string;
  batch_id?: string;
  order_id?: string;
  checkpoint_id?: string;
  date_from?: string;
  date_to?: string;
  score_min?: number;
  score_max?: number;
}

export interface QualityDefectFilters {
  status?: 'open' | 'investigating' | 'resolved' | 'closed';
  severity?: 'minor' | 'major' | 'critical';
  defect_type?: string;
  supplier_id?: string;
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
}

export interface QualityCertificateFilters {
  certificate_type?: 'authenticity' | 'quality' | 'compliance';
  order_id?: string;
  batch_id?: string;
  issued_by?: string;
  is_valid?: boolean;
  date_from?: string;
  date_to?: string;
}

// API Response interfaces
export interface QualityControlAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QualityControlListResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  error?: string;
}

// Dashboard interfaces
export interface QualityControlDashboard {
  recent_inspections: QualityInspectionWithDetails[];
  pending_inspections: QualityInspectionWithDetails[];
  critical_defects: QualityDefectWithDetails[];
  upcoming_audits: QualityCompliance[];
  quality_metrics: {
    today: QualityMetric[];
    this_week: QualityMetric[];
    this_month: QualityMetric[];
  };
  inspector_workload: Array<{
    inspector_id: string;
    inspector_name: string;
    pending_inspections: number;
    completed_today: number;
    average_score: number;
  }>;
} 