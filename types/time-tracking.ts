// Time Tracking System Types

export interface EmployeeShift {
  id: string;
  employee_id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  employee_id: string;
  entry_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: string;
  location?: string;
  device_id?: string;
  notes?: string;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface WorkSession {
  id: string;
  employee_id: string;
  clock_in_entry_id?: string;
  clock_out_entry_id?: string;
  start_time: string;
  end_time?: string;
  total_hours?: number;
  regular_hours?: number;
  overtime_hours?: number;
  break_hours?: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  hourly_rate?: number;
  total_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  clock_in_entry?: TimeEntry;
  clock_out_entry?: TimeEntry;
}

export interface BreakRecord {
  id: string;
  work_session_id?: string;
  employee_id: string;
  break_start_entry_id?: string;
  break_end_entry_id?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  break_type: 'lunch' | 'coffee' | 'restroom' | 'other';
  is_paid: boolean;
  notes?: string;
  created_at: string;
  work_session?: WorkSession;
  break_start_entry?: TimeEntry;
  break_end_entry?: TimeEntry;
}

export interface ProjectTimeAllocation {
  id: string;
  work_session_id?: string;
  employee_id: string;
  batch_id?: string;
  work_order_id?: string;
  task_id?: string;
  start_time: string;
  end_time?: string;
  duration_hours?: number;
  hourly_rate?: number;
  total_cost?: number;
  activity_type?: 'casting' | 'polishing' | 'setting' | 'assembly' | 'quality_check' | 'packaging' | 'other';
  description?: string;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
  work_session?: WorkSession;
}

export interface OvertimeRecord {
  id: string;
  employee_id: string;
  work_session_id?: string;
  date: string;
  regular_hours: number;
  actual_hours?: number;
  overtime_hours?: number;
  overtime_rate_multiplier: number;
  total_overtime_cost?: number;
  reason?: string;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  work_session?: WorkSession;
}

export interface ShiftSchedule {
  id: string;
  employee_id: string;
  date: string;
  shift_id?: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'absent' | 'late';
  notes?: string;
  created_at: string;
  updated_at: string;
  shift?: EmployeeShift;
}

export interface EmployeePayRate {
  id: string;
  employee_id: string;
  base_hourly_rate: number;
  overtime_rate_multiplier: number;
  effective_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeTrackingSettings {
  id: string;
  setting_key: string;
  setting_value?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Request/Response Types
export interface CreateTimeEntryRequest {
  employee_id: string;
  entry_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp?: string;
  location?: string;
  device_id?: string;
  notes?: string;
}

export interface CreateWorkSessionRequest {
  employee_id: string;
  clock_in_entry_id?: string;
  start_time: string;
  hourly_rate?: number;
  notes?: string;
}

export interface UpdateWorkSessionRequest {
  clock_out_entry_id?: string;
  end_time?: string;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  hourly_rate?: number;
  notes?: string;
}

export interface CreateBreakRecordRequest {
  work_session_id?: string;
  employee_id: string;
  break_start_entry_id?: string;
  start_time: string;
  break_type?: 'lunch' | 'coffee' | 'restroom' | 'other';
  is_paid?: boolean;
  notes?: string;
}

export interface CreateProjectTimeAllocationRequest {
  work_session_id?: string;
  employee_id: string;
  batch_id?: string;
  work_order_id?: string;
  task_id?: string;
  start_time: string;
  end_time?: string;
  duration_hours?: number;
  hourly_rate?: number;
  activity_type?: 'casting' | 'polishing' | 'setting' | 'assembly' | 'quality_check' | 'packaging' | 'other';
  description?: string;
  is_billable?: boolean;
}

export interface CreateOvertimeRecordRequest {
  employee_id: string;
  work_session_id?: string;
  date: string;
  regular_hours?: number;
  actual_hours?: number;
  overtime_rate_multiplier?: number;
  reason?: string;
}

export interface CreateShiftScheduleRequest {
  employee_id: string;
  date: string;
  shift_id?: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  notes?: string;
}

export interface CreateEmployeePayRateRequest {
  employee_id: string;
  base_hourly_rate: number;
  overtime_rate_multiplier?: number;
  effective_date: string;
  end_date?: string;
}

// Analytics Types
export interface TimeTrackingAnalytics {
  total_employees: number;
  active_sessions: number;
  total_hours_today: number;
  total_hours_week: number;
  total_hours_month: number;
  overtime_hours_today: number;
  overtime_hours_week: number;
  total_labor_cost_today: number;
  total_labor_cost_week: number;
  total_labor_cost_month: number;
  average_hourly_rate: number;
  attendance_rate: number;
  late_arrivals: number;
  early_departures: number;
  break_compliance: number;
  project_time_distribution: Record<string, number>;
  employee_productivity: EmployeeProductivityMetrics[];
  time_by_activity: Array<{ activity: string; hours: number; cost: number }>;
  daily_hours_trend: Array<{ date: string; hours: number; cost: number }>;
}

export interface EmployeeProductivityMetrics {
  employee_id: string;
  employee_name: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  total_cost: number;
  average_hourly_rate: number;
  productivity_score: number;
  attendance_rate: number;
  projects_completed: number;
  efficiency_percentage: number;
}

export interface LaborCostAnalysis {
  total_labor_cost: number;
  regular_labor_cost: number;
  overtime_labor_cost: number;
  cost_by_project: Array<{ project_id: string; project_name: string; cost: number; hours: number }>;
  cost_by_employee: Array<{ employee_id: string; employee_name: string; cost: number; hours: number }>;
  cost_by_activity: Array<{ activity: string; cost: number; hours: number }>;
  cost_trends: Array<{ date: string; total_cost: number; regular_cost: number; overtime_cost: number }>;
  profitability_analysis: Array<{ project_id: string; revenue: number; labor_cost: number; profit_margin: number }>;
}

export interface WorkforceAnalytics {
  total_employees: number;
  active_employees: number;
  average_hours_per_employee: number;
  average_hourly_rate: number;
  total_capacity_hours: number;
  utilized_capacity_percentage: number;
  employee_utilization: Array<{ employee_id: string; employee_name: string; utilization_percentage: number }>;
  shift_distribution: Record<string, number>;
  skill_distribution: Record<string, number>;
  performance_benchmarks: Array<{ metric: string; average: number; top_performer: number }>;
}

// Filter Types
export interface TimeEntryFilters {
  employee_id?: string;
  entry_type?: string;
  start_date?: string;
  end_date?: string;
  is_approved?: boolean;
}

export interface WorkSessionFilters {
  employee_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  has_overtime?: boolean;
}

export interface ProjectTimeFilters {
  employee_id?: string;
  batch_id?: string;
  work_order_id?: string;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
  is_billable?: boolean;
}

export interface OvertimeFilters {
  employee_id?: string;
  is_approved?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface ShiftScheduleFilters {
  employee_id?: string;
  status?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
}

// Time Clock Types
export interface TimeClockStatus {
  employee_id: string;
  employee_name: string;
  current_status: 'clocked_in' | 'clocked_out' | 'on_break';
  current_session_id?: string;
  last_clock_in?: string;
  last_clock_out?: string;
  current_shift?: EmployeeShift;
  total_hours_today: number;
  overtime_hours_today: number;
}

export interface TimeClockAction {
  employee_id: string;
  action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  location?: string;
  device_id?: string;
  notes?: string;
}

// Integration Types
export interface ProductionTimeIntegration {
  batch_id: string;
  batch_name: string;
  total_labor_hours: number;
  total_labor_cost: number;
  employee_contributions: Array<{
    employee_id: string;
    employee_name: string;
    hours: number;
    cost: number;
    activities: string[];
  }>;
  time_by_activity: Record<string, { hours: number; cost: number }>;
}

export interface EquipmentTimeIntegration {
  equipment_id: string;
  equipment_name: string;
  total_operation_hours: number;
  operator_hours: Array<{
    employee_id: string;
    employee_name: string;
    hours: number;
    cost: number;
  }>;
  efficiency_metrics: {
    utilization_percentage: number;
    operator_efficiency: number;
    cost_per_hour: number;
  };
} 