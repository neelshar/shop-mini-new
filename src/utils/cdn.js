// CDN asset loading utility with fallbacks
const CDN_BASE_URL = import.meta.env.VITE_CDN_BASE_URL || '';

export const getCDNUrl = (assetPath) => {
  if (!CDN_BASE_URL) {
    return assetPath; // Fallback to local path
  }
  
  // Remove leading slash if present
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return `${CDN_BASE_URL}/${cleanPath}`;
};

export const loadAsset = async (cdnPath, fallbackPath) => {
  try {
    const response = await fetch(cdnPath);
    if (response.ok) {
      return response;
    }
  } catch (error) {
    console.warn('CDN asset failed, using fallback:', error);
  }
  
  // Use fallback path
  return fetch(fallbackPath);
};

export const loadCDNAssetWithFallback = async (assetPath) => {
  const cdnUrl = getCDNUrl(assetPath);
  
  if (cdnUrl === assetPath) {
    // No CDN configured, use local
    return fetch(assetPath);
  }
  
  return loadAsset(cdnUrl, assetPath);
};
