// import { useAuth } from "../context/AuthContext";
// import { useTheme } from "../context/ThemeContext";
// import { useBusiness } from "../context/BusinessContext";
// import Header from "../components/Header";

// import { useEffect, useState } from "react";
// // import { db, storage, auth } from "../firebase";
// import { doc, updateDoc, deleteDoc } from "firebase/firestore";
// import {
//   ref,
//   uploadBytesResumable,
//   getDownloadURL,
//   deleteObject,
// } from "firebase/storage";
// import {
//   deleteUser,
//   GoogleAuthProvider,
//   EmailAuthProvider,
//   reauthenticateWithPopup,
//   reauthenticateWithRedirect,
//   reauthenticateWithCredential,
// } from "firebase/auth";
// import { useNavigate } from "react-router-dom";

// const MAX_LOGO_SIZE_MB = 2;

// const COLORS = [
//   "#7c6cf6",
//   "#2563eb",
//   "#16a34a",
//   "#ea580c",
//   "#dc2626",
//   "#0f766e",
// ];

// function isMobile() {
//   return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
// }

// /* safe logo resolver */
// function resolveLogo({ logo, user, businessName }) {
//   if (typeof logo === "string" && logo.trim()) return logo;
//   if (user?.photoURL) return user.photoURL;

//   return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
//     businessName || "D"
//   )}`;
// }

// export default function Settings() {
//   const { logout, user } = useAuth();
//   const { theme, toggleTheme } = useTheme();
//   const {
//     businessName,
//     setBusinessName,
//     saveBusinessName,
//     logo,
//     setLogo,
//   } = useBusiness();

//   const navigate = useNavigate();

//   const [accent, setAccent] = useState(
//     localStorage.getItem("accent") || COLORS[0]
//   );
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadTask, setUploadTask] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   /* accent color */
//   useEffect(() => {
//     document.documentElement.style.setProperty("--accent", accent);
//     localStorage.setItem("accent", accent);
//   }, [accent]);

//   /* resume delete after mobile reauth */
//   useEffect(() => {
//     const resumeDelete = async () => {
//       if (sessionStorage.getItem("PENDING_DELETE") !== "1") return;
//       sessionStorage.removeItem("PENDING_DELETE");

//       try {
//         const uid = auth.currentUser?.uid;
//         if (!uid) return;

//         await deleteDoc(doc(db, "users", uid));
//         await deleteObject(ref(storage, `logos/${uid}`)).catch(() => {});
//         localStorage.clear();
//         navigate("/login", { replace: true });
//       } catch (err) {
//         console.error(err);
//         alert("please try deleting your account again");
//       }
//     };

//     resumeDelete();
//   }, [navigate]);

//   /* save business name (fixed: no infinite saving) */
//   async function handleSaveBusinessName() {
//     if (!user || saving) return;

//     setSaving(true);
//     try {
//       await saveBusinessName(businessName?.trim() || "");
//     } catch (err) {
//       console.error(err);
//       alert("failed to save business name");
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* logo upload */
//   function uploadLogo(file) {
//     if (!file || !user || uploading) return;

//     if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
//       alert("logo must be under 2 mb");
//       return;
//     }

//     const logoRef = ref(storage, `logos/${user.uid}`);
//     const task = uploadBytesResumable(logoRef, file);

//     setUploadTask(task);
//     setUploading(true);
//     setUploadProgress(1);

//     task.on(
//       "state_changed",
//       (snap) => {
//         const percent = Math.round(
//           (snap.bytesTransferred / snap.totalBytes) * 100
//         );
//         setUploadProgress(percent);
//       },
//       (err) => {
//         if (err.code !== "storage/canceled") {
//           console.error(err);
//           alert("logo upload failed");
//         }
//         setUploading(false);
//         setUploadTask(null);
//       },
//       async () => {
//         const url = await getDownloadURL(task.snapshot.ref);

//         await updateDoc(doc(db, "users", user.uid), {
//           "profile.logo": url,
//         });

//         setLogo(url);

//         setTimeout(() => {
//           setUploading(false);
//           setUploadProgress(0);
//           setUploadTask(null);
//         }, 400);
//       }
//     );
//   }

//   function cancelUpload() {
//     uploadTask?.cancel();
//     setUploading(false);
//     setUploadProgress(0);
//     setUploadTask(null);
//   }

//   /* delete logo */
//   async function deleteLogo() {
//     if (!user || uploading) return;

//     setUploading(true);
//     try {
//       await deleteObject(ref(storage, `logos/${user.uid}`)).catch(() => {});
//       await updateDoc(doc(db, "users", user.uid), { "profile.logo": "" });
//       setLogo("");
//     } finally {
//       setUploading(false);
//     }
//   }

//   /* delete account */
//   async function handleDeleteAccount() {
//     if (!user || deleting) return;

//     const ok = window.confirm(
//       "this will permanently delete your account and all data.\n\ncontinue?"
//     );
//     if (!ok) return;

//     setDeleting(true);

//     try {
//       const currentUser = auth.currentUser;
//       const uid = currentUser.uid;

