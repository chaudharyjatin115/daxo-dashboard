
// import { Moon, Sun, Settings } from "lucide-react";
// import { useTheme } from "../context/ThemeContext";
// import { useAuth } from "../context/AuthContext";
// import { useBusiness } from "../context/BusinessContext";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const GRADIENTS = [
//   "from-purple-500 to-indigo-500",
//   "from-pink-500 to-rose-500",
//   "from-emerald-500 to-teal-500",
//   "from-orange-500 to-amber-500",
// ];

// function pickGradient(seed = "") {
//   let hash = 0;
//   for (let i = 0; i < seed.length; i++) {
//     hash = seed.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
// }

// export default function Header() {
//   const { theme, toggleTheme } = useTheme();
//   const { user } = useAuth();
//   const { businessName, logo } = useBusiness();
//   const navigate = useNavigate();

//   const [collapsed, setCollapsed] = useState(false);

//   /* ------------------ COLLAPSE ON SCROLL ------------------ */
//   useEffect(() => {
//     let last = 0;
//     const onScroll = () => {
//       const y = window.scrollY;
//       setCollapsed(y > last && y > 40);
//       last = y;
//     };
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   const name = businessName || "daxo";
//   const gradient = pickGradient(name);
//   const letter = name[0]?.toUpperCase() || "D";

//   return (
//     <div className="sticky top-4 z-40">
//       <header
//         className={`
//           max-w-5xl mx-auto px-4
//           ${collapsed ? "py-2" : "py-4"}
//           rounded-2xl border
//           transition-all duration-300
//           bg-white/80 dark:bg-[#0b1220]/90
//           border-black/5 dark:border-white/10
//           backdrop-blur-xl
//         `}
//       >
//         <div className="flex items-center justify-between">
//           {/* LEFT */}
//           <div className="flex items-center gap-4">
//             {logo ? (
//               <img
//                 src={logo}
//                 alt="business logo"
//                 className="w-10 h-10 rounded-xl object-cover"
//               />
//             ) : user?.photoURL ? (
//               <img
//                 src={user.photoURL}
//                 alt="profile"
//                 className="w-10 h-10 rounded-xl object-cover"
//               />
//             ) : (
//               <div
//                 className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br ${gradient}`}
//               >
//                 {letter}
//               </div>
//             )}

//             {!collapsed && (
//               <div>
//                 <div className="font-semibold leading-tight">
//                   {name}
//                 </div>
//                 <div className="text-xs opacity-60">
//                   daxo
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* RIGHT */}
//           <div className="flex items-center gap-2">
//             <button
//               onClick={toggleTheme}
//               className="
//                 w-10 h-10 rounded-xl
//                 hover:bg-black/5 dark:hover:bg-white/10
//                 flex items-center justify-center
//               "
//             >
//               {theme === "dark" ? (
//                 <Sun size={18} className="accent-text" />
//               ) : (
//                 <Moon size={18} className="accent-text" />
//               )}
//             </button>

//             <button
//               onClick={() => navigate("/settings")}
//               className="
//                 w-10 h-10 rounded-xl
//                 hover:bg-black/5 dark:hover:bg-white/10
//                 flex items-center justify-center
//               "
//             >
//               <Settings size={18} className="accent-text" />
//             </button>
//           </div>
//         </div>
//       </header>
//     </div>
//   );
// }
import { Moon, Sun, Settings } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { businessName, logo } = useBusiness();

  // ⛑️ Hard guard: Header should never crash
  if (!user) return null;

  const displayName = businessName || "daxo";
  const avatar =
    logo ||
    user.photoURL ||
    null;

  const letter = displayName.charAt(0).toUpperCase();

  return (
    <div className="sticky top-4 z-40">
      <header
        className="
         max-w-5xl mx-auto px-3 sm:px-4
    py-2 sm:py-3
    rounded-2xl border
    backdrop-blur-xl
    bg-white/80 dark:bg-[#0b1220]/80
    border-black/5 dark:border-white/10
        "
      >
        <div className="flex items-center justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">
            {avatar ? (
              <img
                src={avatar}
                alt="logo"
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : (
              <div
                className="
                  w-10 h-10 rounded-xl
                  flex items-center justify-center
                  bg-[var(--accent)] text-white font-semibold
                "
              >
                {letter}
              </div>
            )}

            <div className="min-w-0">
              <p className="font-semibold truncate">
                {displayName}
              </p>
              <p className="text-xs opacity-60 truncate hidden sm:block">
                daxo
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="
                w-10 h-10 rounded-xl
                flex items-center justify-center
                hover:bg-black/5 dark:hover:bg-white/10
                transition
              "
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={18} className="accent-text" />
              ) : (
                <Moon size={18} className="accent-text" />
              )}
            </button>

            {/* SETTINGS */}
            <button
              onClick={() => navigate("/settings")}
              className="
                w-10 h-10 rounded-xl
                flex items-center justify-center
                hover:bg-black/5 dark:hover:bg-white/10
                transition
              "
              aria-label="Settings"
            >
              <Settings size={18} className="accent-text" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
