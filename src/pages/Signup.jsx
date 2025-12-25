// import { useState } from "react";
// import { Mail, Lock } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// export default function Signup() {
//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSignup(e) {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await signup(email, password);
//       alert("Verification email sent. Please check your inbox.");
//       navigate("/");
//     } catch (e) {
//       alert(e.message);
//     }
//     setLoading(false);
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4">
//       <div
//         className="
//           w-full max-w-md p-8 rounded-3xl
//           border shadow-xl space-y-6
//           animate-scale-in
//         "
//         style={{
//           background: "var(--card-bg)",
//           borderColor: "var(--card-border)",
//         }}
//       >
//         {/* Animated Logo */}
//         <div className="flex justify-center">
//           <div className="relative w-16 h-16">
//             <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 animate-gradient-spin" />
//             <div className="absolute inset-[3px] rounded-2xl bg-black flex items-center justify-center text-white font-bold">
//               D
//             </div>
//           </div>
//         </div>

//         <div className="text-center">
//           <h1 className="text-2xl font-semibold">Create account</h1>
//           <p className="text-sm opacity-70">
//             Start managing your orders
//           </p>
//         </div>

//         <form onSubmit={handleSignup} className="space-y-4">
//           {/* Email */}
//           <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10">
//             <Mail className="text-purple-500" size={18} />
//             <input
//               type="email"
//               placeholder="Email address"
//               className="w-full outline-none"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>

//           {/* Password */}
//           <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10">
//             <Lock className="text-indigo-500" size={18} />
//             <input
//               type="password"
//               placeholder="Password"
//               className="w-full outline-none"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <button
//             disabled={loading}
//             className="w-full py-3 rounded-xl accent-bg font-medium"
//           >
//             {loading ? "Creating…" : "Create account"}
//           </button>
//         </form>

//         <p className="text-sm text-center">
//           Already have an account?{" "}
//           <span
//             className="accent-text cursor-pointer"
//             onClick={() => navigate("/")}
//           >
//             Sign in
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }

import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signup(email, password);

      // 🔑 THIS WAS MISSING
      navigate("/verify-email", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md p-6 rounded-3xl backdrop-blur-xl border shadow-lg space-y-5 bg-white/85 dark:bg-white/5 border-black/5 dark:border-white/10"
      >
        <h1 className="text-xl font-semibold text-center">
          Create account
        </h1>

        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10 outline-none"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-sm text-center opacity-70">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--accent)]">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
