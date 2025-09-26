import { getMockInventorySharingData } from './mock-data'

// Mock Supabase client that behaves like the real one
export class MockSupabaseClient {
  private data: Map<string, any[]> = new Map()
  
  public auth: MockAuth
  public realtime: MockRealtime

  constructor() {
    this.initializeMockData()
    this.auth = new MockAuth()
    this.realtime = new MockRealtime()
  }


  from(table: string) {
    return new MockQueryBuilder(table, this.data)
  }

  private initializeMockData() {
    // Initialize with realistic data that matches our schema
    this.data.set('message_threads', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Thread',
        type: 'direct',
        created_by: '550e8400-e29b-41d4-a716-446655440000',
        created_at: '2025-01-26T10:00:00Z',
        updated_at: '2025-01-26T10:00:00Z',
        last_message_at: '2025-01-26T10:30:00Z',
        is_active: true,
        metadata: {}
      }
    ])

    this.data.set('messages', [
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        thread_id: '550e8400-e29b-41d4-a716-446655440001',
        sender_id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'This is a test message',
        message_type: 'text',
        created_at: '2025-01-26T10:30:00Z',
        updated_at: '2025-01-26T10:30:00Z',
        is_edited: false,
        is_deleted: false,
        metadata: {}
      }
    ])

    this.data.set('message_read_receipts', [
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        message_id: '550e8400-e29b-41d4-a716-446655440002',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        read_at: '2025-01-26T10:31:00Z',
        thread_id: '550e8400-e29b-41d4-a716-446655440001'
      }
    ])

    this.data.set('message_notifications', [
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        message_id: '550e8400-e29b-41d4-a716-446655440002',
        thread_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'message',
        is_read: false,
        created_at: '2025-01-26T10:30:00Z'
      }
    ])

    this.data.set('message_reactions', [
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        message_id: '550e8400-e29b-41d4-a716-446655440002',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        emoji: '👍',
        created_at: '2025-01-26T10:32:00Z'
      }
    ])

    this.data.set('message_attachments', [
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        message_id: '550e8400-e29b-41d4-a716-446655440002',
        file_name: 'test.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        file_url: 'https://example.com/test.pdf',
        created_at: '2025-01-26T10:30:00Z'
      }
    ])

    this.data.set('inventory_sharing', [
      {
        id: 'sharing-001',
        inventory_id: 'inv-001',
        owner_id: 'user-001',
        is_shared: true,
        visibility_level: 'connections_only',
        show_pricing: true,
        pricing_tier: 'retail',
        b2b_enabled: false,
        b2b_minimum_order: null,
        b2b_payment_terms: null,
        b2b_shipping_terms: null,
        sharing_notes: 'Professional jewelry for network sharing',
        created_at: '2025-01-26T10:00:00Z',
        updated_at: '2025-01-26T10:00:00Z',
      },
      {
        id: 'sharing-002',
        inventory_id: 'inv-002',
        owner_id: 'user-001',
        is_shared: true,
        visibility_level: 'public',
        show_pricing: false,
        pricing_tier: 'wholesale',
        b2b_enabled: true,
        b2b_minimum_order: 1000,
        b2b_payment_terms: 'Net 30',
        b2b_shipping_terms: 'FOB Origin',
        sharing_notes: 'B2B wholesale items',
        created_at: '2025-01-26T11:00:00Z',
        updated_at: '2025-01-26T11:00:00Z',
      }
    ])

    this.data.set('inventory_sharing_connections', [
      {
        id: 'conn-001',
        sharing_id: 'sharing-001',
        viewer_id: 'user-002',
        connection_type: 'connection',
        can_view_pricing: true,
        can_view_quantity: true,
        can_request_quote: true,
        can_place_order: false,
        custom_price: null,
        custom_discount_percent: null,
        created_at: '2025-01-26T12:00:00Z',
        updated_at: '2025-01-26T12:00:00Z',
      }
    ])

    this.data.set('inventory_sharing_requests', [
      {
        id: 'req-001',
        requester_id: 'user-002',
        owner_id: 'user-001',
        inventory_id: 'inv-001',
        request_type: 'quote',
        status: 'pending',
        message: 'Interested in bulk pricing for this item',
        requested_quantity: 5,
        requested_price: null,
        response_message: null,
        response_price: null,
        response_quantity: null,
        expires_at: null,
        created_at: '2025-01-26T13:00:00Z',
        updated_at: '2025-01-26T13:00:00Z',
      }
    ])

    this.data.set('inventory_sharing_analytics', [
      {
        id: 'analytics-001',
        sharing_id: 'sharing-001',
        viewer_id: 'user-002',
        action_type: 'view',
        action_details: { duration: 45, source: 'search' },
        created_at: '2025-01-26T14:00:00Z',
      }
    ])

    this.data.set('inventory', [
      {
        id: 'inv-001',
        name: 'Diamond Engagement Ring',
        sku: 'RING-001',
        category: 'Rings',
        subcategory: 'Engagement Rings',
        metal_type: 'White Gold',
        gemstone_type: 'Diamond',
        weight: 2.5,
        price: 8500,
        cost: 4250,
        quantity: 3,
        description: 'Beautiful 2.5 carat diamond engagement ring in white gold',
        images: ['ring-001-1.jpg', 'ring-001-2.jpg'],
        is_active: true,
        created_at: '2025-01-26T09:00:00Z',
        updated_at: '2025-01-26T09:00:00Z',
      },
      {
        id: 'inv-002',
        name: 'Sapphire Necklace',
        sku: 'NECK-001',
        category: 'Necklaces',
        subcategory: 'Pendant Necklaces',
        metal_type: 'Yellow Gold',
        gemstone_type: 'Sapphire',
        weight: 1.8,
        price: 3200,
        cost: 1600,
        quantity: 7,
        description: 'Elegant sapphire pendant necklace in yellow gold',
        images: ['neck-001-1.jpg'],
        is_active: true,
        created_at: '2025-01-26T09:30:00Z',
        updated_at: '2025-01-26T09:30:00Z',
      }
    ])

    this.data.set('users', [
      {
        id: 'user-001',
        email: 'jewelry@example.com',
        full_name: 'Jewelry Professional',
        company: 'Elite Jewelers',
        role: 'jewelry_professional',
        avatar_url: 'avatar-001.jpg',
        created_at: '2025-01-26T08:00:00Z',
        updated_at: '2025-01-26T08:00:00Z',
      },
      {
        id: 'user-002',
        email: 'buyer@example.com',
        full_name: 'Professional Buyer',
        company: 'Luxury Retail',
        role: 'jewelry_professional',
        avatar_url: 'avatar-002.jpg',
        created_at: '2025-01-26T08:30:00Z',
        updated_at: '2025-01-26T08:30:00Z',
      }
    ])

    // Add shared_inventory_view for AI recommendations performance tests
    const sharedInventoryItems = []
    for (let i = 1; i <= 1000; i++) {
      sharedInventoryItems.push({
        id: `inv-${i.toString().padStart(3, '0')}`,
        name: `Jewelry Item ${i}`,
        sku: `SKU-${i.toString().padStart(3, '0')}`,
        category: ['Rings', 'Necklaces', 'Bracelets', 'Earrings'][i % 4],
        subcategory: `Sub Category ${i % 10}`,
        metal_type: ['Gold', 'Silver', 'Platinum', 'Rose Gold'][i % 4],
        gemstone_type: ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'None'][i % 5],
        weight: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
        price: Math.round((Math.random() * 5000 + 100) * 100) / 100,
        cost: Math.round((Math.random() * 2500 + 50) * 100) / 100,
        quantity: Math.floor(Math.random() * 20) + 1,
        description: `High-quality jewelry item ${i} with excellent craftsmanship`,
        images: [`item-${i}-1.jpg`],
        is_shared: true,
        is_active: true,
        owner_id: i % 2 === 0 ? 'user-002' : 'user-003', // Exclude user-001 for recommendations
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        
        // Additional fields that might be in the view
        sharing_settings: {
          visibility_level: 'connections_only',
          show_pricing: true,
          allow_quotes: true
        },
        owner_name: i % 2 === 0 ? 'Professional Buyer' : 'Another Professional',
        owner_company: i % 2 === 0 ? 'Luxury Retail' : 'Premium Jewelers'
      })
    }
    
    this.data.set('shared_inventory_view', sharedInventoryItems)

    // Add inventory_sharing_analytics_summary for trending recommendations
    const analyticsData = []
    for (let i = 1; i <= 200; i++) {
      analyticsData.push({
        id: `analytics-${i}`,
        inventory_id: `inv-${i.toString().padStart(3, '0')}`,
        total_views: Math.floor(Math.random() * 1000) + 100,
        total_requests: Math.floor(Math.random() * 50) + 5,
        total_quotes: Math.floor(Math.random() * 20) + 1,
        total_orders: Math.floor(Math.random() * 5),
        average_view_time: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
        bounce_rate: Math.round((Math.random() * 0.5 + 0.2) * 100) / 100, // 0.2-0.7
        conversion_rate: Math.round((Math.random() * 0.1 + 0.01) * 100) / 100, // 0.01-0.11
        last_updated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
    
    this.data.set('inventory_sharing_analytics_summary', analyticsData)
  }



  // Helper method for tests to access/modify data
  getMockData(table: string) {
    return this.data.get(table) || []
  }

  setMockData(table: string, data: any[]) {
    this.data.set(table, data)
  }

  clearMockData() {
    this.data.clear()
    this.initializeMockData()
  }
}

class MockAuth {
  public admin: MockAuthAdmin

  constructor() {
    this.admin = new MockAuthAdmin()
  }

  getUser() {
    return Promise.resolve({
      data: { user: { id: 'user-001', email: 'test@example.com' } },
      error: null
    })
  }

  getSession() {
    return Promise.resolve({
      data: { session: { user: { id: 'user-001', email: 'test@example.com' } } },
      error: null
    })
  }

  signUp({ email, password }: { email: string; password: string }) {
    return Promise.resolve({
      data: { 
        user: { 
          id: `550e8400-e29b-41d4-a716-446655440000`, 
          email, 
          created_at: new Date().toISOString() 
        } 
      },
      error: null
    })
  }

  signInWithPassword({ email, password }: { email: string; password: string }) {
    return Promise.resolve({
      data: { 
        user: { 
          id: `user-${Date.now()}`, 
          email, 
          created_at: new Date().toISOString() 
        },
        session: {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000
        }
      },
      error: null
    })
  }

  signOut() {
    return Promise.resolve({ error: null })
  }
}

class MockAuthAdmin {
  deleteUser(userId: string) {
    return Promise.resolve({ error: null })
  }
}

class MockQueryBuilder {
  private table: string
  private data: Map<string, any[]>
  private filters: Array<{ column: string; operator: string; value: any }> = []
  private selectColumns: string[] = ['*']
  private orderByColumn?: string
  private orderByDirection?: 'asc' | 'desc'
  private limitCount?: number
  private offsetCount?: number
  public _insertedItems: any[] | null = null
  public _updateData: any | null = null
  public _deleteMode: boolean = false

  constructor(table: string, data: Map<string, any[]>) {
    this.table = table
    this.data = data
  }

  select(columns: string = '*') {
    this.selectColumns = columns === '*' ? ['*'] : columns.split(',').map(col => col.trim())
    return this
  }

  insert(data: any | any[]) {
    console.log('MockQueryBuilder.insert called with:', data)
    const items = Array.isArray(data) ? data : [data]
    const tableData = this.data.get(this.table) || []
    const insertedItems: any[] = []

    items.forEach(item => {
      const newItem = {
        id: this.generateUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...item
      }
      // Add default fields for specific tables
      const itemWithDefaults = this.addDefaultFields(newItem, this.table)
      tableData.push(itemWithDefaults)
      insertedItems.push(itemWithDefaults)
    })

    this.data.set(this.table, tableData)

    console.log('MockQueryBuilder.insert returning:', insertedItems)
    
    // Return a new MockQueryBuilder that can be chained with select()
    const chainedBuilder = new MockQueryBuilder(this.table, this.data)
    chainedBuilder._insertedItems = insertedItems
    console.log('MockQueryBuilder.insert chainedBuilder._insertedItems:', chainedBuilder._insertedItems)
    return chainedBuilder
  }

  update(data: any) {
    console.log('MockQueryBuilder.update called with:', data)
    // Return a new MockQueryBuilder that can be chained with eq()
    const chainedBuilder = new MockQueryBuilder(this.table, this.data)
    chainedBuilder._updateData = data
    console.log('MockQueryBuilder.update returning chainedBuilder with _updateData:', chainedBuilder._updateData)
    return chainedBuilder
  }

  delete() {
    console.log('MockQueryBuilder.delete called')
    // Return a new MockQueryBuilder that can be chained with eq()
    const chainedBuilder = new MockQueryBuilder(this.table, this.data)
    chainedBuilder._deleteMode = true
    console.log('MockQueryBuilder.delete returning chainedBuilder with _deleteMode:', chainedBuilder._deleteMode)
    return chainedBuilder
  }

  upsert(data: any | any[]) {
    console.log('MockQueryBuilder.upsert called with:', data)
    const items = Array.isArray(data) ? data : [data]
    const tableData = this.data.get(this.table) || []
    
    items.forEach(item => {
      // Check if item already exists (by id or other unique fields)
      const existingIndex = tableData.findIndex(existing => 
        existing.id === item.id || 
        (item.message_id && existing.message_id === item.message_id)
      )
      
      if (existingIndex >= 0) {
        // Update existing item
        tableData[existingIndex] = {
          ...tableData[existingIndex],
          ...item,
          updated_at: new Date().toISOString()
        }
      } else {
        // Insert new item
        const newItem = {
          id: this.generateUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item
        }
        tableData.push(newItem)
      }
    })
    
    this.data.set(this.table, tableData)
    
    return Promise.resolve({
      data: items,
      error: null
    })
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Helper method to add default fields to inserted items
  private addDefaultFields(item: any, table: string) {
    const defaults: Record<string, any> = {
      message_threads: {
        is_active: true,
        last_message_at: new Date().toISOString()
      },
      messages: {
        is_read: false,
        status: 'sent'
      }
    }
    
    return { ...item, ...(defaults[table] || {}) }
  }


  delete() {
    const tableData = this.data.get(this.table) || []
    const deletedItems: any[] = []
    
    for (let i = tableData.length - 1; i >= 0; i--) {
      const item = tableData[i]
      let shouldDelete = true
      
      // Apply filters
      for (const filter of this.filters) {
        if (filter.operator === 'eq' && item[filter.column] !== filter.value) {
          shouldDelete = false
          break
        }
      }
      
      if (shouldDelete) {
        deletedItems.push(item)
        tableData.splice(i, 1)
      }
    }
    
    this.data.set(this.table, tableData)
    
    return Promise.resolve({
      data: deletedItems,
      error: null
    })
  }

  eq(column: string, value: any) {
    // Add to filters for chaining
    this.filters.push({ type: 'eq', field: column, value })
    
    // Return this for chaining - the update will be performed when the chain is awaited
    return this
  }

  or(condition: string) {
    // Parse OR conditions like "partner_a.eq.userId,partner_b.eq.userId"
    const conditions = condition.split(',').map(c => c.trim())
    this.filters.push({ type: 'or', conditions })
    return this
  }

  overlaps(column: string, values: any[]) {
    this.filters.push({ type: 'overlaps', field: column, values })
    return this
  }

  in(column: string, values: any[]) {
    this.filters.push({ type: 'in', field: column, values })
    return this
  }

  // Add a then method to handle the final execution when the chain is awaited
  then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
    console.log('MockQueryBuilder.then called with:', { updateData: this._updateData, filters: this.filters })
    // If we have update data, perform the update operation
    if (this._updateData) {
      console.log('MockQueryBuilder.then performing update with:', { updateData: this._updateData, filters: this.filters })
      const tableData = this.data.get(this.table) || []
      const updatedItems: any[] = []
      
      tableData.forEach((item, index) => {
        // Check all existing filters
        let shouldUpdate = true
        for (const filter of this.filters) {
          if (filter.operator === 'eq' && item[filter.column] !== filter.value) {
            shouldUpdate = false
            break
          }
        }
        
        if (shouldUpdate) {
          const updatedItem = { ...item, ...this._updateData, updated_at: new Date().toISOString() }
          tableData[index] = updatedItem
          updatedItems.push(updatedItem)
        } else {
          updatedItems.push(item)
        }
      })
      
      this.data.set(this.table, tableData)
      
      const result = {
        data: updatedItems.filter(item => {
          // Check all filters
          for (const filter of this.filters) {
            if (filter.type === 'eq' && item[filter.field] !== filter.value) {
              return false
            }
            if (filter.type === 'or') {
              // OR conditions: at least one condition must be true
              const orResult = filter.conditions.some((condition: string) => {
                const [field, operator, value] = condition.split('.')
                switch (operator) {
                  case 'eq':
                    return item[field] === value
                  case 'neq':
                    return item[field] !== value
                  case 'gt':
                    return item[field] > value
                  case 'gte':
                    return item[field] >= value
                  case 'lt':
                    return item[field] < value
                  case 'lte':
                    return item[field] <= value
                  default:
                    return false
                }
              })
              if (!orResult) {
                return false
              }
            }
            if (filter.type === 'overlaps') {
              // Check if arrays have any overlapping elements
              const itemArray = Array.isArray(item[filter.field]) ? item[filter.field] : []
              const hasOverlap = filter.values.some(value => itemArray.includes(value))
              if (!hasOverlap) {
                return false
              }
            }
            if (filter.type === 'in') {
              // Check if value is in the provided array
              if (!filter.values.includes(item[filter.field])) {
                return false
              }
            }
          }
          return true
        }),
        error: null
      }
      
      if (onFulfilled) {
        return Promise.resolve(onFulfilled(result))
      }
      return Promise.resolve(result)
    }
    
    // For select operations, return the filtered data
    const tableData = this.data.get(this.table) || []
    const filteredData = tableData.filter(item => {
      for (const filter of this.filters) {
        if (filter.type === 'eq' && item[filter.field] !== filter.value) {
          return false
        }
        if (filter.type === 'or') {
          // OR conditions: at least one condition must be true
          const orResult = filter.conditions.some((condition: string) => {
            const [field, operator, value] = condition.split('.')
            switch (operator) {
              case 'eq':
                return item[field] === value
              case 'neq':
                return item[field] !== value
              case 'gt':
                return item[field] > value
              case 'gte':
                return item[field] >= value
              case 'lt':
                return item[field] < value
              case 'lte':
                return item[field] <= value
              default:
                return false
            }
          })
          if (!orResult) {
            return false
          }
        }
        if (filter.type === 'overlaps') {
          // Check if arrays have any overlapping elements
          const itemArray = Array.isArray(item[filter.field]) ? item[filter.field] : []
          const hasOverlap = filter.values.some(value => itemArray.includes(value))
          if (!hasOverlap) {
            return false
          }
        }
        if (filter.type === 'in') {
          // Check if value is in the provided array
          if (!filter.values.includes(item[filter.field])) {
            return false
          }
        }
      }
      return true
    })
    
    const result = { data: filteredData, error: null }
    if (onFulfilled) {
      return Promise.resolve(onFulfilled(result))
    }
    return Promise.resolve(result)
  }

  neq(column: string, value: any) {
    this.filters.push({ column, operator: 'neq', value })
    return this
  }

  gt(column: string, value: any) {
    this.filters.push({ column, operator: 'gt', value })
    return this
  }

  gte(column: string, value: any) {
    this.filters.push({ column, operator: 'gte', value })
    return this
  }

  lt(column: string, value: any) {
    this.filters.push({ column, operator: 'lt', value })
    return this
  }

  lte(column: string, value: any) {
    this.filters.push({ column, operator: 'lte', value })
    return this
  }

  like(column: string, pattern: string) {
    this.filters.push({ column, operator: 'like', value: pattern })
    return this
  }

  ilike(column: string, pattern: string) {
    this.filters.push({ column, operator: 'ilike', value: pattern })
    return this
  }

  in(column: string, values: any[]) {
    this.filters.push({ column, operator: 'in', value: values })
    return this
  }

  is(column: string, value: any) {
    this.filters.push({ column, operator: 'is', value })
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderByColumn = column
    this.orderByDirection = options?.ascending === false ? 'desc' : 'asc'
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  range(from: number, to: number) {
    this.offsetCount = from
    this.limitCount = to - from + 1
    return this
  }

  single() {
    console.log('MockQueryBuilder.single called, _insertedItems:', this._insertedItems)
    // If we have inserted items from a previous insert() call, return the first one
    if (this._insertedItems && this._insertedItems.length > 0) {
      console.log('MockQueryBuilder.single returning inserted item:', this._insertedItems[0])
      return Promise.resolve({
        data: this._insertedItems[0],
        error: null
      })
    }
    
    return this.then((result: any) => {
      if (result.data && result.data.length > 0) {
        return { data: result.data[0], error: null }
      }
      return { data: null, error: null }
    })
  }

}

class MockRealtime {
  channel(name: string) {
    return new MockRealtimeChannel(name)
  }

  removeAllChannels() {
    return this
  }
}

class MockRealtimeChannel {
  constructor(private name: string) {}

  on(event: string, callback: Function) {
    return this
  }

  subscribe() {
    return this
  }

  unsubscribe() {
    return this
  }
}

class MockSupabaseQuery {
  private filters: any[] = []
  private selectFields: string[] = ['*']
  private orderByField: string | null = null
  private orderDirection: 'asc' | 'desc' = 'asc'
  private limitValue: number | null = null
  private offsetValue: number | null = null

  constructor(private client: MockSupabaseClient, private table: string) {}

  select(fields: string = '*') {
    this.selectFields = fields === '*' ? ['*'] : fields.split(',').map(f => f.trim())
    return this
  }

  eq(field: string, value: any) {
    this.filters.push({ type: 'eq', field, value })
    return this
  }

  neq(field: string, value: any) {
    this.filters.push({ type: 'neq', field, value })
    return this
  }

  gt(field: string, value: any) {
    this.filters.push({ type: 'gt', field, value })
    return this
  }

  gte(field: string, value: any) {
    this.filters.push({ type: 'gte', field, value })
    return this
  }

  lt(field: string, value: any) {
    this.filters.push({ type: 'lt', field, value })
    return this
  }

  lte(field: string, value: any) {
    this.filters.push({ type: 'lte', field, value })
    return this
  }

  like(field: string, value: string) {
    this.filters.push({ type: 'like', field, value })
    return this
  }

  ilike(field: string, value: string) {
    this.filters.push({ type: 'ilike', field, value })
    return this
  }

  in(field: string, values: any[]) {
    this.filters.push({ type: 'in', field, values })
    return this
  }

  or(condition: string) {
    // Parse OR conditions like "partner_a.eq.userId,partner_b.eq.userId"
    const conditions = condition.split(',').map(c => c.trim())
    this.filters.push({ type: 'or', conditions })
    return this
  }

  order(field: string, direction: 'asc' | 'desc' = 'asc') {
    this.orderByField = field
    this.orderDirection = direction
    return this
  }

  limit(value: number) {
    this.limitValue = value
    return this
  }

  range(start: number, end: number) {
    this.offsetValue = start
    this.limitValue = end - start + 1
    console.log('MockQueryBuilder.range called with:', { start, end, offsetValue: this.offsetValue, limitValue: this.limitValue })
    return this.execute()
  }

  single() {
    const result = this.executeQuery()
    return Promise.resolve({
      data: result.length > 0 ? result[0] : null,
      error: null
    })
  }

  async execute() {
    const result = this.executeQuery()
    console.log('MockQueryBuilder.execute called, result length:', result.length)
    return Promise.resolve({
      data: result,
      error: null,
      count: result.length
    })
  }

  private executeQuery() {
    let data = this.client.getMockData(this.table)

    // Apply filters
    data = data.filter(item => {
      return this.filters.every(filter => {
        switch (filter.type) {
          case 'eq':
            return item[filter.field] === filter.value
          case 'neq':
            return item[filter.field] !== filter.value
          case 'gt':
            return item[filter.field] > filter.value
          case 'gte':
            return item[filter.field] >= filter.value
          case 'lt':
            return item[filter.field] < filter.value
          case 'lte':
            return item[filter.field] <= filter.value
          case 'like':
            return String(item[filter.field]).includes(filter.value)
          case 'ilike':
            return String(item[filter.field]).toLowerCase().includes(filter.value.toLowerCase())
          case 'in':
            return filter.values.includes(item[filter.field])
          case 'or':
            // OR conditions: at least one condition must be true
            return filter.conditions.some((condition: string) => {
              const [field, operator, value] = condition.split('.')
              switch (operator) {
                case 'eq':
                  return item[field] === value
                case 'neq':
                  return item[field] !== value
                case 'gt':
                  return item[field] > value
                case 'gte':
                  return item[field] >= value
                case 'lt':
                  return item[field] < value
                case 'lte':
                  return item[field] <= value
                default:
                  return false
              }
            })
          default:
            return true
        }
      })
    })

    // Apply ordering
    if (this.orderByField) {
      data.sort((a, b) => {
        const aVal = a[this.orderByField!]
        const bVal = b[this.orderByField!]
        if (this.orderDirection === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    }

    // Apply pagination
    if (this.offsetValue !== null) {
      data = data.slice(this.offsetValue)
    }
    if (this.limitValue !== null) {
      data = data.slice(0, this.limitValue)
    }

    // Apply field selection
    if (!this.selectFields.includes('*')) {
      data = data.map(item => {
        const selected: any = {}
        this.selectFields.forEach(field => {
          if (item.hasOwnProperty(field)) {
            selected[field] = item[field]
          }
        })
        return selected
      })
    }

    return data
  }

  // Insert operations
  insert(values: any) {
    const tableData = this.client.getMockData(this.table)
    const newItem = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...values
    }
    
    tableData.push(newItem)
    this.client.setMockData(this.table, tableData)
    
    return {
      select: (fields: string = '*') => ({
        single: () => Promise.resolve({ data: newItem, error: null })
      })
    }
  }

  // Update operations
  update(values: any) {
    const tableData = this.client.getMockData(this.table)
    const updatedData = tableData.map(item => {
      if (this.filters.every(filter => {
        switch (filter.type) {
          case 'eq':
            return item[filter.field] === filter.value
          default:
            return true
        }
      })) {
        return {
          ...item,
          ...values,
          updated_at: new Date().toISOString()
        }
      }
      return item
    })
    
    this.client.setMockData(this.table, updatedData)
    
    return {
      select: (fields: string = '*') => ({
        single: () => Promise.resolve({ 
          data: updatedData.find(item => this.filters.every(filter => {
            switch (filter.type) {
              case 'eq':
                return item[filter.field] === filter.value
              default:
                return true
            }
          })) || null, 
          error: null 
        })
      })
    }
  }

  // Delete operations
  delete() {
    const tableData = this.client.getMockData(this.table)
    const filteredData = tableData.filter(item => {
      return !this.filters.every(filter => {
        switch (filter.type) {
          case 'eq':
            return item[filter.field] === filter.value
          default:
            return true
        }
      })
    })
    
    this.client.setMockData(this.table, filteredData)
    
    return Promise.resolve({ error: null })
  }
}

// Factory function to create mock Supabase client
export function createMockSupabaseClient() {
  console.log('createMockSupabaseClient called - returning MockSupabaseClient')
  return new MockSupabaseClient()
}

// Export the mock data for use in tests
export { getMockInventorySharingData }
