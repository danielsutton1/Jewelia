import { createClient } from '@supabase/supabase-js';
import { 
  TradeIn, 
  TradeInStatusHistory, 
  TradeInValuation, 
  TradeInCredit,
  CreateTradeInRequest,
  UpdateTradeInRequest,
  CreateValuationRequest,
  CreateCreditRequest,
  UpdateCreditRequest,
  TradeInFilters,
  TradeInAnalytics,
  TradeInDashboardStats,
  TradeInStatus,
  CreditStatus
} from '@/types/trade-in';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class TradeInService {
  // Core CRUD Operations
  async createTradeIn(data: CreateTradeInRequest): Promise<TradeIn> {
    const { data: tradeIn, error } = await supabase
      .from('trade_ins')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create trade-in: ${error.message}`);
    }

    return tradeIn;
  }

  async getTradeInById(id: string): Promise<TradeIn | null> {
    const { data: tradeIn, error } = await supabase
      .from('trade_ins')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get trade-in: ${error.message}`);
    }

    return tradeIn;
  }

  async listTradeIns(filters: TradeInFilters = {}, page = 1, limit = 20): Promise<{
    data: TradeIn[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    let query = supabase
      .from('trade_ins')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.item_type) {
      query = query.eq('item_type', filters.item_type);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.appraiser_id) {
      query = query.eq('appraiser_id', filters.appraiser_id);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters.min_value) {
      query = query.gte('appraised_value', filters.min_value);
    }
    if (filters.max_value) {
      query = query.lte('appraised_value', filters.max_value);
    }
    if (filters.search) {
      query = query.or(`item_type.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: tradeIns, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list trade-ins: ${error.message}`);
    }

    return {
      data: tradeIns || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async updateTradeIn(id: string, data: UpdateTradeInRequest): Promise<TradeIn> {
    const { data: tradeIn, error } = await supabase
      .from('trade_ins')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update trade-in: ${error.message}`);
    }

    return tradeIn;
  }

  async deleteTradeIn(id: string): Promise<void> {
    const { error } = await supabase
      .from('trade_ins')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete trade-in: ${error.message}`);
    }
  }

  // Status Management
  async updateTradeInStatus(id: string, status: TradeInStatus, appraiserId?: string, notes?: string): Promise<TradeIn> {
    const updateData: UpdateTradeInRequest = { status };
    
    if (appraiserId) {
      updateData.appraiser_id = appraiserId;
    }
    if (notes) {
      updateData.notes = notes;
    }

    return this.updateTradeIn(id, updateData);
  }

  async getStatusHistory(tradeInId: string): Promise<TradeInStatusHistory[]> {
    const { data: history, error } = await supabase
      .from('trade_in_status_history')
      .select(`
        *,
        changed_by_user:customers!trade_in_status_history_changed_by_fkey(id, full_name, email)
      `)
      .eq('trade_in_id', tradeInId)
      .order('changed_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get status history: ${error.message}`);
    }

    return history || [];
  }

  // Valuations
  async createValuation(data: CreateValuationRequest): Promise<TradeInValuation> {
    const { data: valuation, error } = await supabase
      .from('trade_in_valuations')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create valuation: ${error.message}`);
    }

    // Update the trade-in with the appraised value
    await this.updateTradeIn(data.trade_in_id, {
      appraised_value: data.valuation_amount,
      appraiser_id: data.appraiser_id
    });

    return valuation;
  }

  async getValuations(tradeInId: string): Promise<TradeInValuation[]> {
    const { data: valuations, error } = await supabase
      .from('trade_in_valuations')
      .select('*')
      .eq('trade_in_id', tradeInId)
      .order('valuation_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to get valuations: ${error.message}`);
    }

    return valuations || [];
  }

  async getLatestValuation(tradeInId: string): Promise<TradeInValuation | null> {
    const { data: valuation, error } = await supabase
      .from('trade_in_valuations')
      .select(`
        *,
        appraiser:customers!trade_in_valuations_appraiser_id_fkey(id, name, email)
      `)
      .eq('trade_in_id', tradeInId)
      .order('valuation_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get latest valuation: ${error.message}`);
    }

    return valuation;
  }

  // Credits
  async createCredit(data: CreateCreditRequest): Promise<TradeInCredit> {
    const { data: credit, error } = await supabase
      .from('trade_in_credits')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create credit: ${error.message}`);
    }

    // Update trade-in status to credited
    await this.updateTradeInStatus(data.trade_in_id, 'credited');

    return credit;
  }

  async getCredits(tradeInId: string): Promise<TradeInCredit[]> {
    const { data: credits, error } = await supabase
      .from('trade_in_credits')
      .select(`
        *,
        order:orders!trade_in_credits_order_id_fkey(id, order_number, total_amount)
      `)
      .eq('trade_in_id', tradeInId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get credits: ${error.message}`);
    }

    return credits || [];
  }

  async updateCredit(id: string, data: UpdateCreditRequest): Promise<TradeInCredit> {
    const { data: credit, error } = await supabase
      .from('trade_in_credits')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update credit: ${error.message}`);
    }

    return credit;
  }

  async applyCreditToOrder(creditId: string, orderId: string, amount: number): Promise<TradeInCredit> {
    const credit = await this.getCreditById(creditId);
    if (!credit) {
      throw new Error('Credit not found');
    }

    if (credit.remaining_amount < amount) {
      throw new Error('Insufficient credit amount');
    }

    const newAppliedAmount = credit.applied_amount + amount;
    const status: CreditStatus = newAppliedAmount >= credit.credit_amount ? 'used' : 'active';

    return this.updateCredit(creditId, {
      applied_amount: newAppliedAmount,
      status,
      notes: `Applied ${amount} to order ${orderId}`
    });
  }

  async getCreditById(id: string): Promise<TradeInCredit | null> {
    const { data: credit, error } = await supabase
      .from('trade_in_credits')
      .select(`
        *,
        order:orders!trade_in_credits_order_id_fkey(id, order_number, total_amount)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get credit: ${error.message}`);
    }

    return credit;
  }

  // Analytics
  async getTradeInAnalytics(startDate?: string, endDate?: string): Promise<TradeInAnalytics> {
    let query = `
      SELECT 
        COUNT(*) as total_trade_ins,
        COALESCE(SUM(
          CASE 
            WHEN appraised_value IS NOT NULL THEN appraised_value
            ELSE estimated_value
          END
        ), 0) as total_value,
        COALESCE(AVG(
          CASE 
            WHEN appraised_value IS NOT NULL THEN appraised_value
            ELSE estimated_value
          END
        ), 0) as avg_value,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) FILTER (WHERE status = 'credited') as credited_count
      FROM trade_ins
    `;

    const params: any[] = [];
    if (startDate || endDate) {
      query += ' WHERE 1=1';
      if (startDate) {
        query += ` AND created_at >= $${params.length + 1}`;
        params.push(startDate);
      }
      if (endDate) {
        query += ` AND created_at <= $${params.length + 1}`;
        params.push(endDate);
      }
    }

    const { data, error } = await supabase.rpc('get_trade_in_analytics', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) {
      throw new Error(`Failed to get trade-in analytics: ${error.message}`);
    }

    return data[0] || {
      total_trade_ins: 0,
      total_value: 0,
      avg_value: 0,
      pending_count: 0,
      approved_count: 0,
      rejected_count: 0,
      credited_count: 0,
      top_item_types: []
    };
  }

  async getDashboardStats(): Promise<TradeInDashboardStats> {
    // Get basic stats
    const analytics = await this.getTradeInAnalytics();
    
    // Get pending reviews
    const { count: pendingReviews } = await supabase
      .from('trade_ins')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get approved this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: approvedThisMonth } = await supabase
      .from('trade_ins')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('approved_at', startOfMonth.toISOString());

    // Get total credits issued
    const { count: totalCredits } = await supabase
      .from('trade_in_credits')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get recent trade-ins
    const { data: recentTradeIns } = await supabase
      .from('trade_ins')
      .select(`
        *,
        customer:customers!trade_ins_customer_id_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get top customers
    const { data: topCustomers } = await supabase
      .from('trade_ins')
      .select(`
        customer_id,
        customer:customers!trade_ins_customer_id_fkey(id, full_name, email),
        appraised_value,
        estimated_value
      `)
      .in('status', ['approved', 'credited']);

    // Process top customers data
    const customerStats = new Map<string, { name: string; count: number; totalValue: number }>();
    
    // Type-safe processing of top customers
    if (topCustomers) {
      topCustomers.forEach((ti: any) => {
        const customerId = ti.customer_id;
        const customerName = ti.customer?.full_name || 'Unknown';
        const value = ti.appraised_value || ti.estimated_value || 0;
        
        if (customerStats.has(customerId)) {
          const stats = customerStats.get(customerId)!;
          stats.count++;
          stats.totalValue += value;
        } else {
          customerStats.set(customerId, {
            name: customerName,
            count: 1,
            totalValue: value
          });
        }
      });
    }

    const topCustomersList = Array.from(customerStats.entries())
      .map(([customerId, stats]) => ({
        customer_id: customerId,
        customer_name: stats.name,
        total_trade_ins: stats.count,
        total_value: stats.totalValue
      }))
      .sort((a, b) => b.total_value - a.total_value)
      .slice(0, 10);

    // Calculate average processing time (simplified)
    const avgProcessingTime = 3.5; // This would need a more complex calculation

    return {
      total_trade_ins: analytics.total_trade_ins,
      total_value: analytics.total_value,
      pending_reviews: pendingReviews || 0,
      approved_this_month: approvedThisMonth || 0,
      total_credits_issued: totalCredits || 0,
      avg_processing_time: avgProcessingTime,
      recent_trade_ins: recentTradeIns || [],
      top_customers: topCustomersList
    };
  }

  // Bulk Operations
  async bulkUpdateTradeIns(tradeInIds: string[], updates: Partial<UpdateTradeInRequest>): Promise<{
    updated_count: number;
    failed_count: number;
    errors: Array<{ trade_in_id: string; error: string }>;
  }> {
    const { data, error } = await supabase
      .from('trade_ins')
      .update(updates)
      .in('id', tradeInIds)
      .select('id');

    if (error) {
      throw new Error(`Failed to bulk update trade-ins: ${error.message}`);
    }

    const updatedCount = data?.length || 0;
    const failedCount = tradeInIds.length - updatedCount;

    return {
      updated_count: updatedCount,
      failed_count: failedCount,
      errors: []
    };
  }

  // Utility Methods
  async getCustomerTradeInTotal(customerId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_customer_trade_in_total', {
      customer_uuid: customerId
    });

    if (error) {
      throw new Error(`Failed to get customer trade-in total: ${error.message}`);
    }

    return data || 0;
  }

  async getActiveCredits(customerId: string): Promise<TradeInCredit[]> {
    const { data: credits, error } = await supabase
      .from('trade_in_credits')
      .select(`
        *,
        trade_in:trade_ins!trade_in_credits_trade_in_id_fkey(
          id,
          item_type,
          description,
          customer_id
        )
      `)
      .eq('trade_in.customer_id', customerId)
      .eq('status', 'active')
      .gt('remaining_amount', 0)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get active credits: ${error.message}`);
    }

    return credits || [];
  }

  async getExpiringCredits(daysThreshold: number = 30): Promise<TradeInCredit[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const { data: credits, error } = await supabase
      .from('trade_in_credits')
      .select(`
        *,
        trade_in:trade_ins!trade_in_credits_trade_in_id_fkey(
          id,
          item_type,
          description,
          customer_id
        )
      `)
      .eq('status', 'active')
      .lt('expires_at', thresholdDate.toISOString())
      .gt('remaining_amount', 0)
      .order('expires_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get expiring credits: ${error.message}`);
    }

    return credits || [];
  }
}

export const tradeInService = new TradeInService(); 