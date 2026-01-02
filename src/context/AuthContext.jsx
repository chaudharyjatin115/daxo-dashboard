// import { createContext, useContext, useEffect, useState } from "react";
// import { auth } from "../firebase";
// import {
//   GoogleAuthProvider,
//   signInWithPopup,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
//   signOut,
//   onAuthStateChanged,
// } from "firebase/auth";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // single source of truth
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (u) => {
//       setUser(u);
//       setLoading(false);
//     });
//     return unsub;
//   }, []);

//   function login(email, password) {
//     return signInWithEmailAndPassword(auth, email, password);
//   }

//   async function signup(email, password) {
//     const cred = await createUserWithEmailAndPassword(auth, email, password);
//     await sendEmailVerification(cred.user);
//     return cred;
//   }

//   async function loginWithGoogle() {
//     const provider = new GoogleAuthProvider();
//     provider.setCustomParameters({
//       prompt: "select_account",
//     });

//     // 🔑 WORKS on desktop + Android + iOS
//     return signInWithPopup(auth, provider);
//   }

//   function logout() {
//     return signOut(auth);
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

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
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
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";

const AuthContext = createContext(null);

/* simple mobile check – nothing fancy */
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* --------------------------------------------------
     handle google redirect result (important for mobile)
     this runs once when app loads
  -------------------------------------------------- */
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch(() => {
        // no redirect happened, totally fine
      });
  }, []);

  /* --------------------------------------------------
     main auth state listener
     this is the single source of truth
  -------------------------------------------------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /* ------------------ email login ------------------ */
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  /* ------------------ email signup ------------------ */
  async function signup(email, password) {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // always verify email for email/password users
    await sendEmailVerification(cred.user);
    return cred;
  }

  /* ------------------ google login ------------------ */
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    // mobile browsers *must* use redirect
    if (isMobile()) {
      await signInWithRedirect(auth, provider);
      return;
    }

    return signInWithPopup(auth, provider);
  }

  /* ------------------ logout ------------------ */
  function logout() {
    return signOut(auth);
  }

  /* --------------------------------------------------
     delete account (production safe)
     handles google + email users correctly
  -------------------------------------------------- */
  async function deleteAccount(password) {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // try direct delete first
      await deleteUser(currentUser);
    } catch (err) {
      // firebase requires recent login for this
      if (err.code === "auth/requires-recent-login") {
        const providerId =
          currentUser.providerData[0]?.providerId;

        // google user → popup reauth
        if (providerId === "google.com") {
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(currentUser, provider);
        }

        // email user → password reauth
        else {
          if (!password) {
            throw new Error("Password required to delete account");
          }

          const credential = EmailAuthProvider.credential(
            currentUser.email,
            password
          );

          await reauthenticateWithCredential(
            currentUser,
            credential
          );
        }

        // retry delete after reauth
        await deleteUser(currentUser);
      } else {
        throw err;
      }
    }
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
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------ hook ------------------ */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}