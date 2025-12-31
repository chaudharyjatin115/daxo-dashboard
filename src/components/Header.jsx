import { useNavigate } from "react-router-dom";
import { Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useBusiness } from "../context/BusinessContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { businessName, logo } = useBusiness();
  const { user } = useAuth();

  const displayLogo =
    logo ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      businessName || "D"
    )}`;

  return (
    <header className="w-full flex items-center justify-between">
      {/* left: brand */}
      <div className="flex items-center gap-3">
        {/* icon wrapper */}
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/10 dark:bg-white/10 flex items-center justify-center">
          <img
            src={displayLogo}
            alt="logo"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="leading-tight">
          <div className="font-medium text-sm">
            {businessName || "Your business"}
          </div>
          <div className="text-xs opacity-60">daxo</div>
        </div>
      </div>

      {/* right: actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={() => navigate("/settings")}
          className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}