import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import { db, storage } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export default function Onboarding() {
  const { user } = useAuth();
  const { setBusinessName, setLogo } = useBusiness();
  const navigate = useNavigate();

  const [businessName, setLocalBusinessName] = useState("");
  const [logo, setLocalLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ------------------ LOGO UPLOAD ------------------ */
  async function uploadLogo(file) {
    if (!file || !user) return;
    setUploading(true);

    const logoRef = ref(storage, `logos/${user.uid}`);
    await uploadBytes(logoRef, file);
    const url = await getDownloadURL(logoRef);

    setLocalLogo(url);
    setUploading(false);
  }

  /* ------------------ REMOVE LOGO ------------------ */
  async function removeLogo() {
    if (!user) return;
    setUploading(true);

    const logoRef = ref(storage, `logos/${user.uid}`);
    await deleteObject(logoRef).catch(() => {});
    setLocalLogo(null);

    setUploading(false);
  }

  /* ------------------ SUBMIT ------------------ */
  async function submit() {
    if (!businessName || !user) return;
    setLoading(true);

    const payload = {
      profile: {
        businessName,
        logo: logo || "",
        createdAt: new Date(),
      },
    };

    // 1️⃣ Save to Firestore
    await setDoc(doc(db, "users", user.uid), payload);

    // 2️⃣ Update BusinessContext IMMEDIATELY
    setBusinessName(businessName);
    setLogo(logo || null);

    // 3️⃣ Cache locally (optional but fast)
    localStorage.setItem("businessName", businessName);
    if (logo) {
      localStorage.setItem("businessLogo", logo);
    }

    // 4️⃣ Navigate to dashboard
    navigate("/", { replace: true });
  }

  const displayLogo = logo || user?.photoURL;

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
        <h1 className="text-xl font-semibold">
          Set up your business
        </h1>

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

          <p className="text-xs opacity-60">
            If skipped, your Google profile photo is used.
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

        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={loading || uploading}
          className="
            w-full py-3 rounded-xl
            bg-[var(--accent)] text-white
            font-medium
            disabled:opacity-60
            active:scale-95 transition
          "
        >
          {loading
            ? "Setting up…"
            : uploading
            ? "Uploading logo…"
            : "Continue"}
        </button>
      </div>
    </div>
  );
}

