import { useState } from "react";
import {
  Send,
  Loader2,
  IndianRupee,
  MapPin,
  User,
  Package,
  Award,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import type { CropListing, Toast } from "../types";
import { API_BASE_URL } from "../data";

interface TradingDeskProps {
  selected: CropListing | null;
  onToast: (toast: Omit<Toast, "id">) => void;
}

export default function TradingDesk({ selected, onToast }: TradingDeskProps) {
  const [offerPrice, setOfferPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !offerPrice) return;

    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) {
      onToast({
        type: "error",
        title: "Invalid Price",
        message: "Please enter a valid offer price greater than zero.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = `${API_BASE_URL}/evaluate-offer/${encodeURIComponent(selected.phone)}/${encodeURIComponent(selected.district)}/${encodeURIComponent(selected.commodity)}/${price}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      await res.json();

      onToast({
        type: "success",
        title: "Smart Contract Initiated",
        message: `Offer of ₹${price}/quintal initiated! KrishiOS Oracle is analyzing the market rate and notifying the farmer via WhatsApp.`,
      });

      setOfferPrice("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      onToast({
        type: "error",
        title: "Offer Failed",
        message: `Could not process the offer: ${message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Empty State ---
  if (!selected) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <BarChart3 className="h-7 w-7 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-400">Trading Desk</h3>
        <p className="mt-1 max-w-xs text-sm text-slate-400">
          Select a listing from the market feed to review details and submit a
          smart contract offer.
        </p>
      </div>
    );
  }

  // --- Active State ---
  return (
    <div className="animate-slide-up flex flex-col gap-5">
      {/* Selected Crop Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-krishi-600">
          <ShieldCheck className="h-4 w-4" />
          Selected Listing
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-krishi-100 text-3xl">
            {selected.emoji}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">
              {selected.commodity}
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {selected.farmer_name}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {selected.district}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-slate-400" />
                {selected.quantity}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-slate-400" />
                {selected.grade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h4 className="mb-1 text-sm font-bold text-slate-900">
          Submit Your Offer
        </h4>
        <p className="mb-5 text-xs text-slate-400">
          KrishiOS Oracle will compare your offer against today's official Mandi
          price and advise the farmer in real-time.
        </p>

        {/* Price Input */}
        <label
          htmlFor="offer-price-input"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          Offer Price
        </label>
        <div className="relative mb-5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <IndianRupee className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="offer-price-input"
            type="number"
            min="1"
            step="any"
            placeholder="e.g. 850"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            required
            disabled={isSubmitting}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pr-28 pl-12 text-2xl font-bold text-slate-900 transition-colors placeholder:text-slate-300 focus:border-krishi-400 focus:bg-white focus:ring-2 focus:ring-krishi-400/20 focus:outline-none disabled:opacity-50"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-sm font-medium text-slate-400">
              per Quintal
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="submit-offer-btn"
          type="submit"
          disabled={isSubmitting || !offerPrice}
          className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-krishi-600 to-krishi-700 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-krishi-600/25 transition-all duration-200 hover:from-krishi-500 hover:to-krishi-600 hover:shadow-xl hover:shadow-krishi-600/30 focus:outline-none focus:ring-2 focus:ring-krishi-400 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing via Mandi Oracle…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Smart Contract via WhatsApp
            </>
          )}
        </button>
      </form>

      {/* Footer Note */}
      <p className="text-center text-[11px] text-slate-400">
        Powered by Government of India Mandi API &bull; Google Gemini
        &bull; Twilio WhatsApp
      </p>
    </div>
  );
}
