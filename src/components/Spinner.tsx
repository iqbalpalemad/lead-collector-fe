import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-gray-700 dark:border-t-gray-300 animate-spin"></div>

      {/* Inner ring with counter-rotation */}
      <div
        className="absolute inset-1 rounded-full border border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-400 animate-spin"
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      ></div>

      {/* Center with gradient */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-sm"></div>

      {/* Subtle glow */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gray-300/20 to-gray-400/20 dark:from-gray-600/20 dark:to-gray-500/20 blur-lg opacity-50"></div>

      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/30 dark:via-gray-300/30 to-transparent"></div>
    </div>
  );
};

export default Spinner;
