import { NextRequest, NextResponse } from 'next/server'
import { RBACService } from '@/lib/services/RBACService'

const rbacService = new RBACService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'audit' // 'audit' or 'security'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const severity = searchParams.get('severity')

    if (type === 'security') {
      const events = await rbacService.getSecurityEvents(limit, offset, severity || undefined)
      
      return NextResponse.json({
        success: true,
        data: events,
        pagination: {
          limit,
          offset,
          total: events.length
        }
      })
    } else {
      const logs = await rbacService.getAuditLogs(limit, offset, userId || undefined, action || undefined)
      
      return NextResponse.json({
        success: true,
        data: logs,
        pagination: {
          limit,
          offset,
          total: logs.length
        }
      })
    }
  } catch (error: any) {
    console.error('Audit API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
