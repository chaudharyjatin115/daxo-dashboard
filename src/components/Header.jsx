import { useNavigate } from "react-router-dom";
import { Sun, Moon, Settings } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useBusiness } from "../context/BusinessContext";
import { useAuth } from "../context/AuthContext";

/* small helper to keep logo safe */
function resolveLogo({ logo, user, businessName }) {
  if (logo) return logo;
  if (user?.photoURL) return user.photoURL;

  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    businessName || "D"
  )}`;
}

export default function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { businessName, logo } = useBusiness();
  const { user } = useAuth();

  const displayLogo = resolveLogo({ logo, user, businessName });

  return (
    <header className="sticky top-0 z-40">
      <div
        className="
          mx-auto max-w-5xl
          px-4 py-3
          rounded-2xl
          backdrop-blur-xl
          border shadow-lg
          flex items-center justify-between
        "
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
      >
        {/* left: logo + name */}
        <div className="flex items-center gap-3 min-w-0">
          {/* logo (fixed size, no stretching) */}
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
            <img
              src={displayLogo}
              alt="logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="font-semibold leading-tight truncate">
              {businessName || "Your business"}
            </p>
            <p className="text-xs opacity-60 truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>

        {/* right: actions */}
        <div className="flex items-center gap-2">
          {/* theme toggle */}
          <button
            onClick={toggleTheme}
            className="
              p-2 rounded-xl
              hover:bg-black/10
              dark:hover:bg-white/10
              transition
            "
            aria-label="toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* settings */}
          <button
            onClick={() => navigate("/settings")}
            className="
              p-2 rounded-xl
              hover:bg-black/10
              dark:hover:bg-white/10
              transition
            "
            aria-label="settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}