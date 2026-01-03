import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";

export default function AuthGate() {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        setOnboarded(Boolean(snap.data()?.onboarded));
      } catch {
        setOnboarded(false);
      } finally {
        setChecking(false);
      }
    }

    checkOnboarding();
  }, [user]);

  // still figuring out auth or onboarding
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center opacity-60">
        loading…
      </div>
    );
  }

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // logged in but not onboarded
  if (!onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // logged in + onboarded
  return <Outlet />;
}