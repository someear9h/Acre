import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import type { Toast } from "../types";

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export default function ToastContainer({
  toasts,
  onDismiss,
}: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed right-6 top-20 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`pointer-events-auto flex w-96 gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-sm ${
        exiting ? "animate-toast-out" : "animate-toast-in"
      } ${
        isSuccess
          ? "border-krishi-200 bg-krishi-50/95 shadow-krishi-500/10"
          : "border-red-200 bg-red-50/95 shadow-red-500/10"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-krishi-600" />
      ) : (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-bold ${isSuccess ? "text-krishi-900" : "text-red-900"}`}
        >
          {toast.title}
        </p>
        <p
          className={`mt-0.5 text-xs leading-relaxed ${isSuccess ? "text-krishi-700" : "text-red-700"}`}
        >
          {toast.message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 self-start rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-200/50 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
