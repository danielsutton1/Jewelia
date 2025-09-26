import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CheckInSchema = z.object({
  inventory_id: z.string().uuid(),
  quantity: z.number().positive(),
  location: z.string().min(1),
  notes: z.string().optional(),
  checked_by: z.string().min(1)
})

const CheckOutSchema = z.object({
  inventory_id: z.string().uuid(),
  quantity: z.number().positive(),
  assigned_to: z.string().min(1),
  purpose: z.string().min(1),
  expected_return: z.string().optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    // Validate request body
    const parse = CheckInSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: parse.error.flatten()
      }, { status: 400 })
    }
    
    const { inventory_id, quantity, location, notes, checked_by } = parse.data
    
    // Check if inventory item exists
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', inventory_id)
      .single()
    
    if (inventoryError || !inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }
    
    // Update inventory quantity
    const newQuantity = (inventoryItem.quantity || 0) + quantity
    
    const { data: updatedInventory, error: updateError } = await supabase
      .from('inventory')
      .update({ 
        quantity: newQuantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', inventory_id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    // Log the check-in activity
    const { error: logError } = await supabase
      .from('inventory_activity')
      .insert([{
        inventory_id,
        activity_type: 'check_in',
        quantity,
        location,
        notes,
        performed_by: checked_by,
        timestamp: new Date().toISOString()
      }])
    
    if (logError) throw logError
    
    return NextResponse.json({
      success: true,
      data: updatedInventory,
      message: `Successfully checked in ${quantity} items`
    })
    
  } catch (error: any) {
    console.error('Check-in API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    // Validate request body for check-out
    const parse = CheckOutSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: parse.error.flatten()
      }, { status: 400 })
    }
    
    const { inventory_id, quantity, assigned_to, purpose, expected_return, notes } = parse.data
    
    // Check if inventory item exists and has sufficient quantity
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', inventory_id)
      .single()
    
    if (inventoryError || !inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }
    
    if ((inventoryItem.quantity || 0) < quantity) {
      return NextResponse.json({ error: 'Insufficient inventory quantity' }, { status: 400 })
    }
    
    // Update inventory quantity
    const newQuantity = (inventoryItem.quantity || 0) - quantity
    
    const { data: updatedInventory, error: updateError } = await supabase
      .from('inventory')
      .update({ 
        quantity: newQuantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', inventory_id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    // Log the check-out activity
    const { error: logError } = await supabase
      .from('inventory_activity')
      .insert([{
        inventory_id,
        activity_type: 'check_out',
        quantity,
        assigned_to,
        purpose,
        expected_return,
        notes,
        timestamp: new Date().toISOString()
      }])
    
    if (logError) throw logError
    
    return NextResponse.json({
      success: true,
      data: updatedInventory,
      message: `Successfully checked out ${quantity} items`
    })
    
  } catch (error: any) {
    console.error('Check-out API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 