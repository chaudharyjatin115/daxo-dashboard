import { Routes, Route } from "react-router-dom";

import AuthGate from "./components/AuthGate";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* onboarding is special */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* protected app */}
      <Route element={<AuthGate />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}