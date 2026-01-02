import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/*
  NOTE:
  - This onboarding flow does NOT use Firebase Storage
  - Logo is auto-resolved using:
    1) Google photo (if available)
    2) DiceBear initials fallback
*/

export default function Onboarding() {
  const { user } = useAuth();
  const { setBusinessName, setLogo } = useBusiness();
  const navigate = useNavigate();

  const [businessName, setLocalBusinessName] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  /* save profile and finish onboarding */
  async function saveProfile({ skipLogo = false } = {}) {
    if (saving) return;

    const finalName =
      businessName ||
      user.displayName ||
      user.email?.split("@")[0] ||
      "My Business";

    setSaving(true);

    try {
      // create / update user document
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          onboarded: true,
          profile: {
            businessName: finalName,
            logo: skipLogo ? "" : user.photoURL || "",
            createdAt: new Date(),
          },
        },
        { merge: true }
      );

      // update local state
      setBusinessName(finalName);
      setLogo(skipLogo ? null : user.photoURL || null);

      localStorage.setItem("businessName", finalName);
      skipLogo
        ? localStorage.removeItem("businessLogo")
        : localStorage.setItem("businessLogo", user.photoURL || "");

      navigate("/dashboard", { replace: true });
    } finally {
      setSaving(false);
    }
  }

  /* skip everything */
  async function skipToDashboard() {
    if (saving) return;

    const fallbackName =
      user.displayName ||
      user.email?.split("@")[0] ||
      "My Business";

    setSaving(true);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          onboarded: true,
          profile: {
            businessName: fallbackName,
            logo: "",
            createdAt: new Date(),
          },
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
    user.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      businessName || "D"
    )}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-[var(--bg-gradient)]">
      <div className="w-full max-w-md p-6 rounded-3xl backdrop-blur-xl border shadow-lg space-y-6 bg-white/85 dark:bg-white/5">
        <h1 className="text-xl font-semibold">Set up your business</h1>

        {/* logo preview */}
        <div className="space-y-3">
          <p className="text-sm opacity-70">Business logo</p>

          <div className="flex items-center gap-4">
            <img
              src={displayLogo}
              alt="logo"
              className="w-16 h-16 rounded-xl object-cover"
            />
            <p className="text-xs opacity-60">
              Logo is auto-generated for now
            </p>
          </div>
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
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium disabled:opacity-60"
          >
            {saving ? "Setting up…" : "Continue"}
          </button>

          <button
            onClick={() => saveProfile({ skipLogo: true })}
            disabled={saving}
            className="w-full py-2 rounded-xl bg-black/5 dark:bg-white/10 text-sm"
          >
            Skip logo for now
          </button>

          <button
            onClick={skipToDashboard}
            disabled={saving}
            className="w-full py-2 rounded-xl text-sm opacity-70 hover:opacity-100"
          >
            Skip setup and go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}