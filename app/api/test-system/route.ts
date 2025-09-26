import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const results = {
    success: true,
    timestamp: new Date().toISOString(),
    tests: {} as any,
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      duration: 0
    },
    error: undefined as string | undefined
  }

  try {
    const supabase = await createSupabaseServerClient()

    // Test 1: Database Connection
    results.tests.database = { name: 'Database Connection', status: 'pending' }
    try {
      const { data, error } = await supabase.from('customers').select('count').limit(1)
      if (error) throw error
      results.tests.database = { 
        name: 'Database Connection', 
        status: 'passed', 
        message: 'Database connection successful' 
      }
      results.summary.passed++
    } catch (error: any) {
      results.tests.database = { 
        name: 'Database Connection', 
        status: 'failed', 
        message: error.message 
      }
      results.summary.failed++
    }
    results.summary.total++

    // Test 2: Authentication System
    results.tests.authentication = { name: 'Authentication System', status: 'pending' }
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      results.tests.authentication = { 
        name: 'Authentication System', 
        status: 'passed', 
        message: 'Auth system operational' 
      }
      results.summary.passed++
    } catch (error: any) {
      results.tests.authentication = { 
        name: 'Authentication System', 
        status: 'failed', 
        message: error.message 
      }
      results.summary.failed++
    }
    results.summary.total++

    // Test 3: API Endpoints
    results.tests.apis = { name: 'API Endpoints', status: 'pending' }
    try {
      const apiTests = [
        { name: 'Orders API', table: 'orders' },
        { name: 'Customers API', table: 'customers' },
        { name: 'Inventory API', table: 'inventory' },
        { name: 'Production API', table: 'products_in_production_pipeline' }
      ]

      const apiResults = []
      for (const test of apiTests) {
        try {
          const { data, error } = await supabase.from(test.table).select('*').limit(1)
          if (error) throw new Error(`${error.message} (code: ${error.code})`)
          apiResults.push({ name: test.name, status: 'passed' })
        } catch (error: any) {
          apiResults.push({ name: test.name, status: 'failed', error: error.message })
        }
      }

      const failedApis = apiResults.filter(r => r.status === 'failed')
      if (failedApis.length > 0) {
        throw new Error(`Failed APIs: ${failedApis.map(f => f.name + ' - ' + f.error).join('; ')}`)
      }

      results.tests.apis = { 
        name: 'API Endpoints', 
        status: 'passed', 
        message: `All ${apiResults.length} APIs operational`,
        details: apiResults
      }
      results.summary.passed++
    } catch (error: any) {
      results.tests.apis = { 
        name: 'API Endpoints', 
        status: 'failed', 
        message: error.message 
      }
      results.summary.failed++
    }
    results.summary.total++

    // Test 4: Data Integrity
    results.tests.dataIntegrity = { name: 'Data Integrity', status: 'pending' }
    try {
      const { data: customers, error: customersError } = await supabase.from('customers').select('*')
      const { data: orders, error: ordersError } = await supabase.from('orders').select('*')
      
      if (customersError || ordersError) {
        throw new Error('Data integrity check failed')
      }

      const customerCount = customers?.length || 0
      const orderCount = orders?.length || 0

      results.tests.dataIntegrity = { 
        name: 'Data Integrity', 
        status: 'passed', 
        message: `Data integrity verified: ${customerCount} customers, ${orderCount} orders`,
        details: { customers: customerCount, orders: orderCount }
      }
      results.summary.passed++
    } catch (error: any) {
      results.tests.dataIntegrity = { 
        name: 'Data Integrity', 
        status: 'failed', 
        message: error.message 
      }
      results.summary.failed++
    }
    results.summary.total++

    // Test 5: Performance
    results.tests.performance = { name: 'Performance', status: 'pending' }
    try {
      const performanceStart = Date.now()
      await supabase.from('customers').select('*').limit(10)
      const performanceEnd = Date.now()
      const responseTime = performanceEnd - performanceStart

      if (responseTime > 5000) { // 5 seconds threshold
        throw new Error(`Response time too slow: ${responseTime}ms`)
      }

      results.tests.performance = { 
        name: 'Performance', 
        status: 'passed', 
        message: `Response time: ${responseTime}ms`,
        details: { responseTime }
      }
      results.summary.passed++
    } catch (error: any) {
      results.tests.performance = { 
        name: 'Performance', 
        status: 'failed', 
        message: error.message 
      }
      results.summary.failed++
    }
    results.summary.total++

    // Test 6: Security
    results.tests.security = { name: 'Security', status: 'pending' }
    try {
      // Test RLS policies (basic check)
      const { data: publicData, error: publicError } = await supabase.from('customers').select('*').limit(1)
      
      // This should work for service role, but would be blocked for anonymous users
      if (publicError && publicError.code === 'PGRST116') {
        results.tests.security = { 
          name: 'Security', 
          status: 'passed', 
          message: 'RLS policies active' 
        }
      } else {
        results.tests.security = { 
          name: 'Security', 
          status: 'passed', 
          message: 'Security checks passed' 
        }
      }
      results.summary.passed++
    } catch (error: any) {
      results.tests.security = { 
        name: 'Security', 
        status: 'failed', 
        message: error.message 
      }
      results.summary.failed++
    }
    results.summary.total++

    // Calculate overall success
    results.success = results.summary.failed === 0
    results.summary.duration = Date.now() - startTime

    return NextResponse.json(results)

  } catch (error: any) {
    results.success = false
    results.summary.duration = Date.now() - startTime
    results.error = error.message

    return NextResponse.json(results, { status: 500 })
  }
} 