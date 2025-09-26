// CAD Files Management System Types
// Comprehensive type definitions for CAD file storage, version control, design workflows, and production integration

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface CADFile {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: FileType;
  mime_type?: string;
  version_number: number;
  parent_file_id?: string;
  is_latest_version: boolean;
  
  // Design Information
  design_name?: string;
  design_description?: string;
  designer_id?: string;
  designer_name?: string;
  design_category?: string;
  design_tags?: string[];
  
  // Technical Specifications
  dimensions?: FileDimensions;
  material_specs?: MaterialSpecifications;
  complexity_score?: number; // 0.00 to 10.00
  estimated_print_time?: number; // in minutes
  estimated_material_cost?: number;
  
  // Workflow Status
  workflow_status: WorkflowStatus;
  approval_status: ApprovalStatus;
  
  // Metadata
  thumbnail_path?: string;
  preview_url?: string;
  checksum?: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  
  // Related data (populated by joins)
  parent_file?: CADFile;
  child_files?: CADFile[];
  workflows?: DesignWorkflow[];
  comments?: CADFileComment[];
  production_links?: CADProductionLink[];
  permissions?: CADFilePermission[];
  changes?: CADFileChange[];
}

export interface DesignWorkflow {
  id: string;
  cad_file_id: string;
  workflow_type: WorkflowType;
  current_step: string;
  total_steps: number;
  status: WorkflowStatus;
  assigned_to?: string;
  assigned_by?: string;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  cad_file?: CADFile;
  steps?: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  step_name: string;
  step_type: WorkflowStepType;
  assigned_to?: string;
  status: StepStatus;
  required_approval: boolean;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  workflow?: DesignWorkflow;
}

export interface CADFileCategory {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  color?: string; // Hex color code
  icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  
  // Related data
  parent_category?: CADFileCategory;
  child_categories?: CADFileCategory[];
  files?: CADFile[];
}

export interface CADFileComment {
  id: string;
  cad_file_id: string;
  parent_comment_id?: string;
  author_id?: string;
  author_name: string;
  comment_type: CommentType;
  content: string;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  cad_file?: CADFile;
  parent_comment?: CADFileComment;
  child_comments?: CADFileComment[];
}

export interface CADProductionLink {
  id: string;
  cad_file_id: string;
  production_item_id?: string;
  production_order_id?: string;
  link_type: ProductionLinkType;
  manufacturing_notes?: string;
  material_requirements?: MaterialRequirements;
  cost_impact?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Related data
  cad_file?: CADFile;
}

export interface CADFilePermission {
  id: string;
  cad_file_id: string;
  user_id?: string;
  role: PermissionRole;
  permissions: PermissionSet;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  
  // Related data
  cad_file?: CADFile;
}

export interface CADFileChange {
  id: string;
  cad_file_id: string;
  change_type: ChangeType;
  changed_by?: string;
  changed_by_name?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  change_reason?: string;
  created_at: string;
  
