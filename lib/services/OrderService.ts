import { SupabaseClient } from '@supabase/supabase-js';
import BaseService, { ServiceResponse } from './BaseService';
import CustomerService from './CustomerService';
import { InventoryService } from './InventoryService';
import {
  CompleteOrderRequest,
  OrderItem,
  OrderConfirmation,
  CreditValidationResult,
  OrderStageUpdate,
  OrderCancellation,
  ProcessedOrderItem,
  OrderTotals,
  PaymentInfo,
  ProductionSchedule,
} from '../types/order.types';
import { CustomerWithHistory } from '../types/service.types';
import { z } from 'zod';

const OrderSchema = z.object({
  customer_id: z.string(),
  total_amount: z.number(),
  payment_method: z.string(),
  special_instructions: z.string().optional(),
  rush_order: z.boolean().optional(),
  expected_delivery: z.string().optional(),
});

export default class OrderService extends BaseService<any> {
  protected endpoint = 'orders';
  protected schema = OrderSchema;
  
  private customerService: CustomerService;
  private inventoryService: InventoryService;

  constructor(supabase: SupabaseClient, tenant_id: string) {
    super(supabase, tenant_id, 'orders');
    this.customerService = new CustomerService(supabase, tenant_id);
    this.inventoryService = new InventoryService();
  }

