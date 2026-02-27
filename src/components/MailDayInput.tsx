import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DISPLAY_FORMAT = "dd/MM/yyyy";

function parseDisplayDate(value: string): Date | undefined {
  if (!value || value.trim() === "") return undefined;
  const parsed = parse(value, DISPLAY_FORMAT, new Date(), { locale: it });
  return isValid(parsed) ? parsed : undefined;
}

function formatDate(date: Date): string {
  return format(date, DISPLAY_FORMAT, { locale: it });
}

export function MailDayInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const parsedDate = parseDisplayDate(value);
  const displayValue = value;

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onChange(v);
  }

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onChange(formatDate(date));
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="mail-day">Data</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              id="mail-day"
              value={displayValue}
              onChange={handleInputChange}
              placeholder="Data gg/mm/aaaa"
              className="pr-9"
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parsedDate}
            onSelect={handleSelect}
            defaultMonth={parsedDate ?? new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
