// import { useEffect, useState } from "react";
// import { Mail, Lock } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const { login, loginWithGoogle, user, loading } = useAuth();
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   // 🔑 important: react to auth state change
//   useEffect(() => {
//     if (!loading && user) {
//       // let auth gate decide onboarding vs dashboard
//       navigate("/", { replace: true });
//     }
//   }, [user, loading, navigate]);

//   async function handleLogin(e) {
//     e.preventDefault();
//     if (submitting) return;

//     setSubmitting(true);
//     try {
//       await login(email, password);
//       // ❌ no navigate here
//     } catch (e) {
//       alert(e.message);
//       setSubmitting(false);
//     }
//   }

//   async function handleGoogle() {
//     if (submitting) return;
//     setSubmitting(true);

//     try {
//       await loginWithGoogle();
//       // ❌ no navigate here
//     } catch (e) {
//       alert(e.message);
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4">
//       <div
//         className="w-full max-w-md p-8 rounded-3xl border shadow-xl space-y-6 animate-scale-in"
//         style={{
//           background: "var(--card-bg)",
//           borderColor: "var(--card-border)",
//         }}
//       >
//         {/* logo */}
//         <div className="flex justify-center">
//           <div className="relative w-16 h-16">
//             <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500" />
//             <div className="absolute inset-[3px] rounded-2xl bg-black flex items-center justify-center text-white font-bold">
//               D
//             </div>
//           </div>
//         </div>

//         <div className="text-center">
//           <h1 className="text-2xl font-semibold">Welcome back</h1>
//           <p className="text-sm opacity-70">
//             Manage your orders beautifully
//           </p>
//         </div>

//         <form onSubmit={handleLogin} className="space-y-4">
//           <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10">
//             <Mail size={18} />
//             <input
//               type="email"
//               placeholder="Email"
//               className="w-full bg-transparent outline-none"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>

//           <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10">
//             <Lock size={18} />
//             <input
//               type="password"
//               placeholder="Password"
//               className="w-full bg-transparent outline-none"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <button
//             disabled={submitting}
//             className="w-full py-3 rounded-xl accent-bg font-medium disabled:opacity-60"
//           >
//             {submitting ? "Signing in…" : "Sign in"}
//           </button>
//         </form>

//         <div className="flex items-center gap-3 text-xs opacity-60">
//           <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
//           OR
//           <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
//         </div>

//         <button
//           onClick={handleGoogle}
//           disabled={submitting}
//           className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border disabled:opacity-60"
//           style={{
//             background: "var(--card-bg)",
//             borderColor: "var(--card-border)",
//           }}
//         >
//           <img
//             src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
//             alt="Google"
//             className="w-5 h-5"
//           />
//           Continue with Google
//         </button>
//       </div>
//     </div>
//   );
// }
//working one ends here at 2;13 Pm
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

  // react to auth state change
  useEffect(() => {
    if (!loading && user) {
      // auth gate decides onboarding vs dashboard
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    if (submitting || loading) return;

    setSubmitting(true);
    try {
      await login(email, password);
      // no navigate here
    } catch (e) {
      alert(e.message);
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    if (submitting || loading) return;

    setSubmitting(true);
    try {
      await loginWithGoogle();
      // no navigate here
    } catch (e) {
      alert(e.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="
          w-full max-w-md p-8 rounded-3xl
          border shadow-xl space-y-6
          animate-scale-in
        "
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
      >
        {/* logo */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500" />
            <div className="absolute inset-[3px] rounded-2xl bg-black flex items-center justify-center text-white font-bold">
              D
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm opacity-70">
            Manage your orders beautifully
          </p>
        </div>

        {/* email login */}
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
            disabled={submitting || loading}
            className="w-full py-3 rounded-xl accent-bg font-medium disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs opacity-60">
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
          OR
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
        </div>

        {/* google */}
        <button
          onClick={handleGoogle}
          disabled={submitting || loading}
          className="
            w-full flex items-center justify-center gap-3
            py-3 rounded-xl borderhover:shadow-md transition
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

        {/* create account */}
        <p className="text-sm text-center pt-2">
          Don’t have an account?{" "}
          <span
            className="accent-text cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Create one
          </span>
        </p>
      </div>
    </div>
  );
}