  // Related data
  cad_file?: CADFile;
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface FileDimensions {
  length?: number;
  width?: number;
  height?: number;
  units: 'mm' | 'cm' | 'inches';
}

export interface MaterialSpecifications {
  material_type: string;
  weight?: number;
  density?: number;
  hardness?: number;
  color?: string;
  finish?: string;
  additional_properties?: Record<string, any>;
}

export interface MaterialRequirements {
  material_type: string;
  quantity: number;
  unit: string;
  specifications?: Record<string, any>;
  cost_per_unit?: number;
  total_cost?: number;
}

export interface PermissionSet {
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_share: boolean;
  can_download: boolean;
  can_comment: boolean;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateCADFileRequest {
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: FileType;
  mime_type?: string;
  parent_file_id?: string;
  
  // Design Information
  design_name?: string;
  design_description?: string;
  designer_id?: string;
  designer_name?: string;
  design_category?: string;
  design_tags?: string[];
  
  // Technical Specifications
  dimensions?: FileDimensions;
  material_specs?: MaterialSpecifications;
  complexity_score?: number;
  estimated_print_time?: number;
  estimated_material_cost?: number;
  
  // Metadata
  thumbnail_path?: string;
  preview_url?: string;
  checksum?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCADFileRequest {
  design_name?: string;
  design_description?: string;
  designer_id?: string;
  designer_name?: string;
  design_category?: string;
  design_tags?: string[];
  
  // Technical Specifications
  dimensions?: FileDimensions;
  material_specs?: MaterialSpecifications;
  complexity_score?: number;
  estimated_print_time?: number;
  estimated_material_cost?: number;
  
  // Workflow Status
  workflow_status?: WorkflowStatus;
  approval_status?: ApprovalStatus;
  
  // Metadata
  thumbnail_path?: string;
  preview_url?: string;
  metadata?: Record<string, any>;
}

export interface CreateWorkflowRequest {
  cad_file_id: string;
  workflow_type: WorkflowType;
  current_step: string;
  total_steps: number;
  assigned_to?: string;
  assigned_by?: string;
  due_date?: string;
  notes?: string;
  steps?: CreateWorkflowStepRequest[];
}

export interface CreateWorkflowStepRequest {
  step_number: number;
  step_name: string;
  step_type: WorkflowStepType;
  assigned_to?: string;
  required_approval?: boolean;
  due_date?: string;
  notes?: string;
}

export interface CreateCommentRequest {
  cad_file_id: string;
  parent_comment_id?: string;
  author_id?: string;
  author_name: string;
  comment_type?: CommentType;
  content: string;
}

export interface FileUploadRequest {
  file: File;
  design_name?: string;
  design_description?: string;
  designer_id?: string;
  designer_name?: string;
  design_category?: string;
  design_tags?: string[];
  parent_file_id?: string;
  metadata?: Record<string, any>;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parent_category_id?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parent_category_id?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateProductionLinkRequest {
  cad_file_id: string;
  production_item_id?: string;
  production_order_id?: string;
  link_type: ProductionLinkType;
  manufacturing_notes?: string;
  material_requirements?: MaterialRequirements;
  cost_impact?: number;
}

export interface CreatePermissionRequest {
  cad_file_id: string;
  user_id?: string;
  role: PermissionRole;
  permissions?: Partial<PermissionSet>;
  granted_by?: string;
  expires_at?: string;
}

// ============================================================================
// FILTER AND SEARCH TYPES
// ============================================================================

export interface CADFileFilters {
  search?: string;
  file_type?: FileType;
  workflow_status?: WorkflowStatus;
  approval_status?: ApprovalStatus;
  design_category?: string;
  designer_id?: string;
  designer_name?: string;
  complexity_min?: number;
  complexity_max?: number;
  cost_min?: number;
  cost_max?: number;
  tags?: string[];
  is_latest_version?: boolean;
  parent_file_id?: string;
  created_after?: string;
  created_before?: string;
  approved_after?: string;
  approved_before?: string;
}

export interface WorkflowFilters {
  cad_file_id?: string;
  workflow_type?: WorkflowType;
  status?: WorkflowStatus;
  assigned_to?: string;
  assigned_by?: string;
  due_after?: string;
  due_before?: string;
  completed_after?: string;
  completed_before?: string;
}

export interface CategoryFilters {
  search?: string;
  parent_category_id?: string;
  is_active?: boolean;
  has_files?: boolean;
}

export interface CommentFilters {
  cad_file_id?: string;
  author_id?: string;
  comment_type?: CommentType;
  is_resolved?: boolean;
  created_after?: string;
  created_before?: string;
}

export interface SearchParameters {
  query: string;
  file_types?: FileType[];
  categories?: string[];
  tags?: string[];
  designers?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  status?: WorkflowStatus[];
  complexity_range?: {
    min: number;
    max: number;
  };
}

// ============================================================================
// PAGINATION AND RESPONSE TYPES
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  filters?: any;
}

export interface CADFileListResponse extends PaginatedResponse<CADFile> {
  categories: CADFileCategory[];
  stats: {
    total_files: number;
    total_versions: number;
    approved_files: number;
    pending_review: number;
    in_production: number;
  };
}

export interface WorkflowListResponse extends PaginatedResponse<DesignWorkflow> {
  stats: {
    active_workflows: number;
    completed_workflows: number;
    overdue_workflows: number;
    pending_approvals: number;
  };
}

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export enum FileType {
  STL = 'stl',
  THREE_DM = '3dm',
  CAD = 'cad',
  STEP = 'step',
  IGES = 'iges',
  OBJ = 'obj',
  DWG = 'dwg',
  DXF = 'dxf',
  SKP = 'skp',
  BLEND = 'blend',
  MAX = 'max',
  FBX = 'fbx',
  OTHER = 'other'
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PRODUCTION = 'in_production',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVISION = 'needs_revision'
}

export enum WorkflowType {
  DESIGN_REVIEW = 'design_review',
  PRODUCTION_APPROVAL = 'production_approval',
  QUALITY_CHECK = 'quality_check',
  CUSTOMER_APPROVAL = 'customer_approval'
}

export enum WorkflowStepType {
  REVIEW = 'review',
  APPROVAL = 'approval',
  REVISION = 'revision',
  NOTIFICATION = 'notification',
  QUALITY_CHECK = 'quality_check'
}

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  REJECTED = 'rejected'
}

export enum CommentType {
  GENERAL = 'general',
  FEEDBACK = 'feedback',
  REVISION_REQUEST = 'revision_request',
  APPROVAL_NOTE = 'approval_note',
  PRODUCTION_NOTE = 'production_note'
}

export enum ProductionLinkType {
  PRIMARY_DESIGN = 'primary_design',
  REFERENCE_DESIGN = 'reference_design',
  TOOLING = 'tooling',
  FIXTURE = 'fixture',
  PACKAGING = 'packaging'
}

export enum PermissionRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  APPROVER = 'approver',
  REVIEWER = 'reviewer'
}

export enum ChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  VERSION_CREATED = 'version_created',
  STATUS_CHANGED = 'status_changed',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// ============================================================================
// CONSTANTS AND UTILITIES
// ============================================================================

export const FILE_TYPE_OPTIONS: FileType[] = [
  FileType.STL, FileType.THREE_DM, FileType.CAD, FileType.STEP,
  FileType.IGES, FileType.OBJ, FileType.DWG, FileType.DXF,
  FileType.SKP, FileType.BLEND, FileType.MAX, FileType.FBX, FileType.OTHER
];

export const WORKFLOW_STATUS_OPTIONS: WorkflowStatus[] = [
  WorkflowStatus.DRAFT, WorkflowStatus.IN_REVIEW, WorkflowStatus.APPROVED,
  WorkflowStatus.REJECTED, WorkflowStatus.IN_PRODUCTION, WorkflowStatus.COMPLETED,
  WorkflowStatus.ARCHIVED
];

export const WORKFLOW_TYPE_OPTIONS: WorkflowType[] = [
  WorkflowType.DESIGN_REVIEW, WorkflowType.PRODUCTION_APPROVAL,
  WorkflowType.QUALITY_CHECK, WorkflowType.CUSTOMER_APPROVAL
];

export const COMMENT_TYPE_OPTIONS: CommentType[] = [
  CommentType.GENERAL, CommentType.FEEDBACK, CommentType.REVISION_REQUEST,
  CommentType.APPROVAL_NOTE, CommentType.PRODUCTION_NOTE
];

export const PRODUCTION_LINK_TYPE_OPTIONS: ProductionLinkType[] = [
  ProductionLinkType.PRIMARY_DESIGN, ProductionLinkType.REFERENCE_DESIGN,
  ProductionLinkType.TOOLING, ProductionLinkType.FIXTURE, ProductionLinkType.PACKAGING
];

export const PERMISSION_ROLE_OPTIONS: PermissionRole[] = [
  PermissionRole.OWNER, PermissionRole.EDITOR, PermissionRole.VIEWER,
  PermissionRole.APPROVER, PermissionRole.REVIEWER
];

// Default permission sets for each role
export const DEFAULT_PERMISSIONS: Record<PermissionRole, PermissionSet> = {
  [PermissionRole.OWNER]: {
    can_view: true,
    can_edit: true,
    can_delete: true,
    can_approve: true,
    can_share: true,
    can_download: true,
    can_comment: true,
  },
  [PermissionRole.EDITOR]: {
    can_view: true,
    can_edit: true,
    can_delete: false,
    can_approve: false,
    can_share: false,
    can_download: true,
    can_comment: true,
  },
  [PermissionRole.VIEWER]: {
    can_view: true,
    can_edit: false,
    can_delete: false,
    can_approve: false,
    can_share: false,
    can_download: false,
    can_comment: true,
  },
  [PermissionRole.APPROVER]: {
    can_view: true,
    can_edit: false,
    can_delete: false,
    can_approve: true,
    can_share: false,
    can_download: true,
    can_comment: true,
  },
  [PermissionRole.REVIEWER]: {
    can_view: true,
    can_edit: false,
    can_delete: false,
    can_approve: false,
    can_share: false,
    can_download: true,
    can_comment: true,
  },
};

// File type MIME types mapping
export const FILE_TYPE_MIME_TYPES: Record<FileType, string[]> = {
  [FileType.STL]: ['application/octet-stream', 'model/stl'],
  [FileType.THREE_DM]: ['application/octet-stream', 'model/3dm'],
  [FileType.CAD]: ['application/octet-stream', 'application/cad'],
  [FileType.STEP]: ['application/step', 'model/step'],
  [FileType.IGES]: ['application/iges', 'model/iges'],
  [FileType.OBJ]: ['text/plain', 'model/obj'],
  [FileType.DWG]: ['application/acad', 'image/vnd.dwg'],
  [FileType.DXF]: ['application/dxf', 'image/vnd.dxf'],
  [FileType.SKP]: ['application/octet-stream', 'model/skp'],
  [FileType.BLEND]: ['application/x-blender', 'model/blend'],
  [FileType.MAX]: ['application/octet-stream', 'model/3dsmax'],
  [FileType.FBX]: ['application/octet-stream', 'model/fbx'],
  [FileType.OTHER]: ['application/octet-stream'],
};

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZES: Record<FileType, number> = {
  [FileType.STL]: 100 * 1024 * 1024, // 100MB
  [FileType.THREE_DM]: 200 * 1024 * 1024, // 200MB
  [FileType.CAD]: 150 * 1024 * 1024, // 150MB
  [FileType.STEP]: 100 * 1024 * 1024, // 100MB
  [FileType.IGES]: 100 * 1024 * 1024, // 100MB
  [FileType.OBJ]: 50 * 1024 * 1024, // 50MB
  [FileType.DWG]: 50 * 1024 * 1024, // 50MB
  [FileType.DXF]: 50 * 1024 * 1024, // 50MB
  [FileType.SKP]: 100 * 1024 * 1024, // 100MB
  [FileType.BLEND]: 200 * 1024 * 1024, // 200MB
  [FileType.MAX]: 200 * 1024 * 1024, // 200MB
  [FileType.FBX]: 150 * 1024 * 1024, // 150MB
  [FileType.OTHER]: 100 * 1024 * 1024, // 100MB
};

// Utility functions
export const getFileTypeFromExtension = (filename: string): FileType => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'stl': return FileType.STL;
    case '3dm': return FileType.THREE_DM;
    case 'cad': return FileType.CAD;
    case 'step':
    case 'stp': return FileType.STEP;
    case 'iges':
    case 'igs': return FileType.IGES;
    case 'obj': return FileType.OBJ;
    case 'dwg': return FileType.DWG;
    case 'dxf': return FileType.DXF;
    case 'skp': return FileType.SKP;
    case 'blend': return FileType.BLEND;
    case 'max': return FileType.MAX;
    case 'fbx': return FileType.FBX;
    default: return FileType.OTHER;
  }
};

export const getMaxFileSize = (fileType: FileType): number => {
  return MAX_FILE_SIZES[fileType] || MAX_FILE_SIZES[FileType.OTHER];
};

export const isValidFileType = (fileType: FileType): boolean => {
  return FILE_TYPE_OPTIONS.includes(fileType);
};

export const getDefaultPermissions = (role: PermissionRole): PermissionSet => {
  return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS[PermissionRole.VIEWER];
}; 