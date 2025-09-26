import { supabase } from '../supabase'
import {
  QualityStandard,
  QualityCheckpoint,
  QualityInspection,
  QualityDefect,
  QualityCertificate,
  QualityCompliance,
  QualityMetric,
  QualityInspectionWithDetails,
  QualityDefectWithDetails,
  QualityCertificateWithDetails,
  QualityAnalytics,
  QualityControlDashboard,
  CreateQualityStandardRequest,
  CreateQualityCheckpointRequest,
  CreateQualityInspectionRequest,
  UpdateQualityInspectionRequest,
  CreateQualityDefectRequest,
  CreateQualityCertificateRequest,
  CreateQualityComplianceRequest,
  QualityInspectionFilters,
  QualityDefectFilters,
  QualityCertificateFilters
} from '../../types/quality-control'

export interface QualityTrend {
  date: string
  pass_rate: number
  total_inspections: number
  defects_found: number
  average_score: number
}

export interface QualityAlert {
  id: string
  type: 'defect_rate' | 'compliance_due' | 'certificate_expiry' | 'checkpoint_failure'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  data: Record<string, any>
  created_at: string
  resolved_at?: string
  resolved_by?: string
  is_active: boolean
}

export interface QualityReport {
  id: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  period_start: string
  period_end: string
  data: Record<string, any>
  generated_at: string
  generated_by: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
}

