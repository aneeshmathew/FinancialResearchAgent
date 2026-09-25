"use client";

import React, { useState } from "react";
import { useResearchStream } from "@/hooks/useEventSource";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { AgentThoughtLog } from "@/components/stream/AgentThoughtLog";
import { MarkdownReport } from "@/components/stream/MarkdownReport";
import { useTheme } from "@/context/ThemeContext";
import {
  TrendingUp,
  Search,
  Sparkles,
  Layers,
  StopCircle,
  RotateCcw,
  Zap,
  Building2,
  FileCheck2,
  Sun,
  Moon,
} from "lucide-react";

const DEMO_PRESETS = [
  {
    ticker: "AAPL",
    label: "Apple (AAPL)",
    query: "Analyze Apple's supply chain risks, App Store antitrust challenges, and gross margin trends.",
  },
  {
    ticker: "MSFT",
    label: "Microsoft (MSFT)",
    query: "Evaluate Microsoft Azure cloud growth, AI datacenter capex scale, and software profitability.",
  },
  {
    ticker: "NVDA",
    label: "NVIDIA (NVDA)",
    query: "Examine NVIDIA Blackwell architecture demand, foundry concentration with TSMC, and data center revenue.",
  },
  {
    ticker: "TSLA",
    label: "Tesla (TSLA)",
    query: "Assess Tesla full self-driving autonomous regulations, 4680 battery yield, and automotive margins.",
  },
];

export default function DashboardPage() {
  const [queryInput, setQueryInput] = useState(DEMO_PRESETS[0].query);
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [activeTab, setActiveTab] = useState<"report" | "trace">("report");
  const { theme, toggleTheme } = useTheme();

  const {
    status,
    thoughts,
    widgets,
    reportMarkdown,
    error,
    startResearch,
    resetResearch,
    stopResearch,
  } = useResearchStream();

  const handlePresetSelect = (preset: typeof DEMO_PRESETS[0]) => {
    setSelectedTicker(preset.ticker);
    setQueryInput(preset.query);
  };

  const handleInputChange = (val: string) => {
    setQueryInput(val);
    // If user edited away from preset, clear locked preset ticker so supervisor extracts dynamically
    const matchingPreset = DEMO_PRESETS.find(p => p.query === val);
    if (!matchingPreset) {
      setSelectedTicker("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    // If selectedTicker is set from an untouched preset, pass it; otherwise pass empty string to let AI extract from query
    startResearch(queryInput, selectedTicker || undefined);
  };

  const isRunning = status === "connecting" || status === "streaming";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Autonomous Market & Financial Research Dashboard
                </h1>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  LangGraph v0.2 + Qdrant RAG
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-agent orchestration streaming SEC disclosures & live financial UI widgets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {isRunning ? (
              <button
                onClick={stopResearch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-200 dark:hover:bg-rose-500/20 transition"
              >
                <StopCircle className="w-3.5 h-3.5" />
                Stop Execution
              </button>
            ) : null}

            {widgets.length > 0 || thoughts.length > 0 ? (
              <button
                onClick={resetResearch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Research Query Input & Quick Presets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl dark:shadow-slate-900/50 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter research inquiry (e.g. Analyze Apple supply chain risks and recent revenue trends)..."
                disabled={isRunning}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isRunning || !queryInput.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              {isRunning ? "Executing Graph..." : "Run Research"}
            </button>
          </form>

          {/* Quick Preset Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium mr-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Sample Disclosures:
            </span>
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.ticker}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1 rounded-lg border transition font-mono text-xs ${
                  selectedTicker === preset.ticker
                    ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => resetResearch()} className="text-xs underline hover:text-rose-900 dark:hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Workspace Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Dynamic UI Widgets & Live Charts */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Dynamic UI Blueprint Stream ({widgets.length})
              </h2>
              {isRunning && (
                <span className="text-xs text-slate-400 dark:text-slate-400 animate-pulse font-mono">
                  Streaming component blueprints...
                </span>
              )}
            </div>

            {widgets.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Building2 className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">No UI Widgets Emitted Yet</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                  Click a sample stock above or type a company inquiry. The Widget Generator Agent
                  will dynamically stream KPI metric cards, revenue charts, and SEC risk factors here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {widgets.map((widget) => (
                  <WidgetRenderer key={widget.id} widget={widget} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Tabbed View (Final Equity Memo vs Agent Reasoning Timeline) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("report")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                  activeTab === "report"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                Research Memo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("trace")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                  activeTab === "trace"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                Agent Trace ({thoughts.length})
              </button>
            </div>

            {activeTab === "report" ? (
              <MarkdownReport content={reportMarkdown} isStreaming={isRunning} />
            ) : (
              <AgentThoughtLog thoughts={thoughts} status={status} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-4 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
        Autonomous Financial Research Dashboard &copy; 2026 &bull; LangGraph &bull; Qdrant &bull; FastAPI &bull; Next.js 14
      </footer>
    </div>
  );
}
