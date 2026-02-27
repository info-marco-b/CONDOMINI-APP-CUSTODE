import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  type AvvisoPostaResult,
  confermaRitiroPacco,
} from "@/lib/ricerca-avvisi-api";

interface AvvisoResultCardProps {
  item: AvvisoPostaResult;
  onConsegnaSuccess?: () => void;
}

export function AvvisoResultCard({ item, onConsegnaSuccess }: AvvisoResultCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ritiroSi = item.ritiro_conferma === "SI";
  const ritiroNo = item.ritiro_conferma === "NO";
  const giaConsegnato = !!item.consegnato_da?.trim();
  const canConferma = !giaConsegnato;

  async function handleConfermaConsegna() {
    const id = item._id ?? item.id;
    if (id == null) {
      setError("ID mancante per confermare la consegna");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await confermaRitiroPacco(id);
      if (res.success) {
        setModalOpen(false);
        onConsegnaSuccess?.();
      } else {
        setError(res.message ?? "Errore durante la conferma");
      }
    } catch {
      setError("Errore di connessione");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <h3 className="text-lg font-semibold">{item.conferma_destinatario}</h3>
      <div className="text-sm space-y-1">
        <p>
          <span className="text-muted-foreground">Consegna ricevuta:</span>{" "}
          {item.timestamp ?? "—"}
        </p>
        <div>
          <span className="text-muted-foreground">Codici pacco:</span>
          <ul className="list-disc list-inside ml-2">
            <li>QR: {item.qrcode ?? "—"}</li>
            <li>Bar Code: {item.barcode ?? "—"}</li>
          </ul>
        </div>
        <p>
          Avviso inviato a {item.email ?? "—"} il giorno {item.mail_day ?? "—"} alle
          ore {item.mail_ora ?? "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Ritiro Confermato:</span>{" "}
          {item.ritiro_conferma ?? "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Conferma Consegna:</span>{" "}
          {item.consegnato_da ?? "—"}
        </p>
      </div>

      {ritiroNo && (
        <p className="font-bold text-destructive text-sm">
          Deve essere confermato il ritiro con la mail inviata a {item.email} prima di
          consegnare il pacco
        </p>
      )}
      {ritiroSi && (
        <p className="font-bold text-green-600 dark:text-green-500 text-sm">
          La consegna può essere effettuata
        </p>
      )}

      <Button
        onClick={() => {
          setError(null);
          setModalOpen(true);
        }}
        disabled={!canConferma}
        className="w-full"
      >
        Conferma Consegna
      </Button>

      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma consegna</AlertDialogTitle>
            <AlertDialogDescription>
              {ritiroNo ? (
                <>
                  Confermi di voler consegnare anche se{" "}
                  <strong>non è stata validata</strong> la ricevuta?
                </>
              ) : (
                <>La ricevuta è stata validata. Confermi consegna?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfermaConsegna();
              }}
              disabled={submitting}
            >
              {submitting ? "Conferma..." : "Conferma"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
