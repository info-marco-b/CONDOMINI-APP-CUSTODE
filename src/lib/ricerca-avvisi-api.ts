import type { ApiResponse } from "@/types/api";
import { env } from "@/config/env";

export interface AvvisoPostaResult {
  id?: number | string;
  _id?: number | string;
  conferma_destinatario?: string;
  timestamp?: string;
  qrcode?: string | null;
  barcode?: string | null;
  email?: string;
  mail_day?: string;
  mail_ora?: string;
  ritiro_conferma?: "SI" | "NO";
  consegnato_da?: string;
}

export interface RicercaAvvisiParams {
  conferma_destinatario?: string;
  ritiro_conferma?: string;
  mail_day?: string;
}

export async function ricercaAvvisiPosta(
  params: RicercaAvvisiParams
): Promise<ApiResponse<AvvisoPostaResult[]>> {
  const baseUrl = (env.apiUrl ?? "").replace(/\/$/, "");
  const search = new URLSearchParams();
  search.set("conferma_destinatario", params.conferma_destinatario ?? "");
  if (params.ritiro_conferma != null)
    search.set("ritiro_conferma", params.ritiro_conferma);
  search.set("mail_day", params.mail_day ?? "");
  const url = `${baseUrl}/api/ricerca/avvisi_posta?${search.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = (await response.json().catch(() => ({}))) as ApiResponse;

  if (response.ok) return data;

  return {
    success: false,
    message: data?.message ?? response.statusText ?? "Errore di connessione",
    data: [],
  };
}

export async function confermaRitiroPacco(id: number | string): Promise<ApiResponse<unknown>> {
  const baseUrl = (env.apiUrl ?? "").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/api/ritiro-pacco`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _id: id }),
    credentials: "include",
  });
  const data = (await response.json().catch(() => ({}))) as ApiResponse;
  if (response.ok) return data;
  return {
    success: false,
    message: data?.message ?? response.statusText ?? "Errore",
    data: null,
  };
}
