// Mock data for tests - no React components or hooks
export const getMockInventorySharingData = () => ({
  inventorySharing: {
    id: 'test-sharing-id',
    inventory_id: 'test-inventory-id',
    owner_id: 'test-owner-id',
    is_shared: true,
    visibility_level: 'connections_only' as const,
    show_pricing: true,
    pricing_tier: 'retail' as const,
    b2b_enabled: false,
    b2b_minimum_order: undefined,
    b2b_payment_terms: undefined,
    b2b_shipping_terms: undefined,
    sharing_notes: 'Test sharing notes',
    created_at: '2025-01-26T00:00:00Z',
    updated_at: '2025-01-26T00:00:00Z',
  },
  
  sharedInventoryItem: {
    id: 'inv-001',
    name: 'Diamond Engagement Ring',
    description: 'Beautiful diamond engagement ring',
    category: 'Rings',
    price: 2500.00,
    cost: 1500.00,
    quantity: 1,
    sku: 'RING-001',
    status: 'available' as const,
    condition: 'excellent' as const,
    material: 'Gold',
    gemstone: 'Diamond',
    carat_weight: 1.0,
    color: 'D',
    clarity: 'VS1',
    cut: 'Excellent',
    certification: 'GIA',
    images: ['https://example.com/ring1.jpg'],
    tags: ['engagement', 'diamond', 'gold'],
    notes: 'Perfect for proposals',
    supplier: 'Diamond Co.',
    purchase_date: '2025-01-01',
    last_updated: '2025-01-26T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-26T00:00:00Z',
  },
  
  inventorySharingConnection: {
    id: 'conn-001',
    sharing_id: 'test-sharing-id',
    connected_user_id: 'user-002',
    status: 'active' as const,
    permissions: ['view', 'share'],
    created_at: '2025-01-26T00:00:00Z',
    updated_at: '2025-01-26T00:00:00Z',
  },
  
  inventorySharingRequest: {
    id: 'req-001',
    sharing_id: 'test-sharing-id',
    requester_id: 'user-003',
    status: 'pending' as const,
    message: 'I would like to share this inventory',
    created_at: '2025-01-26T00:00:00Z',
    updated_at: '2025-01-26T00:00:00Z',
  },
  
  inventorySharingAnalytics: {
    id: 'analytics-001',
    sharing_id: 'test-sharing-id',
    views: 15,
    shares: 3,
    requests: 2,
    connections: 1,
    last_viewed: '2025-01-26T00:00:00Z',
    created_at: '2025-01-26T00:00:00Z',
    updated_at: '2025-01-26T00:00:00Z',
  }
})

export const getMockApiResponses = () => ({
  aiRecommendations: {
    success: true,
    data: [
      {
        id: 'rec-001',
        type: 'inventory' as const,
        title: 'Diamond Engagement Ring',
        description: 'Perfect for romantic proposals',
        score: 85,
        reason: 'Matches your preferences for high-value jewelry',
        item: {
          id: 'inv-001',
          name: 'Diamond Engagement Ring',
          price: 2500,
          category: 'Rings',
          image: 'https://example.com/ring1.jpg'
        }
      },
      {
        id: 'rec-002',
        type: 'network' as const,
        title: 'Connect with Sarah Johnson',
        description: 'She has similar inventory and high engagement',
        score: 90,
        reason: 'High compatibility score and active sharing',
        item: {
          id: 'user-002',
          name: 'Sarah Johnson',
          company: 'Luxury Jewelers Inc.',
          connection_strength: 0.85
        }
      }
    ],
    error: null
  },
  
  inventorySharing: {
    success: true,
    data: {
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
    error: null
  },

  sharedInventory: {
    success: true,
    data: [
      {
        id: 'inv-001',
        name: 'Diamond Engagement Ring',
        sku: 'DER-001',
        category: 'Rings',
        price: 2500,
        quantity: 5,
        description: 'Beautiful diamond engagement ring',
        image: 'https://example.com/ring1.jpg',
        owner_id: 'user-001',
        created_at: '2025-01-26T10:00:00Z',
        updated_at: '2025-01-26T10:00:00Z'
      },
      {
        id: 'inv-002',
        name: 'Gold Necklace',
        sku: 'GN-002',
        category: 'Necklaces',
        price: 1200,
        quantity: 3,
        description: 'Elegant gold necklace',
        image: 'https://example.com/necklace1.jpg',
        owner_id: 'user-001',
        created_at: '2025-01-26T10:00:00Z',
        updated_at: '2025-01-26T10:00:00Z'
      },
      {
        id: 'inv-003',
        name: 'Silver Bracelet',
        sku: 'SB-003',
        category: 'Bracelets',
        price: 800,
        quantity: 8,
        description: 'Stylish silver bracelet',
        image: 'https://example.com/bracelet1.jpg',
        owner_id: 'user-001',
        created_at: '2025-01-26T10:00:00Z',
        updated_at: '2025-01-26T10:00:00Z'
      }
    ],
    error: null
  }
})
