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
