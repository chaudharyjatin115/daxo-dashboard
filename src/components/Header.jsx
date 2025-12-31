import { Sun, Moon, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";

export default function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const { businessName, logo } = useBusiness();

  // ⛔️ do not render header actions until auth is resolved
  if (loading) return null;

  return (
    <div className="header-pill">
      {/* left */}
      <div className="header-left">
        <img
          src={
            logo ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              businessName || "D"
            )}`
          }
          alt="logo"
          className="header-logo"
        />

        <span className="header-title">
          {businessName || "Your business"}
        </span>
      </div>

      {/* right */}
      <div className="header-actions">
        <button
          onClick={toggleTheme}
          aria-label="toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          aria-label="settings"
          onClick={() => {
            // ✅ critical fix: never navigate without a user
            if (!user) return;
            navigate("/settings");
          }}
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}