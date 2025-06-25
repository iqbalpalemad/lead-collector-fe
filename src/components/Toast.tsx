import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: "error" | "success" | "warning";
}

const Toast = ({ message, isVisible, onClose, type = "error" }: ToastProps) => {
  const getToastStyles = () => {
    switch (type) {
      case "error":
        return "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-l-4 border-red-400 dark:border-red-500 text-red-800 dark:text-red-200";
      case "success":
        return "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-l-4 border-green-400 dark:border-green-500 text-green-800 dark:text-green-200";
      case "warning":
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-l-4 border-yellow-400 dark:border-yellow-500 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-l-4 border-red-400 dark:border-red-500 text-red-800 dark:text-red-200";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return (
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
        );
      case "success":
        return (
          <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
        );
      case "warning":
        return (
          <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
        );
      default:
        return (
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
        );
    }
  };

  const getCloseButtonStyles = () => {
    switch (type) {
      case "error":
        return "hover:bg-red-100 dark:hover:bg-red-800/30 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300";
      case "success":
        return "hover:bg-green-100 dark:hover:bg-green-800/30 text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300";
      case "warning":
        return "hover:bg-yellow-100 dark:hover:bg-yellow-800/30 text-yellow-500 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300";
      default:
        return "hover:bg-red-100 dark:hover:bg-red-800/30 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className={`fixed bottom-4 left-0 right-0 mx-auto z-50 w-full max-w-sm ${getToastStyles()} rounded-lg shadow-xl p-4 flex items-center justify-between backdrop-blur-sm`}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 p-2 rounded-full bg-white/60 dark:bg-gray-800/60">
              {getIcon()}
            </div>
            <span className="text-sm font-medium leading-relaxed">
              {message}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`flex-shrink-0 ml-3 p-2 rounded-full transition-all duration-200 bg-white/50 dark:bg-gray-800/50 ${getCloseButtonStyles()} outline-none`}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
