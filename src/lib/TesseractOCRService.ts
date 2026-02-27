import { createWorker } from 'tesseract.js';

export interface OcrResult {
  success: boolean;
  message: string;
  data: string | null;
}

/**
 * Filtra e ottimizza l'immagine per l'OCR
 */
const optimizeImage = (inputSource: HTMLCanvasElement | HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = inputSource.width;
  canvas.height = inputSource.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error("Impossibile creare il contesto Canvas");

  // 1. Disegna l'immagine originale
  ctx.drawImage(inputSource, 0, 0);

  // 2. APPLICAZIONE FILTRI (La chiave per la precisione)
  // Grayscale: rimuove i colori che disturbano l'OCR
  // Contrast: rende le scritte nere più nere e lo sfondo bianco più bianco
  // Thresholding (simulato): pulisce ulteriormente l'immagine
  ctx.filter = 'grayscale(100%) contrast(200%) brightness(110%)';
  
  // Ridisegna con i filtri applicati
  ctx.drawImage(canvas, 0, 0);

  return canvas;
};

/**
 * Funzione Principale: Riceve una foto e restituisce il testo
 * @param photo - Può essere un Canvas (scatto live) o un'immagine caricata
 */
export const processOcrFromPhoto = async (
  photo: HTMLCanvasElement | HTMLImageElement
): Promise<OcrResult> => {
  try {
    // 1. Ottimizzazione della foto
    const processedCanvas = optimizeImage(photo);

    // 2. Inizializzazione Worker (italiano + inglese per caratteri latini)
    const worker = await createWorker('ita+eng');

    // 3. Configurazione: se sono codici pacco, meglio forzare caratteri alfanumerici
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
    });

    // 4. Esecuzione OCR
    const { data: { text, confidence } } = await worker.recognize(processedCanvas);

    // 5. Cleanup
    await worker.terminate();

    if (!text.trim()) {
      return {
        success: false,
        message: "Nessun testo rilevato nella foto.",
        data: null
      };
    }

    return {
      success: true,
      message: `Testo letto con precisione del ${confidence}%`,
      data: text.trim()
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: `Errore durante l'elaborazione: ${error instanceof Error ? error.message : String(error)}`,
      data: null
    };
  }
};