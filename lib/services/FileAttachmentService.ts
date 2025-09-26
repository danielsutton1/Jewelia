import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export interface FileAttachment {
  id: string
  message_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  mime_type: string
  uploaded_by: string
  created_at: string
  metadata?: Record<string, any>
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export class FileAttachmentService {
  private supabase = createSupabaseBrowserClient()
  private readonly STORAGE_BUCKET = 'message-attachments'
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  private readonly ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-rar-compressed'
  ]

  constructor() {
    this.initializeStorage()
  }

  private   async initializeStorage() {
    try {
      // Check if storage bucket exists, but don't try to create it
      // The bucket should already exist in Supabase
      const { data: buckets } = await this.supabase.storage.listBuckets()
      const bucketExists = buckets?.some((bucket: any) => bucket.name === this.STORAGE_BUCKET)
      
      if (!bucketExists) {
        console.warn(`Storage bucket '${this.STORAGE_BUCKET}' not found. Please create it manually in Supabase dashboard.`)
      } else {
        console.log(`Storage bucket '${this.STORAGE_BUCKET}' found and ready.`)
      }
    } catch (error) {
      console.error('Error checking storage bucket:', error)
    }
  }

  // Upload file to storage and create attachment record
  async uploadFile(
    file: File,
    messageId: string,
    uploadedBy: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileAttachment | null> {
    try {
      // Validate file
      if (!this.validateFile(file)) {
        throw new Error('Invalid file type or size')
      }

      // Generate unique file path
      const fileExtension = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`
      const filePath = `${messageId}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(filePath)

      // Create attachment record in database
      const { data: attachment, error: dbError } = await this.supabase
        .from('message_attachments')
        .insert({
          message_id: messageId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: fileExtension || 'unknown',
          mime_type: file.type,
          uploaded_by: uploadedBy,
          metadata: {
            original_name: file.name,
            last_modified: file.lastModified
          }
        })
        .select()
        .single()

      if (dbError) throw dbError

      console.log('✅ File uploaded successfully:', attachment)
      return attachment
    } catch (error) {
      console.error('Error uploading file:', error)
      return null
    }
  }

  // Download file
  async downloadFile(filePath: string): Promise<Blob | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .download(filePath)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error downloading file:', error)
      return null
    }
  }

  // Get file attachments for a message
  async getMessageAttachments(messageId: string): Promise<FileAttachment[]> {
    try {
      const { data, error } = await this.supabase
        .from('message_attachments')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching message attachments:', error)
      return []
    }
  }

  // Delete file attachment
  async deleteAttachment(attachmentId: string): Promise<boolean> {
    try {
      // Get attachment details first
      const { data: attachment, error: fetchError } = await this.supabase
        .from('message_attachments')
        .select('file_path')
        .eq('id', attachmentId)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      if (attachment?.file_path) {
        const { error: storageError } = await this.supabase.storage
          .from(this.STORAGE_BUCKET)
          .remove([attachment.file_path])

        if (storageError) {
          console.warn('Could not delete file from storage:', storageError)
        }
      }

      // Delete from database
      const { error: dbError } = await this.supabase
        .from('message_attachments')
        .delete()
        .eq('id', attachmentId)

      if (dbError) throw dbError

      console.log('✅ Attachment deleted successfully')
      return true
    } catch (error) {
      console.error('Error deleting attachment:', error)
      return false
    }
  }

  // Get file preview URL (for images, PDFs, etc.)
  getFilePreviewUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.STORAGE_BUCKET)
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }

  // Validate file before upload
  private validateFile(file: File): boolean {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      console.error('File too large:', file.size, 'bytes')
      return false
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      console.error('File type not allowed:', file.type)
      return false
    }

    return true
  }

  // Get file icon based on type
  getFileIcon(fileType: string): string {
    const iconMap: Record<string, string> = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'txt': '📄',
      'csv': '📊',
      'zip': '📦',
      'rar': '📦',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'webp': '🖼️'
    }

    return iconMap[fileType.toLowerCase()] || '📎'
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Check if file is previewable (image, PDF, etc.)
  isPreviewable(fileType: string): boolean {
    const previewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']
    return previewableTypes.includes(fileType.toLowerCase())
  }
}

// Export singleton instance
export const fileAttachmentService = new FileAttachmentService()
