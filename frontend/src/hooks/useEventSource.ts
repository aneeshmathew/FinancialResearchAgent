"use client";

import { useState, useRef, useCallback } from "react";
import { AgentLog, UIWidget } from "@/types";

export type StreamStatus = "idle" | "connecting" | "streaming" | "completed" | "error";

interface UseResearchStreamReturn {
  status: StreamStatus;
  thoughts: AgentLog[];
  widgets: UIWidget[];
  reportMarkdown: string;
  error: string | null;
  startResearch: (query: string, ticker?: string) => Promise<void>;
  resetResearch: () => void;
  stopResearch: () => void;
}

export function useResearchStream(): UseResearchStreamReturn {
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [thoughts, setThoughts] = useState<AgentLog[]>([]);
  const [widgets, setWidgets] = useState<UIWidget[]>([]);
  const [reportMarkdown, setReportMarkdown] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const resetResearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus("idle");
    setThoughts([]);
    setWidgets([]);
    setReportMarkdown("");
    setError(null);
  }, []);

  const stopResearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStatus("completed");
    }
  }, []);

  const startResearch = useCallback(async (query: string, ticker?: string) => {
    // Reset prior state
    resetResearch();
    setStatus("connecting");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const params = new URLSearchParams({ query });
      if (ticker) {
        params.append("ticker", ticker);
      }

      const response = await fetch(`${backendUrl}/api/v1/research/stream?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No readable response body received from stream.");
      }

      setStatus("streaming");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || ""; // keep incomplete tail

        for (const rawEvent of events) {
          if (!rawEvent.trim()) continue;

          const lines = rawEvent.split("\n");
          let eventType = "message";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              dataStr += line.replace("data:", "").trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventType === "agent_thought" || eventType === "tool_call") {
              const logEntry: AgentLog = {
                agent: data.agent || "Agent",
                type: data.type || (eventType === "tool_call" ? "tool_call" : "thought"),
                content: data.content || JSON.stringify(data),
                details: data.details,
                timestamp: new Date().toLocaleTimeString(),
              };
              setThoughts((prev) => [...prev, logEntry]);
            } else if (eventType === "ui_component") {
              const newWidget = data as UIWidget;
              setWidgets((prev) => {
                // Avoid duplicate widget IDs
                if (prev.some((w) => w.id === newWidget.id)) {
                  return prev.map((w) => (w.id === newWidget.id ? newWidget : w));
                }
                return [...prev, newWidget];
              });
            } else if (eventType === "text_chunk") {
              const chunk = data.chunk || "";
              setReportMarkdown((prev) => prev + chunk);
            } else if (eventType === "done") {
              setStatus("completed");
            } else if (eventType === "error") {
              setError(data.message || data.error || "An error occurred.");
              setStatus("error");
            }
          } catch (e) {
            console.error("Failed to parse SSE payload:", dataStr, e);
          }
        }
      }

      setStatus("completed");
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Research stream aborted by user.");
      } else {
        console.error("Error in research stream:", err);
        setError(err.message || "Failed to connect to research agent stream.");
        setStatus("error");
      }
    }
  }, [resetResearch]);

  return {
    status,
    thoughts,
    widgets,
    reportMarkdown,
    error,
    startResearch,
    resetResearch,
    stopResearch,
  };
}
