import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Barcode, Camera, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  isSupported,
  scanQRCode,
  scanStandardBarcode,
  type ScanResult,
} from "@/lib/BarcodeScannerService";
import { registraPacco } from "@/lib/registra-pacco-api";
import { inviaAvvisoPacco } from "@/lib/avviso-api";
import { env } from "@/config/env";
import {
  ConfermaDestinatarioAutocomplete,
  type DestinatarioSelezionato,
} from "@/components/ConfermaDestinatarioAutocomplete";

type ScanType = "qr" | "barcode" | "ocr" | null;

export function RegistraPaccoPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cancelledRef = useRef(false);

  const [scanType, setScanType] = useState<ScanType>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);
  const [nomePhoto, setNomePhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unsupportedOpen, setUnsupportedOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<{
    qrcode: string | null;
    barcode: string | null;
    foto_riferimento: string | null;
    nome_destinatario: string | null;
    timestamp: string;
  } | null>(null);
  const [selectedDestinatario, setSelectedDestinatario] =
    useState<DestinatarioSelezionato | null>(null);
  const [saving, setSaving] = useState(false);
  const [avvisoAlert, setAvvisoAlert] = useState<{
    open: boolean;
    message: string;
    success: boolean;
  }>({ open: false, message: "", success: false });
  const [sendingAvviso, setSendingAvviso] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cancelledRef.current = true;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : "Errore accesso fotocamera");
    }
  }, []);

  const scanLoop = useCallback(
    async (
      scanFn: (source: HTMLVideoElement) => Promise<ScanResult<unknown[]>>,
      setResult: (v: string) => void
    ) => {
      const video = videoRef.current;
      if (cancelledRef.current) return;
      if (!video || video.readyState < 2) {
        requestAnimationFrame(() => scanLoop(scanFn, setResult));
        return;
      }

      const result = await scanFn(video);

      if (cancelledRef.current) return;

      if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
        const first = result.data[0] as { rawValue?: string };
        const rawValue = first?.rawValue ?? String(result.data[0]);
        setResult(rawValue);
        stopStream();
        setScanType(null);
        return;
      }

      requestAnimationFrame(() => scanLoop(scanFn, setResult));
    },
    [stopStream]
  );

  useEffect(() => {
    if (!scanType || scanType === "ocr") return;

    if (!isSupported()) {
      setUnsupportedOpen(true);
      setScanType(null);
      return;
    }

    cancelledRef.current = false;
    const scanFn = scanType === "qr" ? scanQRCode : scanStandardBarcode;
    const setResult = scanType === "qr" ? setQrResult : setBarcodeResult;

    const runLoop = () =>
      scanLoop(scanFn as (s: HTMLVideoElement) => Promise<ScanResult<unknown[]>>, setResult);
    runLoop();

    return () => {
      cancelledRef.current = true;
    };
  }, [scanType, scanLoop]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  useEffect(() => {
    if (scanType) {
      startCamera();
    } else {
      stopStream();
    }
  }, [scanType, startCamera, stopStream]);

  function handleStartScan(type: ScanType) {
    setError(null);
    setScanType(type);
  }

  function handleCancelScan() {
    stopStream();
    setScanType(null);
  }

  function handleCapturePhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg");
    setNomePhoto(dataUrl);
    handleCancelScan();
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const response = await registraPacco({
        qrcode: qrResult,
        barcode: barcodeResult,
        foto: nomePhoto ?? null,
      });

      if (response.success && response.data) {
        setSaveResult(response.data);
      } else {
        setError(response.message ?? "Errore durante il salvataggio");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di connessione");
    } finally {
      setSaving(false);
    }
  }

  const canInviaAvviso =
    !!saveResult &&
    !!selectedDestinatario?.conferma_destinatario?.trim() &&
    !!(
      (saveResult.qrcode?.trim()) ||
      (saveResult.barcode?.trim()) ||
      (saveResult.foto_riferimento?.trim())
    );

  async function handleInviaAvviso() {
    if (!saveResult || !selectedDestinatario) return;
    setSendingAvviso(true);
    try {
      const response = await inviaAvvisoPacco({
        qrcode: saveResult.qrcode,
        barcode: saveResult.barcode,
        foto_riferimento: saveResult.foto_riferimento,
        id_abitante: selectedDestinatario.id_abitante,
        conferma_destinatario: selectedDestinatario.conferma_destinatario,
        timestamp: saveResult.timestamp,
      });
      setAvvisoAlert({
        open: true,
        message: response.message ?? (response.success ? "Avviso inviato" : "Errore"),
        success: response.success,
      });
    } catch (err) {
      setAvvisoAlert({
        open: true,
        message: err instanceof Error ? err.message : "Errore di connessione",
        success: false,
      });
    } finally {
      setSendingAvviso(false);
    }
  }

  const isScanning = scanType !== null;

  if (saveResult) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-4 md:p-6">
        <div className="max-w-lg mx-auto w-full flex flex-col flex-1">
          <h1 className="text-xl font-semibold mb-6">Registrazione completata</h1>
          <div className="rounded-lg border bg-card p-4 space-y-4 flex-1">
            <ResultRow label="QR Code" value={saveResult.qrcode} />
            <ResultRow label="Codice a barre" value={saveResult.barcode} />
            <ResultPhotoRow
              label="Foto riferimento"
              imageUrl={saveResult.foto_riferimento}
            />
            <ResultRow label="Nome destinatario" value={saveResult.nome_destinatario ?? null} />
            <ConfermaDestinatarioAutocomplete
              value={selectedDestinatario?.conferma_destinatario ?? ""}
              onChange={setSelectedDestinatario}
            />
            <ResultRow label="Data/Ora" value={saveResult.timestamp} />
          </div>
          <Button
            className="w-full mt-6"
            size="lg"
            onClick={handleInviaAvviso}
            disabled={!canInviaAvviso || sendingAvviso}
          >
            {sendingAvviso ? "Invio..." : "Invia avviso"}
          </Button>
        </div>
        <AlertDialog
          open={avvisoAlert.open}
          onOpenChange={(open) => {
            if (!open) {
              const wasSuccess = avvisoAlert.success;
              setAvvisoAlert({ open: false, message: "", success: false });
              if (wasSuccess) navigate("/");
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {avvisoAlert.success ? "Avviso inviato" : "Errore"}
              </AlertDialogTitle>
              <AlertDialogDescription>{avvisoAlert.message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isScanning ? (
        <>
          <header className="flex items-center gap-4 p-4 border-b shrink-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} title="Indietro">
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="text-xl font-semibold flex-1">Registra un Pacco</h1>
          </header>

          <div className="flex-1 p-4 md:p-6 max-w-lg mx-auto w-full space-y-6">
            <nav className="grid gap-3 sm:grid-cols-3">
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 text-base"
                onClick={() => handleStartScan("qr")}
              >
                <QrCode className="size-5 mr-2" />
                Scansiona QR Code
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 text-base"
                onClick={() => handleStartScan("barcode")}
              >
                <Barcode className="size-5 mr-2" />
                Scansiona Codice a barre
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 text-base"
                onClick={() => handleStartScan("ocr")}
              >
                <Camera className="size-5 mr-2" />
                Acquisisci nome
              </Button>
            </nav>

            {(cameraError || error) && (
              <p className="text-sm text-destructive" role="alert">
                {cameraError ?? error}
              </p>
            )}

            <div className="space-y-4">
              <ResultField
                label="QR Code"
                value={qrResult}
                onClear={() => setQrResult(null)}
              />
              <ResultField
                label="Codice a barre"
                value={barcodeResult}
                onClear={() => setBarcodeResult(null)}
              />
              <PhotoResultField
                label="Acquisisci nome"
                photoDataUrl={nomePhoto}
                onClear={() => setNomePhoto(null)}
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvataggio..." : "Salva"}
            </Button>
          </div>
        </>
      ) : (
        <div className="fixed inset-0 flex flex-col bg-black z-50">
          <div className="flex-1 relative min-h-0">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="shrink-0 bg-background border-t p-4 space-y-4">
            {scanType === "ocr" ? (
              <>
                <p className="text-center text-sm text-muted-foreground">
                  Scatta quando a fuoco
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelScan}
                  >
                    Annulla
                  </Button>
                  <Button className="flex-1" onClick={handleCapturePhoto}>
                    Scatta
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-center text-sm text-muted-foreground">
                  Inquadra il codice
                </p>
                <Button variant="outline" className="w-full" onClick={handleCancelScan}>
                  Annulla
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={unsupportedOpen} onOpenChange={setUnsupportedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Browser non supportato</AlertDialogTitle>
            <AlertDialogDescription>
              La Barcode Detection API non è disponibile in questo browser. Prova con Chrome
              su Android o desktop per utilizzare la scansione.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setUnsupportedOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-right break-all">
        {value ?? "—"}
      </span>
    </div>
  );
}

function ResultPhotoRow({
  label,
  imageUrl,
}: {
  label: string;
  imageUrl: string | null;
}) {
  const hasImage = imageUrl != null && imageUrl.trim() !== "";
  const imgSrc = hasImage && env.apiUrl
    ? `${env.apiUrl.replace(/\/$/, "")}${imageUrl!.startsWith("/") ? "" : "/"}${imageUrl}`
    : hasImage
      ? imageUrl!
      : "";

  return (
    <div className="py-2 border-b last:border-0 space-y-2">
      <div className="flex justify-between gap-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        {imageUrl ? (
          <span className="font-mono text-sm text-right break-all">{imageUrl}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      {hasImage && (
        <div className="h-28 w-full flex items-center justify-center bg-muted/50 rounded overflow-hidden shrink-0">
          <img
            src={imgSrc}
            alt="Preview scatto"
            className="max-h-full max-w-full object-contain"
            crossOrigin="use-credentials"
          />
        </div>
      )}
    </div>
  );
}

function ResultField({
  label,
  value,
  onClear,
}: {
  label: string;
  value: string | null;
  onClear: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className={value ? "font-mono break-all" : "text-muted-foreground"}>
          {value ?? "—"}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        title="Svuota"
        disabled={!value}
      >
        <Trash2 className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}

function PhotoResultField({
  label,
  photoDataUrl,
  onClear,
}: {
  label: string;
  photoDataUrl: string | null;
  onClear: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="h-28 w-full flex items-center justify-center bg-muted/50 rounded overflow-hidden shrink-0">
          {photoDataUrl ? (
            <img
              src={photoDataUrl}
              alt="Preview scatto"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <p className="text-muted-foreground text-sm">—</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        title="Svuota"
        disabled={!photoDataUrl}
      >
        <Trash2 className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
