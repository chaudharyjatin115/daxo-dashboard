import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";

import AuthGate from "./components/AuthGate";

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* protected */}
      <Route
        path="/dashboard"
        element={
          <AuthGate>
            <Dashboard />
          </AuthGate>
        }
      />

      <Route
        path="/onboarding"
        element={
          <AuthGate>
            <Onboarding />
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

      {/* fallback */}
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