
// import { useAuth } from "../context/AuthContext";
// import { useBusiness } from "../context/BusinessContext";
// import { useNavigate } from "react-router-dom";

// import { useState } from "react";
// // import { db, storage } from "../firebase";
// import { doc, setDoc } from "firebase/firestore";
// import {
//   ref,
//   uploadBytesResumable,
//   getDownloadURL,
//   deleteObject,
// } from "firebase/storage";

// const MAX_LOGO_SIZE_MB = 2;

// export default function Onboarding() {
//   const { user } = useAuth();
//   const { setBusinessName, setLogo } = useBusiness();
//   const navigate = useNavigate();

//   const [businessName, setLocalBusinessName] = useState("");
//   const [logo, setLocalLogo] = useState(null);

//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadTask, setUploadTask] = useState(null);
//   const [saving, setSaving] = useState(false);

//   function uploadLogo(file) {
//     if (!file || !user || uploading) return;

//     if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
//       alert("Logo must be smaller than 2 MB");
//       return;
//     }

//     const logoRef = ref(storage, `logos/${user.uid}`);
//     const task = uploadBytesResumable(logoRef, file);

//     setUploadTask(task);
//     setUploading(true);
//     setUploadProgress(0);

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
//           alert("Logo upload failed");
//         }
//         setUploading(false);
//         setUploadProgress(0);
//         setUploadTask(null);
//       },
//       async () => {
//         const url = await getDownloadURL(task.snapshot.ref);
//         setLocalLogo(url);

//         // keep bar visible briefly so user sees completion
//         setTimeout(() => {
//           setUploading(false);
//           setUploadProgress(0);
//           setUploadTask(null);
//         }, 600);
//       }
//     );
//   }

//   function cancelUpload() {
//     if (uploadTask) uploadTask.cancel();
//     setUploading(false);
//     setUploadProgress(0);
//     setUploadTask(null);
//   }

//   /* remove logo functions*/
//   async function removeLogo() {
//     if (!user || uploading) return;

//     setUploading(true);
//     try {
//       await deleteObject(ref(storage, `logos/${user.uid}`)).catch(() => {});
//       setLocalLogo(null);
//     } finally {
//       setUploading(false);
//     }
//   }

//   /* save profile */
//   async function saveProfile({ skipLogo = false } = {}) {
//     if (!user || saving || uploading) return;

//     if (!businessName && !skipLogo) return;

//     setSaving(true);

//     try {
//       const payload = {
//         profile: {
//           businessName:
//             businessName ||
//             user.displayName ||
//             user.email?.split("@")[0] ||
//             "My Business",
//           logo: skipLogo ? "" : logo || "",
//           createdAt: new Date(),
//         },
//       };

//       await setDoc(doc(db, "users", user.uid), payload);

//       setBusinessName(payload.profile.businessName);
//       setLogo(skipLogo ? null : logo || null);

//       localStorage.setItem(
//         "businessName",
//         payload.profile.businessName
//       );
//       skipLogo || !logo
//         ? localStorage.removeItem("businessLogo")
//         : localStorage.setItem("businessLogo", logo);

//       navigate("/", { replace: true });
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* skip button */
//   async function skipToDashboard() {
//     if (!user || saving || uploading) return;

//     setSaving(true);

//     try {
//       const fallbackName =
//         user.displayName ||
//         user.email?.split("@")[0] ||
//         "My Business";

//       await setDoc(doc(db, "users", user.uid), {
//         profile: {
//           businessName: fallbackName,
//           logo: "",
//           createdAt: new Date(),
//         },
//       });

//       setBusinessName(fallbackName);
//       setLogo(null);

//       localStorage.setItem("businessName", fallbackName);
//       localStorage.removeItem("businessLogo");

//       navigate("/", { replace: true });
//     } finally {
//       setSaving(false);
//     }
//   }

//   const displayLogo =
//     logo ||
//     user?.photoURL ||
//     `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
//       businessName || "D"
//     )}`;

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center px-4 bg-[var(--bg-gradient)]">
//       <div className="w-full max-w-md p-6 rounded-3xl backdrop-blur-xl border shadow-lg space-y-6 bg-white/85 dark:bg-white/5">
//         <h1 className="text-xl font-semibold">Set up your business</h1>

