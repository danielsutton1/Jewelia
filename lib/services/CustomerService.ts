import BaseService, { ServiceResponse } from './BaseService';
import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
  CustomerWithHistory,
  SpendingTier,
  CustomerPreferences,
} from '../types/service.types';

const CustomerSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export default class CustomerService extends BaseService<any> {
  protected endpoint = 'customers';
  protected schema = CustomerSchema;

  constructor(supabase: SupabaseClient, tenant_id: string) {
    super(supabase, tenant_id, 'customers');
  }

  /**
   * Create a customer with Zod validation.
   */
  async createCustomerWithValidation(payload: any): Promise<ServiceResponse<any>> {
    try {
      const parse = CustomerSchema.safeParse(payload);
      if (!parse.success) {
        return { data: null, error: JSON.stringify(parse.error.flatten()) };
      }
      return await this.create(parse.data);
    } catch (error: any) {
      this.logError('createCustomerWithValidation', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get customer with full history (orders, repairs, account balance).
   */
  async getCustomerWithFullHistory(id: string): Promise<ServiceResponse<CustomerWithHistory>> {
    try {
      // Fetch customer
      const { data: customer, error: customerError } = await this.findById(id);
      if (customerError || !customer) throw customerError || new Error('Customer not found');
      // Fetch orders
      const { data: orders, error: ordersError } = await this.supabase
        .from('orders')
        .select('*')
        .eq('customer_id', id)
        .eq('tenant_id', this.tenant_id);
      // Fetch repairs
      const { data: repairs, error: repairsError } = await this.supabase
        .from('repairs')
        .select('*')
        .eq('customer_id', id)
        .eq('tenant_id', this.tenant_id);
      // Fetch account balance
      const { data: ar, error: arError } = await this.supabase
        .from('accounts_receivable')
        .select('Balance')
        .eq('customer_id', id)
        .eq('tenant_id', this.tenant_id)
        .order('created_at', { ascending: false })
        .limit(1);
      const accountBalance = ar && ar.length > 0 ? ar[0].Balance : 0;
      if (ordersError || repairsError || arError) throw ordersError || repairsError || arError;
      return {
        data: {
          id: customer.id,
          full_name: customer.full_name,
          email: customer.email,
          phone: customer.phone,
          total_orders: orders?.length || 0,
          total_spent: (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0),
          last_order_date: orders && orders.length > 0 ? orders[0].created_at : '',
          account_balance: accountBalance,
          credit_limit: customer.credit_limit || 0,
          spending_tier: customer.spending_tier || 'NEW',
          payment_terms: customer.payment_terms || 'IMMEDIATE',
          orders: orders || [],
          repairs: repairs || [],
        },
        error: null,
      };
    } catch (error: any) {
      this.logError('getCustomerWithFullHistory', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update customer preferences.
   */
  async updateCustomerPreferences(id: string, preferences: CustomerPreferences): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .update({ preferences })
        .eq('id', id)
        .eq('tenant_id', this.tenant_id)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      this.logError('updateCustomerPreferences', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Calculate customer lifetime value (sum of all orders).
   */
  async calculateCustomerLifetimeValue(id: string): Promise<ServiceResponse<number>> {
    try {
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select('total_amount')
        .eq('customer_id', id)
        .eq('tenant_id', this.tenant_id);
      if (error) throw error;
      const total = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
      return { data: total, error: null };
    } catch (error: any) {
      this.logError('calculateCustomerLifetimeValue', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get customers by spending tier (VIP, regular, new).
   */
  async getCustomersBySpendingTier(tier: SpendingTier['tier']): Promise<ServiceResponse<any[]>> {
    try {
      // Example: define tiers by total spent
      let min = 0, max = Infinity;
      if (tier === 'VIP') min = 10000;
      else if (tier === 'REGULAR') { min = 1000; max = 9999; }
      else if (tier === 'NEW') max = 999;
      const { data, error } = await this.supabase.rpc('get_customers_by_spending', {
        tenant_id: this.tenant_id,
        min_spent: min,
        max_spent: max,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      this.logError('getCustomersBySpendingTier', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Mark customer as inactive (soft delete).
   */
  async markCustomerInactive(id: string): Promise<ServiceResponse<any>> {
    return this.softDelete(id);
  }
} 