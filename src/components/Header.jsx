// import { Moon, Sun, Settings } from "lucide-react";
// import { useTheme } from "../context/ThemeContext";
// import { useAuth } from "../context/AuthContext";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { db } from "../firebase";
// import { doc, getDoc } from "firebase/firestore";

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
//   const navigate = useNavigate();

//   const [collapsed, setCollapsed] = useState(false);
//   const [businessName, setBusinessName] = useState("daxo");
//   const [logo, setLogo] = useState(null);

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

//   useEffect(() => {
//     if (!user) return;

//     (async () => {
//       const snap = await getDoc(doc(db, "users", user.uid));
//       const profile = snap.data()?.profile;
//       if (profile?.businessName) setBusinessName(profile.businessName);
//       if (profile?.logoUrl) setLogo(profile.logoUrl);
//     })();
//   }, [user]);

//   const gradient = pickGradient(businessName);
//   const letter = businessName[0]?.toUpperCase() || "D";

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
//         `}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             {logo ? (
//               <img src={logo} className="w-10 h-10 rounded-xl object-cover" />
//             ) : user?.photoURL ? (
//               <img src={user.photoURL} className="w-10 h-10 rounded-xl" />
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
//                   {businessName}
//                 </div>
//                 <div className="text-xs opacity-60">daxo</div>
//               </div>
//             )}
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={toggleTheme}
//               className="w-10 h-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center"
//             >
//               {theme === "dark" ? (
//                 <Sun size={18} className="accent-text" />
//               ) : (
//                 <Moon size={18} className="accent-text" />
//               )}
//             </button>

//             <button
//               onClick={() => navigate("/settings")}
//               className="w-10 h-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center"
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GRADIENTS = [
  "from-purple-500 to-indigo-500",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
];

function pickGradient(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { businessName, logo } = useBusiness();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  /* ------------------ COLLAPSE ON SCROLL ------------------ */
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setCollapsed(y > last && y > 40);
      last = y;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const name = businessName || "daxo";
  const gradient = pickGradient(name);
  const letter = name[0]?.toUpperCase() || "D";

  return (
    <div className="sticky top-4 z-40">
      <header
        className={`
          max-w-5xl mx-auto px-4
          ${collapsed ? "py-2" : "py-4"}
          rounded-2xl border
          transition-all duration-300
          bg-white/80 dark:bg-[#0b1220]/90
          border-black/5 dark:border-white/10
          backdrop-blur-xl
        `}
      >
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            {logo ? (
              <img
                src={logo}
                alt="business logo"
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="profile"
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br ${gradient}`}
              >
                {letter}
              </div>
            )}

            {!collapsed && (
              <div>
                <div className="font-semibold leading-tight">
                  {name}
                </div>
                <div className="text-xs opacity-60">
                  daxo
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="
                w-10 h-10 rounded-xl
                hover:bg-black/5 dark:hover:bg-white/10
                flex items-center justify-center
              "
            >
              {theme === "dark" ? (
                <Sun size={18} className="accent-text" />
              ) : (
                <Moon size={18} className="accent-text" />
              )}
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="
                w-10 h-10 rounded-xl
                hover:bg-black/5 dark:hover:bg-white/10
                flex items-center justify-center
              "
            >
              <Settings size={18} className="accent-text" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
