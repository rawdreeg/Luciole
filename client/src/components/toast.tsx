import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

/**
 * @interface ToastProps
 * @description Defines the props for the Toast component.
 * @property {string} message - The message to be displayed in the toast.
 * @property {"success" | "error" | "info"} [type="success"] - The type of the toast, which determines the icon and color.
 * @property {number} [duration=3000] - The duration in milliseconds for which the toast should be visible.
 * @property {() => void} [onClose] - A callback function to be called when the toast is closed.
 */
interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

/**
 * A toast notification component.
 * It displays a message with an icon and automatically disappears after a specified duration.
 * @param {ToastProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered toast component, or null if it's not visible.
 */
export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };

  const colors = {
    success: "text-green-400",
    error: "text-red-400",
    info: "text-firefly-400",
  };

  const Icon = icons[type];

  return (
    <div className="fixed top-20 left-5 right-5 z-50">
      <div className="glass-card rounded-2xl p-4 flex items-center space-x-3 border-firefly-400/20">
        <Icon className={`w-5 h-5 ${colors[type]}`} />
        <span className="text-firefly-50 font-medium">{message}</span>
      </div>
    </div>
  );
}
