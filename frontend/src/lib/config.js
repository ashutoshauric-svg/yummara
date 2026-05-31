// In development: empty string → Vite proxies /api/* to localhost:3001
// In production: set VITE_API_URL=https://your-backend.up.railway.app in Vercel env vars
export const API_URL = import.meta.env.VITE_API_URL || '';
