import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------------------ LOAD PROFILE ------------------ */
  useEffect(() => {
    // ⛔ auth still resolving
    if (authLoading) return;

    // 🔓 logged out → unblock app
    if (!user) {
      setBusinessName("");
      setLogo(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) {
          if (!cancelled) {
            setBusinessName("");
            setLogo(null);
          }
        } else {
          const profile = snap.data().profile || {};
          if (!cancelled) {
            setBusinessName(profile.businessName || "");
            setLogo(profile.logo || null);
          }
        }
      } catch (err) {
        console.error("Business profile load failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /* ------------------ SAVE NAME ------------------ */
  async function saveBusinessName(name) {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), {
      "profile.businessName": name,
    });
    setBusinessName(name);
  }

  return (
    <BusinessContext.Provider
      value={{
        businessName,
        setBusinessName,
        saveBusinessName,
        logo,
        setLogo,
        loading,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusiness must be used inside BusinessProvider");
  }
  return ctx;
}
