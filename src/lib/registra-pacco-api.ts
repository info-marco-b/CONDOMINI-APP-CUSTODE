import type { ApiResponse } from "@/types/api";
import type { RegistraPaccoPayload, RegistraPaccoData } from "@/types/api";
import { env } from "@/config/env";

export async function registraPacco(
  payload: RegistraPaccoPayload
): Promise<ApiResponse<RegistraPaccoData>> {
  const baseUrl = (env.apiUrl ?? "").replace(/\/$/, "");
  const url = `${baseUrl}/api/registra-pacco`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = (await response.json().catch(() => ({}))) as ApiResponse<RegistraPaccoData>;

  if (response.ok) {
    return data;
  }

  return {
    success: false,
    message: data?.message ?? response.statusText ?? "Errore di connessione",
    data: null as unknown as RegistraPaccoData,
  };
}
