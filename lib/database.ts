import { supabase, supabaseAdmin } from './supabase'
// Re-export supabase for other modules to use
export { supabase }

import type { 
  Customer, 
  Inventory, 
  Order, 
  OrderItem, 
  Repair, 
  User,
  CommunicationThread,
  CommunicationMessage,
  CommunicationAttachment,
  NotificationPreference,
  CommunicationStatus,
  CommunicationType,
  MessageRead,
  CalendarEvent
} from '@/types/database'
import {
  Consignor,
  ConsignedItem,
  ConsignmentSettlement,
  ConsignmentSettlementItem,
  ConsignmentStatus,
  SettlementStatus
} from '@/types/consignment'
import { RepairItem, RepairPhoto, RepairEstimate, RepairHistory } from '@/types/repairs'

// Customer operations
export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, email, phone, address, notes, company, created_at, updated_at')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  // Map the database rows to match the Customer interface
  return (data || []).map(customer => ({
    id: customer.id,
    full_name: customer.name, // Map 'name' to 'full_name'
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    notes: customer.notes,
    company: customer.company,
    created_at: customer.created_at,
    updated_at: customer.updated_at
  }))
}

export const getCustomer = async (id: string) => {
  if (!id) {
    throw new Error('Customer ID is required')
  }

  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    // Use the customers API on the client side
    try {
      const response = await fetch(`/api/customers?id=${id}`)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Customer API response error:', response.status, errorText)
        throw new Error(`Failed to fetch customer: ${response.status} ${response.statusText}`)
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch customer')
      }
      if (!result.data || result.data.length === 0) {
        return null
      }
      // Return the first customer (since we're querying by ID, there should only be one)
      return result.data[0] || null
    } catch (error) {
      console.error('Error fetching customer via API:', error)
      throw error
    }
  }

  // Server-side: Use direct database access with admin privileges
  const client = supabaseAdmin || supabase
  
  const { data, error } = await client
    .from('customers')
    .select('id, name, email, phone, address, notes, company, created_at, updated_at')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Database error fetching customer:', error)
    throw error
  }
  
  // Map the database row to match the Customer interface
  return data ? {
    id: data.id,
    full_name: data.name, // Map 'name' to 'full_name'
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes,
    company: data.company,
    created_at: data.created_at,
    updated_at: data.updated_at
  } : null
}

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
  // Map frontend Customer interface to database columns
  const dbCustomer = {
    name: customer.full_name, // Map 'full_name' to 'name'
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    notes: customer.notes,
    company: customer.company
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([dbCustomer])
    .select('id, name, email, phone, address, notes, company, created_at, updated_at')
    .single()
  
  if (error) throw error
  
  // Map the database row to match the Customer interface
  return data ? {
    id: data.id,
    full_name: data.name, // Map 'name' to 'full_name'
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes,
    company: data.company,
    created_at: data.created_at,
    updated_at: data.updated_at
  } : null
}

export const updateCustomer = async (id: string, updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>) => {
  // Map frontend Customer interface to database columns
  const dbUpdates: any = {}
  if (updates.full_name) dbUpdates.name = updates.full_name
  if (updates.email) dbUpdates.email = updates.email
  if (updates.phone) dbUpdates.phone = updates.phone
  if (updates.address) dbUpdates.address = updates.address
  if (updates.notes) dbUpdates.notes = updates.notes
  if (updates.company) dbUpdates.company = updates.company

  const { data, error } = await supabase
    .from('customers')
    .update(dbUpdates)
    .eq('id', id)
    .select('id, name, email, phone, address, notes, company, created_at, updated_at')
    .single()
    
  if (error) throw error
  
  // Map the database row to match the Customer interface
  return data ? {
    id: data.id,
    full_name: data.name, // Map 'name' to 'full_name'
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes,
    company: data.company,
    created_at: data.created_at,
    updated_at: data.updated_at
  } : null
}

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Inventory operations
export const getInventory = async () => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Inventory[]
}

export const getInventoryItem = async (id: string) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Inventory
}

export const createInventoryItem = async (item: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('inventory')
    .insert([item])
    .select()
    .single()
  
  if (error) throw error
  return data as Inventory
}

export const updateInventoryItem = async (id: string, updates: Partial<Omit<Inventory, 'id' | 'created_at' | 'updated_at'>>) => {
  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Inventory
}

