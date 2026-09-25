"use client";

import React from "react";
import { RiskItemWidgetData } from "@/types";
import { AlertTriangle, ShieldAlert, FileText } from "lucide-react";

interface Props {
  widget: RiskItemWidgetData;
}

export const RiskItemWidget: React.FC<Props> = ({ widget }) => {
  const { category, severity, headline, filing_reference, summary } = widget;

  const severityBadge = () => {
    switch (severity) {
      case "high":
        return {
          bg: "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
          icon: <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
        };
      case "medium":
      default:
        return {
          bg: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
          icon: <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
        };
      case "low":
        return {
          bg: "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20",
          icon: <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
        };
    }
  };

  const badge = severityBadge();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg dark:shadow-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-300">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {badge.icon}
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{headline}</h4>
        </div>
        <span
          className={`text-[11px] font-medium uppercase px-2 py-0.5 rounded-full border ${badge.bg} whitespace-nowrap`}
        >
          {severity} Risk
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{summary}</p>

      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800/80">
        <span className="font-mono text-slate-500">{category}</span>
        <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400/90">
          <FileText className="w-3 h-3" />
          {filing_reference}
        </span>
      </div>
    </div>
  );
};
