import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    async function resolveUser() {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      // 🆕 first-time Google user
      if (!snap.exists()) {
        await setDoc(ref, {
          email: user.email,
          onboarded: false,
          createdAt: new Date(),
        });

        navigate("/onboarding", { replace: true });
        return;
      }

      // existing user
      if (snap.data().onboarded) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }

      setChecking(false);
    }

    resolveUser();
  }, [user, loading, navigate]);

  if (checking) return null;

  return children;
}