const envApiBase = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || '';
export const API_BASE = envApiBase.replace(/\/$/, '');
