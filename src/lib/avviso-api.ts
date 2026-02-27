import type { ApiResponse } from "@/types/api";
import { env } from "@/config/env";

export interface AvvisoPaccoPayload {
  qrcode?: string | null;
  barcode?: string | null;
  foto_riferimento?: string | null;
  id_abitante: number;
  conferma_destinatario: string;
  timestamp: string;
}

export async function inviaAvvisoPacco(
  payload: AvvisoPaccoPayload
): Promise<ApiResponse> {
  const baseUrl = (env.apiUrl ?? "").replace(/\/$/, "");
  const url = `${baseUrl}/api/avviso-pacco`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = (await response.json().catch(() => ({}))) as ApiResponse;

  if (response.ok) return data;

  return {
    success: false,
    message: data?.message ?? response.statusText ?? "Errore di connessione",
    data: null,
  };
}
