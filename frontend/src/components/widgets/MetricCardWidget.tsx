"use client";

import React from "react";
import { MetricCardWidgetData, MetricCardItem } from "@/types";
import { TrendingUp, TrendingDown, Minus, DollarSign, Activity } from "lucide-react";

interface Props {
  widget: MetricCardWidgetData;
}

export const MetricCardWidget: React.FC<Props> = ({ widget }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg dark:shadow-slate-900/50 transition-colors duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          {widget.title}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
          Live Fundamentals
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {widget.metrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200 dark:border-slate-700/50 rounded-lg p-3.5 flex flex-col justify-between"
          >
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{m.label}</span>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">{m.value}</span>
              {m.change_percentage !== undefined && (
                <span
                  className={`text-xs flex items-center font-medium ${
                    m.change_direction === "positive"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : m.change_direction === "negative"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {m.change_direction === "positive" ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : m.change_direction === "negative" ? (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  ) : (
                    <Minus className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(m.change_percentage)}%
                </span>
              )}
            </div>
            {m.subtext && <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">{m.subtext}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
