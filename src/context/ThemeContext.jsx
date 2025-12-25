import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState("light");

  /* ------------------ LOAD FROM CLOUD ------------------ */
  useEffect(() => {
    if (!user) return;

    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      const saved = snap.data()?.preferences?.theme;
      if (saved) setTheme(saved);
    })();
  }, [user]);

  /* ------------------ APPLY THEME ------------------ */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  /* ------------------ TOGGLE ------------------ */
  async function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);

    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        "preferences.theme": next,
      });
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
