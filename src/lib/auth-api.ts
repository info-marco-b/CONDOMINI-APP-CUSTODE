import type { ApiResponse } from "@/types/api";
import type { LoginData } from "@/types/api";
import { env } from "@/config/env";

export async function login(credentials: LoginData): Promise<ApiResponse> {
  const baseUrl = (env.apiUrl ?? "").replace(/\/$/, "");
  const url = `${baseUrl}/api/login`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (response.ok) {
    return data as ApiResponse;
  }

  return {
    success: false,
    message: (data as ApiResponse)?.message ?? response.statusText ?? "Errore di connessione",
    data: null,
  };
}
