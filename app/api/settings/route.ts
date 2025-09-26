import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SystemSettingsSchema = z.object({
  company_name: z.string().min(1),
  timezone: z.string().default('UTC'),
  currency: z.string().default('USD'),
  date_format: z.string().default('MM/DD/YYYY'),
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  auto_backup: z.boolean().default(true),
  backup_frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  max_file_size: z.number().default(10), // MB
  allowed_file_types: z.array(z.string()).default(['jpg', 'png', 'pdf', 'doc', 'docx']),
  session_timeout: z.number().default(30), // minutes
  two_factor_auth: z.boolean().default(false)
})

const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  language: z.string().default('en'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false)
  }),
  dashboard_layout: z.object({
    widgets: z.array(z.string()).default([]),
    columns: z.number().default(3)
  }),
  default_page_size: z.number().default(20),
  auto_refresh: z.boolean().default(true),
  refresh_interval: z.number().default(30) // seconds
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') || 'system' // system, user, all
    
    let data: any = {}
    
    if (type === 'system' || type === 'all') {
      // Get system settings
      const { data: systemSettings, error: systemError } = await supabase
        .from('system_settings')
        .select('*')
        .single()
      
      if (systemError && systemError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw systemError
      }
      
      data.system = systemSettings || {
        company_name: 'Jewelia CRM',
        timezone: 'UTC',
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        email_notifications: true,
        sms_notifications: false,
        auto_backup: true,
        backup_frequency: 'daily',
        max_file_size: 10,
        allowed_file_types: ['jpg', 'png', 'pdf', 'doc', 'docx'],
        session_timeout: 30,
        two_factor_auth: false
      }
    }
    
    if (type === 'user' || type === 'all') {
      // Get user preferences (this would be user-specific in a real app)
      const { data: userPreferences, error: userError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', 'current_user_id') // This should come from auth context
        .single()
      
      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }
      
      data.user = userPreferences || {
        theme: 'auto',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        dashboard_layout: {
          widgets: ['revenue', 'orders', 'customers', 'inventory'],
          columns: 3
        },
        default_page_size: 20,
        auto_refresh: true,
        refresh_interval: 30
      }
    }
    
    return NextResponse.json({
      success: true,
      data
    })
    
  } catch (error: any) {
    console.error('Settings API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    const { type, settings } = body
    
    if (!type || !settings) {
      return NextResponse.json({ error: 'Type and settings are required' }, { status: 400 })
    }
    
    let validatedSettings, tableName
    
    switch (type) {
      case 'system':
        const systemParse = SystemSettingsSchema.safeParse(settings)
        if (!systemParse.success) {
          return NextResponse.json({ 
            error: 'Invalid system settings',
            details: systemParse.error.flatten()
          }, { status: 400 })
        }
        validatedSettings = systemParse.data
        tableName = 'system_settings'
        break
        
      case 'user':
        const userParse = UserPreferencesSchema.safeParse(settings)
        if (!userParse.success) {
          return NextResponse.json({ 
            error: 'Invalid user preferences',
            details: userParse.error.flatten()
          }, { status: 400 })
        }
        validatedSettings = {
          ...userParse.data,
          user_id: 'current_user_id' // This should come from auth context
        }
        tableName = 'user_preferences'
        break
        
      default:
        return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 })
    }
    
    // Upsert settings
    const { data: savedSettings, error: saveError } = await supabase
      .from(tableName)
      .upsert([validatedSettings], { onConflict: 'id' })
      .select()
      .single()
    
    if (saveError) throw saveError
    
    return NextResponse.json({
      success: true,
      data: savedSettings,
      message: `${type} settings saved successfully`
    })
    
  } catch (error: any) {
    console.error('Save settings API error:', error)
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
    
    const { type, key, value } = body
    
    if (!type || !key || value === undefined) {
      return NextResponse.json({ error: 'Type, key, and value are required' }, { status: 400 })
    }
    
    let tableName, updateData
    
    switch (type) {
      case 'system':
        tableName = 'system_settings'
        updateData = { [key]: value, updated_at: new Date().toISOString() }
        break
        
      case 'user':
        tableName = 'user_preferences'
        updateData = { 
          [key]: value, 
          user_id: 'current_user_id', // This should come from auth context
          updated_at: new Date().toISOString() 
        }
        break
        
      default:
        return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 })
    }
    
    // Update specific setting
    const { data: updatedSettings, error: updateError } = await supabase
      .from(tableName)
      .upsert([updateData], { onConflict: 'id' })
      .select()
      .single()
    
    if (updateError) throw updateError
    
    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: `Setting ${key} updated successfully`
    })
    
  } catch (error: any) {
    console.error('Update setting API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 