  /**
   * Process a complete order with all necessary validations and updates.
   */
  async processCompleteOrder(orderData: CompleteOrderRequest): Promise<ServiceResponse<OrderConfirmation>> {
    try {
      // 1. Validate customer and credit
      const creditValidation = await this.validateCustomerCredit(
        orderData.customer_id,
        orderData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
      );
      if (!creditValidation.data?.approved) {
        return { data: null, error: creditValidation.data?.reason || 'Credit validation failed' };
      }

      // 2. Check inventory availability
      for (const item of orderData.items) {
        const availability = await this.inventoryService.checkProductAvailability(
          item.inventory_id,
          item.quantity
        );
        if (!availability.data) {
          return { data: null, error: `Insufficient stock for item ${item.sku}` };
        }
      }

      // 3. Calculate order total
      const totalsResponse = await this.calculateOrderTotal(orderData.items, orderData.customer_id);
      if (!totalsResponse.data) {
        return { data: null, error: totalsResponse.error || 'Failed to calculate order total' };
      }
      const totals = totalsResponse.data;

      // 4. Create order record
      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .insert([{
          customer_id: orderData.customer_id,
          total_amount: totals.total,
          payment_method: orderData.payment_method,
          special_instructions: orderData.special_instructions,
          rush_order: orderData.rush_order,
          expected_delivery: orderData.expected_delivery,
          tenant_id: this.tenant_id,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 5. Create order items
      const processedItems: ProcessedOrderItem[] = [];
      for (const item of orderData.items) {
        // Reserve inventory
        await this.inventoryService.reserveInventoryForOrder(item.inventory_id, item.quantity);

        // Create order item
        const { data: orderItem, error: itemError } = await this.supabase
          .from('order_items')
          .insert([{
            order_id: order.id,
            inventory_id: item.inventory_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            customization: item.customization,
            serial_number: item.serial_number,
            tenant_id: this.tenant_id,
          }])
          .select()
          .single();

        if (itemError) throw itemError;
        processedItems.push({
          ...item,
          total_price: item.unit_price * item.quantity,
          discount_applied: 0, // Calculate based on customer tier
          production_stages: [], // Will be populated by createProductionTasks
          estimated_completion: '', // Will be populated by createProductionTasks
        });
      }

      // 6. Create production tasks
      const productionSchedule = await this.createProductionTasks(order.id);
      if (!productionSchedule.data) {
        return { data: null, error: productionSchedule.error || 'Failed to create production tasks' };
      }

      // 7. Update accounts receivable if on credit terms
      if (orderData.payment_method === 'ACCOUNT') {
        await this.supabase.from('accounts_receivable').insert([{
          order_id: order.id,
          customer_id: orderData.customer_id,
          amount: totals.total,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          tenant_id: this.tenant_id,
        }]);
      }

      // 8. Generate order confirmation
      const customer = await this.customerService.findById(orderData.customer_id);
      if (!customer.data) throw new Error('Customer not found');

      const confirmation: OrderConfirmation = {
        order_id: order.id,
        order_number: `ORD-${order.id.slice(0, 8)}`,
        customer: {
          id: customer.data.id,
          full_name: customer.data.full_name,
          email: customer.data.email,
          spending_tier: customer.data.spending_tier,
          payment_terms: customer.data.payment_terms,
        },
        items: processedItems,
        totals,
        payment_info: {
          method: orderData.payment_method,
          amount_paid: orderData.payment_method === 'ACCOUNT' ? 0 : totals.total,
          payment_date: new Date().toISOString(),
          credit_terms: orderData.payment_method === 'ACCOUNT' ? {
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            minimum_payment: totals.total * 0.1, // 10% minimum payment
          } : undefined,
        },
        production_schedule: productionSchedule.data,
        estimated_delivery: orderData.expected_delivery || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Default 14 days
      };

      return { data: confirmation, error: null };
    } catch (error: any) {
      this.logError('processCompleteOrder', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Validate customer credit for an order.
   */
  async validateCustomerCredit(customerId: string, orderAmount: number): Promise<ServiceResponse<CreditValidationResult>> {
    try {
      const { data: customer, error } = await this.customerService.findById(customerId);
      if (error || !customer) throw error || new Error('Customer not found');

      const currentBalance = customer.account_balance || 0;
      const creditLimit = customer.credit_limit || 0;
      const availableCredit = creditLimit - currentBalance;

      const result: CreditValidationResult = {
        approved: orderAmount <= availableCredit,
        available_credit: availableCredit,
        current_balance: currentBalance,
        credit_limit: creditLimit,
      };

      if (!result.approved) {
        result.reason = `Insufficient credit. Available: $${availableCredit}, Required: $${orderAmount}`;
      }

      return { data: result, error: null };
    } catch (error: any) {
      this.logError('validateCustomerCredit', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Calculate order total with customer discounts and taxes.
   */
  async calculateOrderTotal(items: OrderItem[], customerId: string): Promise<ServiceResponse<OrderTotals>> {
    try {
      const { data: customer, error } = await this.customerService.findById(customerId);
      if (error || !customer) throw error || new Error('Customer not found');

      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

      // Apply customer tier discounts
      let discountPercentage = 0;
      switch (customer.spending_tier) {
        case 'VIP':
          discountPercentage = 0.05; // 5%
          break;
        case 'PREMIUM':
          discountPercentage = 0.10; // 10%
          break;
      }
      const discounts = subtotal * discountPercentage;

      // Calculate taxes (example: 8.5%)
      const taxableAmount = subtotal - discounts;
      const taxes = taxableAmount * 0.085;

      // Calculate total
      const total = taxableAmount + taxes;

      // Calculate deposit (example: 30% for custom orders)
      const depositRequired = total * 0.3;
      const balanceDue = total - depositRequired;

      return {
        data: {
          subtotal,
          discounts,
          taxes,
          total,
          deposit_required: depositRequired,
          balance_due: balanceDue,
        },
        error: null,
      };
    } catch (error: any) {
      this.logError('calculateOrderTotal', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Create production tasks for an order.
   */
  async createProductionTasks(orderId: string): Promise<ServiceResponse<ProductionSchedule[]>> {
    try {
      // Get order items
      const { data: items, error: itemsError } = await this.supabase
        .from('order_items')
        .select('*, inventory(*)')
        .eq('order_id', orderId)
        .eq('tenant_id', this.tenant_id);

      if (itemsError) throw itemsError;

      const schedule: ProductionSchedule[] = [];
      const stages = ['DESIGN', 'CAD', 'CASTING', 'SETTING', 'POLISHING', 'QC'];

      // Create production pipeline entries
      for (const item of items || []) {
        for (const stage of stages) {
          // Find available employee for this stage
          const { data: employee, error: employeeError } = await this.supabase
            .from('employees')
            .select('id')
            .eq('specialization', stage)
            .eq('tenant_id', this.tenant_id)
            .eq('status', 'ACTIVE')
            .limit(1)
            .single();

          if (employeeError) throw employeeError;

          // Create production task
          const { data: task, error: taskError } = await this.supabase
            .from('production_tasks')
            .insert([{
              order_id: orderId,
              order_item_id: item.id,
              stage,
              assigned_to: employee?.id,
              estimated_start: new Date().toISOString(),
              estimated_completion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
              status: 'PENDING',
              tenant_id: this.tenant_id,
            }])
            .select()
            .single();

          if (taskError) throw taskError;

          schedule.push({
            stage,
            assigned_to: employee?.id || '',
            estimated_start: task.estimated_start,
            estimated_completion: task.estimated_completion,
            status: 'PENDING',
          });
        }
      }

      return { data: schedule, error: null };
    } catch (error: any) {
      this.logError('createProductionTasks', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update order production stage.
   */
  async updateOrderStage(update: OrderStageUpdate): Promise<ServiceResponse<OrderStageUpdate>> {
    try {
      // Update production status
      const { error: statusError } = await this.supabase
        .from('orders')
        .update({ production_status: update.next_stage })
        .eq('id', update.order_id)
        .eq('tenant_id', this.tenant_id);

      if (statusError) throw statusError;

      // Update tasks
      const { error: tasksError } = await this.supabase
        .from('production_tasks')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        })
        .eq('order_id', update.order_id)
        .eq('stage', update.current_stage)
        .eq('tenant_id', this.tenant_id);

      if (tasksError) throw tasksError;

      // Create new tasks for next stage
      await this.createProductionTasks(update.order_id);

      // Send notification (implement your notification system)
      // await this.notificationService.sendStageUpdateNotification(update);

      return { data: update, error: null };
    } catch (error: any) {
      this.logError('updateOrderStage', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Handle order cancellation.
   */
  async handleOrderCancellation(cancellation: OrderCancellation): Promise<ServiceResponse<OrderCancellation>> {
    try {
      // Get order items
      const { data: items, error: itemsError } = await this.supabase
        .from('order_items')
        .select('*')
        .eq('order_id', cancellation.order_id)
        .eq('tenant_id', this.tenant_id);

      if (itemsError) throw itemsError;

      // Release inventory reservations
      for (const item of items || []) {
        await this.inventoryService.releaseInventoryReservation(
          item.inventory_id,
          item.quantity
        );
      }

      // Reverse accounts receivable if exists
      const { error: arError } = await this.supabase
        .from('accounts_receivable')
        .delete()
        .eq('order_id', cancellation.order_id)
        .eq('tenant_id', this.tenant_id);

      if (arError) throw arError;

      // Cancel production tasks
      const { error: tasksError } = await this.supabase
        .from('production_tasks')
        .update({ status: 'CANCELLED' })
        .eq('order_id', cancellation.order_id)
        .eq('tenant_id', this.tenant_id);

      if (tasksError) throw tasksError;

      // Update order status
      const { error: orderError } = await this.supabase
        .from('orders')
        .update({
          status: 'CANCELLED',
          cancellation_reason: cancellation.reason,
          cancelled_at: new Date().toISOString(),
          cancelled_by: cancellation.cancelled_by,
        })
        .eq('id', cancellation.order_id)
        .eq('tenant_id', this.tenant_id);

      if (orderError) throw orderError;

      return {
        data: {
          ...cancellation,
          inventory_released: true,
          production_cancelled: true,
          ar_reversed: true,
        },
        error: null,
      };
    } catch (error: any) {
      this.logError('handleOrderCancellation', error);
      return { data: null, error: error.message };
    }
  }
} 