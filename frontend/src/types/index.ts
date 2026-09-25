export type StreamEventType =
  | "agent_thought"
  | "tool_call"
  | "ui_component"
  | "text_chunk"
  | "error"
  | "done";

export interface AgentLog {
  agent: string;
  type: "thought" | "tool_call";
  content: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface MetricCardItem {
  label: string;
  value: string | number;
  change_percentage?: number;
  change_direction?: "positive" | "negative" | "neutral";
  subtext?: string;
}

export interface MetricCardWidgetData {
  widget_type: "metric_card";
  id: string;
  title: string;
  metrics: MetricCardItem[];
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

export interface ChartWidgetData {
  widget_type: "chart";
  id: string;
  title: string;
  description?: string;
  chart_kind: "line" | "bar" | "area";
  x_axis_key: string;
  series: ChartSeries[];
  data: Record<string, any>[];
}

export interface RiskItemWidgetData {
  widget_type: "risk_item";
  id: string;
  category: string;
  severity: "high" | "medium" | "low";
  headline: string;
  filing_reference: string;
  summary: string;
}

export interface TableWidgetData {
  widget_type: "table";
  id: string;
  title: string;
  description?: string;
  headers: string[];
  rows: (string | number)[][];
}

export type UIWidget =
  | MetricCardWidgetData
  | ChartWidgetData
  | RiskItemWidgetData
  | TableWidgetData;
