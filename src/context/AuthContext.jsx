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

/* small helper */
function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
    handle redirect result FIRST
    this is critical for mobile google login
  */
  useEffect(() => {
    let active = true;

    async function handleRedirect() {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && active) {
          setUser(result.user);
        }
      } catch {
        // no redirect happened, ignore
      }
    }

    handleRedirect();

    return () => {
      active = false;
    };
  }, []);

  /*
    main auth state listener
    single source of truth
  */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /* email login */
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  /* email signup */
  async function signup(email, password) {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // always verify email
    await sendEmailVerification(cred.user);
    return cred;
  }

  /* google login */
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    if (isMobile()) {
      // mobile browsers REQUIRE redirect
      await signInWithRedirect(auth, provider);
      return;
    }

    return signInWithPopup(auth, provider);
  }

  /* logout */
  function logout() {
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

/* hook */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}