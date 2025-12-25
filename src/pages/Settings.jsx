import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useBusiness } from "../context/BusinessContext";
import Header from "../components/Header";

import { useEffect, useState } from "react";
import { db, storage, auth } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  deleteUser,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const COLORS = [
  "#7c6cf6",
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#dc2626",
  "#0f766e",
];

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
    localStorage.getItem("accent") || "#7c6cf6"
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ------------------ ACCENT ------------------ */
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("accent", accent);
  }, [accent]);

  /* ------------------ SAVE BUSINESS NAME ------------------ */
  async function handleSaveBusinessName() {
    if (!user) return;
    setSaving(true);
    await saveBusinessName(businessName || "");
    setSaving(false);
  }

  /* ------------------ LOGO UPLOAD ------------------ */
  async function uploadLogo(file) {
    if (!file || !user) return;
    setUploading(true);

    const logoRef = ref(storage, `logos/${user.uid}`);
    await uploadBytes(logoRef, file);
    const url = await getDownloadURL(logoRef);

    await updateDoc(doc(db, "users", user.uid), {
      "profile.logo": url,
    });

    setLogo(url);
    setUploading(false);
  }

  /* ------------------ LOGO DELETE ------------------ */
  async function deleteLogo() {
    if (!user) return;
    setUploading(true);

    const logoRef = ref(storage, `logos/${user.uid}`);
    await deleteObject(logoRef).catch(() => {});

    await updateDoc(doc(db, "users", user.uid), {
      "profile.logo": "",
    });

    setLogo(null);
    setUploading(false);
  }

  /* ------------------ DELETE ACCOUNT (FIXED) ------------------ */
  async function handleDeleteAccount() {
    if (!user || deleting) return;

    const ok = window.confirm(
      "This will permanently delete your account and all data.\n\nThis action cannot be undone.\n\nContinue?"
    );
    if (!ok) return;

    setDeleting(true);

    try {
      // 1️⃣ Delete Firestore user document
      await deleteDoc(doc(db, "users", user.uid));

      // 2️⃣ Delete logo from storage (best-effort)
      const logoRef = ref(storage, `logos/${user.uid}`);
      await deleteObject(logoRef).catch(() => {});

      // 3️⃣ Try deleting auth user
      try {
        await deleteUser(auth.currentUser);
      } catch (err) {
        if (err.code === "auth/requires-recent-login") {
          // 🔐 Re-auth with Google
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(
            auth.currentUser,
            provider
          );
          await deleteUser(auth.currentUser);
        } else {
          throw err;
        }
      }

      // 4️⃣ Cleanup local state
      localStorage.clear();

      // 5️⃣ Redirect to login
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      alert(
        "Account deletion failed. Please sign in again and try."
      );
    } finally {
      setDeleting(false);
    }
  }

  const displayLogo = logo || user?.photoURL || "/avatar.png";

  return (
    <main className="min-h-screen px-4 py-10 bg-[var(--bg-gradient)] transition-colors">
      <div className="max-w-md mx-auto space-y-6">
        <Header />

        <div className="w-full p-6 rounded-3xl backdrop-blur-xl border shadow-lg space-y-6 bg-white/85 dark:bg-white/5 border-black/5 dark:border-white/10 animate-fade-in">
          <h1 className="text-xl font-semibold">Settings</h1>

          {/* THEME */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs opacity-70">
                Currently using {theme} mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          {/* BUSINESS NAME */}
          <div className="space-y-2">
            <label className="text-sm opacity-70">
              Business name
            </label>
            <input
              value={businessName || ""}
              onChange={(e) =>
                setBusinessName(e.target.value)
              }
              className="w-full p-3 rounded-xl outline-none bg-black/5 dark:bg-white/10"
            />
            <button
              onClick={handleSaveBusinessName}
              disabled={saving}
              className="w-full py-2 rounded-xl bg-[var(--accent)] text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save name"}
            </button>
          </div>

          {/* LOGO PICKER */}
          <div className="space-y-3">
            <label className="text-sm opacity-70">
              Business logo
            </label>
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
                    onChange={(e) =>
                      uploadLogo(e.target.files[0])
                    }
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
            <p className="text-xs opacity-60">
              If no logo is set, your Google profile photo is used.
            </p>
          </div>

          {/* ACCENT PICKER */}
          <div>
            <p className="text-sm mb-2">
              Brand accent color
            </p>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    accent === c ? "scale-110" : "opacity-70"
                  }`}
                  style={{
                    background: c,
                    borderColor:
                      accent === c ? c : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          {/* USER INFO */}
          <div className="text-sm space-y-1 opacity-80">
            <p>👤 {user?.displayName}</p>
            <p>📧 {user?.email}</p>
          </div>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="w-full py-3 rounded-xl bg-red-500 text-white"
          >
            Logout
          </button>

          {/* DELETE ACCOUNT */}
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full py-3 rounded-xl border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition disabled:opacity-60"
          >
            {deleting
              ? "Deleting account…"
              : "Delete my account"}
          </button>
        </div>
      </div>
    </main>
  );
}

