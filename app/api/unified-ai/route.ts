import { NextRequest, NextResponse } from 'next/server'
import { UnifiedAIService } from '@/lib/services/UnifiedAIService'

// =====================================================
// UNIFIED AI API
// =====================================================
// This endpoint provides centralized access to all AI features
// Consolidates messaging, analytics, recommendations, pricing, and more

export async function POST(request: NextRequest) {
  try {
    const service = new UnifiedAIService()
    const body = await request.json()

    const { action, ...params } = body

    switch (action) {
      case 'analyze_messaging':
        const messagingAnalysis = await service.analyzeMessaging(
          params.content || '',
          params.context || 'general',
          params.messageHistory || []
        )
        return NextResponse.json({
          success: true,
          data: messagingAnalysis
        })

      case 'analyze_analytics':
        const analyticsInsights = await service.analyzeAnalytics(
          params.data || {},
          params.context || 'general'
        )
        return NextResponse.json({
          success: true,
          data: analyticsInsights
        })

      case 'analyze_recommendations':
        const recommendationInsights = await service.analyzeRecommendations(
          params.userData || {},
          params.productData || {},
          params.context || 'general'
        )
        return NextResponse.json({
          success: true,
          data: recommendationInsights
        })

      case 'analyze_pricing':
        const pricingInsights = await service.analyzePricing(
          params.pricingData || {},
          params.marketData || {},
          params.context || 'general'
        )
        return NextResponse.json({
          success: true,
          data: pricingInsights
        })

      case 'analyze_customer':
        const customerInsights = await service.analyzeCustomer(
          params.customerData || {},
          params.behaviorData || {},
          params.context || 'general'
        )
        return NextResponse.json({
          success: true,
          data: customerInsights
        })

      case 'analyze_inventory':
        const inventoryInsights = await service.analyzeInventory(
          params.inventoryData || {},
          params.marketData || {},
          params.context || 'general'
        )
        return NextResponse.json({
          success: true,
          data: inventoryInsights
        })

      case 'custom_analysis':
        const customAnalysis = await service.analyzeData({
          type: params.type || 'analytics',
          data: params.data || {},
          context: params.context || 'general',
          options: params.options || {}
        })
        return NextResponse.json({
          success: true,
          data: customAnalysis
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in unified AI API:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process AI request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const service = new UnifiedAIService()
    const { searchParams } = new URL(request.url)

    const action = searchParams.get('action')

    switch (action) {
      case 'health_check':
        const status = service.getServiceStatus()
        return NextResponse.json({
          success: true,
          message: 'Unified AI Service is running',
          status,
          features: [
            'Messaging Analysis',
            'Analytics Insights',
            'Product Recommendations',
            'Pricing Strategy',
            'Customer Behavior',
            'Inventory Optimization',
            'Custom AI Analysis'
          ]
        })

      case 'capabilities':
        return NextResponse.json({
          success: true,
          capabilities: {
            messaging: {
              description: 'Analyze message tone, sentiment, and business impact',
              features: ['Tone Analysis', 'Sentiment Assessment', 'Urgency Detection', 'Response Templates']
            },
            analytics: {
              description: 'Extract insights from business data and analytics',
              features: ['Trend Analysis', 'Anomaly Detection', 'Opportunity Identification', 'Risk Assessment']
            },
            recommendations: {
              description: 'Generate personalized product and service recommendations',
              features: ['Personalization', 'Market Trends', 'Cross-sell Opportunities', 'Pricing Optimization']
            },
            pricing: {
              description: 'Analyze pricing strategies and market positioning',
              features: ['Market Analysis', 'Competitive Positioning', 'Risk Assessment', 'Optimization Suggestions']
            },
            customer: {
              description: 'Analyze customer behavior and preferences',
              features: ['Behavior Patterns', 'Preference Analysis', 'Lifetime Value', 'Churn Risk Assessment']
            },
            inventory: {
              description: 'Optimize inventory management and supply chain',
              features: ['Demand Forecasting', 'Stock Optimization', 'Seasonal Analysis', 'Risk Mitigation']
            }
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in unified AI API GET:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process AI request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
