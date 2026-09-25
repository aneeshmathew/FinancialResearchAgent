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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg dark:shadow-slate-900/50 overflow-hidden transition-colors duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          {title}
        </h3>
      </div>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{description}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-mono text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
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
