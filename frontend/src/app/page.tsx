"use client";

import React, { useState } from "react";
import { useResearchStream } from "@/hooks/useEventSource";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { AgentThoughtLog } from "@/components/stream/AgentThoughtLog";
import { MarkdownReport } from "@/components/stream/MarkdownReport";
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
  const [queryInput, setQueryInput] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [activeTab, setActiveTab] = useState<"report" | "trace">("report");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    startResearch(queryInput, selectedTicker);
  };

  const isRunning = status === "connecting" || status === "streaming";

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Autonomous Market & Financial Research Dashboard
                </h1>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LangGraph v0.2 + Qdrant RAG
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-agent orchestration streaming SEC disclosures & live financial UI widgets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={stopResearch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
              >
                <StopCircle className="w-3.5 h-3.5" />
                Stop Execution
              </button>
            ) : null}

            {widgets.length > 0 || thoughts.length > 0 ? (
              <button
                onClick={resetResearch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter research inquiry (e.g. Analyze Apple supply chain risks and recent revenue trends)..."
                disabled={isRunning}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isRunning || !queryInput.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-4 h-4" />
              {isRunning ? "Executing Graph..." : "Run Research"}
            </button>
          </form>

          {/* Quick Preset Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium mr-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Sample Disclosures:
            </span>
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.ticker}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1 rounded-lg border transition font-mono text-xs ${
                  selectedTicker === preset.ticker
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => resetResearch()} className="text-xs underline hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Workspace Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Dynamic UI Widgets & Live Charts */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Dynamic UI Blueprint Stream ({widgets.length})
              </h2>
              {isRunning && (
                <span className="text-xs text-slate-400 animate-pulse font-mono">
                  Streaming component blueprints...
                </span>
              )}
            </div>

            {widgets.length === 0 ? (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Building2 className="w-8 h-8 text-slate-600" />
                <h3 className="text-sm font-medium text-slate-300">No UI Widgets Emitted Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm">
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
            <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("report")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                  activeTab === "report"
                    ? "bg-slate-800 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                Research Memo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("trace")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                  activeTab === "trace"
                    ? "bg-slate-800 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
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
      <footer className="mt-auto border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        Autonomous Financial Research Dashboard &copy; 2026 &bull; LangGraph &bull; Qdrant &bull; FastAPI &bull; Next.js 14
      </footer>
    </div>
  );
}
