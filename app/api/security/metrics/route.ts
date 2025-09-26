// 📊 SECURITY METRICS API
// Provides real-time security metrics and compliance status

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { withErrorHandling, handleApiError, AuthenticationError, ValidationError } from '@/lib/middleware/errorHandler'
import { logger } from '@/lib/services/LoggingService'

// =====================================================
// SECURITY METRICS INTERFACE
// =====================================================

interface SecurityMetrics {
  totalUsers: number
  activeEncryptionKeys: number
  expiredKeys: number
  encryptionSuccessRate: number
  failedDecryptions: number
  activeVideoCalls: number
  totalMessages: number
  encryptedMessages: number
  complianceScore: number
  lastAuditDate: string
  securityIncidents: number
  keyRotationStatus: 'healthy' | 'warning' | 'critical'
}

interface EncryptionActivity {
  timestamp: string
  action: string
  success: boolean
  algorithm: string
  keyVersion: number
}

interface ComplianceStatus {
  standard: string
  status: 'compliant' | 'non-compliant' | 'pending'
  lastCheck: string
  issues: string[]
}

// =====================================================
// API HANDLERS
// =====================================================

async function getSecurityMetricsHandler(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    const includeDetails = searchParams.get('includeDetails') === 'true'

    // Fetch security metrics
    const metrics = await getSecurityMetrics(supabase, timeRange)
    const activity = await getEncryptionActivity(supabase, timeRange)
    const compliance = await getComplianceStatus(supabase)

    return NextResponse.json({
      success: true,
      metrics,
      activity,
      compliance,
      timestamp: new Date().toISOString(),
      timeRange
    })

  } catch (error) {
    return handleApiError(error)
  }
}

// =====================================================
// METRICS FUNCTIONS
// =====================================================

async function getSecurityMetrics(supabase: any, timeRange: string): Promise<SecurityMetrics> {
  try {
    // Calculate time range
    const now = new Date()
    const timeRangeMap: { [key: string]: number } = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    
    const startTime = new Date(now.getTime() - (timeRangeMap[timeRange] || timeRangeMap['24h']))

    // Get total users
    const { count: totalUsers } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true })

    // Get encryption key statistics
    const { data: encryptionKeys } = await supabase
      .from('user_encryption_keys')
      .select('*')

    const activeEncryptionKeys = encryptionKeys?.filter((key: any) => 
      !key.key_expires_at || new Date(key.key_expires_at) > now
    ).length || 0

    const expiredKeys = encryptionKeys?.filter((key: any) => 
      key.key_expires_at && new Date(key.key_expires_at) <= now
    ).length || 0

    // Get message statistics
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startTime.toISOString())

    const { count: encryptedMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startTime.toISOString())
      .eq('is_encrypted', true)

    // Get video call statistics
    const { count: activeVideoCalls } = await supabase
      .from('video_calls')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'connected')

    // Get encryption success rate from audit logs
    const { data: auditLogs } = await supabase
      .from('encryption_audit_logs')
      .select('success')
      .gte('created_at', startTime.toISOString())

    const totalAuditActions = auditLogs?.length || 0
    const successfulActions = auditLogs?.filter((log: any) => log.success).length || 0
    const encryptionSuccessRate = totalAuditActions > 0 
      ? (successfulActions / totalAuditActions) * 100 
      : 100

    const failedDecryptions = totalAuditActions - successfulActions

    // Calculate compliance score
    const complianceScore = await calculateComplianceScore(supabase)

    // Determine key rotation status
    const keyRotationStatus = await determineKeyRotationStatus(supabase)

    // Get security incidents
    const { count: securityIncidents } = await supabase
      .from('encryption_audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('success', false)
      .gte('created_at', startTime.toISOString())

    return {
      totalUsers: totalUsers || 0,
      activeEncryptionKeys,
      expiredKeys,
      encryptionSuccessRate: Math.round(encryptionSuccessRate * 100) / 100,
      failedDecryptions,
      activeVideoCalls: activeVideoCalls || 0,
      totalMessages: totalMessages || 0,
      encryptedMessages: encryptedMessages || 0,
      complianceScore,
      lastAuditDate: now.toISOString(),
      securityIncidents: securityIncidents || 0,
      keyRotationStatus
    }

  } catch (error) {
    logger.error('Failed to get security metrics:', error)
    throw error
  }
}

async function getEncryptionActivity(supabase: any, timeRange: string): Promise<EncryptionActivity[]> {
  try {
    const now = new Date()
    const timeRangeMap: { [key: string]: number } = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    
    const startTime = new Date(now.getTime() - (timeRangeMap[timeRange] || timeRangeMap['24h']))

    // Get recent encryption activity from audit logs
    const { data: auditLogs } = await supabase
      .from('encryption_audit_logs')
      .select('*')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (!auditLogs) return []

    return auditLogs.map((log: any) => ({
      timestamp: log.created_at,
      action: log.action_type.replace(/_/g, ' ').replace(/\b\w/g, (l: any) => l.toUpperCase()),
      success: log.success,
      algorithm: log.encryption_algorithm || 'Unknown',
      keyVersion: log.key_version || 1
    }))

  } catch (error) {
    logger.error('Failed to get encryption activity:', error)
    return []
  }
}