//         {/* LOGO */}
//         <div className="space-y-3">
//           <p className="text-sm opacity-70">Business logo</p>

//           <div className="flex items-center gap-4">
//             <img
//               src={displayLogo}
//               alt="logo"
//               className="w-16 h-16 rounded-xl object-cover"
//             />

//             <div className="flex flex-col gap-2">
//               <label
//                 className={`text-sm cursor-pointer text-[var(--accent)] ${
//                   uploading ? "opacity-50 pointer-events-none" : ""
//                 }`}
//               >
//                 {logo ? "Change logo" : "Upload logo"}
//                 <input
//                   type="file"
//                   accept="image/*"
//                   hidden
//                   onChange={(e) => uploadLogo(e.target.files[0])}
//                 />
//               </label>

//               {logo && !uploading && (
//                 <button
//                   onClick={removeLogo}
//                   className="text-xs text-red-500"
//                 >
//                   Remove logo
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* progress bar*/}
//           {uploading && (
//             <div className="space-y-2">
//               <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
//                 <div
//                   className="h-full bg-[var(--accent)] transition-[width] duration-200"
//                   style={{ width: `${uploadProgress}%` }}
//                 />
//               </div>

//               <div className="flex justify-between text-xs opacity-70">
//                 <span>{uploadProgress}% uploaded</span>
//                 <button
//                   onClick={cancelUpload}
//                   className="text-red-500 hover:underline"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* name */}
//         <div className="space-y-2">
//           <label className="text-sm opacity-70">Business name</label>
//           <input
//             value={businessName}
//             onChange={(e) => setLocalBusinessName(e.target.value)}
//             placeholder="Your business name"
//             className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10 outline-none"
//           />
//         </div>

//         {/* actions */}
//         <div className="space-y-3">
//           <button
//             onClick={() => saveProfile()}
//             disabled={!businessName || saving || uploading}
//             className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium disabled:opacity-60"
//           >
//             {saving ? "Setting up…" : "Continue"}
//           </button>

//           {businessName && (
//             <button
//               onClick={() => saveProfile({ skipLogo: true })}
//               disabled={saving || uploading}
//               className="w-full py-2 rounded-xl bg-black/5 dark:bg-white/10 text-sm"
//             >
//               Skip logo for now
//             </button>
//           )}

//           <button
//             onClick={skipToDashboard}
//             disabled={saving || uploading}
//             className="w-full py-2 rounded-xl text-sm opacity-70 hover:opacity-100 disabled:opacity-40"
//           >
//             Skip setup and go to dashboard
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import { db, storage } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const MAX_LOGO_SIZE_MB = 2;

