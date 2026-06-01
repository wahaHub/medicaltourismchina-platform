/**
 * File Upload Service using Supabase Storage
 *
 * Uploads medical documents to Supabase Storage bucket (PRIVATE)
 * Uses signed URLs for secure access
 */

import { supabase } from '@/config/supabaseClient';

const BUCKET_NAME = 'case-intake-files';
// Signed URL expiry: 1 year (for long-term access to medical documents)
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365;

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string; // Store path for generating new signed URLs later
  error?: string;
}

/**
 * Upload a file to Supabase Storage (PRIVATE bucket)
 * Files are stored in a user-specific folder: {userId}/{caseIntakeId}/{examType}/{filename}
 * Returns a signed URL for secure access
 */
export async function uploadFile(
  file: File,
  userId: string,
  caseIntakeId: string,
  examType: string
): Promise<UploadResult> {
  try {
    // Generate unique filename to avoid collisions
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${caseIntakeId}/${examType}/${timestamp}_${sanitizedName}`;

    console.log('[FileUpload] Uploading file:', filePath);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[FileUpload] Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get a signed URL (for private bucket)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(data.path, SIGNED_URL_EXPIRY);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('[FileUpload] Signed URL error:', signedUrlError);
      return {
        success: false,
        error: signedUrlError?.message || 'Failed to generate signed URL'
      };
    }

    console.log('[FileUpload] Upload successful, signed URL generated');

    return {
      success: true,
      url: signedUrlData.signedUrl,
      path: data.path
    };
  } catch (err) {
    console.error('[FileUpload] Unexpected error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    // Extract the path from the full URL if needed
    const path = filePath.includes(BUCKET_NAME)
      ? filePath.split(`${BUCKET_NAME}/`)[1]
      : filePath;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('[FileUpload] Delete error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[FileUpload] Delete unexpected error:', err);
    return false;
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  userId: string,
  caseIntakeId: string,
  examType: string
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map(file => uploadFile(file, userId, caseIntakeId, examType))
  );
  return results;
}
