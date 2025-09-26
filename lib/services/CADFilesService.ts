import { createClient } from '@supabase/supabase-js';
import {
  CADFile,
  DesignWorkflow,
  WorkflowStep,
  CADFileCategory,
  CADFileComment,
  CADProductionLink,
  CADFilePermission,
  CADFileChange,
  CreateCADFileRequest,
  UpdateCADFileRequest,
  CreateWorkflowRequest,
  CreateCommentRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateProductionLinkRequest,
  CreatePermissionRequest,
  CADFileFilters,
  WorkflowFilters,
  CategoryFilters,
  CommentFilters,
  SearchParameters,
  PaginationParams,
  CADFileListResponse,
  WorkflowListResponse,
  FileType,
  WorkflowStatus,
  ApprovalStatus,
  WorkflowType,
  WorkflowStepType,
  StepStatus,
  CommentType,
  ProductionLinkType,
  PermissionRole,
  ChangeType,
  getFileTypeFromExtension,
  getMaxFileSize,
  isValidFileType,
  getDefaultPermissions
} from '@/types/cad-files';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class CADFilesService {
  // ============================================================================
  // CAD FILE MANAGEMENT
  // ============================================================================

  /**
   * Create a new CAD file
   */
  async createCADFile(data: CreateCADFileRequest): Promise<CADFile> {
    try {
      // Validate file type
      if (!isValidFileType(data.file_type)) {
        throw new Error(`Invalid file type: ${data.file_type}`);
      }

      // Check file size limit
      const maxSize = getMaxFileSize(data.file_type);
      if (data.file_size > maxSize) {
        throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
      }

      // Map the data to the actual database schema
      const insertData = {
        "Project ID": data.design_name || '',
        "Product Name": data.original_filename,
        "CAD File Name": data.filename,
        "File Link/Path": data.file_path,
        "Designer": data.designer_name || '',
        "Date Uploaded": new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        "Status": 'Draft',
        "Notes": data.design_description || ''
      };

      const { data: file, error } = await supabase
        .from('cad_files')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create CAD file: ${error.message}`);
      }

      // Log the change
      await this.logFileChange(file.id, ChangeType.CREATED, undefined, insertData);

      return this.mapDatabaseToCADFile(file);
    } catch (error) {
      console.error('Error in createCADFile:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get CAD file by ID
   */
  async getCADFileById(id: string): Promise<CADFile | null> {
    try {
      const { data: file, error } = await supabase
        .from('cad_files')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // File not found
        }
        throw new Error(`Failed to get CAD file: ${error.message}`);
      }

      return this.mapDatabaseToCADFile(file);
    } catch (error) {
      console.error('Error in getCADFileById:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * List CAD files with filtering and pagination
   */
  async listCADFiles(filters: CADFileFilters = {}, pagination: PaginationParams = {}): Promise<CADFileListResponse> {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('cad_files')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`"CAD File Name".ilike.%${filters.search}%,"Product Name".ilike.%${filters.search}%`);
      }
      if (filters.file_type) {
        // Note: file_type is not in the current schema, so we'll skip this filter
        console.warn('File type filter not supported in current schema');
      }
      if (filters.workflow_status) {
        query = query.eq('Status', filters.workflow_status);
      }
      if (filters.design_category) {
        // Note: category_id is not in the current schema, so we'll skip this filter
        console.warn('Design category filter not supported in current schema');
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      query = query.order('"Date Uploaded"', { ascending: false });

      const { data: files, error, count } = await query;

      if (error) {
        throw new Error(`Failed to list CAD files: ${error.message}`);
      }

      // Map database records to CADFile objects
      const mappedFiles = (files || []).map(file => this.mapDatabaseToCADFile(file));

      // Get basic statistics
      const stats = await this.getCADFileStats();

      return {
        data: mappedFiles,
        pagination: {
          total: count || 0,
          page,
          limit,
          total_pages: Math.ceil((count || 0) / limit)
        },
        filters,
        categories: [], // No categories in current schema
        stats
      };
    } catch (error) {
      console.error('Error in listCADFiles:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Update CAD file
   */
  async updateCADFile(id: string, data: UpdateCADFileRequest): Promise<CADFile> {
    try {
      const oldFile = await this.getCADFileById(id);
      if (!oldFile) {
        throw new Error('CAD file not found');
      }

      // Map the update data to the actual database schema
      const updateData: any = {};
      if (data.design_name !== undefined) updateData["Project ID"] = data.design_name;
      if (data.design_description !== undefined) updateData["Notes"] = data.design_description;
      if (data.designer_name !== undefined) updateData["Designer"] = data.designer_name;
      if (data.workflow_status !== undefined) updateData["Status"] = data.workflow_status;

      const { data: file, error } = await supabase
        .from('cad_files')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update CAD file: ${error.message}`);
      }

      // Log the change
      await this.logFileChange(id, ChangeType.UPDATED, oldFile, updateData);

      return this.mapDatabaseToCADFile(file);
    } catch (error) {
      console.error('Error in updateCADFile:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Delete CAD file
   */
  async deleteCADFile(id: string): Promise<boolean> {
    try {
      // Check if file exists and can be deleted
      const file = await this.getCADFileById(id);
      if (!file) {
        throw new Error('CAD file not found');
      }

      const { error } = await supabase
        .from('cad_files')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete CAD file: ${error.message}`);
      }

      // Log the change
      await this.logFileChange(id, ChangeType.UPDATED, file, undefined);

      return true;
    } catch (error) {
      console.error('Error in deleteCADFile:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Create a new version of an existing CAD file
   */
  async createNewVersion(parentFileId: string, data: CreateCADFileRequest): Promise<CADFile> {
    try {
      const parentFile = await this.getCADFileById(parentFileId);
      if (!parentFile) {
        throw new Error('Parent CAD file not found');
      }

      // Create new version with parent reference
      const versionData = {
        ...data,
        parent_file_id: parentFileId,
        version_number: (parentFile.version_number || 0) + 1
      };

      return await this.createCADFile(versionData);
    } catch (error) {
      console.error('Error in createNewVersion:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get version history for a CAD file
   */
  async getFileVersionHistory(fileId: string): Promise<CADFile[]> {
    try {
      const { data: files, error } = await supabase
        .from('cad_files')
        .select('*')
        .or(`id.eq.${fileId},parent_file_id.eq.${fileId}`)
        .order('"Date Uploaded"', { ascending: true });

      if (error) {
        throw new Error(`Failed to get file version history: ${error.message}`);
      }

      return (files || []).map(file => this.mapDatabaseToCADFile(file));
    } catch (error) {
      console.error('Error in getFileVersionHistory:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  // ============================================================================
  // WORKFLOW MANAGEMENT (Simplified - not in current schema)
  // ============================================================================

  /**
   * Create a new design workflow
   */
  async createWorkflow(data: CreateWorkflowRequest): Promise<DesignWorkflow> {
    throw new Error('Workflow management not supported in current schema');
  }

  /**
   * List workflows with filtering and pagination
   */
  async listWorkflows(filters: WorkflowFilters = {}, pagination: PaginationParams = {}): Promise<WorkflowListResponse> {
    throw new Error('Workflow management not supported in current schema');
  }

  /**
   * Update workflow step status
   */
  async updateWorkflowStep(stepId: string, status: StepStatus, completedBy?: string, notes?: string): Promise<WorkflowStep> {
    throw new Error('Workflow management not supported in current schema');
  }

  // ============================================================================
  // CATEGORY MANAGEMENT (Simplified - not in current schema)
  // ============================================================================

  /**
   * Create a new CAD file category
   */
  async createCategory(data: CreateCategoryRequest): Promise<CADFileCategory> {
    throw new Error('Category management not supported in current schema');
  }

  /**
   * List categories with filtering
   */
  async listCategories(filters: CategoryFilters = {}): Promise<CADFileCategory[]> {
    return []; // No categories in current schema
  }

  // ============================================================================
  // COMMENT MANAGEMENT (Simplified - not in current schema)
  // ============================================================================

  /**
   * Create a new comment on a CAD file
   */
  async createComment(data: CreateCommentRequest): Promise<CADFileComment> {
    throw new Error('Comment management not supported in current schema');
  }

  /**
   * List comments for a CAD file
   */
  async listComments(filters: CommentFilters = {}): Promise<CADFileComment[]> {
    return []; // No comments in current schema
  }

  // ============================================================================
  // PRODUCTION LINK MANAGEMENT (Simplified - not in current schema)
  // ============================================================================

  /**
   * Create a production link for a CAD file
   */
  async createProductionLink(data: CreateProductionLinkRequest): Promise<CADProductionLink> {
    throw new Error('Production link management not supported in current schema');
  }

  /**
   * Get production links for a CAD file
   */
  async getProductionLinks(cadFileId: string): Promise<CADProductionLink[]> {
    return []; // No production links in current schema
  }

  // ============================================================================
  // PERMISSION MANAGEMENT (Simplified - not in current schema)
  // ============================================================================

  /**
   * Create a permission for a CAD file
   */
  async createPermission(data: CreatePermissionRequest): Promise<CADFilePermission> {
    throw new Error('Permission management not supported in current schema');
  }

  // ============================================================================
  // ANALYTICS & STATISTICS
  // ============================================================================

  /**
   * Get CAD file statistics
   */
  private async getCADFileStats() {
    try {
      // Get total count
      const { count: total } = await supabase
        .from('cad_files')
        .select('*', { count: 'exact', head: true });

      // Get status breakdown
      const { data: statusBreakdown } = await supabase
        .from('cad_files')
        .select('Status');

      const statusCounts = (statusBreakdown || []).reduce((acc: any, file: any) => {
        const status = file.Status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Get recent uploads (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateString = thirtyDaysAgo.toISOString().split('T')[0];

      const { count: recentUploads } = await supabase
        .from('cad_files')
        .select('*', { count: 'exact', head: true })
        .gte('"Date Uploaded"', dateString);

      return {
        total_files: total || 0,
        total_versions: 0, // Not available in current schema
        approved_files: statusCounts['Approved'] || 0,
        pending_review: statusCounts['Draft'] || 0,
        in_production: statusCounts['In Production'] || 0
      };
    } catch (error) {
      console.error('Error getting CAD file stats:', error);
      return {
        total_files: 0,
        total_versions: 0,
        approved_files: 0,
        pending_review: 0,
        in_production: 0
      };
    }
  }

  /**
   * Get workflow statistics
   */
  private async getWorkflowStats() {
    // Not supported in current schema
    return {
      total_workflows: 0,
      active_workflows: 0,
      completed_workflows: 0,
      average_completion_time: 0
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Log file changes for audit trail
   */
  private async logFileChange(
    fileId: string,
    changeType: ChangeType,
    oldValues?: any,
    newValues?: any,
    changedBy?: string,
    changeReason?: string
  ) {
    try {
      // Note: Change logging not supported in current schema
      console.log('File change logged:', { fileId, changeType, oldValues, newValues, changedBy, changeReason });
    } catch (error) {
      console.error('Error logging file change:', error);
    }
  }

  /**
   * Search CAD files with advanced parameters
   */
  async searchCADFiles(params: SearchParameters, pagination: PaginationParams = {}): Promise<CADFile[]> {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('cad_files')
        .select('*');

      // Apply search filters
      if (params.query) {
        query = query.or(`"CAD File Name".ilike.%${params.query}%,"Product Name".ilike.%${params.query}%,"Notes".ilike.%${params.query}%`);
      }

      if (params.designers && params.designers.length > 0) {
        query = query.in('Designer', params.designers);
      }

      if (params.status && params.status.length > 0) {
        query = query.in('Status', params.status);
      }

      if (params.date_range) {
        query = query.gte('"Date Uploaded"', params.date_range.start)
                   .lte('"Date Uploaded"', params.date_range.end);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      query = query.order('"Date Uploaded"', { ascending: false });

      const { data: files, error } = await query;

      if (error) {
        throw new Error(`Failed to search CAD files: ${error.message}`);
      }

      return (files || []).map(file => this.mapDatabaseToCADFile(file));
    } catch (error) {
      console.error('Error in searchCADFiles:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Map database record to CADFile object
   */
  private mapDatabaseToCADFile(dbRecord: any): CADFile {
    return {
      id: dbRecord.id,
      filename: dbRecord["CAD File Name"] || '',
      original_filename: dbRecord["Product Name"] || '',
      file_path: dbRecord["File Link/Path"] || '',
      file_size: 0, // Not available in current schema
      file_type: getFileTypeFromExtension(dbRecord["CAD File Name"] || ''),
      version_number: 1, // Not available in current schema
      is_latest_version: true, // Not available in current schema
      
      // Design Information
      design_name: dbRecord["Project ID"] || '',
      design_description: dbRecord["Notes"] || '',
      designer_name: dbRecord["Designer"] || '',
      
      // Workflow Status
      workflow_status: (dbRecord["Status"] as WorkflowStatus) || WorkflowStatus.DRAFT,
      approval_status: ApprovalStatus.PENDING,
      
      // Timestamps
      created_at: dbRecord["Date Uploaded"] ? new Date(dbRecord["Date Uploaded"]).toISOString() : new Date().toISOString(),
      updated_at: dbRecord["Date Uploaded"] ? new Date(dbRecord["Date Uploaded"]).toISOString() : new Date().toISOString(),
      
      // Related data (empty arrays since not available in current schema)
      parent_file: undefined,
      child_files: [],
      workflows: [],
      comments: [],
      production_links: [],
      permissions: [],
      changes: []
    };
  }
}

export const cadFilesService = new CADFilesService(); 