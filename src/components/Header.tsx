import React, { useState, useEffect, useRef } from "react";
import LogoLight from "../assets/logoForLight.png";
import LogoDark from "../assets/logoForDark.png";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";
import { generateAvatarFromUsername } from "../utils/avatarUtils";

interface HeaderProps {
  onLogout: () => void;
  username: string;
}

const Header: React.FC<HeaderProps> = ({ onLogout, username }) => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const { theme } = useTheme();
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    onLogout();
    setShowLogoutPopup(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showLogoutPopup &&
        popupRef.current &&
        buttonRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowLogoutPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogoutPopup]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border-b border-white/30 dark:border-gray-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[60px]">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src={theme === "dark" ? LogoDark : LogoLight}
              alt="Logo"
              className="w-[5rem]"
            />
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4 relative">
            <ThemeToggle />
            <button
              ref={buttonRef}
              onClick={() => setShowLogoutPopup(!showLogoutPopup)}
              className={`group flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                showLogoutPopup
                  ? "bg-gray-100/80 dark:bg-gray-700/80"
                  : "hover:bg-gray-50/80 dark:hover:bg-gray-700/80"
              }`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src={generateAvatarFromUsername(username, undefined, theme)}
                  alt={`${username}'s avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold text-sm">${username
                          .charAt(0)
                          .toUpperCase()}</span>
                      </div>
                    `;
                  }}
                />
              </div>
              <span
                className={`font-medium transition-colors duration-300 ${
                  showLogoutPopup
                    ? "text-gray-800 dark:text-gray-200"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {username}
              </span>
            </button>

            {/* Logout Popup */}
            {showLogoutPopup && (
              <div
                className="absolute top-full right-0 mt-3 w-56 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 py-2 z-[60]"
                ref={popupRef}
              >
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-all duration-200 flex items-center space-x-3 group rounded-xl mx-1"
                >
                  <div className="w-7 h-7 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      Sign out
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sign out of your account
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
