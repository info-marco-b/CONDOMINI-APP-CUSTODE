import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { RegistraPaccoPage } from "@/pages/RegistraPaccoPage";
import { ConsegnaPaccoPage } from "@/pages/ConsegnaPaccoPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/registra-pacco"
            element={
              <ProtectedRoute>
                <RegistraPaccoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consegna-pacco"
            element={
              <ProtectedRoute>
                <ConsegnaPaccoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
