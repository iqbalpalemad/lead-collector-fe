import { useState, useEffect, useCallback, useMemo } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";
import { apiFunctions } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import LogoDark from "../assets/logoForDark.png";
import LogoLight from "../assets/logoForLight.png";

interface FormData {
  username: string;
  password: string;
}

interface ValidationErrors {
  username?: string;
  password?: string;
}

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Memoized validation rules
  const validationRules = useMemo(
    () => ({
      username: {
        required: true,
        minLength: 1,
      },
      password: {
        required: true,
        minLength: 6,
      },
    }),
    []
  );

  // Memoized form validation
  const validateForm = useCallback(
    (data: FormData): ValidationErrors => {
      const errors: ValidationErrors = {};

      if (!data.username.trim()) {
        errors.username = "Username is required";
      }

      if (!data.password.trim()) {
        errors.password = "Password is required";
      } else if (data.password.length < validationRules.password.minLength) {
        errors.password = `Password must be at least ${validationRules.password.minLength} characters`;
      }

      return errors;
    },
    [validationRules]
  );

  // Memoized error toast handler
  const showErrorToast = useCallback((message: string) => {
    setError(message);
    setShowToast(true);
  }, []);

  // Memoized toast hide handler
  const hideToast = useCallback(() => {
    setShowToast(false);
    setError("");
  }, []);

  // Memoized password toggle handler
  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Memoized input change handler
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      if (showToast) {
        hideToast(); // Hide toast when user starts typing
      }
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [showToast, hideToast]
  );

  // Memoized form submission handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = validateForm(formData);
      const firstError = Object.values(errors)[0];

      if (firstError) {
        showErrorToast(firstError);
        return;
      }

      setIsLoading(true);

      try {
        // Use the actual API call
        const response = await apiFunctions.login(
          formData.username,
          formData.password
        );

        // Store the auth token if provided
        if (response.data.token) {
          localStorage.setItem("pathemari::authToken", response.data.token);
          localStorage.setItem("pathemari::userName", response.data.name);
        }

        onLogin();
      } catch (err: unknown) {
        const errorMessage = "Username or password is incorrect";
        showErrorToast(errorMessage);
        console.error("Login error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, showErrorToast, onLogin]
  );

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(hideToast, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast, hideToast]);

  // Memoized input field props to prevent unnecessary re-renders
  const inputProps = useMemo(
    () => ({
      disabled: isLoading,
      className:
        "w-full p-2 pl-10 border border-gray-500 dark:border-gray-400 rounded-md bg-transparent outline-none focus:border-black dark:focus:border-white transition-colors disabled:opacity-50 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
    }),
    [isLoading]
  );

  const passwordInputProps = useMemo(
    () => ({
      ...inputProps,
      className:
        "w-full p-2 pl-10 pr-10 border border-gray-500 dark:border-gray-400 rounded-md bg-transparent outline-none focus:border-black dark:focus:border-white transition-colors disabled:opacity-50 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
    }),
    [inputProps]
  );

  // Memoized logo selection based on theme
  const currentLogo = useMemo(() => {
    return theme === "dark" ? LogoDark : LogoLight;
  }, [theme]);

  return (
    <div className="w-dvw h-dvh bg-white dark:bg-gray-900 text-black dark:text-white flex flex-col items-center justify-center">
      <Toast
        message={error}
        isVisible={showToast}
        onClose={hideToast}
        type="error"
      />

      <header className="text-center flex flex-col items-center justify-center">
        <img src={currentLogo} alt="Logo" className="w-[8rem] mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          കാണാ തീരങ്ങൾ തേടി പോകാം
        </p>
        <h2 className="font-bold mt-2">Login to your account</h2>
      </header>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-[20px] flex flex-col gap-[10px]"
        noValidate
      >
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            className={inputProps.className}
            disabled={inputProps.disabled}
            aria-label="Username"
            autoComplete="username"
          />
        </div>

        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5"
            aria-hidden="true"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={passwordInputProps.className}
            disabled={passwordInputProps.disabled}
            aria-label="Password"
            autoComplete="current-password"
          />
          {formData.password && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <button
                onClick={togglePassword}
                className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer flex items-center justify-center outline-none disabled:opacity-50"
                type="button"
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-2 bg-black dark:bg-white text-white dark:text-black rounded-md border-none hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center"
          aria-label={isLoading ? "Logging in..." : "Login"}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Login</span>
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;
