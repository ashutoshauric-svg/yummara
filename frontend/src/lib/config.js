// In development: empty string → Vite proxies /api/* to localhost:3001
// In production: VITE_API_URL from Vercel env vars, falling back to the Railway backend
const PROD_API = 'https://yummara-production.up.railway.app';
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_API : '');
