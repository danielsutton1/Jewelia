// Professional jewelry industry types

export interface OrderSummary {
  id: string;
  order_number?: string;
  date: string;
  total_amount: number;
  status: string;
}

export interface RepairSummary {
  id: string;
  repair_number?: string;
  date: string;
  status: string;
  cost: number;
}

export interface CustomerWithHistory {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  account_balance: number;
  credit_limit: number;
  spending_tier: 'NEW' | 'REGULAR' | 'VIP' | 'PREMIUM';
  payment_terms: 'IMMEDIATE' | 'NET_15' | 'NET_30';
  orders: OrderSummary[];
  repairs: RepairSummary[];
}

export interface InventoryWithStock {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  quantity_available: number;
  quantity_reserved: number;
  quantity_on_order: number;
  reorder_level: number;
  is_serialized: boolean;
  serial_numbers?: string[];
  last_updated: string;
}

export interface SpendingTier {
  tier: 'NEW' | 'REGULAR' | 'VIP' | 'PREMIUM';
  min_spent: number;
  credit_limit: number;
  discount_percentage: number;
  payment_terms: string;
}

export interface ProductionStage {
  stage: 'DESIGN' | 'CAD' | 'CASTING' | 'SETTING' | 'POLISHING' | 'QC' | 'COMPLETE';
  estimated_hours: number;
  required_skills: string[];
  next_stage?: string;
}

export interface CustomerPreferences {
  preferred_contact_method?: 'EMAIL' | 'PHONE' | 'SMS';
  preferred_categories?: string[];
  marketing_opt_in?: boolean;
} 