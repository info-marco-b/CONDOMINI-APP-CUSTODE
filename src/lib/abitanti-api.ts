import type { ApiResponse } from "@/types/api";
import { buildUrl } from "./api";

export interface Abitante {
  id_abitante: number;
  value: string;
}

export async function getAbitanti(txt: string): Promise<ApiResponse<Abitante[]>> {
  const url = buildUrl("/api/autoC/abitanti", { txt });
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (response.ok) return data as ApiResponse<Abitante[]>;
  return { success: false, message: (data as ApiResponse)?.message ?? response.statusText ?? "Errore", data: [] };
}
