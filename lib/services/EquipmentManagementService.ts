import { supabase } from '../supabase';
import { 
  Equipment, EquipmentCategory, EquipmentMaintenanceSchedule, EquipmentUsage,
  EquipmentAvailability, EquipmentPerformance, EquipmentIssue, EquipmentCalibration,
  EquipmentPart, EquipmentDocumentation, CreateEquipmentRequest, UpdateEquipmentRequest,
  CreateMaintenanceRequest, CreateUsageRequest, CreateAvailabilityRequest, CreateIssueRequest,
  EquipmentAnalytics, EquipmentPerformanceMetrics, MaintenanceStats, EquipmentFilters,
  MaintenanceFilters, UsageFilters, IssueFilters
} from '../../types/equipment';

export class EquipmentManagementService {
  // Equipment Registry Management
  async listEquipment(filters: EquipmentFilters = {}, page = 1, limit = 20): Promise<{ data: Equipment[], total: number }> {
    try {
      let query = supabase
        .from('equipment')
        .select(`
          *,
          category:equipment_categories(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.manufacturer) {
        query = query.ilike('manufacturer', `%${filters.manufacturer}%`);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,equipment_code.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
      }
      if (filters.min_value !== undefined) {
        query = query.gte('current_value', filters.min_value);
      }
      if (filters.max_value !== undefined) {
        query = query.lte('current_value', filters.max_value);
      }
      if (filters.needs_maintenance) {
        query = query.not('next_maintenance_date', 'is', null)
                   .lte('next_maintenance_date', new Date().toISOString().split('T')[0]);
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error listing equipment:', error);
      throw error;
    }
  }

  async createEquipment(equipmentData: CreateEquipmentRequest): Promise<Equipment> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .insert([equipmentData])
        .select(`
          *,
          category:equipment_categories(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  }

  async getEquipment(id: string): Promise<Equipment> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          category:equipment_categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting equipment:', error);
      throw error;
    }
  }

  async updateEquipment(id: string, updates: UpdateEquipmentRequest): Promise<Equipment> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:equipment_categories(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  }

  async deleteEquipment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  }

