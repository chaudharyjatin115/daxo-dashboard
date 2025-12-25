import { useAuth } from "../context/AuthContext";

export default function AuthGate({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm opacity-60">
          Loading…
        </div>
      </div>
    );
  }

  return children;
}
