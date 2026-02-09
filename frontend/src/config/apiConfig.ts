// api.config.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_BASE_URL is required but was not provided.'
  );
}

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
    throw new Error(`Invalid NEXT_PUBLIC_API_BASE_URL: ${url}`);
  }
};

const BASE_URL = normalizeBaseUrl(API_BASE_URL);

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
  },
};