export default function Onboarding() {
  const { user } = useAuth();
  const { setBusinessName, setLogo } = useBusiness();
  const navigate = useNavigate();

  const [businessName, setLocalBusinessName] = useState("");
  const [logo, setLocalLogo] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState(null);
  const [saving, setSaving] = useState(false);

  /* logo upload */
  function uploadLogo(file) {
    if (!file || !user || uploading) return;

    if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      alert("Logo must be smaller than 2 MB");
      return;
    }

    const logoRef = ref(storage, `logos/${user.uid}`);
    const task = uploadBytesResumable(logoRef, file);

    setUploadTask(task);
    setUploading(true);
    setUploadProgress(0);

    task.on(
      "state_changed",
      (snap) => {
        const percent = Math.round(
          (snap.bytesTransferred / snap.totalBytes) * 100
        );
        setUploadProgress(percent);
      },
      (err) => {
        if (err.code !== "storage/canceled") {
          console.error(err);
          alert("Logo upload failed");
        }
        setUploading(false);
        setUploadProgress(0);
        setUploadTask(null);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setLocalLogo(url);

        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          setUploadTask(null);
        }, 600);
      }
    );
  }

  function cancelUpload() {
    if (uploadTask) uploadTask.cancel();
    setUploading(false);
    setUploadProgress(0);
    setUploadTask(null);
  }

  /* remove logo */
  async function removeLogo() {
    if (!user || uploading) return;

    setUploading(true);
    try {
      await deleteObject(ref(storage, `logos/${user.uid}`)).catch(() => {});
      setLocalLogo(null);
    } finally {
      setUploading(false);
    }
  }

  /* save profile */
  async function saveProfile({ skipLogo = false } = {}) {
    if (!user || saving || uploading) return;
    if (!businessName && !skipLogo) return;

    setSaving(true);

    try {
      const finalName =
        businessName ||
        user.displayName ||
        user.email?.split("@")[0] ||
        "My Business";

      await setDoc(
        doc(db, "users", user.uid),
        {
          profile: {
            businessName: finalName,
            logo: skipLogo ? "" : logo || "",
            createdAt: new Date(),
          },
        },
        { merge: true }
      );

      // 🔑 mark onboarding complete
      await updateDoc(doc(db, "users", user.uid), {
        onboarded: true,
      });

      setBusinessName(finalName);
      setLogo(skipLogo ? null : logo || null);

      localStorage.setItem("businessName", finalName);
      skipLogo || !logo
        ? localStorage.removeItem("businessLogo")
        : localStorage.setItem("businessLogo", logo);

      navigate("/dashboard", { replace: true });
    } finally {
      setSaving(false);
    }
  }

  /* skip onboarding */
  async function skipToDashboard() {
    if (!user || saving || uploading) return;

    setSaving(true);

    try {
      const fallbackName =
        user.displayName ||
        user.email?.split("@")[0] ||
        "My Business";

      await setDoc(
        doc(db, "users", user.uid),
        {
          profile: {
            businessName: fallbackName,
            logo: "",
            createdAt: new Date(),
          },
          onboarded: true,
        },
        { merge: true }
      );

      setBusinessName(fallbackName);
      setLogo(null);

      localStorage.setItem("businessName", fallbackName);
      localStorage.removeItem("businessLogo");

      navigate("/dashboard", { replace: true });
    } finally {
      setSaving(false);
    }
  }

  const displayLogo =
    logo ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      businessName || "D"
    )}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-[var(--bg-gradient)]">
      <div className="w-full max-w-md p-6 rounded-3xl backdrop-blur-xl border shadow-lg space-y-6 bg-white/85 dark:bg-white/5">
        <h1 className="text-xl font-semibold">Set up your business</h1>

        {/* logo */}
        <div className="space-y-3">
          <p className="text-sm opacity-70">Business logo</p>

          <div className="flex items-center gap-4">
            <img
              src={displayLogo}
              alt="logo"
              className="w-16 h-16 rounded-xl object-cover"
            />

            <div className="flex flex-col gap-2">
              <label
                className={`text-sm cursor-pointer text-[var(--accent)] ${
                  uploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {logo ? "Change logo" : "Upload logo"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => uploadLogo(e.target.files[0])}
                />
              </label>

              {logo && !uploading && (
                <button
                  onClick={removeLogo}
                  className="text-xs text-red-500"
                >
                  Remove logo
                </button>
              )}
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] transition-[width] duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <div className="flex justify-between text-xs opacity-70">
                <span>{uploadProgress}% uploaded</span>
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

        {/* business name */}
        <div className="space-y-2">
          <label className="text-sm opacity-70">Business name</label>
          <input
            value={businessName}
            onChange={(e) => setLocalBusinessName(e.target.value)}
            placeholder="Your business name"
            className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10 outline-none"
          />
        </div>

        {/* actions */}
        <div className="space-y-3">
          <button
            onClick={() => saveProfile()}
            disabled={!businessName || saving || uploading}
            className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium disabled:opacity-60"
          >
            {saving ? "Setting up…" : "Continue"}
          </button>

          {businessName && (
            <button
              onClick={() => saveProfile({ skipLogo: true })}
              disabled={saving || uploading}
              className="w-full py-2 rounded-xl bg-black/5 dark:bg-white/10 text-sm"
            >
              Skip logo for now
            </button>
          )}

          <button
            onClick={skipToDashboard}
            disabled={saving || uploading}
            className="w-full py-2 rounded-xl text-sm opacity-70 hover:opacity-100 disabled:opacity-40"
          >
            Skip setup and go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}