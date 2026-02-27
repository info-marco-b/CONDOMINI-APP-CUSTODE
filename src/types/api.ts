export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegistraPaccoPayload {
  qrcode: string | null;
  barcode: string | null;
  foto: string | null;
}

export interface RegistraPaccoData {
  qrcode: string | null;
  barcode: string | null;
  foto_riferimento: string | null;
  nome_destinatario: string | null;
  timestamp: string;
}
