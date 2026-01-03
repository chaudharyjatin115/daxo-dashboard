import { useState } from "react";
import { Mail } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    if (!email || sending) return;

    setSending(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (e) {
      alert(e.message);
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full max-w-md p-8 rounded-3xl border shadow-xl space-y-6"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
      >
        <h1 className="text-xl font-semibold text-center">
          Reset your password
        </h1>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm opacity-70">
              We’ve sent a password reset link to:
            </p>
            <p className="font-medium">{email}</p>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl accent-bg text-white"
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              disabled={sending}
              className="w-full py-3 rounded-xl accent-bg text-white disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send reset link"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full text-sm opacity-70 hover:opacity-100"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}