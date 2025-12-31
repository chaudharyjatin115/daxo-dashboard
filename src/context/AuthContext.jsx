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
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // handle google redirect result (mobile)
  useEffect(() => {
    let active = true;

    async function resolveRedirect() {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && active) {
          setUser(result.user);
        }
      } catch {
        // ignore
      }
    }

    resolveRedirect();
    return () => {
      active = false;
    };
  }, []);

  // auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });
    return unsub;
  }, []);

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signup(email, password) {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await sendEmailVerification(cred.user);
    return cred;
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    if (isMobile()) {
      await signInWithRedirect(auth, provider);
      return;
    }

    return signInWithPopup(auth, provider);
  }

  function logout() {
    return signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}