import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import CustomerService from '@/lib/services/CustomerService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = await createSupabaseServerClient()
    const customerService = new CustomerService(supabase, 'default-tenant')

    // Get customer with full history
    const result = await customerService.getCustomerWithFullHistory(resolvedParams.id)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error: any) {
    console.error('Get customer error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    const customerService = new CustomerService(supabase, 'default-tenant')

    // Update customer
    const result = await customerService.update(resolvedParams.id, {
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      notes: body.notes,
      company: body.company
    })

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error: any) {
    console.error('Update customer error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = await createSupabaseServerClient()
    const customerService = new CustomerService(supabase, 'default-tenant')

    // Soft delete customer
    const result = await customerService.markCustomerInactive(resolvedParams.id)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete customer error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 