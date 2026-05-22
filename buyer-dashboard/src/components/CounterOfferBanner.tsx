import {
  MessageSquare,
  IndianRupee,
  CheckCircle2,
  X,
  ArrowRightLeft,
} from "lucide-react";

interface CounterOfferBannerProps {
  visible: boolean;
  counterPrice: number;
  commodity: string;
  originalOffer: number;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function CounterOfferBanner({
  visible,
  counterPrice,
  commodity,
  originalOffer,
  onAccept,
  onDismiss,
}: CounterOfferBannerProps) {
  if (!visible) return null;

  return (
    <div className="animate-alert-in">
      <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-lg shadow-emerald-100/50">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-emerald-200/60 bg-gradient-to-r from-emerald-100/80 to-teal-100/60 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-sm shadow-emerald-500/30">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                Counter-Offer Received
              </h3>
              <p className="text-[11px] text-emerald-700/80">
                Farmer Negotiation • Live Update
              </p>
            </div>
            {/* Live pulse dot */}
            <span className="relative ml-2 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-red-100 hover:text-red-700"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Price Comparison */}
          <div className="mb-4 flex items-center justify-center gap-4 rounded-xl border border-emerald-200/60 bg-white/60 p-4">
            {/* Your Offer */}
            <div className="text-center">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Your Offer
              </p>
              <div className="flex items-center justify-center gap-1">
                <IndianRupee className="h-4 w-4 text-slate-400" />
                <span className="text-xl font-bold text-slate-400 line-through">
                  {originalOffer}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">per Quintal</p>
            </div>

            {/* Arrow */}
            <ArrowRightLeft className="h-5 w-5 text-emerald-400" />

            {/* Counter Offer */}
            <div className="text-center">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                Farmer's Counter
              </p>
              <div className="flex items-center justify-center gap-1">
                <IndianRupee className="h-5 w-5 text-emerald-700" />
                <span className="text-2xl font-extrabold text-emerald-700">
                  {counterPrice}
                </span>
              </div>
              <p className="text-[10px] text-emerald-600">per Quintal</p>
            </div>
          </div>

          {/* Commodity Tag */}
          <p className="mb-4 text-center text-sm text-slate-500">
            for{" "}
            <span className="font-semibold text-slate-700">{commodity}</span>{" "}
            — Farmer Ram Singh, Patiala
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onAccept}
              className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-xl active:scale-[0.98]"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <CheckCircle2 className="h-4 w-4" />
              Accept Counter-Offer
            </button>
            <button
              onClick={onDismiss}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
