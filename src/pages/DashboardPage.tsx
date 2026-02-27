import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { APP } from "@/config/constants";

const ACTIONS = [
  { id: "servizio", label: "Entra in servizio", path: "/" },
  { id: "registra-pacco", label: "Registra un pacco", path: "/registra-pacco" },
  { id: "consegna-pacco", label: "Consegna un pacco", path: "/consegna-pacco" },
  { id: "chiavi", label: "Servizio Chiavi", path: "/chiavi" },
  { id: "registro", label: "Registro", path: "/registro" },
  { id: "segnalazioni", label: "Segnalazioni", path: "/segnalazioni" },
] as const;

export function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background">
      <div className="max-w-md mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{APP.name}</h1>
          <Button variant="ghost" size="icon" onClick={logout} title="Esci">
            <LogOut className="size-4" />
          </Button>
        </header>

        <nav className="grid gap-3 sm:grid-cols-2">
          {ACTIONS.map(({ id, label, path }) => (
            <Button
              key={id}
              variant="outline"
              size="lg"
              className="h-auto py-6 text-base"
              onClick={() => navigate(path)}
            >
              {label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}
