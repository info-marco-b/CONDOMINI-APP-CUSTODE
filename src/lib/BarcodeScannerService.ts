/**
 * Tipi per la Barcode Detection API (dato che non sono ancora standard in tutti i pacchetti @types/dom)
 */
interface DetectedBarcode {
    boundingBox: DOMRectReadOnly;
    cornerPoints: { x: number; y: number }[];
    format: string;
    rawValue: string;
  }
  
  declare global {
    interface Window {
      BarcodeDetector: new (options?: { formats?: string[] }) => {
        detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
      };
    }
  }
  
  /**
   * Struttura di risposta standard richiesta
   */
  export interface ScanResult<T> {
    success: boolean;
    message: string;
    data: T | null;
  }
  
  /**
   * Tipi di sorgente accettati dall'API
   */
  type ScanSource = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap;
  
  /**
   * Verifica se l'API nativa è disponibile
   */
  export const isSupported = (): boolean => {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window;
  };
  
  /**
   * Funzione generica core per l'esecuzione della scansione
   */
  const executeScan = async (
    source: ScanSource, 
    formats: string[]
  ): Promise<ScanResult<DetectedBarcode[]>> => {
    
    if (!isSupported()) {
      return {
        success: false,
        message: "Barcode Detector API non supportata in questo browser.",
        data: null
      };
    }
  
    try {
      const detector = new window.BarcodeDetector({ formats });
      const results: DetectedBarcode[] = await detector.detect(source);
  
      if (results.length === 0) {
        return {
          success: false,
          message: "Nessun codice rilevato.",
          data: []
        };
      }
  
      return {
        success: true,
        message: `Scansione completata con successo. Trovati: ${results.length}`,
        data: results
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Errore durante la scansione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        data: null
      };
    }
  };
  
  /**
   * Scan specifico per QR Code
   */
  export const scanQRCode = (source: ScanSource): Promise<ScanResult<DetectedBarcode[]>> => 
    executeScan(source, ['qr_code']);
  
  /**
   * Scan per Barcode lineari (1D) comuni
   */
  export const scanStandardBarcode = (source: ScanSource): Promise<ScanResult<DetectedBarcode[]>> => 
    executeScan(source, ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a']);
  
  /**
   * Scan universale
   */
  export const scanAll = (source: ScanSource): Promise<ScanResult<DetectedBarcode[]>> => 
    executeScan(source, ['qr_code', 'ean_13', 'code_128', 'code_39', 'upc_a', 'data_matrix', 'pdf417']);