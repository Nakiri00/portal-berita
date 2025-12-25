const ASSET_BASE = import.meta.env.VITE_ASSET_URL;

export function assetUrl(path?: string) {
  if (!path) return '';

  // kalau sudah full URL → pakai langsung
  if (path.startsWith('http')) return path;

  // kalau base64 → pakai langsung
  if (path.startsWith('data:')) return path;

  // normalize
  const cleanPath = path
    .replace(/^\/?api/, '')
    .replace(/\/{2,}/g, '/');

  return `${ASSET_BASE}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
}
