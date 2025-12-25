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
// function isIOS() {
//   return (
//     /iPad|iPhone|iPod/.test(navigator.userAgent) &&
//     !window.MSStream
//   );
// }

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* ------------------ AUTH STATE ------------------ */
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (firebaseUser) => {
//       setUser(firebaseUser);
//       setLoading(false);
//     });

//     return unsub;
//   }, []);

//   /* ------------------ REDIRECT RESULT (CRITICAL) ------------------ */
//   useEffect(() => {
//     getRedirectResult(auth)
//       .then((result) => {
//         if (result?.user) {
//           setUser(result.user);
//         }
//       })
//       .finally(() => {
//         setLoading(false);
//       });
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

//     await sendEmailVerification(cred.user);
//     return cred;
//   }

//   /* ------------------ GOOGLE LOGIN (BULLETPROOF) ------------------ */
//   async function loginWithGoogle() {
//     const provider = new GoogleAuthProvider();
//     provider.setCustomParameters({
//       prompt: "select_account",
//     });

//     try {
//       if (isIOS()) {
//         await signInWithRedirect(auth, provider);
//         return;
//       }

//       await signInWithPopup(auth, provider);
//     } catch (err) {
//       // 🔥 fallback for blocked popup / privacy mode
//       await signInWithRedirect(auth, provider);
//     }
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

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
  }, []);

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signup(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    return cred;
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    if (isIOS()) {
      await signInWithRedirect(auth, provider);
      return;
    }
    return signInWithPopup(auth, provider);
  }

  async function logout() {
    await signOut(auth);
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
