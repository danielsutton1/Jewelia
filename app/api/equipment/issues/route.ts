import { NextRequest, NextResponse } from 'next/server';
import { EquipmentManagementService } from '../../../../lib/services/EquipmentManagementService';
import { CreateIssueRequest } from '../../../../types/equipment';

const equipmentService = new EquipmentManagementService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const equipment_id = searchParams.get('equipment_id') || undefined;
    const issue_type = searchParams.get('issue_type') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const status = searchParams.get('status') || undefined;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;

    const filters = {
      equipment_id,
      issue_type,
      severity,
      status,
      start_date,
      end_date
    };

    const issues = await equipmentService.getIssueHistory(equipment_id, filters);

    return NextResponse.json({
      success: true,
      data: issues
    });
  } catch (error) {
    console.error('Error in equipment issues GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issue history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateIssueRequest = await request.json();

    // Validate required fields
    if (!body.equipment_id || !body.issue_type || !body.title) {
      return NextResponse.json(
        { success: false, error: 'Equipment ID, issue type, and title are required' },
        { status: 400 }
      );
    }

    const issue = await equipmentService.reportIssue(body);

    return NextResponse.json({
      success: true,
      data: issue
    }, { status: 201 });
  } catch (error) {
    console.error('Error in equipment issues POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to report issue' },
      { status: 500 }
    );
  }
} 