export const deleteInventoryItem = async (id: string) => {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Order operations
export const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data as (Order & { customer: Customer | null; items: OrderItem[] })[]
}

export const getOrder = async (id: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Order & { customer: Customer; items: OrderItem[] }
}

export const createOrder = async (
  order: Omit<Order, 'id' | 'created_at' | 'updated_at'>,
  items: Omit<OrderItem, 'id' | 'created_at' | 'order_id'>[]
) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single()
  
  if (error) throw error
  
  const orderItems = items.map(item => ({
    ...item,
    order_id: data.id
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) throw itemsError
  
  return data as Order
}

export const updateOrder = async (
  id: string,
  updates: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>,
  items: Omit<OrderItem, 'id' | 'created_at' | 'order_id'>[]
) => {
  // Update the order
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  // Delete existing order_items
  const { error: deleteError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', id)
  if (deleteError) throw deleteError

  // Insert new order_items
  const orderItems = items.map(item => ({ ...item, order_id: id }))
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  if (itemsError) throw itemsError

  return data as Order
}

export const deleteOrder = async (id: string) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Repair operations
export const getRepairs = async () => {
  const { data, error } = await supabase
    .from('repairs')
    .select(`
      *,
      customer:customers(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as (Repair & { customer: Customer })[]
}

export const getRepair = async (id: string) => {
  const { data, error } = await supabase
    .from('repairs')
    .select(`
      *,
      customer:customers(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Repair & { customer: Customer }
}

export const createRepair = async (repair: Omit<Repair, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('repairs')
    .insert([repair])
    .select()
    .single()
  
  if (error) throw error
  return data as Repair
}

export const updateRepair = async (id: string, updates: Partial<Omit<Repair, 'id' | 'created_at' | 'updated_at'>>) => {
  const { data, error } = await supabase
    .from('repairs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Repair
}

// Communication operations
export const getMessageReads = async (messageId: string) => {
  const { data, error } = await supabase
    .from('message_reads')
    .select('*, user:users(*)')
    .eq('message_id', messageId)
  if (error) throw error
  return data as (MessageRead & { user: User })[]
}

export const markMessageAsReadForUser = async (messageId: string, userId: string) => {
  const { data, error } = await supabase
    .from('message_reads')
    .upsert({
      message_id: messageId,
      user_id: userId,
      read_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data as MessageRead
}

export const getCommunicationThreads = async (filters?: {
  partnerId?: string
  orderId?: string
  status?: CommunicationStatus[]
  type?: CommunicationType[]
}) => {
  let query = supabase
    .from('communication_threads')
    .select(`
      *,
      partner:partners(*),
      assigned_to:users(*),
      messages:communication_messages(
        *,
        sender:users(*),
        attachments:communication_attachments(*),
        message_reads:message_reads(*, user:users(*))
      )
    `)
    .order('last_message_at', { ascending: false })

  if (filters?.partnerId) {
    query = query.eq('partner_id', filters.partnerId)
  }
  if (filters?.orderId) {
    query = query.eq('related_order_id', filters.orderId)
  }
  if (filters?.status?.length) {
    query = query.in('status', filters.status)
  }
  if (filters?.type?.length) {
    query = query.in('type', filters.type)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getCommunicationThread = async (id: string) => {
  const { data, error } = await supabase
    .from('communication_threads')
    .select(`
      *,
      partner:partners(*),
      assigned_to:users(*),
      messages:communication_messages(
        *,
        sender:users(*),
        attachments:communication_attachments(*),
        message_reads:message_reads(*, user:users(*))
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createCommunicationThread = async (thread: Omit<CommunicationThread, 'id' | 'created_at' | 'updated_at' | 'last_message_at'>) => {
  const { data, error } = await supabase
    .from('communication_threads')
    .insert([thread])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCommunicationThread = async (id: string, updates: Partial<Omit<CommunicationThread, 'id' | 'created_at' | 'updated_at' | 'last_message_at'>>) => {
  const { data, error } = await supabase
    .from('communication_threads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteCommunicationThread = async (id: string) => {
  const { error } = await supabase
    .from('communication_threads')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const createCommunicationMessage = async (message: Omit<CommunicationMessage, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('communication_messages')
    .insert([message])
    .select()
    .single()

  if (error) throw error
  return data
}

export const markMessageAsRead = async (messageId: string) => {
  const { error } = await supabase
    .from('communication_messages')
    .update({ is_read: true })
    .eq('id', messageId)

  if (error) throw error
}

export const uploadAttachment = async (file: File, messageId: string) => {
  // First upload the file to storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${messageId}/${Math.random()}.${fileExt}`
  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('attachments')
    .getPublicUrl(fileName)

  // Create the attachment record
  const attachment = {
    message_id: messageId,
    name: file.name,
    type: file.type,
    size: file.size,
    url: publicUrl
  }

  const { data, error } = await supabase
    .from('communication_attachments')
    .insert([attachment])
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteAttachment = async (attachmentId: string) => {
  const { error } = await supabase
    .from('communication_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) throw error
}

export const getNotificationPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data
}

export const updateNotificationPreferences = async (userId: string, type: CommunicationType, preferences: Partial<Omit<NotificationPreference, 'id' | 'user_id' | 'type' | 'created_at' | 'updated_at'>>) => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      type,
      ...preferences
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Calendar Events operations
export const getCalendarEvents = async (filters?: {
  start?: string
  end?: string
  category?: string
  created_by?: string
}) => {
  let query = supabase
    .from('calendar_events')
    .select('*')
    .order('start_time', { ascending: true })

  if (filters?.start) {
    query = query.gte('start_time', filters.start)
  }
  if (filters?.end) {
    query = query.lte('end_time', filters.end)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.created_by) {
    query = query.eq('created_by', filters.created_by)
  }

  const { data, error } = await query
  if (error) throw error
  return data as CalendarEvent[]
}

export const getCalendarEvent = async (id: string) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as CalendarEvent
}

export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert([event])
    .select()
    .single()
  if (error) throw error
  return data as CalendarEvent
}

export const updateCalendarEvent = async (id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>>) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as CalendarEvent
}

export const deleteCalendarEvent = async (id: string) => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Consignor operations
export const getConsignors = async () => {
  const { data, error } = await supabase
    .from('consignors')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data as Consignor[]
}

export const getConsignor = async (id: string) => {
  const { data, error } = await supabase
    .from('consignors')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Consignor
}

export const createConsignor = async (consignor: Omit<Consignor, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('consignors')
    .insert([consignor])
    .select()
    .single()
  
  if (error) throw error
  return data as Consignor
}

export const updateConsignor = async (id: string, consignor: Partial<Consignor>) => {
  const { data, error } = await supabase
    .from('consignors')
    .update(consignor)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Consignor
}

// Consigned items operations
export const getConsignedItems = async (filters?: {
  consignorId?: string
  status?: ConsignmentStatus[]
  category?: string[]
}) => {
  let query = supabase
    .from('consigned_items')
    .select(`
      *,
      consignor:consignors(*)
    `)
    .order('created_at', { ascending: false })

  if (filters?.consignorId) {
    query = query.eq('consignor_id', filters.consignorId)
  }
  if (filters?.status?.length) {
    query = query.in('status', filters.status)
  }
  if (filters?.category?.length) {
    query = query.in('category', filters.category)
  }

  const { data, error } = await query
  if (error) throw error
  return data as (ConsignedItem & { consignor: Consignor })[]
}

export const getConsignedItem = async (id: string) => {
  const { data, error } = await supabase
    .from('consigned_items')
    .select(`
      *,
      consignor:consignors(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as ConsignedItem & { consignor: Consignor }
}

export const createConsignedItem = async (item: Omit<ConsignedItem, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('consigned_items')
    .insert([item])
    .select()
    .single()
  
  if (error) throw error
  return data as ConsignedItem
}

export const updateConsignedItem = async (id: string, item: Partial<ConsignedItem>) => {
  const { data, error } = await supabase
    .from('consigned_items')
    .update(item)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as ConsignedItem
}

// Settlement operations
export const getSettlements = async (filters?: {
  consignorId?: string
  status?: SettlementStatus[]
}) => {
  let query = supabase
    .from('consignment_settlements')
    .select(`
      *,
      consignor:consignors(*),
      items:consignment_settlement_items(
        *,
        item:consigned_items(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.consignorId) {
    query = query.eq('consignor_id', filters.consignorId)
  }
  if (filters?.status?.length) {
    query = query.in('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as (ConsignmentSettlement & {
    consignor: Consignor
    items: (ConsignmentSettlementItem & { item: ConsignedItem })[]
  })[]
}

export const getSettlement = async (id: string) => {
  const { data, error } = await supabase
    .from('consignment_settlements')
    .select(`
      *,
      consignor:consignors(*),
      items:consignment_settlement_items(
        *,
        item:consigned_items(*)
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as ConsignmentSettlement & {
    consignor: Consignor
    items: (ConsignmentSettlementItem & { item: ConsignedItem })[]
  }
}

export const createSettlement = async (
  settlement: Omit<ConsignmentSettlement, 'id' | 'created_at' | 'updated_at'>,
  items: Omit<ConsignmentSettlementItem, 'id' | 'created_at'>[]
) => {
  const { data: settlementData, error: settlementError } = await supabase
    .from('consignment_settlements')
    .insert([settlement])
    .select()
    .single()
  
  if (settlementError) throw settlementError

  const settlementItems = items.map(item => ({
    ...item,
    settlement_id: settlementData.id
  }))

  const { error: itemsError } = await supabase
    .from('consignment_settlement_items')
    .insert(settlementItems)
  
  if (itemsError) throw itemsError

  return settlementData as ConsignmentSettlement
}

export const updateSettlement = async (id: string, settlement: Partial<ConsignmentSettlement>) => {
  const { data, error } = await supabase
    .from('consignment_settlements')
    .update(settlement)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as ConsignmentSettlement
}

// Repair Items
export async function getRepairItems(repairId: string): Promise<RepairItem[]> {
  const { data, error } = await supabase
    .from('repair_items')
    .select('*')
    .eq('repair_id', repairId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createRepairItem(item: Omit<RepairItem, 'id' | 'created_at' | 'updated_at'>): Promise<RepairItem> {
  const { data, error } = await supabase
    .from('repair_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRepairItem(id: string, item: Partial<RepairItem>): Promise<RepairItem> {
  const { data, error } = await supabase
    .from('repair_items')
    .update(item)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Repair Photos
export async function getRepairPhotos(repairId: string): Promise<RepairPhoto[]> {
  const { data, error } = await supabase
    .from('repair_photos')
    .select('*')
    .eq('repair_id', repairId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createRepairPhoto(photo: Omit<RepairPhoto, 'id' | 'created_at'>): Promise<RepairPhoto> {
  const { data, error } = await supabase
    .from('repair_photos')
    .insert(photo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRepairPhoto(id: string): Promise<void> {
  const { error } = await supabase
    .from('repair_photos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Repair Estimates
export async function getRepairEstimates(repairId: string): Promise<RepairEstimate[]> {
  const { data, error } = await supabase
    .from('repair_estimates')
    .select('*')
    .eq('repair_id', repairId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createRepairEstimate(estimate: Omit<RepairEstimate, 'id' | 'created_at' | 'updated_at'>): Promise<RepairEstimate> {
  const { data, error } = await supabase
    .from('repair_estimates')
    .insert(estimate)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRepairEstimate(id: string, estimate: Partial<RepairEstimate>): Promise<RepairEstimate> {
  const { data, error } = await supabase
    .from('repair_estimates')
    .update(estimate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Repair History
export async function getRepairHistory(repairId: string): Promise<RepairHistory[]> {
  const { data, error } = await supabase
    .from('repair_history')
    .select('*')
    .eq('repair_id', repairId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function addRepairHistoryEntry(entry: Omit<RepairHistory, 'id' | 'created_at'>): Promise<RepairHistory> {
  const { data, error } = await supabase
    .from('repair_history')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Enhanced Repair Functions
export async function getRepairWithDetails(id: string): Promise<Repair> {
  const { data: repair, error: repairError } = await supabase
    .from('repairs')
    .select('*')
    .eq('id', id)
    .single();

  if (repairError) throw repairError;

  const [items, photos, estimates, history] = await Promise.all([
    getRepairItems(id),
    getRepairPhotos(id),
    getRepairEstimates(id),
    getRepairHistory(id)
  ]);

  return {
    ...repair,
    items,
    photos,
    estimates,
    history
  };
}

// Agreement Template operations
export const getAgreementTemplates = async () => {
  const { data, error } = await supabase
    .from('consignment_agreement_templates')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createAgreementTemplate = async (template: { name: string; description: string; body: string }) => {
  const { data, error } = await supabase
    .from('consignment_agreement_templates')
    .insert([template])
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteAgreementTemplate = async (id: string) => {
  const { error } = await supabase
    .from('consignment_agreement_templates')
    .delete()
    .eq('id', id)
  if (error) throw error
} 