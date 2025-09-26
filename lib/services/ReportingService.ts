import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface ReportRequest {
  reportType: ReportType
  dateRange: {
    start: string
    end: string
  }
  filters?: Record<string, any>
  format?: 'json' | 'csv' | 'pdf' | 'excel'
  includeCharts?: boolean
}

export type ReportType = 
  | 'sales_summary'
  | 'inventory_status'
  | 'customer_analytics'
  | 'financial_summary'
  | 'production_report'
  | 'quality_metrics'
  | 'partner_performance'
  | 'meeting_summary'
  | 'custom'

export interface ReportResult {
  id: string
  reportType: ReportType
  title: string
  description: string
  dateRange: {
    start: string
    end: string
  }
  generatedAt: string
  data: any
  summary: ReportSummary
  charts?: ChartData[]
  metadata: ReportMetadata
}

export interface ReportSummary {
  totalRecords: number
  keyMetrics: Record<string, number>
  insights: string[]
  recommendations: string[]
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: any
  options?: any
}

export interface ReportMetadata {
  filters: Record<string, any>
  format: string
  processingTime: number
  dataSources: string[]
}

export interface SavedReport {
  id: string
  name: string
  reportType: ReportType
  description: string
  dateRange: {
    start: string
    end: string
  }
  filters: Record<string, any>
  schedule?: ReportSchedule
  createdAt: string
  updatedAt: string
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  recipients: string[]
  format: string
  enabled: boolean
}

export class ReportingService {
  private supabase: any

