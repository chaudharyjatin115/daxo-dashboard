import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const { user } = useAuth();

  const [businessName, setBusinessName] = useState(null);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------------------ LOAD BUSINESS PROFILE ------------------ */
  useEffect(() => {
    if (!user) {
      setBusinessName(null);
      setLogo(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const profile = snap.data()?.profile || {};

        setBusinessName(profile.businessName || null);
        setLogo(
  typeof profile.logo === "string" && profile.logo.trim()
    ? profile.logo
    : ""
);

        // cache (fast refresh + header)
        if (profile.businessName) {
          localStorage.setItem("businessName", profile.businessName);
        }
        if (profile.logo) {
          localStorage.setItem("businessLogo", profile.logo);
        }
      } catch (e) {
        console.error("Business load failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  /* ------------------ SAVE NAME ------------------ */
  async function saveBusinessName(name) {
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      "profile.businessName": name,
    });

    setBusinessName(name);
    localStorage.setItem("businessName", name);
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
