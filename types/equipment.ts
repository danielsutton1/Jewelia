// Equipment Management System Types

export interface EquipmentCategory {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  category_id: string;
  asset_id?: string;
  equipment_code: string;
  name: string;
  model?: string;
  manufacturer?: string;
  serial_number?: string;
  description?: string;
  specifications?: Record<string, any>;
  purchase_date?: string;
  purchase_cost?: number;
  current_value?: number;
  location?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired' | 'broken';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  capacity_per_hour?: number;
  power_consumption?: number;
  maintenance_interval_hours?: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  total_operating_hours: number;
  total_maintenance_cost: number;
  hourly_operating_cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: EquipmentCategory;
}

export interface EquipmentMaintenanceSchedule {
  id: string;
  equipment_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  scheduled_date: string;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  estimated_cost?: number;
  actual_cost?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  description?: string;
  work_performed?: string;
  parts_used?: Record<string, any>;
  technician_notes?: string;
  performed_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
}

export interface EquipmentUsage {
  id: string;
  equipment_id: string;
  batch_id?: string;
  work_order_id?: string;
  start_time: string;
  end_time?: string;
  duration_hours?: number;
  operator_id?: string;
  operation_type?: string;
  production_quantity?: number;
  quality_score?: number;
  energy_consumed?: number;
  cost_incurred?: number;
  notes?: string;
  created_at: string;
  equipment?: Equipment;
}

export interface EquipmentAvailability {
  id: string;
  equipment_id: string;
  date: string;
  shift: 'morning' | 'day' | 'evening' | 'night';
  start_time?: string;
  end_time?: string;
  status: 'available' | 'scheduled' | 'maintenance' | 'broken' | 'reserved';
  reserved_by?: string;
  reserved_for_batch_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
}

export interface EquipmentPerformance {
  id: string;
  equipment_id: string;
  metric_date: string;
  total_operating_hours: number;
  productive_hours: number;
  downtime_hours: number;
  maintenance_hours: number;
  production_quantity: number;
  quality_score?: number;
  energy_consumption: number;
  operating_cost: number;
  efficiency_percentage?: number;
  utilization_percentage?: number;
  created_at: string;
  equipment?: Equipment;
}

export interface EquipmentIssue {
  id: string;
  equipment_id: string;
  issue_type: 'breakdown' | 'performance' | 'safety' | 'quality' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  reported_by?: string;
  reported_at: string;
  status: 'open' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  resolution_notes?: string;
  resolved_at?: string;
  downtime_hours: number;
  cost_impact: number;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
}

export interface EquipmentCalibration {
  id: string;
  equipment_id: string;
  calibration_date: string;
  next_calibration_date?: string;
  calibration_type?: string;
  calibration_standard?: string;
  calibration_result?: 'pass' | 'fail' | 'conditional';
  accuracy_before?: number;
  accuracy_after?: number;
  calibration_cost?: number;
  performed_by?: string;
  certificate_number?: string;
  notes?: string;
  created_at: string;
  equipment?: Equipment;
}

export interface EquipmentPart {
  id: string;
  equipment_id?: string;
  part_number?: string;
  part_name: string;
  description?: string;
  manufacturer?: string;
  supplier?: string;
  current_stock: number;
  minimum_stock: number;
  unit_cost?: number;
  last_ordered_date?: string;
  lead_time_days?: number;
  location?: string;
  is_critical: boolean;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
}

export interface EquipmentDocumentation {
  id: string;
  equipment_id: string;
  document_type: 'manual' | 'warranty' | 'certificate' | 'schematic' | 'procedure' | 'other';
  title: string;
  description?: string;
  file_path?: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_at: string;
  is_active: boolean;
  created_at: string;
  equipment?: Equipment;
}

