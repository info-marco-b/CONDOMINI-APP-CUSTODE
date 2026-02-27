import type { ApiResponse } from "@/types/api";
import { buildUrl } from "./api";

export interface AvvisoPosta {
  value: string;
}

export async function getAvvisiPosta(txt: string): Promise<ApiResponse<AvvisoPosta[]>> {
  const url = buildUrl("/api/autoC/avvisi_posta", { txt });
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (response.ok) return data as ApiResponse<AvvisoPosta[]>;
  return {
    success: false,
    message: (data as ApiResponse)?.message ?? response.statusText ?? "Errore",
    data: [],
  };
}
