import { useState, useCallback, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
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

  // --- Counter-Offer Polling State ---
  const [incomingCounterOffer, setIncomingCounterOffer] = useState(false);
  const [counterOfferPrice, setCounterOfferPrice] = useState(0);
  const [counterCommodity, setCounterCommodity] = useState("");
  const [originalOffer, setOriginalOffer] = useState(0);

  // --- Finalized State ---
  const [dealClosed, setDealClosed] = useState(false);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Polling: Check contract status every 3 seconds ---
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/contract-status/${encodeURIComponent(POLLING_PHONE)}`
        );
        if (!res.ok) return;

        const json = await res.json();

        if (json.status === "success" && json.data) {
          const status = json.data.status;

          // If finalized, kill the interval and show success state
          if (status === "ACCEPTED" || status === "REJECTED") {
            clearInterval(pollInterval);
            setDealClosed(true);
            setIncomingCounterOffer(false);
            return;
          }

          // If a counter-offer is received, show the banner
          if (status === "COUNTER_OFFER" && json.data.counter_offer) {
            setCounterOfferPrice(json.data.counter_offer);
            setCounterCommodity(json.data.commodity || "Potato");
            setOriginalOffer(json.data.current_offer || 0);
            setIncomingCounterOffer(true);
          }
        }
      } catch {
        // Silently ignore fetch errors — backend may be restarting
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(pollInterval);
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
              {dealClosed ? (
                <div className="animate-alert-in flex flex-col items-center justify-center rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center shadow-lg shadow-blue-100/50">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 shadow-sm shadow-blue-500/30">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-blue-900">
                    Deal Closed Successfully
                  </h3>
                  <p className="text-sm text-blue-700/80">
                    The smart contract has been finalized. No further negotiation
                    is required.
                  </p>
                </div>
              ) : (
                <>
                  {/* Counter-Offer Banner (dynamic, from polling) */}
                  <CounterOfferBanner
                    visible={incomingCounterOffer}
                    counterPrice={counterOfferPrice}
                    commodity={counterCommodity}
                    originalOffer={originalOffer}
                    onAccept={handleAcceptCounter}
                    onDismiss={handleDismissCounter}
                  />

                  {/* Supply Chain Alert (dynamic polling) */}
                  {!incomingCounterOffer && <SupplyChainAlerts />}

                  <TradingDesk selected={selectedCrop} onToast={addToast} />
                </>
              )}
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
