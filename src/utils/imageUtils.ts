import config from '@/config/environment';

/**
 * Converts a backend image path to a full URL
 * @param imagePath - The image path from the backend (e.g., "/uploads/Profile/filename.jpg")
 * @returns The full URL for the image
 */
export function getImageUrl(imagePath: string | null | undefined): string | undefined {
  if (!imagePath) return undefined;

  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // If it's a base64 data URL, return as is (for preview purposes)
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  // If it's a relative path, prepend the backend URL
  if (imagePath.startsWith('/')) {
    return `${config.BACKEND_URL}${imagePath}`;
  }

  // If it's just a filename, assume it's in the uploads folder
  return `${config.BACKEND_URL}/uploads/${imagePath}`;
}
