import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // wait for auth restore
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center opacity-60">
        Loading…
      </div>
    );
  }

  // already logged in → go home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}