import Home from "./Pages/Home";
import LoginScreen from "./Pages/LoginScreen";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useState, useEffect } from "react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by looking for auth token in localStorage
    const authToken = localStorage.getItem("pathemari::authToken");
    setIsLoggedIn(!!authToken);
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("pathemari::authToken");
    localStorage.removeItem("pathemari::userName");
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="h-full flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="h-full flex flex-col">
        {isLoggedIn ? (
          <Home onLogout={handleLogout} />
        ) : (
          <LoginScreen onLogin={handleLogin} />
        )}
      </div>
    </ThemeProvider>
  );
}
