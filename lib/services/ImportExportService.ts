import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface ImportRequest {
  dataType: DataType
  data: any
  format: 'json' | 'csv' | 'excel'
  options?: ImportOptions
}

export interface ExportRequest {
  dataType: DataType
  format: 'json' | 'csv' | 'excel' | 'pdf'
  filters?: Record<string, any>
  options?: ExportOptions
}

export type DataType = 
  | 'customers'
  | 'inventory'
  | 'orders'
  | 'partners'
  | 'meetings'
  | 'reports'
  | 'ai_estimations'
  | 'quality_checks'

export interface ImportOptions {
  updateExisting?: boolean
  skipDuplicates?: boolean
  validateData?: boolean
  batchSize?: number
  onConflict?: 'ignore' | 'update' | 'error'
}

export interface ExportOptions {
  includeHeaders?: boolean
  dateFormat?: string
  numberFormat?: string
  compression?: boolean
  maxRecords?: number
}

export interface ImportResult {
  id: string
  dataType: DataType
  operation: 'import'
  status: 'completed' | 'failed' | 'partial'
  totalRecords: number
  importedRecords: number
  failedRecords: number
  errors: ImportError[]
  processingTime: number
  createdAt: string
}

export interface ExportResult {
  id: string
  dataType: DataType
  operation: 'export'
  status: 'completed' | 'failed'
  totalRecords: number
  fileUrl?: string
  fileSize?: number
  processingTime: number
  createdAt: string
}

export interface ImportError {
  row: number
  field: string
  value: any
  message: string
}

export interface OperationHistory {
  id: string
  operation: 'import' | 'export'
  dataType: DataType
  status: 'completed' | 'failed' | 'partial' | 'in_progress'
  totalRecords: number
  processedRecords: number
  processingTime: number
  createdAt: string
  updatedAt: string
}

export class ImportExportService {
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

  async importData(request: ImportRequest): Promise<ImportResult> {
    const startTime = Date.now()
    const supabase = await this.getSupabase()

    const result: ImportResult = {
      id: crypto.randomUUID(),
      dataType: request.dataType,
      operation: 'import',
      status: 'completed',
      totalRecords: 0,
      importedRecords: 0,
      failedRecords: 0,
      errors: [],
      processingTime: 0,
      createdAt: new Date().toISOString()
    }

    try {
      // Parse data based on format
      const parsedData = this.parseData(request.data, request.format)
      result.totalRecords = parsedData.length

      // Validate data if requested
      if (request.options?.validateData) {
        const validationResult = this.validateData(parsedData, request.dataType)
        result.errors = validationResult.errors
        result.failedRecords = validationResult.errors.length
      }

      // Import data in batches
      const batchSize = request.options?.batchSize || 100
      const batches = this.chunkArray(parsedData, batchSize)

      for (const batch of batches) {
        const batchResult = await this.importBatch(batch, request.dataType, request.options)
        result.importedRecords += batchResult.imported
        result.failedRecords += batchResult.failed
        result.errors.push(...batchResult.errors)
      }

      // Determine final status
      if (result.failedRecords === 0) {
        result.status = 'completed'
      } else if (result.importedRecords > 0) {
        result.status = 'partial'
      } else {
        result.status = 'failed'
      }

    } catch (error: any) {
      result.status = 'failed'
      result.errors.push({
        row: 0,
        field: 'general',
        value: null,
        message: error.message
      })
    }

    result.processingTime = Date.now() - startTime

    // Save operation record
    await this.saveOperationRecord(result)

    return result
  }

  async exportData(request: ExportRequest): Promise<ExportResult> {
    const startTime = Date.now()
    const supabase = await this.getSupabase()

    const result: ExportResult = {
      id: crypto.randomUUID(),
      dataType: request.dataType,
      operation: 'export',
      status: 'completed',
      totalRecords: 0,
      processingTime: 0,
      createdAt: new Date().toISOString()
    }

    try {
      // Fetch data from database
      const data = await this.fetchDataForExport(request.dataType, request.filters)
      result.totalRecords = data.length

      // Format data based on export format
      const formattedData = this.formatDataForExport(data, request.format, request.options)

      // Generate file and get URL
      const fileInfo = await this.generateExportFile(formattedData, request.format, result.id)
      result.fileUrl = fileInfo.url
      result.fileSize = fileInfo.size

    } catch (error: any) {
      result.status = 'failed'
      throw error
    }

    result.processingTime = Date.now() - startTime

    // Save operation record
    await this.saveOperationRecord(result)

    return result
  }

