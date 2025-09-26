"use client";

import { ArrowUp, ArrowDown, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

function useSimulatedMetalPrices() {
  const [prices, setPrices] = useState({
    gold: { value: 3320.55, prev: 3320.55 },
    silver: { value: 35.45, prev: 35.45 },
    platinum: { value: 1355.39, prev: 1355.39 },
  });
  const [lastUpdated, setLastUpdated] = useState("Just now");

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        // Keep prices hovering around the target values
        const randomize = (val: number, target: number) => {
          // Drift gently toward the target, with some random noise
          const drift = (target - val) * 0.05; // 5% of the distance to target
          const noise = (Math.random() - 0.5) * 2; // -1% to +1%
          let next = val + drift + (val * noise / 100);
          // Clamp to a reasonable range around the target
          if (next > target * 1.08) next = target * 1.08;
          if (next < target * 0.92) next = target * 0.92;
          return parseFloat(next.toFixed(2));
        };
        return {
          gold: { value: randomize(prev.gold.value, 3320.55), prev: prev.gold.value },
          silver: { value: randomize(prev.silver.value, 35.45), prev: prev.silver.value },
          platinum: { value: randomize(prev.platinum.value, 1355.39), prev: prev.platinum.value },
        };
      });
      setLastUpdated("Just now");
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return { prices, lastUpdated, setLastUpdated };
}

export default function BottomStatusBar() {
  const { prices, lastUpdated, setLastUpdated } = useSimulatedMetalPrices();

  // Calculate percent change
  const getChange = (curr: number, prev: number) => {
    const diff = curr - prev;
    const percent = prev !== 0 ? (diff / prev) * 100 : 0;
    return { diff, percent };
  };

  // Manual refresh handler
  const handleRefresh = () => {
    setLastUpdated("Just now");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-center h-12 px-4 gap-4 text-sm" style={{fontFamily: 'Inter, Arial, sans-serif'}}>
      {/* Gold */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white shadow-sm">
        <span className="font-semibold text-[15px] text-yellow-500">Gold</span>
        <span className="font-medium text-gray-900">${prices.gold.value.toFixed(2)}</span>
        {(() => {
          const { percent } = getChange(prices.gold.value, prices.gold.prev);
          const up = percent > 0;
          return (
            <span className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-600' : percent < 0 ? 'text-red-600' : 'text-gray-500'} bg-emerald-50 px-2 py-0.5 rounded-full ml-1`} style={{ backgroundColor: up ? 'rgba(16,185,129,0.10)' : percent < 0 ? 'rgba(239,68,68,0.10)' : 'rgba(156,163,175,0.10)' }}>
              {up ? <ArrowUp className="h-3 w-3" /> : percent < 0 ? <ArrowDown className="h-3 w-3" /> : null}
              {percent !== 0 ? `${up ? '+' : ''}${percent.toFixed(2)}%` : '0.00%'}
            </span>
          );
        })()}
      </div>
      {/* Silver */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white shadow-sm">
        <span className="font-semibold text-[15px] text-gray-700">Silver</span>
        <span className="font-medium text-gray-900">${prices.silver.value.toFixed(2)}</span>
        {(() => {
          const { percent } = getChange(prices.silver.value, prices.silver.prev);
          const up = percent > 0;
          return (
            <span className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-600' : percent < 0 ? 'text-red-600' : 'text-gray-500'} bg-emerald-50 px-2 py-0.5 rounded-full ml-1`} style={{ backgroundColor: up ? 'rgba(16,185,129,0.10)' : percent < 0 ? 'rgba(239,68,68,0.10)' : 'rgba(156,163,175,0.10)' }}>
              {up ? <ArrowUp className="h-3 w-3" /> : percent < 0 ? <ArrowDown className="h-3 w-3" /> : null}
              {percent !== 0 ? `${up ? '+' : ''}${percent.toFixed(2)}%` : '0.00%'}
            </span>
          );
        })()}
      </div>
      {/* Platinum */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white shadow-sm">
        <span className="font-semibold text-[15px] text-gray-500">Platinum</span>
        <span className="font-medium text-gray-900">${prices.platinum.value.toFixed(2)}</span>
        {(() => {
          const { percent } = getChange(prices.platinum.value, prices.platinum.prev);
          const up = percent > 0;
          return (
            <span className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-600' : percent < 0 ? 'text-red-600' : 'text-gray-500'} bg-emerald-50 px-2 py-0.5 rounded-full ml-1`} style={{ backgroundColor: up ? 'rgba(16,185,129,0.10)' : percent < 0 ? 'rgba(239,68,68,0.10)' : 'rgba(156,163,175,0.10)' }}>
              {up ? <ArrowUp className="h-3 w-3" /> : percent < 0 ? <ArrowDown className="h-3 w-3" /> : null}
              {percent !== 0 ? `${up ? '+' : ''}${percent.toFixed(2)}%` : '0.00%'}
            </span>
          );
        })()}
      </div>
      {/* Refresh and Timestamp */}
      <div className="flex items-center gap-2 ml-2">
        <button onClick={handleRefresh} className="p-1 rounded-full hover:bg-gray-100 transition-colors" aria-label="Refresh prices">
          <RefreshCcw className="h-4 w-4 text-gray-400" />
        </button>
        <span className="text-xs text-gray-400">{lastUpdated}</span>
      </div>
    </div>
  );
} 