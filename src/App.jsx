import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword"; // ✅ NEW
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AuthGate from "./components/AuthGate";

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ✅ NEW */}

      {/* protected */}
      <Route
        path="/onboarding"
        element={
          <AuthGate>
            <Onboarding />
          </AuthGate>
        }
      />

      <Route
        path="/dashboard"
        element={
          <AuthGate>
            <Dashboard />
          </AuthGate>
        }
      />

      <Route
        path="/settings"
        element={
          <AuthGate>
            <Settings />
          </AuthGate>
        }
      />

      {/* default */}
      <Route
        path="*"
        element={
          <AuthGate>
            <Dashboard />
          </AuthGate>
        }
      />
    </Routes>
  );
}