import { MapPin, User, Package, Award, Radio } from "lucide-react";
import type { CropListing } from "../types";

interface MarketFeedProps {
  listings: CropListing[];
  selectedId: number | null;
  onSelect: (listing: CropListing) => void;
}

export default function MarketFeed({
  listings,
  selectedId,
  onSelect,
}: MarketFeedProps) {
  return (
    <section className="flex flex-col">
      {/* Section header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-krishi-100">
          <Radio className="h-4 w-4 text-krishi-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Live Produce Market
          </h2>
          <p className="text-xs text-slate-400">
            {listings.length} listings available today
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-krishi-600">
          <span className="h-1.5 w-1.5 rounded-full bg-krishi-500 animate-live-pulse" />
          Live
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {listings.map((listing) => {
          const isActive = selectedId === listing.id;
          return (
            <button
              key={listing.id}
              id={`listing-card-${listing.id}`}
              onClick={() => onSelect(listing)}
              className={`group relative w-full cursor-pointer rounded-2xl border p-5 text-left transition-all duration-200
                ${
                  isActive
                    ? "border-krishi-400 bg-krishi-50 shadow-lg shadow-krishi-500/10 ring-2 ring-krishi-400/30"
                    : "border-slate-200 bg-white shadow-sm hover:border-krishi-300 hover:shadow-md hover:shadow-krishi-500/5"
                }
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-krishi-500" />
              )}

              <div className="flex items-start gap-4">
                {/* Emoji avatar */}
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl transition-colors
                    ${isActive ? "bg-krishi-200/60" : "bg-slate-100 group-hover:bg-krishi-100"}
                  `}
                >
                  {listing.emoji}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                      {listing.commodity}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
                        ${isActive ? "bg-krishi-200 text-krishi-800" : "bg-slate-100 text-slate-500"}
                      `}
                    >
                      <Award className="h-2.5 w-2.5" />
                      {listing.grade}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {listing.farmer_name}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {listing.district}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Package className="h-3.5 w-3.5 text-slate-400" />
                      {listing.quantity}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
