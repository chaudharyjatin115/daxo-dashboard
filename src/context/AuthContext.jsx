import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext(null);

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔍 DEBUG: handle redirect result (mobile Google login) */
  useEffect(() => {
    console.log("[AUTH] Checking redirect result…");

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("[AUTH] Redirect login success:", result.user);
        } else {
          console.log("[AUTH] No redirect result");
        }
      })
      .catch((err) => {
        console.error("[AUTH] Redirect error:", err);
      });
  }, []);

  /* 🔍 DEBUG: auth state listener (single source of truth) */
  useEffect(() => {
    console.log("[AUTH] Subscribing to auth state");

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[AUTH] Auth state changed:", firebaseUser);
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /* email login */
  async function login(email, password) {
    console.log("[AUTH] Email login attempt:", email);
    return signInWithEmailAndPassword(auth, email, password);
  }

  /* email signup */
  async function signup(email, password) {
    console.log("[AUTH] Signup attempt:", email);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    return cred;
  }

  /* google login */
  async function loginWithGoogle() {
    console.log("[AUTH] Google login clicked");
    console.log("[AUTH] Mobile:", isMobile());

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    if (isMobile()) {
      console.log("[AUTH] Using redirect login (mobile)");
      await signInWithRedirect(auth, provider);
      return;
    }

    console.log("[AUTH] Using popup login (desktop)");
    return signInWithPopup(auth, provider);
  }

  function logout() {
    console.log("[AUTH] Logging out");
    return signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}