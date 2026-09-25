"use client";

import React, { useState } from "react";
import { ChartWidgetData } from "@/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, TrendingUp, Layers, PieChart as PieIcon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  widget: ChartWidgetData;
}

const CHART_MODES = [
  { key: "bar", icon: BarChart3, label: "Bar" },
  { key: "line", icon: TrendingUp, label: "Line" },
  { key: "area", icon: Layers, label: "Area" },
  { key: "pie", icon: PieIcon, label: "Pie" },
] as const;

type ChartMode = (typeof CHART_MODES)[number]["key"];

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

export const ChartWidget: React.FC<Props> = ({ widget }) => {
  const { chart_kind, data, x_axis_key, series, title, description } = widget;
  const [mode, setMode] = useState<ChartMode>(chart_kind as ChartMode || "bar");
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const tooltipStyle = {
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    borderColor: isDark ? "#334155" : "#e2e8f0",
    borderRadius: "8px",
    color: isDark ? "#f8fafc" : "#0f172a",
    fontSize: "12px",
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.4)" : "0 4px 12px rgba(0,0,0,0.1)",
  };

  const gridStroke = isDark ? "#334155" : "#e2e8f0";
  const axisStroke = isDark ? "#94a3b8" : "#64748b";

  const renderChart = () => {
    switch (mode) {
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.5} />
            <XAxis dataKey={x_axis_key} stroke={axisStroke} fontSize={12} tickLine={false} />
            <YAxis stroke={axisStroke} fontSize={12} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                fill={s.color || "#3b82f6"}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                animationBegin={100}
              />
            ))}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {series.map((s, i) => (
                <linearGradient key={`gradient-${s.key}`} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color || "#3b82f6"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color || "#3b82f6"} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.5} />
            <XAxis dataKey={x_axis_key} stroke={axisStroke} fontSize={12} tickLine={false} />
            <YAxis stroke={axisStroke} fontSize={12} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color || "#3b82f6"}
                fill={`url(#gradient-${s.key})`}
                strokeWidth={2}
                animationDuration={800}
              />
            ))}
          </AreaChart>
        );

      case "pie":
        // For pie chart, aggregate the first series across all data points
        const pieData = data.map((d: Record<string, any>, i: number) => ({
          name: String(d[x_axis_key] || `Item ${i + 1}`),
          value: Number(d[series[0]?.key] || 0),
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
              animationDuration={800}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </PieChart>
        );

      case "line":
      default:
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.5} />
            <XAxis dataKey={x_axis_key} stroke={axisStroke} fontSize={12} tickLine={false} />
            <YAxis stroke={axisStroke} fontSize={12} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color || "#3b82f6"}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: isDark ? "#0f172a" : "#ffffff" }}
                activeDot={{ r: 6, strokeWidth: 0, fill: s.color || "#3b82f6" }}
                animationDuration={800}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg dark:shadow-slate-900/50 transition-colors duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          {title}
        </h3>
        {/* Chart type toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg p-0.5">
          {CHART_MODES.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              title={label}
              className={`p-1.5 rounded-md transition-all ${
                mode === key
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{description}</p>}

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