  private parseData(data: any, format: string): any[] {
    switch (format) {
      case 'json':
        return Array.isArray(data) ? data : [data]
      case 'csv':
        return this.parseCSV(data)
      case 'excel':
        return this.parseExcel(data)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  private parseCSV(csvData: string): any[] {
    const lines = csvData.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const result = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        result.push(row)
      }
    }

    return result
  }

  private parseExcel(excelData: any): any[] {
    // This would typically use a library like xlsx
    // For now, we'll assume it's already parsed
    return Array.isArray(excelData) ? excelData : [excelData]
  }

  private validateData(data: any[], dataType: DataType): { errors: ImportError[] } {
    const errors: ImportError[] = []
    const validators = this.getValidators(dataType)

    data.forEach((row, index) => {
      Object.keys(validators).forEach(field => {
        const validator = validators[field]
        const value = row[field]

        if (validator.required && (!value || value === '')) {
          errors.push({
            row: index + 1,
            field,
            value,
            message: `${field} is required`
          })
        } else if (value && validator.type) {
          if (!this.validateFieldType(value, validator.type)) {
            errors.push({
              row: index + 1,
              field,
              value,
              message: `${field} must be of type ${validator.type}`
            })
          }
        }
      })
    })

    return { errors }
  }

  private getValidators(dataType: DataType): Record<string, any> {
    const validators: Record<DataType, Record<string, any>> = {
      customers: {
        name: { required: true, type: 'string' },
        email: { required: true, type: 'email' },
        phone: { required: false, type: 'string' }
      },
      inventory: {
        sku: { required: true, type: 'string' },
        name: { required: true, type: 'string' },
        quantity: { required: true, type: 'number' },
        price: { required: true, type: 'number' }
      },
      orders: {
        customer_id: { required: true, type: 'string' },
        total_amount: { required: true, type: 'number' },
        status: { required: true, type: 'string' }
      },
      partners: {
        name: { required: true, type: 'string' },
        type: { required: true, type: 'string' },
        email: { required: false, type: 'email' }
      },
      meetings: {
        title: { required: true, type: 'string' },
        meeting_date: { required: true, type: 'date' },
        type: { required: true, type: 'string' }
      },
      reports: {
        report_type: { required: true, type: 'string' },
        title: { required: true, type: 'string' }
      },
      ai_estimations: {
        item_type: { required: true, type: 'string' },
        total_price: { required: true, type: 'number' }
      },
      quality_checks: {
        item_id: { required: true, type: 'string' },
        result: { required: true, type: 'string' }
      }
    }

    return validators[dataType] || {}
  }