// Request/Response Types
export interface CreateEquipmentRequest {
  category_id: string;
  asset_id?: string;
  equipment_code: string;
  name: string;
  model?: string;
  manufacturer?: string;
  serial_number?: string;
  description?: string;
  specifications?: Record<string, any>;
  purchase_date?: string;
  purchase_cost?: number;
  current_value?: number;
  location?: string;
  status?: 'active' | 'inactive' | 'maintenance' | 'retired' | 'broken';
  condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  capacity_per_hour?: number;
  power_consumption?: number;
  maintenance_interval_hours?: number;
  notes?: string;
}

export interface UpdateEquipmentRequest extends Partial<CreateEquipmentRequest> {
  last_maintenance_date?: string;
  next_maintenance_date?: string;
}

export interface CreateMaintenanceRequest {
  equipment_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  scheduled_date: string;
  estimated_duration_hours?: number;
  estimated_cost?: number;
  description?: string;
}

export interface CreateUsageRequest {
  equipment_id: string;
  batch_id?: string;
  work_order_id?: string;
  start_time: string;
  end_time?: string;
  duration_hours?: number;
  operator_id?: string;
  operation_type?: string;
  production_quantity?: number;
  quality_score?: number;
  energy_consumed?: number;
  cost_incurred?: number;
  notes?: string;
}

export interface CreateAvailabilityRequest {
  equipment_id: string;
  date: string;
  shift?: 'morning' | 'day' | 'evening' | 'night';
  start_time?: string;
  end_time?: string;
  status?: 'available' | 'scheduled' | 'maintenance' | 'broken' | 'reserved';
  reserved_by?: string;
  reserved_for_batch_id?: string;
  notes?: string;
}

export interface CreateIssueRequest {
  equipment_id: string;
  issue_type: 'breakdown' | 'performance' | 'safety' | 'quality' | 'other';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  reported_by?: string;
}

// Analytics Types
export interface EquipmentAnalytics {
  total_equipment: number;
  active_equipment: number;
  maintenance_equipment: number;
  broken_equipment: number;
  total_value: number;
  average_utilization: number;
  total_operating_hours: number;
  total_maintenance_cost: number;
  upcoming_maintenance: number;
  open_issues: number;
  critical_issues: number;
  equipment_by_status: Record<string, number>;
  equipment_by_condition: Record<string, number>;
  equipment_by_category: Record<string, number>;
  monthly_utilization: Array<{ month: string; utilization: number }>;
  monthly_maintenance_cost: Array<{ month: string; cost: number }>;
  top_performing_equipment: Equipment[];
  equipment_needing_maintenance: Equipment[];
}

export interface EquipmentPerformanceMetrics {
  equipment_id: string;
  equipment_name: string;
  total_operating_hours: number;
  productive_hours: number;
  downtime_hours: number;
  maintenance_hours: number;
  production_quantity: number;
  quality_score: number;
  energy_consumption: number;
  operating_cost: number;
  efficiency_percentage: number;
  utilization_percentage: number;
  availability_percentage: number;
  oee_score: number; // Overall Equipment Effectiveness
}

export interface MaintenanceStats {
  total_maintenance_events: number;
  preventive_maintenance: number;
  corrective_maintenance: number;
  emergency_maintenance: number;
  total_maintenance_cost: number;
  average_maintenance_duration: number;
  maintenance_completion_rate: number;
  upcoming_maintenance: EquipmentMaintenanceSchedule[];
  overdue_maintenance: EquipmentMaintenanceSchedule[];
  maintenance_by_type: Record<string, number>;
  maintenance_by_month: Array<{ month: string; count: number; cost: number }>;
}

// Filter Types
export interface EquipmentFilters {
  category_id?: string;
  status?: string;
  condition?: string;
  location?: string;
  manufacturer?: string;
  search?: string;
  min_value?: number;
  max_value?: number;
  needs_maintenance?: boolean;
}

export interface MaintenanceFilters {
  equipment_id?: string;
  maintenance_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface UsageFilters {
  equipment_id?: string;
  batch_id?: string;
  start_date?: string;
  end_date?: string;
  operation_type?: string;
}

export interface IssueFilters {
  equipment_id?: string;
  issue_type?: string;
  severity?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
} 