import { useEffect, useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Signup() {
  const { signup, loginWithGoogle, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔑 IMPORTANT: react to auth state change
  useEffect(() => {
    if (!authLoading && user) {
      // AuthGate will decide onboarding vs dashboard
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  /* email signup */
  async function handleSignup(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      // create auth account
      const cred = await signup(email, password);

      // create user doc for onboarding flow
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        onboarded: false,
        createdAt: serverTimestamp(),
      });

      // ✅ go straight to onboarding for email signup
      navigate("/onboarding", { replace: true });
    } catch (e) {
      alert(e.message);
      setLoading(false);
    }
  }

  /* google signup / login */
  async function handleGoogle() {
    if (loading) return;
    setLoading(true);

    try {
      // popup / redirect handled inside AuthContext
      await loginWithGoogle();
      // ❌ do NOT navigate here
      // useEffect + AuthGate will handle it
    } catch (e) {
      alert(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="
          w-full max-w-md p-8 rounded-3xl
          border shadow-xl space-y-6
          animate-scale-in
          text-black dark:text-white
        "
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
      >
        {/* logo */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 animate-gradient-spin" />
            <div className="absolute inset-[3px] rounded-2xl bg-black flex items-center justify-center text-white font-bold">
              D
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm opacity-70">
            Start managing orders in minutes
          </p>
        </div>

        {/* google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="
            w-full flex items-center justify-center gap-3
            py-3 rounded-xl border
            hover:shadow-md transition
            disabled:opacity-60
          "
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs opacity-60">
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
          OR
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
        </div>

        {/* email signup */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10">
            <Mail className="text-purple-500" size={18} />
            <input
              type="email"
              placeholder="Email address"
              className="w-full outline-none bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10">
            <Lock className="text-indigo-500" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full outline-none bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl accent-bg font-medium disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <span
            className="accent-text cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}