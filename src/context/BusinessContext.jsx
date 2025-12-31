import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [businessName, setBusinessName] = useState(
    localStorage.getItem("businessName") || ""
  );
  const [logo, setLogo] = useState(
    localStorage.getItem("businessLogo") || ""
  );
  const [loading, setLoading] = useState(true);

  /* load from firestore when user changes */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // nothing blocking here, firestore hooks elsewhere already read data
        setLoading(false);
      } catch {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  /* ✅ FIXED: safe save using setDoc + merge */
  async function saveBusinessName(name) {
    const user = auth.currentUser;
    if (!user) throw new Error("not authenticated");

    const cleanName = name.trim();

    await setDoc(
      doc(db, "users", user.uid),
      {
        profile: {
          businessName: cleanName,
        },
      },
      { merge: true }
    );

    setBusinessName(cleanName);
    localStorage.setItem("businessName", cleanName);
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