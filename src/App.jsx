import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { useBusiness } from "./context/BusinessContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import VerifyEmail from "./pages/VerifyEmail";

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { businessName, loading: businessLoading } = useBusiness();

  /* ⛔ ABSOLUTE BLOCK */
  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ---------------- PUBLIC ---------------- */}
        {!user && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {/* ---------------- VERIFY EMAIL ---------------- */}
        {user && !user.emailVerified && (
          <>
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="*" element={<Navigate to="/verify-email" replace />} />
          </>
        )}

        {/* ---------------- ONBOARDING ---------------- */}
        {user && user.emailVerified && !businessName && (
          <>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </>
        )}

        {/* ---------------- APP ---------------- */}
        {user && user.emailVerified && businessName && (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

