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

  /* ------------------ AUTH STATE ------------------ */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  /* ------------------ EMAIL LOGIN ------------------ */
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  /* ------------------ EMAIL SIGNUP ------------------ */
  async function signup(email, password) {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Email verification (important)
    await sendEmailVerification(cred.user);

    return cred;
  }

  /* ------------------ GOOGLE LOGIN ------------------ */
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account", // 🔑 fixes mobile bug
    });

    return signInWithPopup(auth, provider);
  }

  /* ------------------ LOGOUT ------------------ */
  async function logout() {
    await signOut(auth);
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

/* ------------------ HOOK ------------------ */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
