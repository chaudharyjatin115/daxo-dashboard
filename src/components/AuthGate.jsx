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
    if (!user) {
      setChecking(false);
      return;
    }

    async function check() {
      const snap = await getDoc(doc(db, "users", user.uid));
      setOnboarded(snap.exists() && snap.data()?.onboarded === true);
      setChecking(false);
    }

    check();
  }, [user]);

  if (loading || checking) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (!onboarded) return <Navigate to="/onboarding" replace />;

  return children;
}