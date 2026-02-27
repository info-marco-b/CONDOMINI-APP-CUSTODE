/**
 * Environment configuration.
 * Variables must be prefixed with VITE_ to be exposed to the client.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "",
} as const;

export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;
