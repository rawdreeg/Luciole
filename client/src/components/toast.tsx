import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

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
