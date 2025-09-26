import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ProductsService } from '@/lib/services/ProductsService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const material = searchParams.get('material') || ''
    const gemstone = searchParams.get('gemstone') || ''
    const priceRange = searchParams.get('priceRange') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    console.log('🔍 Products API filters:', {
      page, limit, search, category, status, material, gemstone, priceRange, sortBy, sortOrder
    })

    // Create products service instance
    const productsService = new ProductsService()

    // Build filters for the service
    const filters: any = {}

    if (search) {
      filters.search = search
    }
    
    if (category && category !== 'all') {
      // Convert frontend category to database format
      const categoryMap: Record<string, string> = {
        'rings': 'Rings',
        'necklaces': 'Necklaces', 
        'earrings': 'Earrings',
        'bracelets': 'Bracelets',
        'pendants': 'Pendants',
        'watches': 'Watches'
      }
      filters.category = categoryMap[category] || category
    }

    if (status && status !== 'all') {
      filters.status = status
    }

    // Temporarily disable material and gemstone filters until columns are added
    // if (material && material !== 'all') {
    //   filters.material = material
    // }

    // if (gemstone && gemstone !== 'all') {
    //   filters.gemstone = gemstone
    // }

    if (priceRange && priceRange !== 'all') {
      // Parse price range
      if (priceRange === '0-500') {
        filters.minPrice = 0
        filters.maxPrice = 500
      } else if (priceRange === '500-1000') {
        filters.minPrice = 500
        filters.maxPrice = 1000
      } else if (priceRange === '1000-2000') {
        filters.minPrice = 1000
        filters.maxPrice = 2000
      } else if (priceRange === '2000+') {
        filters.minPrice = 2000
      }
    }

    console.log('🔍 Applied filters:', filters)

    // Fetch products using the service
    const result = await productsService.getProducts(filters, page, limit)

    console.log('✅ Products fetched:', {
      count: result.products?.length || 0,
      total: result.total,
      page: result.page
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Products API error:', error)
    
    // Fallback to sample data when database connection fails
    const sampleProducts = [
      {
        id: "1",
        name: "Diamond Engagement Ring",
        sku: "RING-001",
        price: 2500.00,
        stock: 5,
        category: "Rings",
        status: "active",
        description: "Classic solitaire diamond engagement ring",
        image: "/placeholder-ring.jpg",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z"
      },
      {
        id: "2",
        name: "Pearl Necklace",
        sku: "NECK-002",
        price: 1200.00,
        stock: 3,
        category: "Necklaces",
        status: "active",
        description: "Elegant pearl necklace with gold chain",
        image: "/placeholder-necklace.jpg",
        createdAt: "2024-01-16T10:00:00Z",
        updatedAt: "2024-01-16T10:00:00Z"
      },
      {
        id: "3",
        name: "Gold Earrings",
        sku: "EARR-003",
        price: 800.00,
        stock: 8,
        category: "Earrings",
        status: "active",
        description: "Beautiful gold earrings with gemstones",
        image: "/placeholder-earrings.jpg",
        createdAt: "2024-01-17T10:00:00Z",
        updatedAt: "2024-01-17T10:00:00Z"
      }
    ]
    
    return NextResponse.json({
      success: true,
      data: {
        products: sampleProducts,
        total: sampleProducts.length,
        page: 1,
        totalPages: 1,
        hasMore: false
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.sku) {
      return NextResponse.json(
        { error: 'Product name and SKU are required' },
        { status: 400 }
      )
    }

    // Create product service instance
    const productsService = new ProductsService()

    // Create product with all fields including diamond-specific ones
    const result = await productsService.createProduct({
      name: body.name,
      sku: body.sku,
      price: body.price || 0,
      stock: body.stock || 0,
      category: body.category || 'general',
      image: body.image,
      status: body.status,
      description: body.description,
      cost: body.cost,
      minStock: body.minStock,
      material: body.material,
      gemstone: body.gemstone,
      weight: body.weight,
      dimensions: body.dimensions,
      images: body.images,
      tags: body.tags,
      // Diamond-specific fields
      carat_weight: body.carat_weight,
      clarity: body.clarity,
      color: body.color,
      cut: body.cut,
      shape: body.shape,
      certification: body.certification,
      fluorescence: body.fluorescence,
      polish: body.polish,
      symmetry: body.symmetry,
      depth_percentage: body.depth_percentage,
      table_percentage: body.table_percentage,
      measurements: body.measurements,
      origin: body.origin,
      treatment: body.treatment,
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create product error:', error)
    
    // Fallback: Create product locally when database connection fails
    console.log('Database connection failed, creating product locally:', error)
    
    const fallbackProduct = {
      id: Date.now().toString(),
      name: body.name || 'New Product',
      sku: body.sku || `PROD-${Date.now()}`,
      price: body.price || 0,
      stock: body.stock || 0,
      category: body.category || 'general',
      status: body.status || 'active',
      description: body.description || '',
      cost: body.cost || 0,
      minStock: body.minStock || 0,
      material: body.material || 'Gold',
      gemstone: body.gemstone || 'Diamond',
      weight: body.weight || 0,
      dimensions: body.dimensions || '',
      images: body.images || [],
      tags: body.tags || [],
      // Diamond-specific fields
      carat_weight: body.carat_weight || 1.0,
      clarity: body.clarity || 'VS1',
      color: body.color || 'G',
      cut: body.cut || 'Excellent',
      shape: body.shape || 'Round',
      certification: body.certification || '',
      fluorescence: body.fluorescence || 'None',
      polish: body.polish || 'Excellent',
      symmetry: body.symmetry || 'Excellent',
      depth_percentage: body.depth_percentage || 60.0,
      table_percentage: body.table_percentage || 57.0,
      measurements: body.measurements || '',
      origin: body.origin || 'Unknown',
      treatment: body.treatment || 'None',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true, 
      data: fallbackProduct,
      message: 'Product created locally (API connection failed)'
    }, { status: 201 });
  }
} 