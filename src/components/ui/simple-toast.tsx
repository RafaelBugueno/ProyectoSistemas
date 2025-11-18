import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastIdCounter = 0;
let addToastCallback: ((message: string, type: ToastType) => void) | null = null;

export const toast = {
  success: (message: string) => {
    if (addToastCallback) {
      addToastCallback(message, "success");
    }
  },
  error: (message: string) => {
    if (addToastCallback) {
      addToastCallback(message, "error");
    }
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    addToastCallback = (message: string, type: ToastType) => {
      const id = toastIdCounter++;
      setToasts((prev) => [...prev, { id, message, type }]);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    return () => {
      addToastCallback = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            flex items-center gap-3 min-w-[300px] max-w-[500px]
            px-4 py-3 rounded-lg shadow-lg
            animate-in slide-in-from-top-2 fade-in
            ${
              toast.type === "success"
                ? "bg-white border-l-4 border-green-500"
                : "bg-white border-l-4 border-red-500"
            }
          `}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          )}
          <p className="text-sm text-gray-900 flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
