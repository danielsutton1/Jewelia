import { supabase } from './supabase'

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  return { data, error }
}

export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicData.publicUrl
}

export async function downloadFile(bucket: string, path: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  if (error) {
    console.error('Error downloading file:', error)
    return null
  }

  return data
}

export async function getPublicUrlFromPath(bucket: string, path: string): Promise<string> {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFile(bucket: string, path: string): Promise<{ error: any }> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  return { error }
}

export async function listFiles(bucket: string, path?: string): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage.from(bucket).list(path)
  return { data, error }
}

// Helper function to generate a unique file path
export function generateFilePath(file: File, prefix: string = ''): string {
  const timestamp = new Date().getTime()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = file.name.split('.').pop()
  return `${prefix}/${timestamp}-${randomString}.${extension}`
} 
 
 