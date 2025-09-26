export type ConsignmentStatus = 'active' | 'sold' | 'returned' | 'expired'
export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface Consignor {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  commission_rate: number
  status: string
  tax_id?: string
  bank_account_info?: {
    account_number?: string
    routing_number?: string
    account_type?: string
    bank_name?: string
  }
  notes?: string
  created_at: string
  updated_at: string
}

export interface ConsignedItem {
  id: string
  consignor_id: string
  name: string
  description?: string
  category?: string
  condition?: string
  price: number
  status: ConsignmentStatus
  date_received: string
  end_date: string
  date_sold?: string
  sale_price?: number
  settlement_id?: string
  photos: string[]
  appraisal_value?: number
  appraisal_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ConsignmentSettlement {
  id: string
  consignor_id: string
  total_amount: number
  commission_amount: number
  payout_amount: number
  status: SettlementStatus
  settlement_date?: string
  payment_method?: string
  payment_reference?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ConsignmentSettlementItem {
  id: string
  settlement_id: string
  item_id: string
  sale_price: number
  commission_amount: number
  payout_amount: number
  created_at: string
} 