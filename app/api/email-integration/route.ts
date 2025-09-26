import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserContextFromRequest } from '@/lib/services/UserContextService'
import { z } from 'zod'

// =====================================================
// EMAIL INTEGRATION SETTINGS API
// =====================================================
// This endpoint manages email integration settings

const EmailIntegrationSchema = z.object({
  email_address: z.string().email('Invalid email address'),
  email_type: z.enum(['quotes', 'orders', 'repairs', 'communications', 'general']),
  is_active: z.boolean().default(true),
  auto_process: z.boolean().default(true),
  require_confirmation: z.boolean().default(false),
  notification_email: z.string().email().optional()
})

const UpdateEmailIntegrationSchema = EmailIntegrationSchema.partial().extend({
  id: z.string().uuid()
})

export async function GET(request: NextRequest) {
  try {
    // Get user context and validate access
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to access email integration settings'
      }, { status: 401 })
    }

    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get specific email integration
      const { data, error } = await supabase
        .from('email_integration_settings')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', userContext.tenantId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ 
            success: false,
            error: 'Email integration not found'
          }, { status: 404 })
        }
        throw error
      }

      return NextResponse.json({ 
        success: true,
        data: data
      })
    }

    // Get all email integrations for tenant
    const { data, error } = await supabase
      .from('email_integration_settings')
      .select('*')
      .eq('tenant_id', userContext.tenantId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      data: data || []
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user context and validate access
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to create email integration settings'
      }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = EmailIntegrationSchema.parse(body)

    const supabase = await createSupabaseServerClient()

    // Check if email address already exists
    const { data: existing } = await supabase
      .from('email_integration_settings')
      .select('id')
      .eq('email_address', validatedData.email_address)
      .single()

    if (existing) {
      return NextResponse.json({ 
        success: false,
        error: 'Email address is already configured for integration'
      }, { status: 400 })
    }

    // Create email integration setting
    const integrationData = {
      tenant_id: userContext.tenantId,
      user_id: userContext.user.id,
      email_address: validatedData.email_address,
      email_type: validatedData.email_type,
      is_active: validatedData.is_active,
      auto_process: validatedData.auto_process,
      require_confirmation: validatedData.require_confirmation,
      notification_email: validatedData.notification_email
    }

    const { data, error } = await supabase
      .from('email_integration_settings')
      .insert([integrationData])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      data: data,
      message: 'Email integration created successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user context and validate access
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to update email integration settings'
      }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = UpdateEmailIntegrationSchema.parse(body)

    const supabase = await createSupabaseServerClient()

    // Verify the integration belongs to the user's tenant
    const { data: existing } = await supabase
      .from('email_integration_settings')
      .select('id, tenant_id')
      .eq('id', validatedData.id)
      .eq('tenant_id', userContext.tenantId)
      .single()

    if (!existing) {
      return NextResponse.json({ 
        success: false,
        error: 'Email integration not found or access denied'
      }, { status: 404 })
    }

    // Update email integration
    const updateData: any = {}
    if (validatedData.email_address) updateData.email_address = validatedData.email_address
    if (validatedData.email_type) updateData.email_type = validatedData.email_type
    if (validatedData.is_active !== undefined) updateData.is_active = validatedData.is_active
    if (validatedData.auto_process !== undefined) updateData.auto_process = validatedData.auto_process
    if (validatedData.require_confirmation !== undefined) updateData.require_confirmation = validatedData.require_confirmation
    if (validatedData.notification_email !== undefined) updateData.notification_email = validatedData.notification_email

    const { data, error } = await supabase
      .from('email_integration_settings')
      .update(updateData)
      .eq('id', validatedData.id)
      .eq('tenant_id', userContext.tenantId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      data: data,
      message: 'Email integration updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user context and validate access
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to delete email integration settings'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'Email integration ID is required'
      }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Verify the integration belongs to the user's tenant
    const { data: existing } = await supabase
      .from('email_integration_settings')
      .select('id, tenant_id')
      .eq('id', id)
      .eq('tenant_id', userContext.tenantId)
      .single()

    if (!existing) {
      return NextResponse.json({ 
        success: false,
        error: 'Email integration not found or access denied'
      }, { status: 404 })
    }

    // Delete email integration
    const { error } = await supabase
      .from('email_integration_settings')
      .delete()
      .eq('id', id)
      .eq('tenant_id', userContext.tenantId)

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      message: 'Email integration deleted successfully'
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}
