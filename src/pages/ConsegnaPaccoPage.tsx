import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DestinatarioAvvisiAutocomplete } from "@/components/DestinatarioAvvisiAutocomplete";
import { MailDayInput } from "@/components/MailDayInput";
import { AvvisoResultCard } from "@/components/AvvisoResultCard";
import {
  ricercaAvvisiPosta,
  type AvvisoPostaResult,
} from "@/lib/ricerca-avvisi-api";

type RitiroConferma = "SI" | "NO" | null;

export function ConsegnaPaccoPage() {
  const navigate = useNavigate();
  const [confermaDestinatario, setConfermaDestinatario] = useState("");
  const [mailDay, setMailDay] = useState("");
  const [ritiroConferma, setRitiroConferma] = useState<RitiroConferma>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AvvisoPostaResult[]>([]);

  function handleRitiroClick(value: "SI" | "NO") {
    setRitiroConferma((prev) => (prev === value ? null : value));
  }

  async function handleCerca() {
    setSearching(true);
    setResults([]);
    try {
      const res = await ricercaAvvisiPosta({
        conferma_destinatario: confermaDestinatario || undefined,
        ritiro_conferma: ritiroConferma ?? undefined,
        mail_day: mailDay || undefined,
      });
      const data = res.data;
      const items = Array.isArray(data) ? data : [];
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-4 p-4 border-b shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} title="Indietro">
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl font-semibold flex-1">Consegna un Pacco</h1>
      </header>

      <div className="flex-1 p-4 md:p-6 max-w-lg mx-auto w-full space-y-6">
        <DestinatarioAvvisiAutocomplete
          value={confermaDestinatario}
          onChange={setConfermaDestinatario}
        />

        <MailDayInput value={mailDay} onChange={setMailDay} />

        <div className="space-y-2">
          <span className="text-sm font-medium">Stato ritiro</span>
          <div className="flex gap-2">
            <Button
              variant={ritiroConferma === "NO" ? "default" : "outline"}
              onClick={() => handleRitiroClick("NO")}
            >
              Ricevuta non validata
            </Button>
            <Button
              variant={ritiroConferma === "SI" ? "default" : "outline"}
              onClick={() => handleRitiroClick("SI")}
            >
              Ricevuta valida
            </Button>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCerca}
          disabled={searching}
        >
          {searching ? "Ricerca..." : "Cerca"}
        </Button>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((item, idx) => (
              <AvvisoResultCard
                key={item.id ?? idx}
                item={item}
                onConsegnaSuccess={handleCerca}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
