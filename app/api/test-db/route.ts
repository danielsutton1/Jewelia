import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Use raw SQL to check what tables exist (more reliable than information_schema)
    const { data, error } = await supabase.rpc('get_table_names')
    
    if (error) {
      // Fallback: try to query specific tables directly
      console.log('RPC failed, trying direct table queries...')
      
      const tables = []
      
      // Check for common messaging tables
      const messagingTables = [
        'messages', 'message_threads', 'message_attachments', 
        'message_reactions', 'message_read_receipts'
      ]
      
      for (const tableName of messagingTables) {
        try {
          const { error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          if (!tableError) {
            tables.push(tableName)
          }
        } catch (e) {
          // Table doesn't exist or accessible
        }
      }
      
      return NextResponse.json({
        success: true,
        data: {
          message_tables: tables,
          total_tables: tables.length,
          method: 'direct_query_fallback'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        message_tables: data || [],
        total_tables: data?.length || 0,
        method: 'rpc'
      }
    })

  } catch (error: any) {
    console.error('Database check error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to check database',
        details: error.message || 'Unknown error'
      }
    }, { status: 500 })
  }
}