export class QualityControlService {
  // Quality Standards Management
  async createQualityStandard(data: CreateQualityStandardRequest): Promise<QualityStandard> {
    const { data: standard, error } = await supabase
      .from('quality_standards')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create quality standard: ${error.message}`)
    return standard
  }

  async getQualityStandards(): Promise<QualityStandard[]> {
    const { data: standards, error } = await supabase
      .from('quality_standards')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch quality standards: ${error.message}`)
    return standards || []
  }

  async getQualityStandardById(id: string): Promise<QualityStandard> {
    const { data: standard, error } = await supabase
      .from('quality_standards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Failed to fetch quality standard: ${error.message}`)
    return standard
  }

  async updateQualityStandard(id: string, updates: Partial<QualityStandard>): Promise<QualityStandard> {
    const { data: standard, error } = await supabase
      .from('quality_standards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update quality standard: ${error.message}`)
    return standard
  }

  async deleteQualityStandard(id: string): Promise<void> {
    const { error } = await supabase
      .from('quality_standards')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete quality standard: ${error.message}`)
  }

  // Quality Checkpoints Management
  async createQualityCheckpoint(data: CreateQualityCheckpointRequest): Promise<QualityCheckpoint> {
    const { data: checkpoint, error } = await supabase
      .from('quality_checkpoints')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create quality checkpoint: ${error.message}`)
    return checkpoint
  }

  async getQualityCheckpoints(): Promise<QualityCheckpoint[]> {
    const { data: checkpoints, error } = await supabase
      .from('quality_checkpoints')
      .select('*')
      .eq('is_active', true)
      .order('order_sequence')

    if (error) throw new Error(`Failed to fetch quality checkpoints: ${error.message}`)
    return checkpoints || []
  }

  async getQualityCheckpointById(id: string): Promise<QualityCheckpoint> {
    const { data: checkpoint, error } = await supabase
      .from('quality_checkpoints')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Failed to fetch quality checkpoint: ${error.message}`)
    return checkpoint
  }

  async updateQualityCheckpoint(id: string, updates: Partial<QualityCheckpoint>): Promise<QualityCheckpoint> {
    const { data: checkpoint, error } = await supabase
      .from('quality_checkpoints')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update quality checkpoint: ${error.message}`)
    return checkpoint
  }

  async deleteQualityCheckpoint(id: string): Promise<void> {
    const { error } = await supabase
      .from('quality_checkpoints')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete quality checkpoint: ${error.message}`)
  }

  // Quality Inspections Management
  async createQualityInspection(data: CreateQualityInspectionRequest): Promise<QualityInspection> {
    const { data: inspection, error } = await supabase
      .from('quality_inspections')
      .insert({
        ...data,
        inspector_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create quality inspection: ${error.message}`)

    // Check for quality alerts
    await this.checkForQualityAlerts(inspection)

    return inspection
  }

  async getQualityInspections(filters?: QualityInspectionFilters, page = 1, limit = 20): Promise<{
    inspections: QualityInspectionWithDetails[];
    total: number;
    total_pages: number;
  }> {
    let query = supabase
      .from('quality_inspections')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.checkpoint_id) query = query.eq('checkpoint_id', filters.checkpoint_id)
    if (filters?.batch_id) query = query.eq('batch_id', filters.batch_id)
    if (filters?.order_id) query = query.eq('order_id', filters.order_id)
    if (filters?.inspector_id) query = query.eq('inspector_id', filters.inspector_id)
    if (filters?.date_from) query = query.gte('created_at', filters.date_from)
    if (filters?.date_to) query = query.lte('created_at', filters.date_to)

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: inspections, error, count } = await query

    if (error) throw new Error(`Failed to fetch quality inspections: ${error.message}`)

    // Transform data to match interface - fetch related data separately
    const transformedInspections: QualityInspectionWithDetails[] = []
    for (const inspection of inspections || []) {
      const [checkpoint, inspector, defects] = await Promise.all([
        this.getQualityCheckpointById(inspection.checkpoint_id),
        this.getUserById(inspection.inspector_id),
        this.getDefectsByInspectionId(inspection.id)
      ])

      transformedInspections.push({
        ...inspection,
        checkpoint,
        inspector,
        defects
      })
    }

    return {
      inspections: transformedInspections,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit)
    }
  }

  async getQualityInspectionById(id: string): Promise<QualityInspectionWithDetails> {
    const { data: inspection, error } = await supabase
      .from('quality_inspections')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Failed to fetch quality inspection: ${error.message}`)

    const [checkpoint, inspector, defects] = await Promise.all([
      this.getQualityCheckpointById(inspection.checkpoint_id),
      this.getUserById(inspection.inspector_id),
      this.getDefectsByInspectionId(inspection.id)
    ])

    return {
      ...inspection,
      checkpoint,
      inspector,
      defects
    }
  }

  async updateQualityInspection(id: string, updates: UpdateQualityInspectionRequest): Promise<QualityInspection> {
    const { data: inspection, error } = await supabase
      .from('quality_inspections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update quality inspection: ${error.message}`)

    // Check for quality alerts if status changed
    if (updates.status) {
      await this.checkForQualityAlerts(inspection)
    }

    return inspection
  }

  // Quality Defects Management
  async createQualityDefect(data: CreateQualityDefectRequest): Promise<QualityDefect> {
    const { data: defect, error } = await supabase
      .from('quality_defects')
      .insert({
        ...data,
        reported_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create quality defect: ${error.message}`)

    // Create quality alert for critical defects
    if (data.severity === 'critical') {
      await this.createQualityAlert({
        type: 'defect_rate',
        severity: 'critical',
        title: 'Critical Quality Defect Detected',
        message: `Critical defect reported: ${data.description}`,
        data: { defect_id: defect.id, inspection_id: data.inspection_id }
      })
    }

    return defect
  }

  async getQualityDefects(filters?: QualityDefectFilters, page = 1, limit = 20): Promise<{
    defects: QualityDefectWithDetails[];
    total: number;
    total_pages: number;
  }> {
    let query = supabase
      .from('quality_defects')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.severity) query = query.eq('severity', filters.severity)
    if (filters?.defect_type) query = query.eq('defect_type', filters.defect_type)
    if (filters?.supplier_id) query = query.eq('supplier_id', filters.supplier_id)
    if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to)
    if (filters?.date_from) query = query.gte('created_at', filters.date_from)
    if (filters?.date_to) query = query.lte('created_at', filters.date_to)

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: defects, error, count } = await query

    if (error) throw new Error(`Failed to fetch quality defects: ${error.message}`)

    // Transform data to match interface
    const transformedDefects: QualityDefectWithDetails[] = []
    for (const defect of defects || []) {
      const [reporter, assignee, inspection] = await Promise.all([
        this.getUserById(defect.reported_by),
        defect.assigned_to ? this.getUserById(defect.assigned_to) : null,
        defect.inspection_id ? this.getQualityInspectionById(defect.inspection_id) : null
      ])

      transformedDefects.push({
        ...defect,
        reporter,
        assignee,
        inspection
      })
    }

    return {
      defects: transformedDefects,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit)
    }
  }

  async getQualityDefectById(id: string): Promise<QualityDefectWithDetails> {
    const { data: defect, error } = await supabase
      .from('quality_defects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Failed to fetch quality defect: ${error.message}`)

    const [reporter, assignee, inspection] = await Promise.all([
      this.getUserById(defect.reported_by),
      defect.assigned_to ? this.getUserById(defect.assigned_to) : null,
      defect.inspection_id ? this.getQualityInspectionById(defect.inspection_id) : null
    ])

    return {
      ...defect,
      reporter,
      assignee,
      inspection
    }
  }

  // Quality Certificates Management
  async createQualityCertificate(data: CreateQualityCertificateRequest): Promise<QualityCertificate> {
    const { data: certificate, error } = await supabase
      .from('quality_certificates')
      .insert({
        ...data,
        issued_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create quality certificate: ${error.message}`)
    return certificate
  }

  async getQualityCertificates(filters?: QualityCertificateFilters, page = 1, limit = 20): Promise<{
    certificates: QualityCertificateWithDetails[];
    total: number;
    total_pages: number;
  }> {
    let query = supabase
      .from('quality_certificates')
      .select('*', { count: 'exact' })
      .order('issued_date', { ascending: false })

    // Apply filters
    if (filters?.certificate_type) query = query.eq('certificate_type', filters.certificate_type)
    if (filters?.order_id) query = query.eq('order_id', filters.order_id)
    if (filters?.batch_id) query = query.eq('batch_id', filters.batch_id)
    if (filters?.issued_by) query = query.eq('issued_by', filters.issued_by)
    if (filters?.is_valid !== undefined) query = query.eq('is_valid', filters.is_valid)
    if (filters?.date_from) query = query.gte('issued_date', filters.date_from)
    if (filters?.date_to) query = query.lte('issued_date', filters.date_to)

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: certificates, error, count } = await query

    if (error) throw new Error(`Failed to fetch quality certificates: ${error.message}`)

    // Transform data to match interface
    const transformedCertificates: QualityCertificateWithDetails[] = []
    for (const certificate of certificates || []) {
      const issuer = await this.getUserById(certificate.issued_by)

      transformedCertificates.push({
        ...certificate,
        issuer
      })
    }

    return {
      certificates: transformedCertificates,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit)
    }
  }

  async getQualityCertificateById(id: string): Promise<QualityCertificateWithDetails> {
    const { data: certificate, error } = await supabase
      .from('quality_certificates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Failed to fetch quality certificate: ${error.message}`)

    const issuer = await this.getUserById(certificate.issued_by)

    return {
      ...certificate,
      issuer
    }
  }

  // Quality Compliance Management
  async createQualityCompliance(data: CreateQualityComplianceRequest): Promise<QualityCompliance> {
    const { data: compliance, error } = await supabase
      .from('quality_compliance')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create quality compliance: ${error.message}`)
    return compliance
  }

  async getQualityCompliance(): Promise<QualityCompliance[]> {
    const { data: compliance, error } = await supabase
      .from('quality_compliance')
      .select('*')
      .order('next_audit_date', { ascending: true })

    if (error) throw new Error(`Failed to fetch quality compliance: ${error.message}`)
    return compliance || []
  }

  async getQualityComplianceById(id: string): Promise<QualityCompliance> {
    const { data: compliance, error } = await supabase
      .from('quality_compliance')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Failed to fetch quality compliance: ${error.message}`)
    return compliance
  }

  // Quality Analytics
  async getQualityAnalytics(): Promise<QualityAnalytics> {
    // Get recent inspections
    const { data: recentInspections } = await supabase
      .from('quality_inspections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)

    // Get defects
    const { data: defects } = await supabase
      .from('quality_defects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    // Get metrics
    const { data: metrics } = await supabase
      .from('quality_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(30)

    // Calculate analytics
    const totalInspections = recentInspections?.length || 0
    const passedInspections = recentInspections?.filter(i => i.status === 'passed').length || 0
    const failedInspections = recentInspections?.filter(i => i.status === 'failed').length || 0
    const passRate = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0
    const defectRate = totalInspections > 0 ? (failedInspections / totalInspections) * 100 : 0

    // Group defects by severity and type
    const defectsBySeverity = this.groupDefectsBySeverity(defects || [])
    const defectsByType = this.groupDefectsByType(defects || [])

    // Calculate trends
    const dailyMetrics = metrics?.filter(m => m.metric_type === 'defect_rate').slice(0, 7) || []
    const weeklyMetrics = metrics?.filter(m => m.metric_type === 'pass_rate').slice(0, 4) || []
    const monthlyMetrics = metrics?.filter(m => m.metric_type === 'rework_rate').slice(0, 12) || []

    return {
      overview: {
        total_inspections: totalInspections,
        passed_inspections: passedInspections,
        failed_inspections: failedInspections,
        pass_rate: passRate,
        defect_rate: defectRate,
        rework_rate: 0 // Calculate based on rework status if needed
      },
      trends: {
        daily_metrics: dailyMetrics,
        weekly_metrics: weeklyMetrics,
        monthly_metrics: monthlyMetrics
      },
      defects: {
        by_severity: defectsBySeverity,
        by_type: defectsByType,
        by_supplier: {}, // Calculate based on supplier_id if needed
        recent_defects: [] // Transform recentDefects to QualityDefectWithDetails if needed
      },
      compliance: {
        current_status: [], // Get from quality_compliance table
        upcoming_audits: [], // Get from quality_compliance table
        compliance_score: 0 // Calculate compliance score
      },
      performance: {
        inspector_performance: [], // Calculate inspector performance if needed
        checkpoint_performance: [] // Calculate checkpoint performance if needed
      }
    }
  }

  // Quality Control Dashboard
  async getQualityControlDashboard(): Promise<QualityControlDashboard> {
    // Get recent inspections
    const { data: recentInspections } = await supabase
      .from('quality_inspections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get pending inspections
    const { data: pendingInspections } = await supabase
      .from('quality_inspections')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10)

    // Get critical defects
    const { data: criticalDefects } = await supabase
      .from('quality_defects')
      .select('*')
      .eq('severity', 'critical')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get upcoming audits
    const { data: upcomingAudits } = await supabase
      .from('quality_compliance')
      .select('*')
      .gte('next_audit_date', new Date().toISOString().split('T')[0])
      .order('next_audit_date', { ascending: true })
      .limit(5)

    // Get metrics
    const { data: metrics } = await supabase
      .from('quality_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(30)

    // Transform recent inspections
    const transformedRecentInspections: QualityInspectionWithDetails[] = []
    for (const inspection of recentInspections || []) {
      const [checkpoint, inspector] = await Promise.all([
        this.getQualityCheckpointById(inspection.checkpoint_id),
        this.getUserById(inspection.inspector_id)
      ])

      transformedRecentInspections.push({
        ...inspection,
        checkpoint,
        inspector,
        defects: []
      })
    }

    return {
      recent_inspections: transformedRecentInspections,
      pending_inspections: pendingInspections || [],
      critical_defects: criticalDefects || [],
      upcoming_audits: upcomingAudits || [],
      quality_metrics: {
        today: metrics?.filter(m => m.metric_date === new Date().toISOString().split('T')[0]) || [],
        this_week: metrics?.filter(m => {
          const date = new Date(m.metric_date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return date >= weekAgo
        }) || [],
        this_month: metrics?.filter(m => {
          const date = new Date(m.metric_date)
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return date >= monthAgo
        }) || []
      },
      inspector_workload: [] // Calculate inspector workload if needed
    }
  }

  // Quality Alerts
  async createQualityAlert(alert: Omit<QualityAlert, 'id' | 'created_at' | 'is_active'>): Promise<QualityAlert> {
    const { data, error } = await supabase
      .from('quality_alerts')
      .insert({
        ...alert,
        created_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create quality alert: ${error.message}`)
    return data
  }

  async getQualityAlerts(filters?: {
    type?: string
    severity?: string
    is_active?: boolean
  }): Promise<QualityAlert[]> {
    let query = supabase
      .from('quality_alerts')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.severity) query = query.eq('severity', filters.severity)
    if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch quality alerts: ${error.message}`)
    return data || []
  }

  async resolveQualityAlert(alertId: string, resolvedBy: string): Promise<void> {
    const { error } = await supabase
      .from('quality_alerts')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        is_active: false
      })
      .eq('id', alertId)

    if (error) throw new Error(`Failed to resolve quality alert: ${error.message}`)
  }

  // Quality Reports
  async generateQualityReport(type: 'daily' | 'weekly' | 'monthly' | 'custom', periodStart: string, periodEnd: string): Promise<QualityReport> {
    const { data: report, error } = await supabase
      .from('quality_reports')
      .insert({
        type,
        period_start: periodStart,
        period_end: periodEnd,
        generated_by: (await supabase.auth.getUser()).data.user?.id,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create quality report: ${error.message}`)

    // Generate report data asynchronously
    this.generateReportData(report.id, type, periodStart, periodEnd)

    return report
  }

  private async generateReportData(reportId: string, type: string, periodStart: string, periodEnd: string): Promise<void> {
    try {
      // Update status to generating
      await supabase
        .from('quality_reports')
        .update({ status: 'generating' })
        .eq('id', reportId)

      // Get data for the period
      const [inspections, defects, certificates] = await Promise.all([
        this.getInspectionsForPeriod(periodStart, periodEnd),
        this.getDefectsForPeriod(periodStart, periodEnd),
        this.getCertificatesForPeriod(periodStart, periodEnd)
      ])

      // Calculate report data
      const reportData = {
        period: { start: periodStart, end: periodEnd },
        inspections: {
          total: inspections.length,
          passed: inspections.filter(i => i.status === 'passed').length,
          failed: inspections.filter(i => i.status === 'failed').length,
          pass_rate: inspections.length > 0 ? (inspections.filter(i => i.status === 'passed').length / inspections.length) * 100 : 0
        },
        defects: {
          total: defects.length,
          by_severity: this.groupDefectsBySeverity(defects),
          by_type: this.groupDefectsByType(defects)
        },
        certificates: {
          total: certificates.length,
          valid: certificates.filter(c => c.is_valid).length,
          expired: certificates.filter(c => !c.is_valid).length
        },
        trends: this.calculateQualityTrends(inspections)
      }

      // Update report with data
      await supabase
        .from('quality_reports')
        .update({
          data: reportData,
          status: 'completed'
        })
        .eq('id', reportId)

    } catch (error: any) {
      // Update report with error
      await supabase
        .from('quality_reports')
        .update({
          status: 'failed',
          data: { error: error.message }
        })
        .eq('id', reportId)
    }
  }

  // Private helper methods
  private async getUserById(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('id', userId)
      .single()

    if (error) return null
    return data
  }

  private async getDefectsByInspectionId(inspectionId: string): Promise<QualityDefect[]> {
    const { data, error } = await supabase
      .from('quality_defects')
      .select('*')
      .eq('inspection_id', inspectionId)

    if (error) return []
    return data || []
  }

  private async checkForQualityAlerts(inspection: QualityInspection): Promise<void> {
    // Check for failed inspections
    if (inspection.status === 'failed') {
      await this.createQualityAlert({
        type: 'checkpoint_failure',
        severity: 'high',
        title: 'Quality Inspection Failed',
        message: `Inspection ${inspection.id} failed at checkpoint`,
        data: { inspection_id: inspection.id, checkpoint_id: inspection.checkpoint_id }
      })
    }

    // Check for low pass rates
    const recentInspections = await this.getInspectionsForPeriod(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    )

    const passRate = recentInspections.length > 0 
      ? (recentInspections.filter(i => i.status === 'passed').length / recentInspections.length) * 100 
      : 100

    if (passRate < 80) {
      await this.createQualityAlert({
        type: 'defect_rate',
        severity: 'medium',
        title: 'Low Quality Pass Rate',
        message: `Quality pass rate is ${passRate.toFixed(1)}% (below 80% threshold)`,
        data: { pass_rate: passRate, period_days: 7 }
      })
    }
  }

  private async getInspectionsForPeriod(startDate: string, endDate: string): Promise<QualityInspection[]> {
    const { data, error } = await supabase
      .from('quality_inspections')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error) return []
    return data || []
  }

  private async getDefectsForPeriod(startDate: string, endDate: string): Promise<QualityDefect[]> {
    const { data, error } = await supabase
      .from('quality_defects')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error) return []
    return data || []
  }

  private async getCertificatesForPeriod(startDate: string, endDate: string): Promise<QualityCertificate[]> {
    const { data, error } = await supabase
      .from('quality_certificates')
      .select('*')
      .gte('issued_date', startDate)
      .lte('issued_date', endDate)

    if (error) return []
    return data || []
  }

  private calculateQualityTrends(inspections: QualityInspection[]): QualityTrend[] {
    // Group inspections by date and calculate daily metrics
    const dailyMetrics = new Map<string, { total: number; passed: number; defects: number; scores: number[] }>()

    inspections.forEach(inspection => {
      const date = inspection.created_at.split('T')[0]
      const current = dailyMetrics.get(date) || { total: 0, passed: 0, defects: 0, scores: [] }
      
      current.total++
      if (inspection.status === 'passed') current.passed++
      if (inspection.score) current.scores.push(inspection.score)
      
      dailyMetrics.set(date, current)
    })

    return Array.from(dailyMetrics.entries()).map(([date, metrics]) => ({
      date,
      pass_rate: metrics.total > 0 ? (metrics.passed / metrics.total) * 100 : 0,
      total_inspections: metrics.total,
      defects_found: metrics.defects,
      average_score: metrics.scores.length > 0 ? metrics.scores.reduce((a, b) => a + b, 0) / metrics.scores.length : 0
    })).sort((a, b) => a.date.localeCompare(b.date))
  }

  private groupDefectsBySeverity(defects: QualityDefect[]): Record<string, number> {
    return defects.reduce((acc, defect) => {
      acc[defect.severity] = (acc[defect.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private groupDefectsByType(defects: QualityDefect[]): Record<string, number> {
    return defects.reduce((acc, defect) => {
      acc[defect.defect_type] = (acc[defect.defect_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  // Missing methods for API routes
  async updateQualityCertificate(id: string, updates: Partial<QualityCertificate>): Promise<QualityCertificate> {
    const { data: certificate, error } = await supabase
      .from('quality_certificates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update quality certificate: ${error.message}`)
    return certificate
  }

  async deleteQualityCertificate(id: string): Promise<void> {
    const { error } = await supabase
      .from('quality_certificates')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete quality certificate: ${error.message}`)
  }

  async updateQualityCompliance(id: string, updates: Partial<QualityCompliance>): Promise<QualityCompliance> {
    const { data: compliance, error } = await supabase
      .from('quality_compliance')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update quality compliance: ${error.message}`)
    return compliance
  }

  async deleteQualityCompliance(id: string): Promise<void> {
    const { error } = await supabase
      .from('quality_compliance')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete quality compliance: ${error.message}`)
  }

  async updateQualityDefect(id: string, updates: Partial<QualityDefect>): Promise<QualityDefect> {
    const { data: defect, error } = await supabase
      .from('quality_defects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update quality defect: ${error.message}`)
    return defect
  }

  async deleteQualityDefect(id: string): Promise<void> {
    const { error } = await supabase
      .from('quality_defects')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete quality defect: ${error.message}`)
  }

  async deleteQualityInspection(id: string): Promise<void> {
    const { error } = await supabase
      .from('quality_inspections')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete quality inspection: ${error.message}`)
  }
} 