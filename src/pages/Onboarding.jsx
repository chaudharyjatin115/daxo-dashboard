import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import { db, storage } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
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
  const [saving, setSaving] = useState(false);

  /* ------------------ LOGO UPLOAD (WITH PROGRESS) ------------------ */
function uploadLogo(file) {
  if (!file || !user) return;

  // 🔐 Size validation
  if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
    alert("Logo must be smaller than 2 MB");
    return;
  }

  const logoRef = ref(storage, `logos/${user.uid}`);
  const task = uploadBytesResumable(logoRef, file);

  setUploading(true);
  setUploadProgress(0);

  task.on(
    "state_changed",
    (snap) => {
      const progress =
        (snap.bytesTransferred / snap.totalBytes) * 100;
      setUploadProgress(Math.round(progress));
    },
    (err) => {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
      setUploading(false);
    },
    async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      setLocalLogo(url);
      setUploading(false);
    }
  );
}


  /* ------------------ REMOVE LOGO ------------------ */
  async function removeLogo() {
    if (!user) return;

    setUploading(true);
    try {
      const logoRef = ref(storage, `logos/${user.uid}`);
      await deleteObject(logoRef).catch(() => {});
      setLocalLogo(null);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }

  /* ------------------ SAVE PROFILE ------------------ */
  async function saveProfile({ skipLogo = false } = {}) {
    if (!businessName || !user) return;
    if (uploading || saving) return;

    setSaving(true);

    try {
      const payload = {
        profile: {
          businessName,
          logo: skipLogo ? "" : logo || "",
          createdAt: new Date(),
        },
      };

      // 1️⃣ Firestore
      await setDoc(doc(db, "users", user.uid), payload);

      // 2️⃣ Context
      setBusinessName(businessName);
      setLogo(skipLogo ? null : logo || null);

      // 3️⃣ Cache
      localStorage.setItem("businessName", businessName);
      if (!skipLogo && logo) {
        localStorage.setItem("businessLogo", logo);
      } else {
        localStorage.removeItem("businessLogo");
      }

      // 4️⃣ Dashboard
      navigate("/", { replace: true });
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="
          w-full max-w-md p-6 rounded-3xl
          backdrop-blur-xl border shadow-lg space-y-6
          bg-white/85 dark:bg-white/5
          border-black/5 dark:border-white/10
          animate-scale-in
        "
      >
        <h1 className="text-xl font-semibold">Set up your business</h1>

        {/* LOGO PICKER */}
        <div className="space-y-3">
          <p className="text-sm opacity-70">Business logo</p>

          <div className="flex items-center gap-4">
            <img
              src={displayLogo}
              alt="logo"
              className="w-16 h-16 rounded-xl object-cover"
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm cursor-pointer text-[var(--accent)]">
                {logo ? "Change logo" : "Upload logo"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    uploadLogo(e.target.files[0])
                  }
                />
              </label>

              {logo && (
                <button
                  onClick={removeLogo}
                  className="text-xs text-red-500"
                >
                  Remove logo
                </button>
              )}
            </div>
          </div>

          {/* PROGRESS BAR */}
          {uploading && (
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs opacity-60">
                Uploading… {uploadProgress}%
              </p>
            </div>
          )}

          <p className="text-xs opacity-60">
            You can skip this and add it later from settings.
          </p>
        </div>

        {/* BUSINESS NAME */}
        <div className="space-y-2">
          <label className="text-sm opacity-70">
            Business name
          </label>

          <input
            value={businessName}
            onChange={(e) =>
              setLocalBusinessName(e.target.value)
            }
            placeholder="Your business name"
            className="
              w-full p-3 rounded-xl outline-none
              bg-black/5 dark:bg-white/10
            "
          />
        </div>

        {/* ACTIONS */}
        <div className="space-y-3">
          <button
            onClick={() => saveProfile()}
            disabled={!businessName || uploading || saving}
            className="
              w-full py-3 rounded-xl
              bg-[var(--accent)] text-white
              font-medium
              disabled:opacity-60
              active:scale-95 transition
            "
          >
            {saving
              ? "Setting up…"
              : uploading
              ? "Uploading logo…"
              : "Continue"}
          </button>

          {businessName && (
            <button
              onClick={() => saveProfile({ skipLogo: true })}
              disabled={uploading || saving}
              className="
                w-full py-2 rounded-xl
                bg-black/5 dark:bg-white/10
                text-sm
                active:scale-95 transition
              "
            >
              Skip logo for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

