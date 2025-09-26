import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  meta?: Record<string, any>;
}

/**
 * Abstract base service for all business entities.
 * Handles tenant_id, CRUD, error handling, and logging.
 */
export default abstract class BaseService<T> {
  protected supabase: SupabaseClient;
  protected tenant_id: string;
  protected table: string;
  protected abstract endpoint: string;
  protected abstract schema: z.ZodType<T>;

  constructor(supabase: SupabaseClient, tenant_id: string, table: string) {
    this.supabase = supabase;
    this.tenant_id = tenant_id;
    this.table = table;
  }

  /**
   * Find all records for this tenant.
   */
  async findAll(): Promise<ServiceResponse<T[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .select('*')
        .eq('tenant_id', this.tenant_id);
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      this.logError('findAll', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Find a record by ID for this tenant.
   */
  async findById(id: string): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .eq('tenant_id', this.tenant_id)
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      this.logError('findById', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Create a new record for this tenant.
   */
  async create(payload: Partial<T>): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .insert([{ ...payload, tenant_id: this.tenant_id }])
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      this.logError('create', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update a record by ID for this tenant.
   */
  async update(id: string, payload: Partial<T>): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .update(payload)
        .eq('id', id)
        .eq('tenant_id', this.tenant_id)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      this.logError('update', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Soft delete a record by ID (set status to 'inactive').
   */
  async softDelete(id: string): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .update({ status: 'inactive' })
        .eq('id', id)
        .eq('tenant_id', this.tenant_id)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      this.logError('softDelete', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Log errors with context.
   */
  protected logError(method: string, error: any) {
    // You can replace this with a more robust logger
    console.error(`[${this.table}] ${method} error:`, error);
  }

  async getAll(): Promise<T[]> {
    const response = await this.supabase
      .from(this.table)
      .select('*')
      .eq('tenant_id', this.tenant_id);
    if (response.error) throw response.error;
    return response.data;
  }

  async getById(id: string): Promise<T> {
    const response = await this.supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .eq('tenant_id', this.tenant_id)
      .single();
    if (response.error) throw response.error;
    return response.data;
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase
      .from(this.table)
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenant_id);
    if (response.error) throw response.error;
  }

  async validate(data: unknown): Promise<T> {
    return this.schema.parse(data);
  }
} 