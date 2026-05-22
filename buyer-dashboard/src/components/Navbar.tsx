import { Sprout, Activity } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-krishi-500 to-krishi-700 shadow-lg shadow-krishi-500/25">
            <Sprout className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Ac<span className="text-krishi-600">re</span>
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              B2B Market
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 rounded-full border border-krishi-200 bg-krishi-50 px-4 py-1.5">
          <Activity className="h-3.5 w-3.5 text-krishi-600" />
          <span className="text-xs font-semibold text-krishi-700">
            Mandi Oracle Online
          </span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-krishi-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-krishi-500" />
          </span>
        </div>
      </div>
    </nav>
  );
}
