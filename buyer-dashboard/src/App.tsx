import { useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import MarketFeed from "./components/MarketFeed";
import TradingDesk from "./components/TradingDesk";
import ToastContainer from "./components/ToastContainer";
import { CROP_LISTINGS } from "./data";
import type { CropListing, Toast } from "./types";

export default function App() {
  const [selectedCrop, setSelectedCrop] = useState<CropListing | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Navbar />

      {/* Toast overlay */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Buyer Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Browse live produce listings, analyze market rates, and send
            AI-powered smart contract offers — all from one place.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left: 3/5 width */}
          <div className="lg:col-span-3">
            <MarketFeed
              listings={CROP_LISTINGS}
              selectedId={selectedCrop?.id ?? null}
              onSelect={setSelectedCrop}
            />
          </div>

          {/* Right: 2/5 width — sticky trading desk */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <TradingDesk selected={selectedCrop} onToast={addToast} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © 2026 KrishiOS &mdash; Empowering India's Agricultural Supply Chain
      </footer>
    </div>
  );
}
