import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { z } from 'zod';
import { InventoryCreateSchema } from '@/lib/schemas/inventory.schemas';
import { CompleteOrderRequestSchema } from '@/lib/schemas/order.schemas';

export interface ImportResult {
  row: number;
  status: 'success' | 'error';
  errors?: string[];
  data?: any;
}

/**
 * ImportService handles parsing, validating, and processing inventory/customer import files.
 */
class ImportService {
  /**
   * Parse inventory or customer file (CSV/XLSX) and return data rows.
   */
  async parseInventoryFile(file: File): Promise<any[]> {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let data: any[] = [];
    if (ext === 'csv') {
      const text = await file.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      if (parsed.errors.length) throw new Error('CSV parse error');
      data = parsed.data;
    } else if (ext === 'xlsx') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    } else {
      throw new Error('Unsupported file format');
    }
    return data;
  }

  /**
   * Validate import data using Zod schemas for inventory or customers.
   */
  validateImportData(data: any[], type: 'inventory' | 'inventory_data' | 'customers'): ImportResult[] {
    const results: ImportResult[] = [];
    const schema = (type === 'inventory' || type === 'inventory_data') ? InventoryCreateSchema : CompleteOrderRequestSchema;
    data.forEach((row, idx) => {
      try {
        schema.parse(row);
        results.push({ row: idx + 1, status: 'success', data: row });
      } catch (err: any) {
        results.push({
          row: idx + 1,
          status: 'error',
          errors: err.errors?.map((e: any) => e.message) || ['Validation error'],
        });
      }
    });
    return results;
  }

  /**
   * Process import batch, handle duplicates, and rollback on failure.
   */
  async processImportBatch(data: any[], tenantId: string, type: 'inventory' | 'inventory_data' | 'customers', supabase: any): Promise<ImportResult[]> {
    const results: ImportResult[] = [];
    const table = (type === 'inventory' || type === 'inventory_data') ? (type === 'inventory_data' ? 'inventory_data' : 'inventory') : 'customers';
    const trx = supabase;
    let hasError = false;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        let exists;
        if (type === 'inventory' || type === 'inventory_data') {
          exists = await trx.from(table).select('id').eq('sku', row.sku).eq('tenant_id', tenantId).single();
        } else {
          exists = await trx.from(table).select('id').eq('email', row.email).eq('tenant_id', tenantId).single();
        }
        if (exists.data) {
          await trx.from(table).update(row).eq('id', exists.data.id);
          results.push({ row: i + 1, status: 'success', data: { ...row, updated: true } });
        } else {
          await trx.from(table).insert({ ...row, tenant_id: tenantId });
          results.push({ row: i + 1, status: 'success', data: { ...row, inserted: true } });
        }
      } catch (err: any) {
        hasError = true;
        results.push({ row: i + 1, status: 'error', errors: [err.message || 'Import error'] });
        break;
      }
    }
    if (hasError) {
      // TODO: Implement rollback if using a DB that supports it
    }
    return results;
  }

  /**
   * Generate import report from results.
   */
  generateImportReport(results: ImportResult[]) {
    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error').length,
      errorRows: results.filter(r => r.status === 'error').map(r => r.row),
    };
    return summary;
  }
}

export default ImportService; 