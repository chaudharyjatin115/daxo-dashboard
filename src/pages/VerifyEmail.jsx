import { useAuth } from "../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  /* ------------------ AUTO DETECT VERIFICATION ------------------ */
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await auth.currentUser?.reload();

        if (auth.currentUser?.emailVerified) {
          // ✅ SAFE navigation
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Verification reload failed", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  /* ------------------ RESEND EMAIL ------------------ */
  async function resendVerification() {
    if (!user) return;

    setSending(true);
    setError("");
    setSent(false);

    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch (err) {
      setError(
        err.code === "auth/too-many-requests"
          ? "Too many attempts. Please wait."
          : "Failed to send verification email."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="
          w-full max-w-md p-6 rounded-3xl
          border shadow-lg space-y-5
          backdrop-blur-xl
          bg-white/85 dark:bg-white/5
          border-black/5 dark:border-white/10
        "
      >
        <h1 className="text-xl font-semibold text-center">
          Verify your email
        </h1>

        <p className="text-sm text-center opacity-70">
          We sent a verification link to:
        </p>

        <p className="text-center font-medium break-all">
          {user?.email}
        </p>

        <p className="text-xs text-center opacity-60">
          This page will continue automatically once verified.
        </p>

        {sent && (
          <p className="text-sm text-green-600 text-center">
            Verification email sent ✔
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <button
          onClick={resendVerification}
          disabled={sending}
          className="
            w-full py-3 rounded-xl
            bg-[var(--accent)] text-white
            disabled:opacity-60
          "
        >
          {sending ? "Sending…" : "Resend verification email"}
        </button>
      </div>
    </div>
  );
}
