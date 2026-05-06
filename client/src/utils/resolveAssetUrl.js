import api from '../api/client';

// Convert backend-returned paths like "/uploads/..." into a usable absolute URL
// when the frontend runs on a different origin (e.g. localhost:3000).
export default function resolveAssetUrl(url) {
  if (!url) return '';
  if (typeof url === 'string' && url.startsWith('/')) {
    const base = String(api.defaults.baseURL || '').replace(/\/$/, '');
    return base ? `${base}${url}` : url;
  }
  return url;
}
