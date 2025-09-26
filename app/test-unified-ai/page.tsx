"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Brain,
  Sparkles,
  MessageSquare,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Send,
  BarChart3,
  Users,
  Package,
  DollarSign,
  Settings
} from 'lucide-react'

export default function TestUnifiedAIPage() {
  const [activeTab, setActiveTab] = useState('messaging')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [inputData, setInputData] = useState({
    messaging: {
      content: 'Hello! I am interested in purchasing 2kg of 18k gold for our jewelry collection. Can you provide pricing and availability?',
      context: 'Customer inquiry about precious metals',
      messageHistory: []
    },
    analytics: {
      data: {
        revenue: 150000,
        orders: 45,
        customers: 23,
        growth: 12.5
      },
      context: 'Q4 Business Performance'
    },
    recommendations: {
      userData: {
        preferences: ['rings', 'gold', 'diamonds'],
        budget: '5000-15000',
        style: 'classic'
      },
      productData: {
        category: 'rings',
        metal: '18k gold',
        gemstone: 'diamond',
        price: 8500
      },
      context: 'Wedding Ring Recommendation'
    },
    pricing: {
      pricingData: {
        cost: 6000,
        currentPrice: 8500,
        competitorPrices: [8000, 9000, 7500]
      },
      marketData: {
        demand: 'high',
        supply: 'limited',
        trend: 'increasing'
      },
      context: 'Gold Ring Pricing Strategy'
    },
    customer: {
      customerData: {
        name: 'John Smith',
        totalSpent: 25000,
        orders: 8,
        lastOrder: '2024-01-15'
      },
      behaviorData: {
        preferredCategories: ['rings', 'necklaces'],
        averageOrderValue: 3125,
        responseTime: '2.3 days'
      },
      context: 'VIP Customer Analysis'
    },
    inventory: {
      inventoryData: {
        currentStock: 150,
        reorderPoint: 50,
        leadTime: '3 weeks',
        demand: 'steady'
      },
      marketData: {
        marketTrend: 'stable',
        supplierReliability: 'high',
        priceVolatility: 'medium'
      },
      context: 'Gold Inventory Management'
    }
  })

  const handleAnalysis = async (type: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/unified-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `analyze_${type}`,
          ...inputData[type as keyof typeof inputData]
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResults({ type, data: data.data })
      } else {
        throw new Error('Analysis failed')
      }
    } catch (error) {
      console.error('Error:', error)
      setResults({ type, error: 'Analysis failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomAnalysis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/unified-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'custom_analysis',
          type: 'analytics',
          data: { custom: 'data' },
          context: 'Custom Analysis',
          options: { model: 'gpt-4', maxTokens: 300 }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResults({ type: 'custom', data: data.data })
      } else {
        throw new Error('Custom analysis failed')
      }
    } catch (error) {
      console.error('Error:', error)
      setResults({ type: 'custom', error: 'Custom analysis failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const updateInput = (type: string, field: string, value: any) => {
    setInputData(prev => ({
      ...prev,
      [type]: {
        ...prev[type as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const renderResults = () => {
    if (!results) return null

    if (results.error) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>Error: {results.error}</span>
            </div>
          </CardContent>
        </Card>
      )
    }

    const { type, data } = results

    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-6 w-6" />
            <span>{type.charAt(0).toUpperCase() + type.slice(1)} Analysis Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {type === 'messaging' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Tone & Sentiment</h4>
                  <div className="space-y-2">
                    <Badge variant="outline" className="bg-white text-green-800">
                      Tone: {data.tone}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-green-800">
                      Sentiment: {data.sentiment}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-green-800">
                      Urgency: {data.urgency}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-green-800">
                      Impact: {data.businessImpact}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Suggested Actions</h4>
                  <ul className="text-sm space-y-1">
                    {data.suggestedActions?.map((action: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {type === 'analytics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-white rounded border">
                      <div className="text-2xl font-bold text-green-600">{String(value)}</div>
                      <div className="text-sm text-gray-600 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  <ul className="text-sm space-y-1">
                    {data.trends?.map((trend: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span>{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {type === 'recommendations' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Personalization Factors</h4>
                    <ul className="text-sm space-y-1">
                      {data.personalizationFactors?.map((factor: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cross-sell Opportunities</h4>
                    <ul className="text-sm space-y-1">
                      {data.crossSellOpportunities?.map((opportunity: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-green-600" />
                          <span>{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {type === 'pricing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Market Analysis</h4>
                    <p className="text-sm">{data.marketPosition}</p>
                    <p className="text-sm">{data.competitiveAnalysis}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Strategy & Risk</h4>
                    <p className="text-sm">{data.pricingStrategy}</p>
                    <p className="text-sm">{data.riskAssessment}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Optimization Suggestions</h4>
                  <ul className="text-sm space-y-1">
                    {data.optimizationSuggestions?.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {type === 'customer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Behavior Patterns</h4>
                    <ul className="text-sm space-y-1">
                      {data.behaviorPatterns?.map((pattern: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-green-600" />
                          <span>{pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Engagement Opportunities</h4>
                    <ul className="text-sm space-y-1">
                      {data.engagementOpportunities?.map((opportunity: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Lightbulb className="h-4 w-4 text-green-600" />
                          <span>{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {type === 'inventory' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Demand & Trends</h4>
                    <ul className="text-sm space-y-1">
                      {data.demandTrends?.map((trend: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span>{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Optimization</h4>
                    <ul className="text-sm space-y-1">
                      {data.stockOptimization?.map((optimization: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-green-600" />
                          <span>{optimization}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {type === 'custom' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Custom Analysis Results</h4>
                  <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center space-x-3">
            <Brain className="h-10 w-10 text-blue-600" />
            <span>Unified AI Service</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Experience the centralized AI service that consolidates all OpenAI integrations across the application.
            From messaging analysis to business insights, pricing strategies to customer behavior - all powered by AI.
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Sparkles className="h-4 w-4 mr-2" />
              OpenAI GPT-4
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Zap className="h-4 w-4 mr-2" />
              Unified Service
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Settings className="h-4 w-4 mr-2" />
              Centralized
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - AI Features */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Analysis Tabs */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-6 w-6" />
                  <span>AI Analysis Features</span>
                </CardTitle>
                <p className="text-blue-100 text-sm font-normal">
                  Choose an analysis type and provide data to get AI-powered insights
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="messaging">Messaging</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="customer">Customer</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  </TabsList>

                  <TabsContent value="messaging" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Message Content</label>
                      <Textarea
                        value={inputData.messaging.content}
                        onChange={(e) => updateInput('messaging', 'content', e.target.value)}
                        placeholder="Enter your message content..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Context</label>
                      <Input
                        value={inputData.messaging.context}
                        onChange={(e) => updateInput('messaging', 'context', e.target.value)}
                        placeholder="e.g., Customer inquiry, internal communication..."
                      />
                    </div>
                    <Button
                      onClick={() => handleAnalysis('messaging')}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {isLoading ? 'Analyzing...' : 'Analyze Message'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Data (JSON)</label>
                      <Textarea
                        value={JSON.stringify(inputData.analytics.data, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value)
                            updateInput('analytics', 'data', parsed)
                          } catch (error) {
                            // Invalid JSON, ignore
                          }
                        }}
                        placeholder="Enter business data in JSON format..."
                        rows={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Analysis Context</label>
                      <Input
                        value={inputData.analytics.context}
                        onChange={(e) => updateInput('analytics', 'context', e.target.value)}
                        placeholder="e.g., Q4 Performance, Sales Analysis..."
                      />
                    </div>
                    <Button
                      onClick={() => handleAnalysis('analytics')}
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {isLoading ? 'Analyzing...' : 'Analyze Business Data'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">User Data (JSON)</label>
                        <Textarea
                          value={JSON.stringify(inputData.recommendations.userData, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              updateInput('recommendations', 'userData', parsed)
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="User preferences and data..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Product Data (JSON)</label>
                        <Textarea
                          value={JSON.stringify(inputData.recommendations.productData, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              updateInput('recommendations', 'productData', parsed)
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="Product information..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAnalysis('recommendations')}
                      disabled={isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      {isLoading ? 'Analyzing...' : 'Generate Recommendations'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Pricing Data (JSON)</label>
                        <Textarea
                          value={JSON.stringify(inputData.pricing.pricingData, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              updateInput('pricing', 'pricingData', parsed)
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="Pricing information..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Market Data (JSON)</label>
                        <Textarea
                          value={JSON.stringify(inputData.pricing.marketData, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              updateInput('pricing', 'marketData', parsed)
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="Market conditions..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAnalysis('pricing')}
                      disabled={isLoading}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {isLoading ? 'Analyzing...' : 'Analyze Pricing Strategy'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="customer" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Customer Data (JSON)</label>
                        <Textarea
                          value={JSON.stringify(inputData.customer.customerData, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              updateInput('customer', 'customerData', parsed)
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="Customer information..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Behavior Data (JSON)</label>
                        <Textarea
                          value={JSON.stringify(inputData.customer.behaviorData, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              updateInput('customer', 'behaviorData', parsed)
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="Behavior patterns..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAnalysis('customer')}
                      disabled={isLoading}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {isLoading ? 'Analyzing...' : 'Analyze Customer Behavior'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="inventory" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Inventory Data (JSON)</label>
                        <Textarea
                          value={JSON.stringify(inputData.inventory.inventoryData, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              updateInput('inventory', 'inventoryData', parsed)
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="Inventory information..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Market Data (JSON)</label>
                        <Textarea
                          value={JSON.stringify(inputData.inventory.marketData, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              updateInput('inventory', 'marketData', parsed)
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="Market conditions..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAnalysis('inventory')}
                      disabled={isLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      {isLoading ? 'Analyzing...' : 'Analyze Inventory'}
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Custom Analysis */}
                <Separator className="my-6" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-3">Custom AI Analysis</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Perform custom analysis with your own data and parameters
                  </p>
                  <Button
                    onClick={handleCustomAnalysis}
                    disabled={isLoading}
                    variant="outline"
                    className="border-2 border-dashed"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {isLoading ? 'Processing...' : 'Run Custom Analysis'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Display */}
            {renderResults()}
          </div>

          {/* Right Column - Features & Status */}
          <div className="space-y-6">
            {/* Service Status */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Service Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">OpenAI API</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Available
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Supabase</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Models</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    GPT-4 & GPT-3.5
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>AI Capabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Messaging Analysis</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Tone & Sentiment Detection</div>
                    <div>• Business Impact Assessment</div>
                    <div>• Response Templates</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Business Analytics</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Trend Analysis</div>
                    <div>• Anomaly Detection</div>
                    <div>• Strategic Insights</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Smart Recommendations</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Personalized Suggestions</div>
                    <div>• Market Trends</div>
                    <div>• Cross-sell Opportunities</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('messaging')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Business Analytics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('recommendations')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Product Recommendations
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('pricing')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pricing Strategy
                </Button>
              </CardContent>
            </Card>

            {/* OpenAI Integration Info */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>OpenAI Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="text-sm text-blue-100 space-y-2">
                  <p>This service now uses the OpenAI API key in multiple strategic locations:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Unified AI Service (Central)</li>
                    <li>AI Messaging Service</li>
                    <li>AI Estimation Service</li>
                    <li>AI Recommendation Service</li>
                    <li>Enhanced Analytics</li>
                  </ul>
                </div>
                <div className="pt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Centralized API Key Management
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
