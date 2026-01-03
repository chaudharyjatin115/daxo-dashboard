import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔍 DEBUG: runs once when app boots
  useEffect(() => {
    console.log("[auth] provider mounted");
    console.log("[auth] current auth object:", auth);
  }, []);

  // 🔑 single source of truth for auth state
  useEffect(() => {
    console.log("[auth] attaching onAuthStateChanged listener");

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log(
        "[auth] state changed:",
        firebaseUser ? firebaseUser.uid : "logged out"
      );

      setUser(firebaseUser || null);
      setLoading(false);
    });

    return () => {
      console.log("[auth] removing auth listener");
      unsubscribe();
    };
  }, []);

  /* ---------- email login ---------- */
  function login(email, password) {
    console.log("[auth] email login attempt:", email);
    return signInWithEmailAndPassword(auth, email, password);
  }

  /* ---------- email signup ---------- */
  async function signup(email, password) {
    console.log("[auth] email signup attempt:", email);

    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await sendEmailVerification(cred.user);
    console.log("[auth] signup success:", cred.user.uid);

    return cred;
  }

  /* ---------- google login ---------- */
  async function loginWithGoogle() {
    console.log("[auth] google login clicked");

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("[auth] google login success:", result.user.uid);
      return result;
    } catch (err) {
      console.error("[auth] google login failed:", err);
      throw err;
    }
  }

  /* ---------- logout ---------- */
  function logout() {
    console.log("[auth] logout clicked");
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