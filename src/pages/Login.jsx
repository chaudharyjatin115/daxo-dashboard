import { useEffect, useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, loginWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔑 THIS FIXES MOBILE
  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (e) {
      alert(e.message);
    }
    setSubmitting(false);
  }

  async function handleGoogle() {
    try {
      await loginWithGoogle();
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse opacity-60">Checking session…</div>
      </div>
    );
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
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm opacity-70">
            Manage your orders beautifully
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-transparent outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-transparent outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={submitting}
            className="w-full py-3 rounded-xl accent-bg"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs opacity-60">
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
          OR
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full py-3 rounded-xl border"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}