import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import BrandLogo from "../components/BrandLogo";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-gradient)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-3xl border shadow-xl space-y-6 animate-scale-in"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
      >
        <BrandLogo />

        <h1 className="text-xl font-semibold text-center">
          Reset your password
        </h1>

        {sent ? (
          <p className="text-sm text-center opacity-70">
            Password reset email sent. Check your inbox.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10 outline-none"
            />

            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}

            <button
              onClick={submit}
              className="w-full py-3 rounded-xl accent-bg"
            >
              Send reset email
            </button>
          </>
        )}

        <Link
          to="/"
          className="block text-sm text-center accent-text"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
