

// import { useAuth } from "../context/AuthContext";
// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";

// export default function Signup() {
//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function handleSignup(e) {
//     e.preventDefault();
//     setError("");

//     if (password !== confirm) {
//       setError("Passwords do not match");
//       return;
//     }

//     try {
//       setLoading(true);
//       await signup(email, password);

//       // 🔑 THIS WAS MISSING
//       navigate("/verify-email", { replace: true });
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Failed to create account");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4">
//       <form
//         onSubmit={handleSignup}
//         className="w-full max-w-md p-6 rounded-3xl backdrop-blur-xl border shadow-lg space-y-5 bg-white/85 dark:bg-white/5 border-black/5 dark:border-white/10"
//       >
//         <h1 className="text-xl font-semibold text-center">
//           Create account
//         </h1>

//         {error && (
//           <p className="text-sm text-red-500 text-center">
//             {error}
//           </p>
//         )}

//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10 outline-none"
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10 outline-none"
//         />

//         <input
//           type="password"
//           placeholder="Confirm password"
//           value={confirm}
//           onChange={(e) => setConfirm(e.target.value)}
//           required
//           className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10 outline-none"
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium disabled:opacity-60"
//         >
//           {loading ? "Creating account…" : "Create account"}
//         </button>

//         <p className="text-sm text-center opacity-70">
//           Already have an account?{" "}
//           <Link to="/login" className="text-[var(--accent)]">
//             Log in
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- EMAIL SIGNUP ---------------- */
  async function handleSignup(e) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      await signup(email, password);
      // App.jsx will redirect → verify-email
      navigate("/verify-email", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- GOOGLE SIGNUP ---------------- */
  async function handleGoogleSignup() {
    setLoading(true);
    setError("");

    try {
      await loginWithGoogle();
      // App.jsx handles onboarding/dashboard routing
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-gradient)]">
      <div className="w-full max-w-md p-6 rounded-3xl backdrop-blur-xl border shadow-lg space-y-6 bg-white/85 dark:bg-white/5 border-black/5 dark:border-white/10 animate-scale-in">
        <h1 className="text-xl font-semibold text-center">
          Create your account
        </h1>

        {/* GOOGLE SIGNUP */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="
            w-full py-3 rounded-xl
            border border-black/10 dark:border-white/20
            flex items-center justify-center gap-3
            hover:bg-black/5 dark:hover:bg-white/10
            transition disabled:opacity-60
          "
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 text-xs opacity-60">
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
          OR
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
        </div>

        {/* EMAIL SIGNUP */}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl outline-none bg-black/5 dark:bg-white/10"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl outline-none bg-black/5 dark:bg-white/10"
          />

          {error && (
            <p className="text-sm text-red-500 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-sm text-center opacity-70">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[var(--accent)] font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
