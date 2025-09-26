import { supabase } from '../supabase';
import { 
  EmployeeShift, TimeEntry, WorkSession, BreakRecord, ProjectTimeAllocation,
  OvertimeRecord, ShiftSchedule, EmployeePayRate, TimeTrackingSettings,
  CreateTimeEntryRequest, CreateWorkSessionRequest, UpdateWorkSessionRequest,
  CreateBreakRecordRequest, CreateProjectTimeAllocationRequest, CreateOvertimeRecordRequest,
  CreateShiftScheduleRequest, CreateEmployeePayRateRequest, TimeTrackingAnalytics,
  EmployeeProductivityMetrics, LaborCostAnalysis, WorkforceAnalytics, TimeEntryFilters,
  WorkSessionFilters, ProjectTimeFilters, OvertimeFilters, ShiftScheduleFilters,
  TimeClockStatus, TimeClockAction, ProductionTimeIntegration, EquipmentTimeIntegration
} from '../../types/time-tracking';

export class TimeTrackingService {
  // Time Clock Management
  async clockIn(employeeId: string, location?: string, deviceId?: string, notes?: string): Promise<TimeEntry> {
    try {
      // Check if employee is already clocked in
      const activeSession = await this.getActiveWorkSession(employeeId);
      if (activeSession) {
        throw new Error('Employee is already clocked in');
      }

      // Create time entry
      const timeEntry = await this.createTimeEntry({
        employee_id: employeeId,
        entry_type: 'clock_in',
        timestamp: new Date().toISOString(),
        location,
        device_id: deviceId,
        notes
      });

      // Create work session
      const payRate = await this.getCurrentPayRate(employeeId);
      await this.createWorkSession({
        employee_id: employeeId,
        clock_in_entry_id: timeEntry.id,
        start_time: timeEntry.timestamp,
        hourly_rate: payRate?.base_hourly_rate
      });

      return timeEntry;
    } catch (error) {
      console.error('Error in clock in:', error);
      throw error;
    }
  }

  async clockOut(employeeId: string, location?: string, deviceId?: string, notes?: string): Promise<TimeEntry> {
    try {
      // Get active work session
      const activeSession = await this.getActiveWorkSession(employeeId);
      if (!activeSession) {
        throw new Error('No active work session found');
      }

      // Create time entry
      const timeEntry = await this.createTimeEntry({
        employee_id: employeeId,
        entry_type: 'clock_out',
        timestamp: new Date().toISOString(),
        location,
        device_id: deviceId,
        notes
      });

      // Update work session
      await this.updateWorkSession(activeSession.id, {
        clock_out_entry_id: timeEntry.id,
        end_time: timeEntry.timestamp,
        status: 'completed'
      });

      return timeEntry;
    } catch (error) {
      console.error('Error in clock out:', error);
      throw error;
    }
  }

  async startBreak(employeeId: string, breakType: 'lunch' | 'coffee' | 'restroom' | 'other' = 'lunch', notes?: string): Promise<TimeEntry> {
    try {
      const activeSession = await this.getActiveWorkSession(employeeId);
      if (!activeSession) {
        throw new Error('No active work session found');
      }

      // Create break start entry
      const timeEntry = await this.createTimeEntry({
        employee_id: employeeId,
        entry_type: 'break_start',
        timestamp: new Date().toISOString(),
        notes
      });

      // Create break record
      await this.createBreakRecord({
        work_session_id: activeSession.id,
        employee_id: employeeId,
        break_start_entry_id: timeEntry.id,
        start_time: timeEntry.timestamp,
        break_type: breakType,
        notes
      });

      return timeEntry;
    } catch (error) {
      console.error('Error starting break:', error);
      throw error;
    }
  }

  async endBreak(employeeId: string, notes?: string): Promise<TimeEntry> {
    try {
      const activeSession = await this.getActiveWorkSession(employeeId);
      if (!activeSession) {
        throw new Error('No active work session found');
      }

      // Get active break record
      const { data: breakRecord } = await supabase
        .from('break_records')
        .select('*')
        .eq('work_session_id', activeSession.id)
        .is('end_time', null)
        .single();

      if (!breakRecord) {
        throw new Error('No active break found');
      }

      // Create break end entry
      const timeEntry = await this.createTimeEntry({
        employee_id: employeeId,
        entry_type: 'break_end',
        timestamp: new Date().toISOString(),
        notes
      });

      // Update break record
      const endTime = new Date(timeEntry.timestamp);
      const startTime = new Date(breakRecord.start_time);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      await supabase
        .from('break_records')
        .update({
          break_end_entry_id: timeEntry.id,
          end_time: timeEntry.timestamp,
          duration_minutes: durationMinutes
        })
        .eq('id', breakRecord.id);

      return timeEntry;
    } catch (error) {
      console.error('Error ending break:', error);
      throw error;
    }
  }

