import { CustomerWithHistory } from './service.types';

export interface CompleteOrderRequest {
  customer_id: string;
  items: OrderItem[];
  payment_method: 'CASH' | 'CREDIT_CARD' | 'CHECK' | 'ACCOUNT';
  special_instructions?: string;
  rush_order?: boolean;
  expected_delivery?: string;
}

export interface OrderItem {
  inventory_id: string;
  sku: string;
  quantity: number;
  unit_price: number;
  customization?: string;
  serial_number?: string;
}

export interface CustomerSummary {
  id: string;
  full_name: string;
  email: string;
  spending_tier: 'NEW' | 'REGULAR' | 'VIP' | 'PREMIUM';
  payment_terms: 'IMMEDIATE' | 'NET_15' | 'NET_30';
}

export interface ProcessedOrderItem extends OrderItem {
  total_price: number;
  discount_applied: number;
  production_stages: string[];
  estimated_completion: string;
}

export interface OrderTotals {
  subtotal: number;
  discounts: number;
  taxes: number;
  total: number;
  deposit_required: number;
  balance_due: number;
}

export interface PaymentInfo {
  method: 'CASH' | 'CREDIT_CARD' | 'CHECK' | 'ACCOUNT';
  amount_paid: number;
  payment_date: string;
  transaction_id?: string;
  credit_terms?: {
    due_date: string;
    minimum_payment: number;
  };
}

export interface ProductionSchedule {
  stage: string;
  assigned_to: string;
  estimated_start: string;
  estimated_completion: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
}

export interface OrderConfirmation {
  order_id: string;
  order_number: string;
  customer: CustomerSummary;
  items: ProcessedOrderItem[];
  totals: OrderTotals;
  payment_info: PaymentInfo;
  production_schedule: ProductionSchedule[];
  estimated_delivery: string;
}

export interface CreditValidationResult {
  approved: boolean;
  reason?: string;
  available_credit: number;
  current_balance: number;
  credit_limit: number;
}

export interface OrderStageUpdate {
  order_id: string;
  current_stage: string;
  next_stage: string;
  updated_by: string;
  notes?: string;
  estimated_completion?: string;
}

export interface OrderCancellation {
  order_id: string;
  reason: string;
  cancelled_by: string;
  refund_required: boolean;
  refund_amount?: number;
  inventory_released: boolean;
  production_cancelled: boolean;
  ar_reversed: boolean;
} 