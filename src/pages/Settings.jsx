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

  
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("accent", accent);
  }, [accent]);

  
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


  async function handleSaveBusinessName() {
    if (!user) return;
    setSaving(true);
    await saveBusinessName(businessName || "");
    setSaving(false);
  }

  /* ------------------ LOGO UPLOAD (PRODUCTION SAFE) ------------------ */

/* ------------------ LOGO UPLOAD (FINAL, NEVER STUCK) ------------------ */
function uploadLogo(file) {
  if (!file || !user || deleting) return;

  if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
    alert("Logo must be under 2MB");
    return;
  }

  const logoRef = ref(storage, `logos/${user.uid}`);
  const task = uploadBytesResumable(logoRef, file);

  setUploadTask(task);
  setUploading(true);

  // 🔹 Start visibly
  setUploadProgress(12);

  // 🔹 Smooth fallback progress (never freezes)
  let fake = 12;
  const ticker = setInterval(() => {
    fake += Math.random() * 6;
    setUploadProgress((p) =>
      p < 95 ? Math.min(Math.max(p, fake), 95) : p
    );
  }, 300);

  // 🔹 Real Firebase progress
  task.on(
    "state_changed",
    (snap) => {
      if (!snap.totalBytes) return;

      const real = Math.round(
        (snap.bytesTransferred / snap.totalBytes) * 100
      );

      setUploadProgress((p) => Math.max(p, real));
    },
    (err) => {
      clearInterval(ticker);

      if (err.code === "storage/canceled") {
        resetUploadUI();
        return;
      }

      console.error(err);
      alert("Logo upload failed");
      resetUploadUI();
    }
  );

  // ✅ 🔥 GUARANTEED COMPLETION (THIS FIXES 90%)
  task
    .then(async () => {
      clearInterval(ticker);

      const url = await getDownloadURL(task.snapshot.ref);

      await updateDoc(doc(db, "users", user.uid), {
        "profile.logo": url,
      });

      setLogo(url);

      // Hard snap to 100
      setUploadProgress(100);

      setTimeout(resetUploadUI, 500);
    })
    .catch(() => {
      clearInterval(ticker);
      resetUploadUI();
    });
}

function cancelUpload() {
  if (uploadTask) uploadTask.cancel();
  resetUploadUI();
}

function resetUploadUI() {
  setUploading(false);
  setUploadProgress(0);
  setUploadTask(null);
}

  
  async function deleteLogo() {
    if (!user || uploading) return;

    setUploading(true);
    await deleteObject(ref(storage, `logos/${user.uid}`)).catch(() => {});
    await updateDoc(doc(db, "users", user.uid), { "profile.logo": "" });
    setLogo("");
    setUploading(false);
  }

 
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
