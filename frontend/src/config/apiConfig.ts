// api.config.ts

/**
 * Normalize and validate API base URL
 * - Must be a valid http/https URL
 * - Removes trailing slash
 */
const normalizeBaseUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.origin; // guarantees protocol + host
  } catch {
    return url.replace(/\/+$/, ''); // Fallback for relative or malformed URLs
  }
};

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// In production (Vercel), we use a relative path to leverage the Next.js rewrite proxy.
// This ensures cookies are treated as same-origin, fixing authentication issues.
const BASE_URL = process.env.NODE_ENV === 'production'
  ? ''
  : normalizeBaseUrl(API_BASE_URL || 'http://localhost:8000');

export const apiConfig = {
  baseUrl: BASE_URL,
  endpoints: {
    auth: {
      login: `${BASE_URL}/api/v1/auth/login`,
      register: `${BASE_URL}/api/v1/auth/register`,
      me: `${BASE_URL}/api/v1/auth/me`,
      logout: `${BASE_URL}/api/v1/auth/logout`,
    },
    todos: {
      base: `${BASE_URL}/api/v1/todos`,
      getById: (id: string) => `${BASE_URL}/api/v1/todos/${id}`,
      toggle: (id: string) => `${BASE_URL}/api/v1/todos/${id}/toggle`,
    },
    chat: {
      chat: `${BASE_URL}/api/v1/chat`,
    },
  },
};
