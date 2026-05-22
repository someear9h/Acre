import { useState, useCallback, useEffect } from "react";
import Navbar from "./components/Navbar";
import MarketFeed from "./components/MarketFeed";
import TradingDesk from "./components/TradingDesk";
import SupplyChainAlerts from "./components/SupplyChainAlerts";
import CounterOfferBanner from "./components/CounterOfferBanner";
import ToastContainer from "./components/ToastContainer";
import { CROP_LISTINGS, API_BASE_URL } from "./data";
import type { CropListing, Toast } from "./types";

const POLLING_PHONE = "+919028432689";
const POLL_INTERVAL_MS = 3000;

export default function App() {
  const [selectedCrop, setSelectedCrop] = useState<CropListing | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAlert, setShowAlert] = useState(true);

  // --- Counter-Offer Polling State ---
  const [incomingCounterOffer, setIncomingCounterOffer] = useState(false);
  const [counterOfferPrice, setCounterOfferPrice] = useState(0);
  const [counterCommodity, setCounterCommodity] = useState("");
  const [originalOffer, setOriginalOffer] = useState(0);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Polling: Check contract status every 3 seconds ---
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/contract-status/${encodeURIComponent(POLLING_PHONE)}`
        );
        if (!res.ok) return;

        const json = await res.json();

        if (
          json.status === "success" &&
          json.data?.status === "COUNTER_OFFER" &&
          json.data?.counter_offer
        ) {
          setCounterOfferPrice(json.data.counter_offer);
          setCounterCommodity(json.data.commodity || "Potato");
          setOriginalOffer(json.data.current_offer || 0);
          setIncomingCounterOffer(true);
        }
      } catch {
        // Silently ignore fetch errors — backend may be restarting
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // --- Accept Counter-Offer ---
  const handleAcceptCounter = useCallback(() => {
    setIncomingCounterOffer(false);
    addToast({
      type: "success",
      title: "Counter-Offer Accepted",
      message: `You accepted the farmer's counter-offer of ₹${counterOfferPrice}/quintal for ${counterCommodity}. Deal confirmed via WhatsApp.`,
    });
  }, [counterOfferPrice, counterCommodity, addToast]);

  // --- Dismiss Counter-Offer ---
  const handleDismissCounter = useCallback(() => {
    setIncomingCounterOffer(false);
    addToast({
      type: "error",
      title: "Counter-Offer Declined",
      message: "The farmer's counter-offer has been declined.",
    });
  }, [addToast]);

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

          {/* Right: 2/5 width — alerts + trading desk */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 flex flex-col gap-5">
              {/* Counter-Offer Banner (dynamic, from polling) */}
              <CounterOfferBanner
                visible={incomingCounterOffer}
                counterPrice={counterOfferPrice}
                commodity={counterCommodity}
                originalOffer={originalOffer}
                onAccept={handleAcceptCounter}
                onDismiss={handleDismissCounter}
              />

              {/* Supply Chain Alert (hardcoded demo) */}
              <SupplyChainAlerts
                visible={showAlert}
                onDismiss={() => setShowAlert(false)}
              />

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
