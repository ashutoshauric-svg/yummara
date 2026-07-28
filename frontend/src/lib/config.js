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
