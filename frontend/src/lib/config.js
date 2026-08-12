// In development: empty string → Vite proxies /api/* to localhost:3001
// In production: VITE_API_URL from Vercel env vars, falling back to the Railway backend
const PROD_API = 'https://yummara-production.up.railway.app';
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_API : '');

// Order fees. Overridable via VITE_DELIVERY_FEE / VITE_PLATFORM_FEE so live-key testing can use
// ₹1 fees without shipping those values to production. The backend has matching env vars and
// recomputes the total itself — if the two disagree, the amount charged won't match the order.
// TESTING: defaults dropped to 1 to keep live-key test charges tiny.
// REVERT TO 29 / 12 BEFORE TAKING REAL CUSTOMERS.
export const DELIVERY_FEE = Number(import.meta.env.VITE_DELIVERY_FEE ?? 1);
export const PLATFORM_FEE = Number(import.meta.env.VITE_PLATFORM_FEE ?? 1);

// Returns an error string, or '' when the pair is a usable coordinate. Used by both the cook
// profile and checkout so typed-in coordinates are validated the same way in both places.
export function validateLatLng(lat, lng) {
  if (String(lat).trim() === '' || String(lng).trim() === '') return 'Enter both latitude and longitude';
  const la = Number(lat), ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return 'Coordinates must be numbers';
  if (la < -90 || la > 90) return 'Latitude must be between -90 and 90';
  if (ln < -180 || ln > 180) return 'Longitude must be between -180 and 180';
  if (la === 0 && ln === 0) return 'That looks like an empty location';
  return '';
}