  // Equipment Categories
  async listCategories(): Promise<EquipmentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('equipment_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing categories:', error);
      throw error;
    }
  }

  async createCategory(categoryData: { name: string; description?: string; parent_category_id?: string }): Promise<EquipmentCategory> {
    try {
      const { data, error } = await supabase
        .from('equipment_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Maintenance Management
  async scheduleMaintenance(maintenanceData: CreateMaintenanceRequest): Promise<EquipmentMaintenanceSchedule> {
    try {
      const { data, error } = await supabase
        .from('equipment_maintenance_schedule')
        .insert([maintenanceData])
        .select(`
          *,
          equipment:equipment(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      throw error;
    }
  }

  async recordMaintenance(id: string, updates: {
    actual_duration_hours?: number;
    actual_cost?: number;
    status: 'completed' | 'cancelled';
    work_performed?: string;
    parts_used?: Record<string, any>;
    technician_notes?: string;
    performed_by?: string;
  }): Promise<EquipmentMaintenanceSchedule> {
    try {
      const updateData = {
        ...updates,
        completed_at: updates.status === 'completed' ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('equipment_maintenance_schedule')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          equipment:equipment(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording maintenance:', error);
      throw error;
    }
  }

  async getMaintenanceHistory(equipmentId?: string, filters: MaintenanceFilters = {}): Promise<EquipmentMaintenanceSchedule[]> {
    try {
      let query = supabase
        .from('equipment_maintenance_schedule')
        .select(`
          *,
          equipment:equipment(*)
        `);

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }
      if (filters.maintenance_type) {
        query = query.eq('maintenance_type', filters.maintenance_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.start_date) {
        query = query.gte('scheduled_date', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('scheduled_date', filters.end_date);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting maintenance history:', error);
      throw error;
    }
  }

  // Availability & Scheduling
  async checkAvailability(equipmentId: string, date: string, shift?: string): Promise<EquipmentAvailability[]> {
    try {
      let query = supabase
        .from('equipment_availability')
        .select('*')
        .eq('equipment_id', equipmentId)
        .eq('date', date);

      if (shift) {
        query = query.eq('shift', shift);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  async scheduleEquipment(availabilityData: CreateAvailabilityRequest): Promise<EquipmentAvailability> {
    try {
      const { data, error } = await supabase
        .from('equipment_availability')
        .insert([availabilityData])
        .select(`
          *,
          equipment:equipment(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error scheduling equipment:', error);
      throw error;
    }
  }

  async updateSchedule(id: string, updates: Partial<CreateAvailabilityRequest>): Promise<EquipmentAvailability> {
    try {
      const { data, error } = await supabase
        .from('equipment_availability')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          equipment:equipment(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  // Usage Tracking
  async recordUsage(usageData: CreateUsageRequest): Promise<EquipmentUsage> {
    try {
      const { data, error } = await supabase
        .from('equipment_usage')
        .insert([usageData])
        .select(`
          *,
          equipment:equipment(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording usage:', error);
      throw error;
    }
  }

  async getUsageHistory(equipmentId?: string, filters: UsageFilters = {}): Promise<EquipmentUsage[]> {
    try {
      let query = supabase
        .from('equipment_usage')
        .select(`
          *,
          equipment:equipment(*)
        `);

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }
      if (filters.batch_id) {
        query = query.eq('batch_id', filters.batch_id);
      }
      if (filters.start_date) {
        query = query.gte('start_time', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('start_time', filters.end_date);
      }
      if (filters.operation_type) {
        query = query.eq('operation_type', filters.operation_type);
      }

      const { data, error } = await query.order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting usage history:', error);
      throw error;
    }
  }

  async getUtilizationMetrics(equipmentId: string, startDate: string, endDate: string): Promise<EquipmentPerformanceMetrics> {
    try {
      // Get usage data for the period
      const { data: usageData, error: usageError } = await supabase
        .from('equipment_usage')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('start_time', startDate)
        .lte('start_time', endDate);

      if (usageError) throw usageError;

      // Get equipment details
      const equipment = await this.getEquipment(equipmentId);

      // Calculate metrics
      const totalHours = usageData?.reduce((sum: number, usage: EquipmentUsage) => sum + (usage.duration_hours || 0), 0) || 0;
      const totalProduction = usageData?.reduce((sum: number, usage: EquipmentUsage) => sum + (usage.production_quantity || 0), 0) || 0;
      const totalEnergy = usageData?.reduce((sum: number, usage: EquipmentUsage) => sum + (usage.energy_consumed || 0), 0) || 0;
      const totalCost = usageData?.reduce((sum: number, usage: EquipmentUsage) => sum + (usage.cost_incurred || 0), 0) || 0;
      const avgQuality = usageData?.length ? 
        usageData.reduce((sum: number, usage: EquipmentUsage) => sum + (usage.quality_score || 0), 0) / usageData.length : 0;

      // Calculate availability (assuming 24 hours per day for the period)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalAvailableHours = totalDays * 24;
      const utilizationPercentage = totalAvailableHours > 0 ? (totalHours / totalAvailableHours) * 100 : 0;

      // Calculate OEE (Overall Equipment Effectiveness)
      const availability = utilizationPercentage / 100;
      const performance = equipment.capacity_per_hour && totalHours > 0 ? 
        (totalProduction / (equipment.capacity_per_hour * totalHours)) : 0;
      const quality = avgQuality / 100;
      const oee = availability * performance * quality;

      return {
        equipment_id: equipmentId,
        equipment_name: equipment.name,
        total_operating_hours: totalHours,
        productive_hours: totalHours,
        downtime_hours: 0, // Would need separate downtime tracking
        maintenance_hours: 0, // Would need maintenance integration
        production_quantity: totalProduction,
        quality_score: avgQuality,
        energy_consumption: totalEnergy,
        operating_cost: totalCost,
        efficiency_percentage: performance * 100,
        utilization_percentage: utilizationPercentage,
        availability_percentage: utilizationPercentage,
        oee_score: oee * 100
      };
    } catch (error) {
      console.error('Error getting utilization metrics:', error);
      throw error;
    }
  }

  // Issue Management
  async reportIssue(issueData: CreateIssueRequest): Promise<EquipmentIssue> {
    try {
      const { data, error } = await supabase
        .from('equipment_issues')
        .insert([issueData])
        .select(`
          *,
          equipment:equipment(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error reporting issue:', error);
      throw error;
    }
  }

  async updateIssue(id: string, updates: {
    status: 'investigating' | 'in_progress' | 'resolved' | 'closed';
    assigned_to?: string;
    resolution_notes?: string;
    downtime_hours?: number;
    cost_impact?: number;
  }): Promise<EquipmentIssue> {
    try {
      const updateData = {
        ...updates,
        resolved_at: updates.status === 'resolved' ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('equipment_issues')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          equipment:equipment(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  }

  async getIssueHistory(equipmentId?: string, filters: IssueFilters = {}): Promise<EquipmentIssue[]> {
    try {
      let query = supabase
        .from('equipment_issues')
        .select(`
          *,
          equipment:equipment(*)
        `);

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }
      if (filters.issue_type) {
        query = query.eq('issue_type', filters.issue_type);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.start_date) {
        query = query.gte('reported_at', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('reported_at', filters.end_date);
      }

      const { data, error } = await query.order('reported_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting issue history:', error);
      throw error;
    }
  }

  // Analytics & Reporting
  async getEquipmentAnalytics(): Promise<EquipmentAnalytics> {
    try {
      // Get basic counts
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('*');

      if (equipmentError) throw equipmentError;

      // Get maintenance data
      const { data: maintenance, error: maintenanceError } = await supabase
        .from('equipment_maintenance_schedule')
        .select('*')
        .gte('scheduled_date', new Date().toISOString().split('T')[0]);

      if (maintenanceError) throw maintenanceError;

      // Get issues data
      const { data: issues, error: issuesError } = await supabase
        .from('equipment_issues')
        .select('*')
        .eq('status', 'open');

      if (issuesError) throw issuesError;

      // Calculate analytics
      const totalEquipment = equipment?.length || 0;
      const activeEquipment = equipment?.filter((e: Equipment) => e.status === 'active').length || 0;
      const maintenanceEquipment = equipment?.filter((e: Equipment) => e.status === 'maintenance').length || 0;
      const brokenEquipment = equipment?.filter((e: Equipment) => e.status === 'broken').length || 0;
      const totalValue = equipment?.reduce((sum: number, e: Equipment) => sum + (e.current_value || 0), 0) || 0;
      const totalOperatingHours = equipment?.reduce((sum: number, e: Equipment) => sum + (e.total_operating_hours || 0), 0) || 0;
      const totalMaintenanceCost = equipment?.reduce((sum: number, e: Equipment) => sum + (e.total_maintenance_cost || 0), 0) || 0;
      const upcomingMaintenance = maintenance?.filter((m: EquipmentMaintenanceSchedule) => m.status === 'scheduled').length || 0;
      const openIssues = issues?.length || 0;
      const criticalIssues = issues?.filter((i: EquipmentIssue) => i.severity === 'critical').length || 0;

      // Group by status, condition, category
      const equipmentByStatus = equipment?.reduce((acc: Record<string, number>, e: Equipment) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const equipmentByCondition = equipment?.reduce((acc: Record<string, number>, e: Equipment) => {
        acc[e.condition] = (acc[e.condition] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get categories for grouping
      const { data: categories } = await supabase
        .from('equipment_categories')
        .select('id, name');

      const equipmentByCategory = equipment?.reduce((acc: Record<string, number>, e: Equipment) => {
        const category = categories?.find((c: { id: string; name: string }) => c.id === e.category_id);
        const categoryName = category?.name || 'Unknown';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get top performing equipment (by utilization)
      const topPerforming = equipment
        ?.sort((a: Equipment, b: Equipment) => (b.total_operating_hours || 0) - (a.total_operating_hours || 0))
        .slice(0, 5) || [];

      // Get equipment needing maintenance
      const needsMaintenance = equipment
        ?.filter((e: Equipment) => e.next_maintenance_date && new Date(e.next_maintenance_date) <= new Date())
        .slice(0, 5) || [];

      // Mock monthly data (in real implementation, this would come from actual usage data)
      const monthlyUtilization = [
        { month: 'Jan', utilization: 75 },
        { month: 'Feb', utilization: 82 },
        { month: 'Mar', utilization: 78 },
        { month: 'Apr', utilization: 85 },
        { month: 'May', utilization: 80 },
        { month: 'Jun', utilization: 88 }
      ];

      const monthlyMaintenanceCost = [
        { month: 'Jan', cost: 2500 },
        { month: 'Feb', cost: 1800 },
        { month: 'Mar', cost: 3200 },
        { month: 'Apr', cost: 2100 },
        { month: 'May', cost: 2800 },
        { month: 'Jun', cost: 1900 }
      ];

      return {
        total_equipment: totalEquipment,
        active_equipment: activeEquipment,
        maintenance_equipment: maintenanceEquipment,
        broken_equipment: brokenEquipment,
        total_value: totalValue,
        average_utilization: totalEquipment > 0 ? (totalOperatingHours / (totalEquipment * 24 * 30)) * 100 : 0, // Rough estimate
        total_operating_hours: totalOperatingHours,
        total_maintenance_cost: totalMaintenanceCost,
        upcoming_maintenance: upcomingMaintenance,
        open_issues: openIssues,
        critical_issues: criticalIssues,
        equipment_by_status: equipmentByStatus,
        equipment_by_condition: equipmentByCondition,
        equipment_by_category: equipmentByCategory,
        monthly_utilization: monthlyUtilization,
        monthly_maintenance_cost: monthlyMaintenanceCost,
        top_performing_equipment: topPerforming,
        equipment_needing_maintenance: needsMaintenance
      };
    } catch (error) {
      console.error('Error getting equipment analytics:', error);
      throw error;
    }
  }

  async getMaintenanceStats(): Promise<MaintenanceStats> {
    try {
      const { data: maintenance, error } = await supabase
        .from('equipment_maintenance_schedule')
        .select('*')
        .gte('scheduled_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) throw error;

      const totalEvents = maintenance?.length || 0;
      const preventive = maintenance?.filter((m: EquipmentMaintenanceSchedule) => m.maintenance_type === 'preventive').length || 0;
      const corrective = maintenance?.filter((m: EquipmentMaintenanceSchedule) => m.maintenance_type === 'corrective').length || 0;
      const emergency = maintenance?.filter((m: EquipmentMaintenanceSchedule) => m.maintenance_type === 'emergency').length || 0;
      const totalCost = maintenance?.reduce((sum: number, m: EquipmentMaintenanceSchedule) => sum + (m.actual_cost || 0), 0) || 0;
      const avgDuration = maintenance?.length ? 
        maintenance.reduce((sum: number, m: EquipmentMaintenanceSchedule) => sum + (m.actual_duration_hours || 0), 0) / maintenance.length : 0;
      const completionRate = maintenance?.length ? 
        (maintenance.filter((m: EquipmentMaintenanceSchedule) => m.status === 'completed').length / maintenance.length) * 100 : 0;

      const upcoming = maintenance?.filter((m: EquipmentMaintenanceSchedule) => m.status === 'scheduled' && new Date(m.scheduled_date) > new Date()).slice(0, 5) || [];
      const overdue = maintenance?.filter((m: EquipmentMaintenanceSchedule) => m.status === 'scheduled' && new Date(m.scheduled_date) < new Date()).slice(0, 5) || [];

      const byType = {
        preventive,
        corrective,
        emergency,
        inspection: maintenance?.filter((m: EquipmentMaintenanceSchedule) => m.maintenance_type === 'inspection').length || 0
      };

      // Mock monthly data
      const byMonth = [
        { month: 'Jan', count: 12, cost: 2500 },
        { month: 'Feb', count: 8, cost: 1800 },
        { month: 'Mar', count: 15, cost: 3200 },
        { month: 'Apr', count: 10, cost: 2100 },
        { month: 'May', count: 13, cost: 2800 },
        { month: 'Jun', count: 9, cost: 1900 }
      ];

      return {
        total_maintenance_events: totalEvents,
        preventive_maintenance: preventive,
        corrective_maintenance: corrective,
        emergency_maintenance: emergency,
        total_maintenance_cost: totalCost,
        average_maintenance_duration: avgDuration,
        maintenance_completion_rate: completionRate,
        upcoming_maintenance: upcoming,
        overdue_maintenance: overdue,
        maintenance_by_type: byType,
        maintenance_by_month: byMonth
      };
    } catch (error) {
      console.error('Error getting maintenance stats:', error);
      throw error;
    }
  }
} 