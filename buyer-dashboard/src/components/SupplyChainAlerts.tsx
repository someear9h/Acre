import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Thermometer,
  Droplets,
  Activity,
  ShieldAlert,
  X,
  ChevronDown,
  ChevronUp,
  TrendingDown,
} from "lucide-react";

import { API_BASE_URL } from "../data";

interface AlertData {
  contract: { initial_qty: number; current_qty: number };
  sensor_data: { soil_moisture: number; temperature: number; disease_flag: boolean };
}

export default function SupplyChainAlerts() {
  const [expanded, setExpanded] = useState(true);
  const [visible, setVisible] = useState(false);
  const [alertData, setAlertData] = useState<AlertData | null>(null);

  useEffect(() => {
    // If the alert is already showing, we can stop polling to save network calls.
    if (visible) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/contract-alerts/%2B918983404900`);
        if (!res.ok) return;
        const json = await res.json();

        if (json.alert_active) {
          setAlertData({
            contract: json.contract,
            sensor_data: json.sensor_data,
          });
          setVisible(true);
        }
      } catch (e) {
        // Silently ignore fetch errors during polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [visible]);

  // CRITICAL FIX: The function to tell the backend the alert is dismissed
  const handleAcknowledge = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/contract-alerts/%2B918983404900/acknowledge`, {
        method: "POST",
      });
      // Once the backend confirms it updated SQLite, hide the UI
      setVisible(false);
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
      // Hide visually anyway to prevent UI blocking on a network hiccup
      setVisible(false);
    }
  };

  if (!visible || !alertData) return null;

  return (
    <div className="animate-alert-in">
      <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 shadow-lg shadow-amber-100/50">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-amber-200/60 bg-gradient-to-r from-amber-100/80 to-orange-100/60 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-sm shadow-amber-500/30">
              <ShieldAlert className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Predictive Supply Chain Alert
              </h3>
              <p className="text-[11px] text-amber-700/80">
                Acre Yield Engine • Automated Contract Revision
              </p>
            </div>
            {/* Live pulse dot */}
            <span className="relative ml-2 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded-lg p-1.5 text-amber-600 transition-colors hover:bg-amber-200/60 hover:text-amber-800"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleAcknowledge}
              className="rounded-lg p-1.5 text-amber-600 transition-colors hover:bg-red-100 hover:text-red-700"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Body */}
        <div
          className={`transition-all duration-300 ease-in-out ${expanded
            ? "max-h-[600px] opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
            }`}
        >
          <div className="p-5">
            {/* Alert Type Badge */}
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                <AlertTriangle className="h-3 w-3" />
                CRITICAL YIELD REVISION
              </span>
              <span className="text-[11px] text-amber-600">
                Just now • Auto-triggered
              </span>
            </div>

            {/* Contract Info */}
            <div className="mb-4 rounded-xl border border-amber-200/60 bg-white/60 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-700/70">
                Affected Contract
              </p>
              <p className="text-lg font-bold text-slate-900">
                Farmer Ram Singh — Potato
              </p>
              <p className="text-sm text-slate-500">
                District: Patiala • Forward Contract
              </p>
            </div>

            {/* Sensor Data Tags */}
            <div className="mb-4">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-amber-700/70">
                Environmental Stress Detected
              </p>
              <div className="flex flex-wrap gap-2.5">
                {/* Soil Moisture Badge */}
                <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-3.5 py-2 shadow-sm">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                      Soil Moisture
                    </p>
                    <p className="text-sm font-bold text-blue-800">
                      {alertData.sensor_data.soil_moisture}%{" "}
                      {alertData.sensor_data.soil_moisture < 30.0 && (
                        <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                          CRITICAL
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Temperature Badge */}
                <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-3.5 py-2 shadow-sm">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-400">
                      Temperature
                    </p>
                    <p className="text-sm font-bold text-orange-800">
                      {alertData.sensor_data.temperature}°C{" "}
                      {alertData.sensor_data.temperature > 35.0 && (
                        <span className="ml-1 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
                          HIGH
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Disease Badge */}
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-3.5 py-2 shadow-sm">
                  <Activity className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                      Disease Flag
                    </p>
                    <p className="text-sm font-bold text-red-800">
                      {alertData.sensor_data.disease_flag ? "Detected" : "None"}{" "}
                      {alertData.sensor_data.disease_flag && (
                        <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                          TRUE
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revision Action Card */}
            <div className="rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-100/60 to-orange-100/40 p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-700" />
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Automatic Action Taken
                </p>
              </div>
              <p className="text-sm leading-relaxed text-amber-900">
                Forward contract automatically revised from{" "}
                <span className="font-bold text-red-700 line-through">
                  {alertData.contract.initial_qty} Quintals
                </span>{" "}
                →{" "}
                <span className="font-bold text-emerald-700">
                  {alertData.contract.current_qty} Quintals
                </span>{" "}
                to guarantee quality. Escrow hold adjusted.
              </p>
            </div>

            {/* Acknowledge Button */}
            <button
              onClick={handleAcknowledge}
              className="mt-4 w-full rounded-xl border border-amber-300/60 bg-white/80 py-2.5 text-sm font-semibold text-amber-800 shadow-sm transition-all duration-200 hover:bg-amber-100 hover:shadow-md active:scale-[0.99]"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}