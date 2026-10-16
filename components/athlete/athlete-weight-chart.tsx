"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function AthleteWeightChart() {
  const [period, setPeriod] = useState<"6w" | "3m">("6w");

  const is6w = period === "6w";

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>روند وزن</h3>
          <div className="hint">{is6w ? "۶ هفته‌ی اخیر" : "۳ ماه اخیر"}</div>
        </div>
        <div className="seg">
          <button
            type="button"
            onClick={() => setPeriod("3m")}
            className={cn(!is6w && "active")}
          >
            ۳ ماه
          </button>
          <button
            type="button"
            onClick={() => setPeriod("6w")}
            className={cn(is6w && "active")}
          >
            ۶ هفته
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="chart-legend">
          <div className="li">
            <span className="swatch" style={{ background: "#D94A10" }} />
            وزن (کیلوگرم)
          </div>
        </div>
        <div className="chart-wrap" style={{ height: "200px" }}>
          <svg
            viewBox="0 0 720 200"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", overflow: "visible" }}
          >
            <defs>
              <linearGradient id="fillG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F25C1F" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#F25C1F" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="40"
              x2="720"
              y2="40"
              stroke="#E7E5E4"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <line
              x1="0"
              y1="100"
              x2="720"
              y2="100"
              stroke="#E7E5E4"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <line
              x1="0"
              y1="160"
              x2="720"
              y2="160"
              stroke="#E7E5E4"
              strokeWidth="1"
              strokeDasharray="4 6"
            />

            {is6w ? (
              <>
                <path
                  d="M0 40 L144 65 L288 90 L432 110 L576 130 L720 150 L720 200 L0 200 Z"
                  fill="url(#fillG)"
                  className="transition-all duration-300"
                />
                <path
                  d="M0 40 L144 65 L288 90 L432 110 L576 130 L720 150"
                  fill="none"
                  stroke="#D94A10"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
                <circle cx="720" cy="150" r="5" fill="#D94A10" />
              </>
            ) : (
              <>
                <path
                  d="M0 25 L144 50 L288 75 L432 105 L576 125 L720 150 L720 200 L0 200 Z"
                  fill="url(#fillG)"
                  className="transition-all duration-300"
                />
                <path
                  d="M0 25 L144 50 L288 75 L432 105 L576 125 L720 150"
                  fill="none"
                  stroke="#D94A10"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
                <circle cx="720" cy="150" r="5" fill="#D94A10" />
              </>
            )}
          </svg>
        </div>
        <div className="chart-x">
          {is6w ? (
            <>
              <span>هفته ۱</span>
              <span>۲</span>
              <span>۳</span>
              <span>۴</span>
              <span>۵</span>
              <span>این هفته</span>
            </>
          ) : (
            <>
              <span>ماه ۱</span>
              <span>ماه ۲</span>
              <span>ماه ۳</span>
              <span>این ماه</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
