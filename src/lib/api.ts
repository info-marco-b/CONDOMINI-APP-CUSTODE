import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = (env.apiUrl ?? "").replace(/\/$/, "");
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  if (!baseUrl && !endpoint.startsWith("http")) {
    console.warn("[API] VITE_API_URL not set. Configure .env for backend calls.");
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body?.message ?? body?.error ?? message;
    } catch {
      // Response not JSON
    }
    throw new ApiError(message, response.status, response);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as Promise<T>;
}

export async function apiFetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = (env.apiUrl ?? "").replace(/\/$/, "");
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  throw new ApiError("Invalid response format", response.status, response);
}

export function buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
  const baseUrl = (env.apiUrl ?? "").replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.append(key, String(value));
  }
  return `${url}?${searchParams.toString()}`;
}