async function getComplianceStatus(supabase: any): Promise<ComplianceStatus[]> {
  try {
    // Get retention policies
    const { data: retentionPolicies } = await supabase
      .from('retention_policies')
      .select('*')
      .not('compliance_standard', 'is', null)

    if (!retentionPolicies) return []

    const complianceStatus: ComplianceStatus[] = []

    for (const policy of retentionPolicies) {
      // Check if policy is being enforced
      const { data: archivedMessages } = await supabase
        .from('archived_messages')
        .select('*')
        .eq('retention_policy_id', policy.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const { data: recentMessages } = await supabase
        .from('messages')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      // Simple compliance check
      const totalRelevantMessages = (recentMessages?.length || 0) + (archivedMessages?.length || 0)
      const processedMessages = archivedMessages?.length || 0
      
      let status: 'compliant' | 'non-compliant' | 'pending' = 'pending'
      const issues: string[] = []

      if (totalRelevantMessages > 0) {
        const complianceRate = (processedMessages / totalRelevantMessages) * 100
        
        if (complianceRate >= 90) {
          status = 'compliant'
        } else if (complianceRate >= 70) {
          status = 'pending'
          issues.push(`Compliance rate: ${complianceRate.toFixed(1)}%`)
        } else {
          status = 'non-compliant'
          issues.push(`Low compliance rate: ${complianceRate.toFixed(1)}%`)
        }
      }

      // Check for expired keys
      const now = new Date()
      const { data: expiredKeys } = await supabase
        .from('user_encryption_keys')
        .select('*')
        .lt('key_expires_at', now.toISOString())

      if (expiredKeys && expiredKeys.length > 0) {
        issues.push(`${expiredKeys.length} expired encryption keys`)
        if (status === 'compliant') status = 'pending'
      }

      complianceStatus.push({
        standard: policy.compliance_standard,
        status,
        lastCheck: new Date().toISOString(),
        issues
      })
    }

    return complianceStatus

  } catch (error) {
    logger.error('Failed to get compliance status:', error)
    return []
  }
}

async function calculateComplianceScore(supabase: any): Promise<number> {
  try {
    // Calculate overall compliance score based on various factors
    let totalScore = 0
    let totalFactors = 0

    // Factor 1: Encryption coverage
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    const { count: encryptedMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_encrypted', true)

    if (totalMessages && totalMessages > 0) {
      const encryptionCoverage = (encryptedMessages || 0) / totalMessages
      totalScore += encryptionCoverage * 30 // 30% weight
      totalFactors += 30
    }

    // Factor 2: Key rotation health
    const { data: encryptionKeys } = await supabase
      .from('user_encryption_keys')
      .select('*')

    if (encryptionKeys && encryptionKeys.length > 0) {
      const now = new Date()
      const activeKeys = encryptionKeys.filter((key: any) => 
        !key.key_expires_at || new Date(key.key_expires_at) > now
      ).length

      const keyHealth = activeKeys / encryptionKeys.length
      totalScore += keyHealth * 25 // 25% weight
      totalFactors += 25
    }

    // Factor 3: Audit logging coverage
    const { count: auditLogs } = await supabase
      .from('encryption_audit_logs')
      .select('*', { count: 'exact', head: true })

    if (auditLogs && auditLogs > 0) {
      totalScore += 25 // 25% weight for having audit logs
      totalFactors += 25
    }

    // Factor 4: Security incidents
    const { count: securityIncidents } = await supabase
      .from('encryption_audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('success', false)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (securityIncidents === 0) {
      totalScore += 20 // 20% weight for no security incidents
      totalFactors += 20
    }

    return totalFactors > 0 ? Math.round((totalScore / totalFactors) * 100) : 100

  } catch (error) {
    logger.error('Failed to calculate compliance score:', error)
    return 100
  }
}

async function determineKeyRotationStatus(supabase: any): Promise<'healthy' | 'warning' | 'critical'> {
  try {
    const { data: encryptionKeys } = await supabase
      .from('user_encryption_keys')
      .select('*')

    if (!encryptionKeys || encryptionKeys.length === 0) {
      return 'warning'
    }

    const now = new Date()
    const warningThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    const criticalThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day

    let criticalCount = 0
    let warningCount = 0

    for (const key of encryptionKeys as any[]) {
      if (key.key_expires_at) {
        const expiryDate = new Date(key.key_expires_at)
        
        if (expiryDate <= criticalThreshold) {
          criticalCount++
        } else if (expiryDate <= warningThreshold) {
          warningCount++
        }
      }
    }

    if (criticalCount > 0) {
      return 'critical'
    } else if (warningCount > 0) {
      return 'warning'
    } else {
      return 'healthy'
    }

  } catch (error) {
    logger.error('Failed to determine key rotation status:', error)
    return 'warning'
  }
}

// =====================================================
// EXPORT
// =====================================================

export const GET = withErrorHandling(getSecurityMetricsHandler)
