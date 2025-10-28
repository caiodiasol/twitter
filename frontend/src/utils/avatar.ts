/**
 * Utility function to get the full avatar URL
 * @param avatarPath - The avatar path from the API (e.g., "/media/avatars/filename.png")
 * @returns The full URL to the avatar image
 */
export const getAvatarUrl = (avatarPath: string | null | undefined): string | null => {
  if (!avatarPath) return null;
  
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // If it starts with /media/, it's already the correct path
  if (avatarPath.startsWith('/media/')) {
    return `http://localhost:8001${avatarPath}`;
  }
  
  // If it's just a filename, construct the full path
  return `http://localhost:8001/media/${avatarPath}`;
};