  constructor() {
    this.supabase = null
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  async generateReport(request: ReportRequest): Promise<ReportResult> {
    const startTime = Date.now()
    const supabase = await this.getSupabase()

    // Generate report based on type
    let reportData: any
    let summary: ReportSummary

    switch (request.reportType) {
      case 'sales_summary':
        reportData = await this.generateSalesSummary(request.dateRange, request.filters)
        summary = this.generateSalesSummarySummary(reportData)
        break
      case 'inventory_status':
        reportData = await this.generateInventoryStatus(request.dateRange, request.filters)
        summary = this.generateInventorySummary(reportData)
        break
      case 'customer_analytics':
        reportData = await this.generateCustomerAnalytics(request.dateRange, request.filters)
        summary = this.generateCustomerSummary(reportData)
        break
      case 'financial_summary':
        reportData = await this.generateFinancialSummary(request.dateRange, request.filters)
        summary = this.generateFinancialSummarySummary(reportData)
        break
      case 'production_report':
        reportData = await this.generateProductionReport(request.dateRange, request.filters)
        summary = this.generateProductionSummary(reportData)
        break
      case 'quality_metrics':
        reportData = await this.generateQualityMetrics(request.dateRange, request.filters)
        summary = this.generateQualitySummary(reportData)
        break
      case 'partner_performance':
        reportData = await this.generatePartnerPerformance(request.dateRange, request.filters)
        summary = this.generatePartnerSummary(reportData)
        break
      case 'meeting_summary':
        reportData = await this.generateMeetingSummary(request.dateRange, request.filters)
        summary = this.generateMeetingSummarySummary(reportData)
        break
      default:
        throw new Error(`Unsupported report type: ${request.reportType}`)
    }

    const processingTime = Date.now() - startTime

    // Generate charts if requested
    let charts: ChartData[] = []
    if (request.includeCharts) {
      charts = this.generateCharts(reportData, request.reportType)
    }

    const report: ReportResult = {
      id: crypto.randomUUID(),
      reportType: request.reportType,
      title: this.getReportTitle(request.reportType),
      description: this.getReportDescription(request.reportType),
      dateRange: request.dateRange,
      generatedAt: new Date().toISOString(),
      data: reportData,
      summary,
      charts,
      metadata: {
        filters: request.filters || {},
        format: request.format || 'json',
        processingTime,
        dataSources: this.getDataSources(request.reportType)
      }
    }

    // Save report to database
    await this.saveReport(report)

    return report
  }

  private async generateSalesSummary(dateRange: any, filters: any) {
    const supabase = await this.getSupabase()

    // Get orders in date range
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    if (!orders) return { orders: [], summary: {} }

    const totalSales = orders.reduce((sum: any, order: any) => sum + (order.total_amount || 0), 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Group by status
    const statusCounts = orders.reduce((acc: any, order: any) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by customer
    const customerSales = orders.reduce((acc: any, order: any) => {
      acc[order.customer_id] = (acc[order.customer_id] || 0) + (order.total_amount || 0)
      return acc
    }, {} as Record<string, number>)

    return {
      orders,
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
        statusCounts,
        customerSales
      }
    }
  }

  private async generateInventoryStatus(dateRange: any, filters: any) {
    const supabase = await this.getSupabase()

    // Get inventory items
    const { data: inventory } = await supabase
      .from('inventory')
      .select('*')

    if (!inventory) return { inventory: [], summary: {} }

    const totalItems = inventory.length
    const lowStockItems = inventory.filter((item: any) => (item.quantity || 0) <= 10)
    const outOfStockItems = inventory.filter((item: any) => (item.quantity || 0) === 0)
    const totalValue = inventory.reduce((sum: any, item: any) => sum + ((item.quantity || 0) * (item.price || 0)), 0)

    // Group by category
    const categoryCounts = inventory.reduce((acc: any, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      inventory,
      summary: {
        totalItems,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        totalValue,
        categoryCounts
      }
    }
  }

  private async generateCustomerAnalytics(dateRange: any, filters: any) {
    const supabase = await this.getSupabase()

    // Get customers and their orders
    const { data: customers } = await supabase
      .from('customers')
      .select('*')

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    if (!customers) return { customers: [], summary: {} }

    const totalCustomers = customers.length
    const newCustomers = customers.filter((customer: any) => 
      new Date(customer.created_at) >= new Date(dateRange.start)
    ).length

    // Calculate customer lifetime value
    const customerLTV = customers.map((customer: any) => {
      const customerOrders = orders?.filter((order: any) => order.customer_id === customer.id) || []
      const totalSpent = customerOrders.reduce((sum: any, order: any) => sum + (order.total_amount || 0), 0)
      return {
        customerId: customer.id,
        customerName: customer.name,
        totalSpent,
        orderCount: customerOrders.length
      }
    })

    return {
      customers,
      customerLTV,
      summary: {
        totalCustomers,
        newCustomers,
        averageLTV: customerLTV.reduce((sum: any, c: any) => sum + c.totalSpent, 0) / customerLTV.length
      }
    }
  }

  private async generateFinancialSummary(dateRange: any, filters: any) {
    const supabase = await this.getSupabase()

    // Get financial data
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    const totalRevenue = orders?.reduce((sum: any, order: any) => sum + (order.total_amount || 0), 0) || 0
    const totalPayments = payments?.reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0) || 0
    const outstandingAmount = totalRevenue - totalPayments

    return {
      orders,
      payments,
      summary: {
        totalRevenue,
        totalPayments,
        outstandingAmount,
        paymentRate: totalRevenue > 0 ? (totalPayments / totalRevenue) * 100 : 0
      }
    }
  }

  private async generateProductionReport(dateRange: any, filters: any) {
    const supabase = await this.getSupabase()

    // Get production data
    const { data: production } = await supabase
      .from('production_batches')
      .select('*')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    if (!production) return { production: [], summary: {} }

    const totalBatches = production.length
    const completedBatches = production.filter((batch: any) => batch.status === 'completed').length
    const inProgressBatches = production.filter((batch: any) => batch.status === 'in_progress').length

    return {
      production,
      summary: {
        totalBatches,
        completedBatches,
        inProgressBatches,
        completionRate: totalBatches > 0 ? (completedBatches / totalBatches) * 100 : 0
      }
    }
  }

  private async generateQualityMetrics(dateRange: any, filters: any) {
    const supabase = await this.getSupabase()

    // Get quality control data
    const { data: qualityChecks } = await supabase
      .from('quality_checks')
      .select('*')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    if (!qualityChecks) return { qualityChecks: [], summary: {} }

    const totalChecks = qualityChecks.length
    const passedChecks = qualityChecks.filter((check: any) => check.result === 'pass').length
    const failedChecks = qualityChecks.filter((check: any) => check.result === 'fail').length

    return {
      qualityChecks,
      summary: {
        totalChecks,
        passedChecks,
        failedChecks,
        passRate: totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0
      }
    }
  }

  private async generatePartnerPerformance(dateRange: any, filters: any) {
    const supabase = await this.getSupabase()

    // Get partner data
    const { data: partners } = await supabase
      .from('partners')
      .select('*')

    if (!partners) return { partners: [], summary: {} }

    const totalPartners = partners.length
    const activePartners = partners.filter((partner: any) => partner.status === 'active').length
    const averageRating = partners.reduce((sum: any, partner: any) => sum + (partner.rating || 0), 0) / totalPartners

    return {
      partners,
      summary: {
        totalPartners,
        activePartners,
        averageRating,
        inactiveRate: totalPartners > 0 ? ((totalPartners - activePartners) / totalPartners) * 100 : 0
      }
    }
  }

  private async generateMeetingSummary(dateRange: any, filters: any) {
    const supabase = await this.getSupabase()

    // Get meeting data
    const { data: meetings } = await supabase
      .from('meeting_briefs')
      .select('*')
      .gte('meeting_date', dateRange.start)
      .lte('meeting_date', dateRange.end)

    if (!meetings) return { meetings: [], summary: {} }

    const totalMeetings = meetings.length
    const completedMeetings = meetings.filter((meeting: any) => meeting.status === 'completed').length
    const cancelledMeetings = meetings.filter((meeting: any) => meeting.status === 'cancelled').length

    return {
      meetings,
      summary: {
        totalMeetings,
        completedMeetings,
        cancelledMeetings,
        completionRate: totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0
      }
    }
  }

  private generateSalesSummarySummary(data: any): ReportSummary {
    return {
      totalRecords: data.orders?.length || 0,
      keyMetrics: {
        totalSales: data.summary?.totalSales || 0,
        totalOrders: data.summary?.totalOrders || 0,
        averageOrderValue: data.summary?.averageOrderValue || 0
      },
      insights: [
        `Generated ${data.summary?.totalOrders || 0} orders in the period`,
        `Total sales value: $${(data.summary?.totalSales || 0).toFixed(2)}`,
        `Average order value: $${(data.summary?.averageOrderValue || 0).toFixed(2)}`
      ],
      recommendations: [
        'Focus on increasing average order value',
        'Analyze order status distribution',
        'Review top-performing customers'
      ]
    }
  }

  private generateInventorySummary(data: any): ReportSummary {
    return {
      totalRecords: data.inventory?.length || 0,
      keyMetrics: {
        totalItems: data.summary?.totalItems || 0,
        lowStockItems: data.summary?.lowStockItems || 0,
        totalValue: data.summary?.totalValue || 0
      },
      insights: [
        `Total inventory items: ${data.summary?.totalItems || 0}`,
        `${data.summary?.lowStockItems || 0} items need restocking`,
        `Total inventory value: $${(data.summary?.totalValue || 0).toFixed(2)}`
      ],
      recommendations: [
        'Restock low inventory items',
        'Review pricing strategy',
        'Optimize inventory levels'
      ]
    }
  }

  private generateCustomerSummary(data: any): ReportSummary {
    return {
      totalRecords: data.customers?.length || 0,
      keyMetrics: {
        totalCustomers: data.summary?.totalCustomers || 0,
        newCustomers: data.summary?.newCustomers || 0,
        averageLTV: data.summary?.averageLTV || 0
      },
      insights: [
        `Total customers: ${data.summary?.totalCustomers || 0}`,
        `${data.summary?.newCustomers || 0} new customers acquired`,
        `Average customer LTV: $${(data.summary?.averageLTV || 0).toFixed(2)}`
      ],
      recommendations: [
        'Focus on customer retention',
        'Develop loyalty programs',
        'Analyze customer segments'
      ]
    }
  }

  private generateFinancialSummarySummary(data: any): ReportSummary {
    return {
      totalRecords: (data.orders?.length || 0) + (data.payments?.length || 0),
      keyMetrics: {
        totalRevenue: data.summary?.totalRevenue || 0,
        totalPayments: data.summary?.totalPayments || 0,
        outstandingAmount: data.summary?.outstandingAmount || 0
      },
      insights: [
        `Total revenue: $${(data.summary?.totalRevenue || 0).toFixed(2)}`,
        `Payment rate: ${(data.summary?.paymentRate || 0).toFixed(1)}%`,
        `Outstanding amount: $${(data.summary?.outstandingAmount || 0).toFixed(2)}`
      ],
      recommendations: [
        'Improve payment collection',
        'Review credit policies',
        'Monitor cash flow'
      ]
    }
  }

  private generateProductionSummary(data: any): ReportSummary {
    return {
      totalRecords: data.production?.length || 0,
      keyMetrics: {
        totalBatches: data.summary?.totalBatches || 0,
        completedBatches: data.summary?.completedBatches || 0,
        completionRate: data.summary?.completionRate || 0
      },
      insights: [
        `Total production batches: ${data.summary?.totalBatches || 0}`,
        `Completion rate: ${(data.summary?.completionRate || 0).toFixed(1)}%`,
        `${data.summary?.inProgressBatches || 0} batches in progress`
      ],
      recommendations: [
        'Optimize production workflow',
        'Reduce bottlenecks',
        'Improve quality control'
      ]
    }
  }

  private generateQualitySummary(data: any): ReportSummary {
    return {
      totalRecords: data.qualityChecks?.length || 0,
      keyMetrics: {
        totalChecks: data.summary?.totalChecks || 0,
        passedChecks: data.summary?.passedChecks || 0,
        passRate: data.summary?.passRate || 0
      },
      insights: [
        `Total quality checks: ${data.summary?.totalChecks || 0}`,
        `Pass rate: ${(data.summary?.passRate || 0).toFixed(1)}%`,
        `${data.summary?.failedChecks || 0} failed checks`
      ],
      recommendations: [
        'Improve quality standards',
        'Review failed check patterns',
        'Enhance quality training'
      ]
    }
  }

  private generatePartnerSummary(data: any): ReportSummary {
    return {
      totalRecords: data.partners?.length || 0,
      keyMetrics: {
        totalPartners: data.summary?.totalPartners || 0,
        activePartners: data.summary?.activePartners || 0,
        averageRating: data.summary?.averageRating || 0
      },
      insights: [
        `Total partners: ${data.summary?.totalPartners || 0}`,
        `Active partners: ${data.summary?.activePartners || 0}`,
        `Average rating: ${(data.summary?.averageRating || 0).toFixed(1)}/5`
      ],
      recommendations: [
        'Strengthen partner relationships',
        'Improve partner onboarding',
        'Monitor partner performance'
      ]
    }
  }

  private generateMeetingSummarySummary(data: any): ReportSummary {
    return {
      totalRecords: data.meetings?.length || 0,
      keyMetrics: {
        totalMeetings: data.summary?.totalMeetings || 0,
        completedMeetings: data.summary?.completedMeetings || 0,
        completionRate: data.summary?.completionRate || 0
      },
      insights: [
        `Total meetings: ${data.summary?.totalMeetings || 0}`,
        `Completion rate: ${(data.summary?.completionRate || 0).toFixed(1)}%`,
        `${data.summary?.cancelledMeetings || 0} cancelled meetings`
      ],
      recommendations: [
        'Improve meeting scheduling',
        'Reduce meeting cancellations',
        'Enhance meeting effectiveness'
      ]
    }
  }

  private generateCharts(data: any, reportType: ReportType): ChartData[] {
    const charts: ChartData[] = []

    switch (reportType) {
      case 'sales_summary':
        if (data.summary?.statusCounts) {
          charts.push({
            type: 'pie',
            title: 'Order Status Distribution',
            data: Object.entries(data.summary.statusCounts).map(([status, count]) => ({
              name: status,
              value: count
            }))
          })
        }
        break
      case 'inventory_status':
        if (data.summary?.categoryCounts) {
          charts.push({
            type: 'bar',
            title: 'Inventory by Category',
            data: Object.entries(data.summary.categoryCounts).map(([category, count]) => ({
              category,
              count
            }))
          })
        }
        break
      // Add more chart types for other reports
    }

    return charts
  }

  private getReportTitle(reportType: ReportType): string {
    const titles: Record<ReportType, string> = {
      sales_summary: 'Sales Summary Report',
      inventory_status: 'Inventory Status Report',
      customer_analytics: 'Customer Analytics Report',
      financial_summary: 'Financial Summary Report',
      production_report: 'Production Report',
      quality_metrics: 'Quality Metrics Report',
      partner_performance: 'Partner Performance Report',
      meeting_summary: 'Meeting Summary Report',
      custom: 'Custom Report'
    }
    return titles[reportType]
  }

  private getReportDescription(reportType: ReportType): string {
    const descriptions: Record<ReportType, string> = {
      sales_summary: 'Comprehensive analysis of sales performance and trends',
      inventory_status: 'Current inventory levels and stock management insights',
      customer_analytics: 'Customer behavior analysis and lifetime value metrics',
      financial_summary: 'Financial performance overview and cash flow analysis',
      production_report: 'Production efficiency and batch completion metrics',
      quality_metrics: 'Quality control performance and defect analysis',
      partner_performance: 'Partner relationship and performance evaluation',
      meeting_summary: 'Meeting effectiveness and follow-up tracking',
      custom: 'Custom report with user-defined parameters'
    }
    return descriptions[reportType]
  }

  private getDataSources(reportType: ReportType): string[] {
    const sources: Record<ReportType, string[]> = {
      sales_summary: ['orders', 'customers'],
      inventory_status: ['inventory'],
      customer_analytics: ['customers', 'orders'],
      financial_summary: ['orders', 'payments'],
      production_report: ['production_batches'],
      quality_metrics: ['quality_checks'],
      partner_performance: ['partners'],
      meeting_summary: ['meeting_briefs'],
      custom: []
    }
    return sources[reportType] || []
  }

  private async saveReport(report: ReportResult): Promise<void> {
    const supabase = await this.getSupabase()

    await supabase
      .from('reports')
      .insert({
        id: report.id,
        report_type: report.reportType,
        title: report.title,
        description: report.description,
        date_range: report.dateRange,
        data: report.data,
        summary: report.summary,
        charts: report.charts,
        metadata: report.metadata
      })
  }

  async getReportHistory(filters: {
    reportType?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }): Promise<{ data: any[], pagination: any }> {
    const supabase = await this.getSupabase()

    let query = supabase
      .from('reports')
      .select('*', { count: 'exact' })

    if (filters.reportType) {
      query = query.eq('report_type', filters.reportType)
    }

    if (filters.dateFrom) {
      query = query.gte('generated_at', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('generated_at', filters.dateTo)
    }

    const page = filters.page || 1
    const limit = filters.limit || 20
    const offset = (page - 1) * limit

    const { data: reports, error, count } = await query
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch report history: ${error.message}`)
    }

    return {
      data: reports || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async getReportById(id: string): Promise<ReportResult | null> {
    const supabase = await this.getSupabase()

    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch report: ${error.message}`)
    }

    return {
      id: report.id,
      reportType: report.report_type,
      title: report.title,
      description: report.description,
      dateRange: report.date_range,
      generatedAt: report.generated_at,
      data: report.data,
      summary: report.summary,
      charts: report.charts,
      metadata: report.metadata
    }
  }
} 