import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLoader from "./AppLoader";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}