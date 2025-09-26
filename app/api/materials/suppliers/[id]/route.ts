import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    
    const supplier = await materialsService.updateSupplier(id, {
      name: body.name,
      contact_person: body.contact_person,
      email: body.email,
      phone: body.phone,
      address: body.address,
      website: body.website,
      payment_terms: body.payment_terms,
      lead_time_days: body.lead_time_days,
      minimum_order_quantity: body.minimum_order_quantity,
      is_active: body.is_active
    });
    
    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error updating material supplier:', error);
    return NextResponse.json(
      { error: 'Failed to update material supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await materialsService.deleteSupplier(id);
    
    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting material supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete material supplier' },
      { status: 500 }
    );
  }
} 