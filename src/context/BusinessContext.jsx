import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const BusinessContext = createContext(undefined);

export function BusinessProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [businessName, setBusinessName] = useState(null);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setBusinessName(null);
      setLogo(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const profile = snap.data()?.profile;

        setBusinessName(profile?.businessName || null);
        setLogo(profile?.logo || null);
      } catch {
        setBusinessName(null);
        setLogo(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  const saveBusinessName = async (name) => {
    setBusinessName(name);
  };

  const value = {
    businessName,
    setBusinessName,
    saveBusinessName,
    logo,
    setLogo,
    loading,
  };

  return (
    <BusinessContext.Provider value={value}>
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