  private validateFieldType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' || !isNaN(Number(value))
      case 'email':
        return typeof value === 'string' && value.includes('@')
      case 'date':
        return !isNaN(Date.parse(value))
      default:
        return true
    }
  }

  private async importBatch(batch: any[], dataType: DataType, options?: ImportOptions): Promise<{
    imported: number
    failed: number
    errors: ImportError[]
  }> {
    const supabase = await this.getSupabase()
    const result = { imported: 0, failed: 0, errors: [] as ImportError[] }

    try {
      const { error } = await supabase
        .from(this.getTableName(dataType))
        .insert(batch)

      if (error) {
        result.failed = batch.length
        result.errors.push({
          row: 0,
          field: 'general',
          value: null,
          message: error.message
        })
      } else {
        result.imported = batch.length
      }
    } catch (error: any) {
      result.failed = batch.length
      result.errors.push({
        row: 0,
        field: 'general',
        value: null,
        message: error.message
      })
    }

    return result
  }

  private async fetchDataForExport(dataType: DataType, filters?: Record<string, any>): Promise<any[]> {
    const supabase = await this.getSupabase()

    let query = supabase
      .from(this.getTableName(dataType))
      .select('*')

    // Apply filters
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key]
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else {
          query = query.eq(key, value)
        }
      })
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch data: ${error.message}`)
    }

    return data || []
  }

  private formatDataForExport(data: any[], format: string, options?: ExportOptions): any {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.formatAsCSV(data, options)
      case 'excel':
        return this.formatAsExcel(data, options)
      case 'pdf':
        return this.formatAsPDF(data, options)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  private formatAsCSV(data: any[], options?: ExportOptions): string {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0])
    const csvRows = []

    // Add headers if requested
    if (options?.includeHeaders !== false) {
      csvRows.push(headers.join(','))
    }

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      })
      csvRows.push(values.join(','))
    })

    return csvRows.join('\n')
  }

  private formatAsExcel(data: any[], options?: ExportOptions): any {
    // This would typically use a library like xlsx
    // For now, return the data as-is
    return data
  }

  private formatAsPDF(data: any[], options?: ExportOptions): any {
    // This would typically use a library like puppeteer or jsPDF
    // For now, return the data as-is
    return data
  }

  private async generateExportFile(data: any, format: string, operationId: string): Promise<{
    url: string
    size: number
  }> {
    // In a real implementation, this would save to a file storage service
    // For now, we'll create a mock file URL
    const fileName = `export_${operationId}.${format}`
    const fileUrl = `/exports/${fileName}`
    const fileSize = JSON.stringify(data).length

    return { url: fileUrl, size: fileSize }
  }

  private getTableName(dataType: DataType): string {
    const tableNames: Record<DataType, string> = {
      customers: 'customers',
      inventory: 'inventory',
      orders: 'orders',
      partners: 'partners',
      meetings: 'meeting_briefs',
      reports: 'reports',
      ai_estimations: 'ai_estimations',
      quality_checks: 'quality_checks'
    }

    return tableNames[dataType]
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private async saveOperationRecord(result: ImportResult | ExportResult): Promise<void> {
    const supabase = await this.getSupabase()

    await supabase
      .from('import_export_operations')
      .insert({
        id: result.id,
        operation: result.operation,
        data_type: result.dataType,
        status: result.status,
        total_records: result.totalRecords,
        processed_records: result.operation === 'import' 
          ? (result as ImportResult).importedRecords 
          : result.totalRecords,
        processing_time: result.processingTime
      })
  }

  async getOperationHistory(filters: {
    operation?: string
    dataType?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ data: OperationHistory[], pagination: any }> {
    const supabase = await this.getSupabase()

    let query = supabase
      .from('import_export_operations')
      .select('*', { count: 'exact' })

    if (filters.operation) {
      query = query.eq('operation', filters.operation)
    }

    if (filters.dataType) {
      query = query.eq('data_type', filters.dataType)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const page = filters.page || 1
    const limit = filters.limit || 20
    const offset = (page - 1) * limit

    const { data: operations, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch operation history: ${error.message}`)
    }

    return {
      data: (operations || []).map((op: any) => ({
        id: op.id,
        operation: op.operation,
        dataType: op.data_type,
        status: op.status,
        totalRecords: op.total_records,
        processedRecords: op.processed_records,
        processingTime: op.processing_time,
        createdAt: op.created_at,
        updatedAt: op.updated_at
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async getOperationById(id: string): Promise<OperationHistory | null> {
    const supabase = await this.getSupabase()

    const { data: operation, error } = await supabase
      .from('import_export_operations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch operation: ${error.message}`)
    }

    return {
      id: operation.id,
      operation: operation.operation,
      dataType: operation.data_type,
      status: operation.status,
      totalRecords: operation.total_records,
      processedRecords: operation.processed_records,
      processingTime: operation.processing_time,
      createdAt: operation.created_at,
      updatedAt: operation.updated_at
    }
  }
}

export default ImportExportService
// Create and export a singleton instance
export const importExportService = new ImportExportService() 