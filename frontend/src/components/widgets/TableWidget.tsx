"use client";

import React from "react";
import { TableWidgetData } from "@/types";
import { Table as TableIcon } from "lucide-react";

interface Props {
  widget: TableWidgetData;
}

export const TableWidget: React.FC<Props> = ({ widget }) => {
  const { title, description, headers, rows } = widget;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-purple-400" />
          {title}
        </h3>
      </div>
      {description && <p className="text-xs text-slate-400 mb-4">{description}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 uppercase font-mono text-[11px] text-slate-400 border-b border-slate-700">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 font-mono">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
