
// import { createContext, useContext, useEffect, useState } from "react";
// import { auth } from "../firebase";
// import {
//   GoogleAuthProvider,
//   signInWithPopup,
//   signInWithRedirect,
//   getRedirectResult,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
//   signOut,
//   onAuthStateChanged,
// } from "firebase/auth";

// const AuthContext = createContext(null);

// /* ------------------ HELPERS ------------------ */
// function isMobile() {
//   return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
// }

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* ------------------ AUTH STATE LISTENER ------------------ */
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//       setUser(firebaseUser);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   /* ------------------ HANDLE REDIRECT LOGIN ------------------ */
//   useEffect(() => {
//     getRedirectResult(auth).catch(() => {
//       // No redirect happened – ignore safely
//     });
//   }, []);

//   /* ------------------ EMAIL LOGIN ------------------ */
//   async function login(email, password) {
//     return signInWithEmailAndPassword(auth, email, password);
//   }

//   /* ------------------ EMAIL SIGNUP ------------------ */
//   async function signup(email, password) {
//     const cred = await createUserWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );

//     // 🔐 Always send verification for email signup
//     await sendEmailVerification(cred.user);

//     return cred;
//   }

//   /* ------------------ GOOGLE LOGIN ------------------ */
//   async function loginWithGoogle() {
//     const provider = new GoogleAuthProvider();
//     provider.setCustomParameters({
//       prompt: "select_account",
//     });

//     if (isMobile()) {
//       // ✅ REQUIRED for mobile browsers
//       await signInWithRedirect(auth, provider);
//       return;
//     }

//     return signInWithPopup(auth, provider);
//   }

//   /* ------------------ LOGOUT ------------------ */
//   async function logout() {
//     await signOut(auth);
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         signup,
//         loginWithGoogle,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// /* ------------------ HOOK ------------------ */
// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }
//   return ctx;
// }
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

  /* handle redirect result first (important for mobile) */
  useEffect(() => {
    let mounted = true;

    async function handleRedirect() {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && mounted) {
          setUser(result.user);
        }
      } catch {
        // no redirect, safe to ignore
      }
    }

    handleRedirect();

    return () => {
      mounted = false;
    };
  }, []);

  /* auth state listener */
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

    await sendEmailVerification(cred.user);
    return cred;
  }

  /* google login */
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    if (isMobile()) {
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