//       try {
//         await deleteUser(currentUser);
//       } catch (err) {
//         if (err.code !== "auth/requires-recent-login") throw err;

//         const isGoogle = currentUser.providerData.some(
//           (p) => p.providerId === "google.com"
//         );

//         if (isGoogle) {
//           const provider = new GoogleAuthProvider();
//           sessionStorage.setItem("PENDING_DELETE", "1");

//           if (isMobile()) {
//             await reauthenticateWithRedirect(currentUser, provider);
//             return;
//           } else {
//             await reauthenticateWithPopup(currentUser, provider);
//           }
//         } else {
//           const password = window.prompt("enter password to continue");
//           if (!password) throw new Error("password required");

//           const credential = EmailAuthProvider.credential(
//             currentUser.email,
//             password
//           );
//           await reauthenticateWithCredential(currentUser, credential);
//         }

//         await deleteUser(currentUser);
//       }

//       await deleteDoc(doc(db, "users", uid));
//       await deleteObject(ref(storage, `logos/${uid}`)).catch(() => {});
//       localStorage.clear();
//       navigate("/login", { replace: true });
//     } catch (err) {
//       console.error(err);
//       alert("account deletion failed");
//     } finally {
//       setDeleting(false);
//     }
//   }

//   const displayLogo = resolveLogo({ logo, user, businessName });

//   return (
//     <main className="min-h-screen px-4 py-10 bg-[var(--bg-gradient)]">
//       <div className="max-w-md mx-auto space-y-6">
//         <Header />

//         <div
//           className="
//             p-6 rounded-3xl
//             backdrop-blur-xl border shadow-lg
//             space-y-6
//           "
//           style={{
//             background: "var(--card-bg)",
//             borderColor: "var(--card-border)",
//           }}
//         >
//           <h1 className="text-xl font-semibold">settings</h1>

//           {/* theme */}
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="text-sm font-medium">theme</p>
//               <p className="text-xs opacity-70">
//                 currently using {theme} mode
//               </p>
//             </div>
//             <button
//               onClick={toggleTheme}
//               className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white"
//             >
//               {theme === "dark" ? "light" : "dark"}
//             </button>
//           </div>

//           {/* business name */}
//           <div className="space-y-2">
//             <label className="text-sm opacity-70">business name</label>
//             <input
//               value={businessName || ""}
//               onChange={(e) => setBusinessName(e.target.value)}
//               className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10"
//             />
//             <button
//               onClick={handleSaveBusinessName}
//               disabled={saving}
//               className="w-full py-2 rounded-xl bg-[var(--accent)] text-white"
//             >
//               {saving ? "saving…" : "save name"}
//             </button>
//           </div>

//           {/* logo */}
//           <div className="space-y-3">
//             <label className="text-sm opacity-70">business logo</label>

//             <div className="flex items-center gap-4">
//               <img
//                 src={displayLogo}
//                 alt="logo"
//                 className="w-14 h-14 rounded-xl object-cover"
//               />

//               <div className="flex flex-col gap-2">
//                 <label className="text-sm cursor-pointer text-[var(--accent)]">
//                   change logo
//                   <input
//                     type="file"
//                     accept="image/*"
//                     hidden
//                     onChange={(e) => uploadLogo(e.target.files[0])}
//                   />
//                 </label>

//                 {logo && (
//                   <button
//                     onClick={deleteLogo}
//                     className="text-xs text-red-500"
//                   >
//                     remove logo
//                   </button>
//                 )}
//               </div>
//             </div>

//             {uploading && (
//               <div className="space-y-2">
//                 <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
//                   <div
//                     className="h-full bg-[var(--accent)] transition-all"
//                     style={{ width: `${uploadProgress}%` }}
//                   />
//                 </div>
//                 <div className="flex justify-between text-xs opacity-70">
//                   <span>uploading… {uploadProgress}%</span>
//                   <button
//                     onClick={cancelUpload}
//                     className="text-red-500 hover:underline"
//                   >
//                     cancel
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* accent */}
//           <div>
//             <p className="text-sm mb-2">brand accent</p>
//             <div className="flex gap-3">
//               {COLORS.map((c) => (
//                 <button
//                   key={c}
//                   onClick={() => setAccent(c)}
//                   className={`w-8 h-8 rounded-full border-2 ${
//                     accent === c ? "scale-110" : "opacity-70"
//                   }`}
//                   style={{ background: c }}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* user */}
//           <div className="text-sm opacity-80">
//             <p>👤 {user?.displayName || "email user"}</p>
//             <p>📧 {user?.email}</p>
//           </div>

//           <button
//             onClick={logout}
//             disabled={deleting}
//             className="w-full py-3 rounded-xl bg-red-500 text-white"
//           >
//             logout
//           </button>

//           <button
//             onClick={handleDeleteAccount}
//             disabled={deleting}
//             className="w-full py-3 rounded-xl border border-red-500 text-red-600"
//           >
//             {deleting ? "deleting…" : "delete my account"}
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }