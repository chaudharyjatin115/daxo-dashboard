
// import { useAuth } from "../context/AuthContext";
// import { useTheme } from "../context/ThemeContext";
// import { useBusiness } from "../context/BusinessContext";
// import Header from "../components/Header";

// import { useEffect, useState } from "react";
// import { db, storage, auth } from "../firebase";
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

// /* ---------- SAFE LOGO RESOLVER ---------- */
// function resolveLogo({ logo, user, businessName }) {
//   if (typeof logo === "string" && logo.trim().length > 0) {
//     return logo;
//   }

//   if (user?.photoURL) {
//     return user.photoURL;
//   }

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
//     localStorage.getItem("accent") || "#7c6cf6"
//   );
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [deleting, setDeleting] = useState(false);

//   /* ------------------ ACCENT ------------------ */
//   useEffect(() => {
//     document.documentElement.style.setProperty("--accent", accent);
//     localStorage.setItem("accent", accent);
//   }, [accent]);

//   /* ------------------ RESUME DELETE (MOBILE REDIRECT) ------------------ */
//   useEffect(() => {
//     const resumeDelete = async () => {
//       if (sessionStorage.getItem("PENDING_DELETE") !== "1") return;
//       sessionStorage.removeItem("PENDING_DELETE");

//       try {
//         const currentUser = auth.currentUser;
//         if (!currentUser) return;

//         await deleteUser(currentUser);
//         await deleteDoc(doc(db, "users", currentUser.uid));

//         const logoRef = ref(storage, `logos/${currentUser.uid}`);
//         await deleteObject(logoRef).catch(() => {});

//         localStorage.clear();
//         navigate("/login", { replace: true });
//       } catch (err) {
//         console.error(err);
//         alert("Please try deleting your account again.");
//       }
//     };

//     resumeDelete();
//   }, [navigate]);

//   /* ------------------ SAVE BUSINESS NAME ------------------ */
//   async function handleSaveBusinessName() {
//     if (!user) return;
//     setSaving(true);
//     await saveBusinessName(businessName || "");
//     setSaving(false);
//   }

//   /* ------------------ LOGO UPLOAD ------------------ */
//   async function uploadLogo(file) {
//     if (!file || !user) return;

//     if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
//       alert("Logo must be under 2MB");
//       return;
//     }

//     setUploading(true);
//     setUploadProgress(0);

//     const logoRef = ref(storage, `logos/${user.uid}`);
//     const task = uploadBytesResumable(logoRef, file);

//     task.on(
//       "state_changed",
//       (snap) => {
//         const percent = Math.round(
//           (snap.bytesTransferred / snap.totalBytes) * 100
//         );
//         setUploadProgress(percent);
//       },
//       (err) => {
//         console.error(err);
//         alert("Logo upload failed");
//         setUploading(false);
//       },
//       async () => {
//         const url = await getDownloadURL(task.snapshot.ref);

//         await updateDoc(doc(db, "users", user.uid), {
//           "profile.logo": url,
//         });

//         setLogo(url);
//         setUploading(false);
//         setUploadProgress(0);
//       }
//     );
//   }

//   /* ------------------ LOGO DELETE ------------------ */
//   async function deleteLogo() {
//     if (!user) return;
//     setUploading(true);

//     const logoRef = ref(storage, `logos/${user.uid}`);
//     await deleteObject(logoRef).catch(() => {});

//     await updateDoc(doc(db, "users", user.uid), {
//       "profile.logo": "",
//     });

//     setLogo("");
//     setUploading(false);
//   }

//   /* ------------------ DELETE ACCOUNT ------------------ */
//   async function handleDeleteAccount() {
//     if (!user || deleting) return;

//     const ok = window.confirm(
//       "This will permanently delete your account and all data.\n\nThis cannot be undone.\n\nContinue?"
//     );
//     if (!ok) return;

//     setDeleting(true);

//     try {
//       const currentUser = auth.currentUser;

//       try {
//         await deleteUser(currentUser);
//       } catch (err) {
//         if (err.code !== "auth/requires-recent-login") throw err;

//         const isGoogleUser = currentUser.providerData.some(
//           (p) => p.providerId === "google.com"
//         );

//         if (isGoogleUser) {
//           const provider = new GoogleAuthProvider();

//           if (isMobile()) {
//             sessionStorage.setItem("PENDING_DELETE", "1");
//             await reauthenticateWithRedirect(currentUser, provider);
//             return;
//           } else {
//             await reauthenticateWithPopup(currentUser, provider);
//           }
//         } else {
//           const password = window.prompt(
//             "Enter your password to confirm account deletion:"
//           );
//           if (!password) throw new Error("Password required");

//           const credential = EmailAuthProvider.credential(
//             currentUser.email,
//             password
//           );

//           await reauthenticateWithCredential(currentUser, credential);
//         }

//         await deleteUser(currentUser);
//       }

//       await deleteDoc(doc(db, "users", user.uid));

//       const logoRef = ref(storage, `logos/${user.uid}`);
//       await deleteObject(logoRef).catch(() => {});

//       localStorage.clear();
//       navigate("/login", { replace: true });
//     } catch (err) {
//       console.error(err);
//       alert("Account deletion failed. Please try again.");
//     } finally {
//       setDeleting(false);
//     }
//   }

//   const displayLogo = resolveLogo({ logo, user, businessName });

//   return (
//     <main className="min-h-screen px-4 py-10 bg-[var(--bg-gradient)] transition-colors">
//       <div className="max-w-md mx-auto space-y-6">
//         <Header />

//         <div className="w-full p-6 rounded-3xl backdrop-blur-xl border shadow-lg space-y-6 bg-white/85 dark:bg-white/5 border-black/5 dark:border-white/10">
//           <h1 className="text-xl font-semibold">Settings</h1>

//           {/* THEME */}
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium">Theme</p>
//               <p className="text-xs opacity-70">
//                 Currently using {theme} mode
//               </p>
//             </div>
//             <button
//               onClick={toggleTheme}
//               className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium"
//             >
//               {theme === "dark" ? "Light" : "Dark"}
//             </button>
//           </div>

//           {/* BUSINESS NAME */}
//           <div className="space-y-2">
//             <label className="text-sm opacity-70">Business name</label>
//             <input
//               value={businessName || ""}
//               onChange={(e) => setBusinessName(e.target.value)}
//               className="w-full p-3 rounded-xl outline-none bg-black/5 dark:bg-white/10"
//             />
//             <button
//               onClick={handleSaveBusinessName}
//               disabled={saving}
//               className="w-full py-2 rounded-xl bg-[var(--accent)] text-white disabled:opacity-60"
//             >
//               {saving ? "Saving…" : "Save name"}
//             </button>
//           </div>

//           {/* LOGO PICKER */}
//           <div className="space-y-3">
//             <label className="text-sm opacity-70">Business logo</label>

//             <div className="flex items-center gap-4">
//               <img
//                 src={displayLogo}
//                 alt="logo"
//                 className="w-14 h-14 rounded-xl object-cover"
//               />

//               <div className="flex flex-col gap-2">
//                 <label className="text-sm cursor-pointer text-[var(--accent)]">
//                   Change logo
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
//                     Remove logo
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* UPLOAD PROGRESS */}
//             {uploading && (
//               <div className="w-full space-y-1">
//                 <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-[var(--accent)] transition-all duration-200"
//                     style={{ width: `${uploadProgress}%` }}
//                   />
//                 </div>
//                 <p className="text-xs opacity-60 text-right">
//                   Uploading… {uploadProgress}%
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* ACCENT PICKER */}
//           <div>
//             <p className="text-sm mb-2">Brand accent color</p>
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

//           {/* USER INFO */}
//           <div className="text-sm space-y-1 opacity-80">
//             <p>👤 {user?.displayName || "Email user"}</p>
//             <p>📧 {user?.email}</p>
//           </div>

//           {/* LOGOUT */}
//           <button
//             onClick={logout}
//             className="w-full py-3 rounded-xl bg-red-500 text-white"
//           >
//             Logout
//           </button>

//           {/* DELETE ACCOUNT */}
//           <button
//             onClick={handleDeleteAccount}
//             disabled={deleting}
//             className="w-full py-3 rounded-xl border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition disabled:opacity-60"
//           >
//             {deleting ? "Deleting account…" : "Delete my account"}
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useBusiness } from "../context/BusinessContext";
import Header from "../components/Header";

import { useEffect, useState } from "react";
import { db, storage, auth } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  deleteUser,
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithPopup,
  reauthenticateWithRedirect,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const MAX_LOGO_SIZE_MB = 2;

const COLORS = [
  "#7c6cf6",
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#dc2626",
  "#0f766e",
];

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/* ---------- SAFE LOGO RESOLVER ---------- */
function resolveLogo({ logo, user, businessName }) {
  if (typeof logo === "string" && logo.trim()) return logo;
  if (user?.photoURL) return user.photoURL;

  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    businessName || "D"
  )}`;
}

export default function Settings() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    businessName,
    setBusinessName,
    saveBusinessName,
    logo,
    setLogo,
  } = useBusiness();

  const navigate = useNavigate();

  const [accent, setAccent] = useState(
    localStorage.getItem("accent") || COLORS[0]
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ------------------ ACCENT ------------------ */
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("accent", accent);
  }, [accent]);

  /* ------------------ RESUME DELETE (MOBILE REDIRECT) ------------------ */
  useEffect(() => {
    const resumeDelete = async () => {
      if (sessionStorage.getItem("PENDING_DELETE") !== "1") return;
      sessionStorage.removeItem("PENDING_DELETE");

      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        await deleteDoc(doc(db, "users", uid));
        await deleteObject(ref(storage, `logos/${uid}`)).catch(() => {});

        localStorage.clear();
        navigate("/login", { replace: true });
      } catch (err) {
        console.error(err);
        alert("Please try deleting your account again.");
      }
    };

    resumeDelete();
  }, [navigate]);

  /* ------------------ SAVE BUSINESS NAME ------------------ */
  async function handleSaveBusinessName() {
    if (!user) return;
    setSaving(true);
    await saveBusinessName(businessName || "");
    setSaving(false);
  }

  /* ------------------ LOGO UPLOAD ------------------ */
  async function uploadLogo(file) {
    if (!file || !user || deleting) return;

    if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      alert("Logo must be under 2MB");
      return;
    }

    setUploading(true);
    setUploadProgress(1);

    const logoRef = ref(storage, `logos/${user.uid}`);
    const task = uploadBytesResumable(logoRef, file);
    setUploadTask(task);

    task.on(
      "state_changed",
      (snap) => {
        const percent = Math.round(
          (snap.bytesTransferred / snap.totalBytes) * 100
        );
        setUploadProgress(percent);
      },
      (err) => {
        if (err.code === "storage/canceled") return;
        console.error(err);
        alert("Logo upload failed");
        setUploading(false);
        setUploadTask(null);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);

        await updateDoc(doc(db, "users", user.uid), {
          "profile.logo": url,
        });

        setLogo(url);
        setUploadProgress(100);

        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          setUploadTask(null);
        }, 600);
      }
    );
  }

  function cancelUpload() {
    if (!uploadTask) return;
    uploadTask.cancel();
    setUploading(false);
    setUploadProgress(0);
    setUploadTask(null);
  }

  /* ------------------ LOGO DELETE ------------------ */
  async function deleteLogo() {
    if (!user || uploading) return;

    setUploading(true);
    await deleteObject(ref(storage, `logos/${user.uid}`)).catch(() => {});
    await updateDoc(doc(db, "users", user.uid), { "profile.logo": "" });
    setLogo("");
    setUploading(false);
  }

  /* ------------------ DELETE ACCOUNT ------------------ */
  async function handleDeleteAccount() {
    if (!user || deleting) return;

    const ok = window.confirm(
      "This will permanently delete your account and all data.\n\nThis cannot be undone.\n\nContinue?"
    );
    if (!ok) return;

    setDeleting(true);

    try {
      const currentUser = auth.currentUser;
      const uid = currentUser.uid;

      try {
        await deleteUser(currentUser);
      } catch (err) {
        if (err.code !== "auth/requires-recent-login") throw err;

        const isGoogleUser = currentUser.providerData.some(
          (p) => p.providerId === "google.com"
        );

        if (isGoogleUser) {
          const provider = new GoogleAuthProvider();
          sessionStorage.setItem("PENDING_DELETE", "1");

          if (isMobile()) {
            await reauthenticateWithRedirect(currentUser, provider);
            return;
          } else {
            await reauthenticateWithPopup(currentUser, provider);
          }
        } else {
          const password = window.prompt(
            "Enter your password to confirm account deletion:"
          );
          if (!password) throw new Error("Password required");

          const credential = EmailAuthProvider.credential(
            currentUser.email,
            password
          );

          await reauthenticateWithCredential(currentUser, credential);
        }

        await deleteUser(currentUser);
      }

      await deleteDoc(doc(db, "users", uid));
      await deleteObject(ref(storage, `logos/${uid}`)).catch(() => {});
      localStorage.clear();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Account deletion failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const displayLogo = resolveLogo({ logo, user, businessName });

  return (
    <main className="min-h-screen px-4 py-10 bg-[var(--bg-gradient)]">
      <div className="max-w-md mx-auto space-y-6">
        <Header />

        <div className="p-6 rounded-3xl backdrop-blur-xl border shadow-lg space-y-6 bg-white/85 dark:bg-white/5">
          <h1 className="text-xl font-semibold">Settings</h1>

          {/* THEME */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs opacity-70">
                Currently using {theme} mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          {/* BUSINESS NAME */}
          <div className="space-y-2">
            <label className="text-sm opacity-70">Business name</label>
            <input
              value={businessName || ""}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10"
            />
            <button
              onClick={handleSaveBusinessName}
              disabled={saving}
              className="w-full py-2 rounded-xl bg-[var(--accent)] text-white"
            >
              {saving ? "Saving…" : "Save name"}
            </button>
          </div>

          {/* LOGO */}
          <div className="space-y-3">
            <label className="text-sm opacity-70">Business logo</label>

            <div className="flex items-center gap-4">
              <img
                src={displayLogo}
                alt="logo"
                className="w-14 h-14 rounded-xl object-cover"
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm cursor-pointer text-[var(--accent)]">
                  Change logo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => uploadLogo(e.target.files[0])}
                  />
                </label>

                {logo && (
                  <button
                    onClick={deleteLogo}
                    className="text-xs text-red-500"
                  >
                    Remove logo
                  </button>
                )}
              </div>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs opacity-70">
                  <span>Uploading… {uploadProgress}%</span>
                  <button
                    onClick={cancelUpload}
                    className="text-red-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACCENT */}
          <div>
            <p className="text-sm mb-2">Brand accent color</p>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    accent === c ? "scale-110" : "opacity-70"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* USER */}
          <div className="text-sm opacity-80">
            <p>👤 {user?.displayName || "Email user"}</p>
            <p>📧 {user?.email}</p>
          </div>

          <button
            onClick={logout}
            disabled={deleting}
            className="w-full py-3 rounded-xl bg-red-500 text-white"
          >
            Logout
          </button>

          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full py-3 rounded-xl border border-red-500 text-red-600"
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </div>
    </main>
  );
}
