import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAbitanti, type Abitante } from "@/lib/abitanti-api";

export interface DestinatarioSelezionato {
  id_abitante: number;
  conferma_destinatario: string;
}

export function ConfermaDestinatarioAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (selection: DestinatarioSelezionato | null) => void;
}) {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<Abitante[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchOptions = useCallback(async (txt: string) => {
    if (txt.length < 3) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getAbitanti(txt);
      if (res.success && res.data) {
        setOptions(Array.isArray(res.data) ? res.data : []);
      } else {
        setOptions([]);
      }
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions(inputValue);
  }, [inputValue, fetchOptions]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="space-y-2">
      <Label htmlFor="conferma-destinatario">
        Conferma destinatario <span className="text-destructive">*</span>
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="conferma-destinatario"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Digita almeno 3 caratteri..."
          autoComplete="off"
        />
        {open && inputValue.length >= 3 && (
          <ul
            className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover py-1 shadow-md"
            role="listbox"
            onMouseDown={(e) => e.preventDefault()}
          >
            {loading && options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">Caricamento...</li>
            ) : options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Nessun risultato
              </li>
            ) : (
              options.map((opt) => (
                <li
                  key={opt.id_abitante}
                  role="option"
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setInputValue(opt.value);
                    onChange({ id_abitante: opt.id_abitante, conferma_destinatario: opt.value });
                    setOpen(false);
                    inputRef.current?.focus();
                  }}
                >
                  {opt.value}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
