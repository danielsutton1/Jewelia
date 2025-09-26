import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const suppliers = await materialsService.listSuppliers(
      active ? active === 'true' : undefined
    );
    
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching material suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch material suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const supplier = await materialsService.createSupplier({
      name: body.name,
      contact_person: body.contact_person,
      email: body.email,
      phone: body.phone,
      address: body.address,
      website: body.website,
      payment_terms: body.payment_terms,
      lead_time_days: body.lead_time_days || 0,
      minimum_order_quantity: body.minimum_order_quantity,
      is_active: body.is_active !== undefined ? body.is_active : true
    });
    
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Error creating material supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create material supplier' },
      { status: 500 }
    );
  }
} 