  async getTimeClockStatus(employeeId: string): Promise<TimeClockStatus> {
    try {
      const activeSession = await this.getActiveWorkSession(employeeId);
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's hours
      const { data: todaySessions } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('start_time', today)
        .lte('start_time', today + 'T23:59:59');

      const totalHoursToday = todaySessions?.reduce((sum: number, session: WorkSession) => sum + (session.total_hours || 0), 0) || 0;
      const overtimeHoursToday = todaySessions?.reduce((sum: number, session: WorkSession) => sum + (session.overtime_hours || 0), 0) || 0;

      // Get current shift
      const { data: currentShift } = await supabase
        .from('shift_schedules')
        .select('*, shift:employee_shifts(*)')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .single();

      return {
        employee_id: employeeId,
        employee_name: 'Employee Name', // Would need to join with employee table
        current_status: activeSession ? 'clocked_in' : 'clocked_out',
        current_session_id: activeSession?.id,
        last_clock_in: activeSession?.start_time,
        last_clock_out: activeSession?.end_time,
        current_shift: currentShift?.shift,
        total_hours_today: totalHoursToday,
        overtime_hours_today: overtimeHoursToday
      };
    } catch (error) {
      console.error('Error getting time clock status:', error);
      throw error;
    }
  }

  // Work Session Management
  async getActiveWorkSession(employeeId: string): Promise<WorkSession | null> {
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .select(`
          *,
          clock_in_entry:time_entries(*),
          clock_out_entry:time_entries(*)
        `)
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting active work session:', error);
      throw error;
    }
  }

  async createTimeEntry(timeEntryData: CreateTimeEntryRequest): Promise<TimeEntry> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([timeEntryData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  }

  async createWorkSession(sessionData: CreateWorkSessionRequest): Promise<WorkSession> {
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .insert([sessionData])
        .select(`
          *,
          clock_in_entry:time_entries(*),
          clock_out_entry:time_entries(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating work session:', error);
      throw error;
    }
  }

  async updateWorkSession(sessionId: string, updates: UpdateWorkSessionRequest): Promise<WorkSession> {
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select(`
          *,
          clock_in_entry:time_entries(*),
          clock_out_entry:time_entries(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating work session:', error);
      throw error;
    }
  }

  async getWorkSessions(filters: WorkSessionFilters = {}, page = 1, limit = 20): Promise<{ data: WorkSession[], total: number }> {
    try {
      let query = supabase
        .from('work_sessions')
        .select(`
          *,
          clock_in_entry:time_entries(*),
          clock_out_entry:time_entries(*)
        `, { count: 'exact' });

      if (filters.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.start_date) {
        query = query.gte('start_time', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('start_time', filters.end_date);
      }
      if (filters.has_overtime) {
        query = query.gt('overtime_hours', 0);
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('start_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error getting work sessions:', error);
      throw error;
    }
  }

  // Break Management
  async createBreakRecord(breakData: CreateBreakRecordRequest): Promise<BreakRecord> {
    try {
      const { data, error } = await supabase
        .from('break_records')
        .insert([breakData])
        .select(`
          *,
          work_session:work_sessions(*),
          break_start_entry:time_entries(*),
          break_end_entry:time_entries(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating break record:', error);
      throw error;
    }
  }

  async getBreakRecords(employeeId?: string, startDate?: string, endDate?: string): Promise<BreakRecord[]> {
    try {
      let query = supabase
        .from('break_records')
        .select(`
          *,
          work_session:work_sessions(*),
          break_start_entry:time_entries(*),
          break_end_entry:time_entries(*)
        `);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      if (startDate) {
        query = query.gte('start_time', startDate);
      }
      if (endDate) {
        query = query.lte('start_time', endDate);
      }

      const { data, error } = await query.order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting break records:', error);
      throw error;
    }
  }

  // Project Time Tracking
  async allocateProjectTime(allocationData: CreateProjectTimeAllocationRequest): Promise<ProjectTimeAllocation> {
    try {
      const { data, error } = await supabase
        .from('project_time_allocations')
        .insert([allocationData])
        .select(`
          *,
          work_session:work_sessions(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error allocating project time:', error);
      throw error;
    }
  }

  async getProjectTimeAllocations(filters: ProjectTimeFilters = {}): Promise<ProjectTimeAllocation[]> {
    try {
      let query = supabase
        .from('project_time_allocations')
        .select(`
          *,
          work_session:work_sessions(*)
        `);

      if (filters.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      if (filters.batch_id) {
        query = query.eq('batch_id', filters.batch_id);
      }
      if (filters.work_order_id) {
        query = query.eq('work_order_id', filters.work_order_id);
      }
      if (filters.activity_type) {
        query = query.eq('activity_type', filters.activity_type);
      }
      if (filters.start_date) {
        query = query.gte('start_time', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('start_time', filters.end_date);
      }
      if (filters.is_billable !== undefined) {
        query = query.eq('is_billable', filters.is_billable);
      }

      const { data, error } = await query.order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting project time allocations:', error);
      throw error;
    }
  }

  // Overtime Management
  async createOvertimeRecord(overtimeData: CreateOvertimeRecordRequest): Promise<OvertimeRecord> {
    try {
      const { data, error } = await supabase
        .from('overtime_records')
        .insert([overtimeData])
        .select(`
          *,
          work_session:work_sessions(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating overtime record:', error);
      throw error;
    }
  }

  async approveOvertime(overtimeId: string, approvedBy: string): Promise<OvertimeRecord> {
    try {
      const { data, error } = await supabase
        .from('overtime_records')
        .update({
          is_approved: true,
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', overtimeId)
        .select(`
          *,
          work_session:work_sessions(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving overtime:', error);
      throw error;
    }
  }

  async getOvertimeRecords(filters: OvertimeFilters = {}): Promise<OvertimeRecord[]> {
    try {
      let query = supabase
        .from('overtime_records')
        .select(`
          *,
          work_session:work_sessions(*)
        `);

      if (filters.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      if (filters.is_approved !== undefined) {
        query = query.eq('is_approved', filters.is_approved);
      }
      if (filters.start_date) {
        query = query.gte('date', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('date', filters.end_date);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting overtime records:', error);
      throw error;
    }
  }

  // Shift Management
  async createShiftSchedule(scheduleData: CreateShiftScheduleRequest): Promise<ShiftSchedule> {
    try {
      const { data, error } = await supabase
        .from('shift_schedules')
        .insert([scheduleData])
        .select(`
          *,
          shift:employee_shifts(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating shift schedule:', error);
      throw error;
    }
  }

  async getShiftSchedules(filters: ShiftScheduleFilters = {}): Promise<ShiftSchedule[]> {
    try {
      let query = supabase
        .from('shift_schedules')
        .select(`
          *,
          shift:employee_shifts(*)
        `);

      if (filters.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.date) {
        query = query.eq('date', filters.date);
      }
      if (filters.start_date) {
        query = query.gte('date', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('date', filters.end_date);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting shift schedules:', error);
      throw error;
    }
  }

  // Pay Rate Management
  async createEmployeePayRate(payRateData: CreateEmployeePayRateRequest): Promise<EmployeePayRate> {
    try {
      const { data, error } = await supabase
        .from('employee_pay_rates')
        .insert([payRateData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating employee pay rate:', error);
      throw error;
    }
  }

  async getCurrentPayRate(employeeId: string): Promise<EmployeePayRate | null> {
    try {
      const { data, error } = await supabase
        .from('employee_pay_rates')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .lte('effective_date', new Date().toISOString().split('T')[0])
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting current pay rate:', error);
      throw error;
    }
  }

  // Analytics & Reporting
  async getTimeTrackingAnalytics(): Promise<TimeTrackingAnalytics> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get basic counts
      const { data: activeSessions } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('status', 'active');

      // Get today's data
      const { data: todaySessions } = await supabase
        .from('work_sessions')
        .select('*')
        .gte('start_time', today)
        .lte('start_time', today + 'T23:59:59');

      // Get week's data
      const { data: weekSessions } = await supabase
        .from('work_sessions')
        .select('*')
        .gte('start_time', weekStart);

      // Get month's data
      const { data: monthSessions } = await supabase
        .from('work_sessions')
        .select('*')
        .gte('start_time', monthStart);

      // Calculate metrics
      const totalHoursToday = todaySessions?.reduce((sum: number, session: WorkSession) => sum + (session.total_hours || 0), 0) || 0;
      const totalHoursWeek = weekSessions?.reduce((sum: number, session: WorkSession) => sum + (session.total_hours || 0), 0) || 0;
      const totalHoursMonth = monthSessions?.reduce((sum: number, session: WorkSession) => sum + (session.total_hours || 0), 0) || 0;

      const overtimeHoursToday = todaySessions?.reduce((sum: number, session: WorkSession) => sum + (session.overtime_hours || 0), 0) || 0;
      const overtimeHoursWeek = weekSessions?.reduce((sum: number, session: WorkSession) => sum + (session.overtime_hours || 0), 0) || 0;

      const totalLaborCostToday = todaySessions?.reduce((sum: number, session: WorkSession) => sum + (session.total_cost || 0), 0) || 0;
      const totalLaborCostWeek = weekSessions?.reduce((sum: number, session: WorkSession) => sum + (session.total_cost || 0), 0) || 0;
      const totalLaborCostMonth = monthSessions?.reduce((sum: number, session: WorkSession) => sum + (session.total_cost || 0), 0) || 0;

      // Get project time distribution
      const { data: projectTime } = await supabase
        .from('project_time_allocations')
        .select('*')
        .gte('start_time', weekStart);

      const projectTimeDistribution = projectTime?.reduce((acc: Record<string, number>, allocation: ProjectTimeAllocation) => {
        const activity = allocation.activity_type || 'other';
        acc[activity] = (acc[activity] || 0) + (allocation.duration_hours || 0);
        return acc;
      }, {} as Record<string, number>) || {};

      // Mock data for demonstration
      const timeByActivity = [
        { activity: 'Casting', hours: 45.5, cost: 1137.50 },
        { activity: 'Polishing', hours: 32.0, cost: 800.00 },
        { activity: 'Setting', hours: 28.5, cost: 712.50 },
        { activity: 'Assembly', hours: 22.0, cost: 550.00 },
        { activity: 'Quality Check', hours: 15.0, cost: 375.00 }
      ];

      const dailyHoursTrend = [
        { date: '2024-01-15', hours: 8.5, cost: 212.50 },
        { date: '2024-01-16', hours: 9.0, cost: 225.00 },
        { date: '2024-01-17', hours: 7.5, cost: 187.50 },
        { date: '2024-01-18', hours: 8.0, cost: 200.00 },
        { date: '2024-01-19', hours: 6.5, cost: 162.50 }
      ];

      return {
        total_employees: 15, // Mock data
        active_sessions: activeSessions?.length || 0,
        total_hours_today: totalHoursToday,
        total_hours_week: totalHoursWeek,
        total_hours_month: totalHoursMonth,
        overtime_hours_today: overtimeHoursToday,
        overtime_hours_week: overtimeHoursWeek,
        total_labor_cost_today: totalLaborCostToday,
        total_labor_cost_week: totalLaborCostWeek,
        total_labor_cost_month: totalLaborCostMonth,
        average_hourly_rate: 25.00, // Mock data
        attendance_rate: 95.5, // Mock data
        late_arrivals: 3, // Mock data
        early_departures: 1, // Mock data
        break_compliance: 98.2, // Mock data
        project_time_distribution: projectTimeDistribution,
        employee_productivity: [], // Would need employee data
        time_by_activity: timeByActivity,
        daily_hours_trend: dailyHoursTrend
      };
    } catch (error) {
      console.error('Error getting time tracking analytics:', error);
      throw error;
    }
  }

  async getLaborCostAnalysis(startDate: string, endDate: string): Promise<LaborCostAnalysis> {
    try {
      const { data: sessions } = await supabase
        .from('work_sessions')
        .select('*')
        .gte('start_time', startDate)
        .lte('start_time', endDate);

      const { data: projectTime } = await supabase
        .from('project_time_allocations')
        .select('*')
        .gte('start_time', startDate)
        .lte('start_time', endDate);

      const totalLaborCost = sessions?.reduce((sum: number, session: WorkSession) => sum + (session.total_cost || 0), 0) || 0;
      const regularLaborCost = sessions?.reduce((sum: number, session: WorkSession) => sum + ((session.regular_hours || 0) * (session.hourly_rate || 0)), 0) || 0;
      const overtimeLaborCost = sessions?.reduce((sum: number, session: WorkSession) => sum + ((session.overtime_hours || 0) * (session.hourly_rate || 0) * 1.5), 0) || 0;

      // Mock data for demonstration
      const costByProject = [
        { project_id: 'batch-001', project_name: 'Gold Ring Batch', cost: 1250.00, hours: 50.0 },
        { project_id: 'batch-002', project_name: 'Diamond Necklace', cost: 1875.00, hours: 75.0 },
        { project_id: 'batch-003', project_name: 'Silver Bracelet', cost: 625.00, hours: 25.0 }
      ];

      const costByEmployee = [
        { employee_id: 'emp-001', employee_name: 'John Smith', cost: 1250.00, hours: 50.0 },
        { employee_id: 'emp-002', employee_name: 'Jane Doe', cost: 1125.00, hours: 45.0 },
        { employee_id: 'emp-003', employee_name: 'Mike Johnson', cost: 1375.00, hours: 55.0 }
      ];

      const costByActivity = [
        { activity: 'Casting', cost: 1137.50, hours: 45.5 },
        { activity: 'Polishing', cost: 800.00, hours: 32.0 },
        { activity: 'Setting', cost: 712.50, hours: 28.5 },
        { activity: 'Assembly', cost: 550.00, hours: 22.0 },
        { activity: 'Quality Check', cost: 375.00, hours: 15.0 }
      ];

      const costTrends = [
        { date: '2024-01-15', total_cost: 212.50, regular_cost: 200.00, overtime_cost: 12.50 },
        { date: '2024-01-16', total_cost: 225.00, regular_cost: 200.00, overtime_cost: 25.00 },
        { date: '2024-01-17', total_cost: 187.50, regular_cost: 187.50, overtime_cost: 0.00 },
        { date: '2024-01-18', total_cost: 200.00, regular_cost: 200.00, overtime_cost: 0.00 },
        { date: '2024-01-19', total_cost: 162.50, regular_cost: 162.50, overtime_cost: 0.00 }
      ];

      const profitabilityAnalysis = [
        { project_id: 'batch-001', revenue: 5000.00, labor_cost: 1250.00, profit_margin: 75.0 },
        { project_id: 'batch-002', revenue: 7500.00, labor_cost: 1875.00, profit_margin: 75.0 },
        { project_id: 'batch-003', revenue: 2500.00, labor_cost: 625.00, profit_margin: 75.0 }
      ];

      return {
        total_labor_cost: totalLaborCost,
        regular_labor_cost: regularLaborCost,
        overtime_labor_cost: overtimeLaborCost,
        cost_by_project: costByProject,
        cost_by_employee: costByEmployee,
        cost_by_activity: costByActivity,
        cost_trends: costTrends,
        profitability_analysis: profitabilityAnalysis
      };
    } catch (error) {
      console.error('Error getting labor cost analysis:', error);
      throw error;
    }
  }

  // Integration Methods
  async getProductionTimeIntegration(batchId: string): Promise<ProductionTimeIntegration> {
    try {
      const { data: projectTime } = await supabase
        .from('project_time_allocations')
        .select('*')
        .eq('batch_id', batchId);

      const totalLaborHours = projectTime?.reduce((sum: number, allocation: ProjectTimeAllocation) => sum + (allocation.duration_hours || 0), 0) || 0;
      const totalLaborCost = projectTime?.reduce((sum: number, allocation: ProjectTimeAllocation) => sum + (allocation.total_cost || 0), 0) || 0;

      // Group by employee
      const employeeContributions = projectTime?.reduce((acc: Record<string, any>, allocation: ProjectTimeAllocation) => {
        if (!acc[allocation.employee_id]) {
          acc[allocation.employee_id] = {
            employee_id: allocation.employee_id,
            employee_name: `Employee ${allocation.employee_id}`, // Would need employee lookup
            hours: 0,
            cost: 0,
            activities: []
          };
        }
        acc[allocation.employee_id].hours += allocation.duration_hours || 0;
        acc[allocation.employee_id].cost += allocation.total_cost || 0;
        if (allocation.activity_type) {
          acc[allocation.employee_id].activities.push(allocation.activity_type);
        }
        return acc;
      }, {} as Record<string, any>) || {};

      // Group by activity
      const timeByActivity = projectTime?.reduce((acc: Record<string, any>, allocation: ProjectTimeAllocation) => {
        const activity = allocation.activity_type || 'other';
        if (!acc[activity]) {
          acc[activity] = { hours: 0, cost: 0 };
        }
        acc[activity].hours += allocation.duration_hours || 0;
        acc[activity].cost += allocation.total_cost || 0;
        return acc;
      }, {} as Record<string, any>) || {};

      return {
        batch_id: batchId,
        batch_name: `Batch ${batchId}`, // Would need batch lookup
        total_labor_hours: totalLaborHours,
        total_labor_cost: totalLaborCost,
        employee_contributions: Object.values(employeeContributions),
        time_by_activity: timeByActivity
      };
    } catch (error) {
      console.error('Error getting production time integration:', error);
      throw error;
    }
  }
} 