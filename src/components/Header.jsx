import { Moon, Sun, Settings } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useNavigate } from "react-router-dom";

/* ---------- SAFE LOGO RESOLVER ---------- */
function resolveLogo({ logo, user, businessName }) {
  if (typeof logo === "string" && logo.trim().length > 0) {
    return logo;
  }

  if (user?.photoURL) {
    return user.photoURL;
  }

  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    businessName || "D"
  )}`;
}

export default function Header() {
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { businessName, logo } = useBusiness();

  // ⛑️ Hard guard
  if (!user) return null;

  const displayName = businessName || "daxo";

  const avatar = resolveLogo({
    logo,
    user,
    businessName,
  });

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
            <img
              src={avatar}
              alt="logo"
              className="w-10 h-10 rounded-xl object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  businessName || "D"
                )}`;
              }}
            />

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
