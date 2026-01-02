import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { onboarded, loading: bizLoading } = useBusiness();

  if (loading || bizLoading) return null;

  if (!user) return <Navigate to="/login" />;

  if (!onboarded) return <Navigate to="/onboarding" />;

  return children;
}