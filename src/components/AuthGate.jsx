import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      if (!user) {
        setChecking(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      setOnboarded(Boolean(snap.exists() && snap.data()?.onboarded));
      setChecking(false);
    }

    checkOnboarding();
  }, [user]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center opacity-60">
        loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}