import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { useBusiness } from "./context/BusinessContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

/*require on boarding fix */
function RequireOnboarding({ children }) {
  const { businessName, loading } = useBusiness();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (businessName === null) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}



function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RequireBusiness({ children }) {
  const { businessName, loading } = useBusiness();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!businessName) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

/* ------------------ APP ------------------ */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- PUBLIC ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ---------- ONBOARDING ---------- */}
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <Onboarding />
            </RequireAuth>
          }
        />

        {/* ---------- APP ---------- */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <RequireBusiness>
                <Dashboard />
              </RequireBusiness>
            </RequireAuth>
          }
        />

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <RequireBusiness>
                <Settings />
              </RequireBusiness>
            </RequireAuth>
          }
        />

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

