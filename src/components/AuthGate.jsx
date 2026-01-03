import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [checkingProfile, setCheckingProfile] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    // not logged in → nothing to check
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    let active = true;

    async function checkOnboarding() {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (!active) return;

        setOnboarded(Boolean(snap.exists() && snap.data()?.onboarded));
      } catch (err) {
        console.error("failed to check onboarding", err);
        setOnboarded(false);
      } finally {
        if (active) setCheckingProfile(false);
      }
    }

    checkOnboarding();

    return () => {
      active = false;
    };
  }, [user]);

  /* 🔒 still checking auth or profile */
  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm opacity-70">
        Loading…
      </div>
    );
  }

  /* ❌ not logged in */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  /* 🆕 logged in but not onboarded */
  if (!onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  /* ✅ all good */
  return children;
}