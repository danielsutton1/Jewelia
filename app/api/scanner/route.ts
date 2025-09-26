import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ScanSchema = z.object({
  code: z.string().min(1),
  scan_type: z.enum(['barcode', 'qr', 'sku']),
  action: z.enum(['lookup', 'check_in', 'check_out', 'update']).optional(),
  quantity: z.number().positive().optional(),
  location: z.string().optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    // Validate request body
    const parse = ScanSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: parse.error.flatten()
      }, { status: 400 })
    }
    
    const { code, scan_type, action = 'lookup', quantity, location, notes } = parse.data
    
    // Search for inventory item by different code types
    let query = supabase.from('inventory').select('*')
    
    switch (scan_type) {
      case 'barcode':
        query = query.eq('barcode', code)
        break
      case 'qr':
        query = query.eq('qr_code', code)
        break
      case 'sku':
        query = query.eq('sku', code)
        break
      default:
        // Try all fields
        query = query.or(`barcode.eq.${code},qr_code.eq.${code},sku.eq.${code}`)
    }
    
    const { data: inventoryItem, error: inventoryError } = await query.single()
    
    if (inventoryError || !inventoryItem) {
      return NextResponse.json({ 
        error: 'Item not found',
        scanned_code: code,
        scan_type
      }, { status: 404 })
    }
    
    // Handle different actions
    let result: any = { inventoryItem }
    let actionPerformed = 'lookup'
    
    if (action === 'check_in' && quantity) {
      const newQuantity = (inventoryItem.quantity || 0) + quantity
      const { data: updatedItem, error: updateError } = await supabase
        .from('inventory')
        .update({ 
          quantity: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', inventoryItem.id)
        .select()
        .single()
      
      if (updateError) throw updateError
      result = { inventoryItem: updatedItem }
      actionPerformed = 'checked_in'
    }
    
    if (action === 'check_out' && quantity) {
      if ((inventoryItem.quantity || 0) < quantity) {
        return NextResponse.json({ 
          error: 'Insufficient quantity',
          available: inventoryItem.quantity,
          requested: quantity
        }, { status: 400 })
      }
      
      const newQuantity = (inventoryItem.quantity || 0) - quantity
      const { data: updatedItem, error: updateError } = await supabase
        .from('inventory')
        .update({ 
          quantity: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', inventoryItem.id)
        .select()
        .single()
      
      if (updateError) throw updateError
      result = { inventoryItem: updatedItem }
      actionPerformed = 'checked_out'
    }
    
    // Log the scan activity
    const { error: logError } = await supabase
      .from('scan_logs')
      .insert([{
        inventory_id: inventoryItem.id,
        scanned_code: code,
        scan_type,
        action,
        quantity,
        location,
        notes,
        timestamp: new Date().toISOString()
      }])
    
    if (logError) {
      console.warn('Failed to log scan activity:', logError)
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      action: actionPerformed,
      message: `Successfully scanned ${scan_type}: ${code}`
    })
    
  } catch (error: any) {
    console.error('Scanner API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Get recent scan logs
    const { data: scanLogs, error: scanError } = await supabase
      .from('scan_logs')
      .select(`
        *,
        inventory (
          name,
          sku,
          barcode
        )
      `)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (scanError) throw scanError
    
    return NextResponse.json({
      success: true,
      data: scanLogs,
      pagination: {
        limit,
        offset,
        total: scanLogs?.length || 0
      }
    })
    
  } catch (error: any) {
    console.error('Scanner logs API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 