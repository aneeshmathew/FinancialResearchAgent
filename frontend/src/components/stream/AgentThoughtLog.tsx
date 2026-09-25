"use client";

import React, { useRef, useEffect } from "react";
import { AgentLog } from "@/types";
import { Brain, Wrench, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  thoughts: AgentLog[];
  status: string;
}

export const AgentThoughtLog: React.FC<Props> = ({ thoughts, status }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts]);

  const getAgentColor = (agent: string) => {
    switch (agent.toLowerCase()) {
      case "supervisor":
      case "coordinator":
        return "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20";
      case "sec_agent":
        return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
      case "market_agent":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
      case "widget_agent":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20";
      case "synthesizer":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg dark:shadow-slate-900/50 flex flex-col h-full transition-colors duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Agent Reasoning & Trace</h3>
        </div>
        <div className="flex items-center gap-2">
          {status === "streaming" && (
            <span className="flex items-center gap-1.5 text-xs text-indigo-500 dark:text-indigo-400 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Active
            </span>
          )}
          {status === "completed" && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 dark:text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2.5 max-h-[380px] pr-1">
        {thoughts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
            Awaiting query execution... Agent thoughts and tool calls will appear here in real time.
          </div>
        ) : (
          thoughts.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-lg p-3 text-xs flex flex-col gap-1.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${getAgentColor(
                    item.agent
                  )}`}
                >
                  {item.agent}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.timestamp}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans flex items-start gap-2">
                {item.type === "tool_call" ? (
                  <Wrench className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Brain className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                )}
                <span>{item.content}</span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
