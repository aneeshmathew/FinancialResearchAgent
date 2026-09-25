"use client";

import React from "react";
import { UIWidget } from "@/types";
import { MetricCardWidget } from "./MetricCardWidget";
import { ChartWidget } from "./ChartWidget";
import { RiskItemWidget } from "./RiskItemWidget";
import { TableWidget } from "./TableWidget";

interface Props {
  widget: UIWidget;
}

export const WidgetRenderer: React.FC<Props> = ({ widget }) => {
  switch (widget.widget_type) {
    case "metric_card":
      return <MetricCardWidget widget={widget} />;
    case "chart":
      return <ChartWidget widget={widget} />;
    case "risk_item":
      return <RiskItemWidget widget={widget} />;
    case "table":
      return <TableWidget widget={widget} />;
    default:
      return null;
  }
};
