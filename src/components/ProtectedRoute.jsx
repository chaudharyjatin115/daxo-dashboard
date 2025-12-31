import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // wait until firebase finishes restoring session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center opacity-60">
        Loading…
      </div>
    );
  }

  // not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}