import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  /* ------------------ AUTO CHECK VERIFICATION ------------------ */
  useEffect(() => {
    if (!user) return;

    let interval = setInterval(async () => {
      await user.reload(); // 🔑 REQUIRED
      const refreshedUser = auth.currentUser;

      if (refreshedUser?.emailVerified) {
        clearInterval(interval);
        navigate("/", { replace: true }); // → Dashboard or onboarding
      }
    }, 3000); // every 3 seconds

    return () => clearInterval(interval);
  }, [user, navigate]);

  /* ------------------ RESEND ------------------ */
  async function resendVerification() {
    if (!user) return;
    setSending(true);
    await sendEmailVerification(user);
    setSent(true);
    setSending(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 rounded-3xl backdrop-blur-xl border shadow-lg space-y-5 bg-white/85 dark:bg-white/5 border-black/5 dark:border-white/10">
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
          This page will automatically continue once verified.
        </p>

        {sent && (
          <p className="text-sm text-green-600 text-center">
            Verification email sent again ✔
          </p>
        )}

        <button
          onClick={resendVerification}
          disabled={sending}
          className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium disabled:opacity-60"
        >
          {sending ? "Sending…" : "Resend verification email"}
        </button>

        <p className="text-xs text-center opacity-50">
          Waiting for verification…
        </p>
      </div>
    </div>
  );
}
