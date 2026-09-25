"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Copy, Check } from "lucide-react";

interface Props {
  content: string;
  isStreaming: boolean;
}

export const MarkdownReport: React.FC<Props> = ({ content, isStreaming }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg dark:shadow-slate-900/50 transition-colors duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          Equity Research Synthesis
        </h3>
        {content && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Memo"}
          </button>
        )}
      </div>

      {!content && isStreaming && (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm animate-pulse">
          Synthesis Agent is drafting the final memorandum...
        </div>
      )}

      {!content && !isStreaming && (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
          Run a research prompt to generate an institutional equity memo.
        </div>
      )}

      {content && (
        <article className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-4 font-sans">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mt-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mt-5 mb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-4 mb-1">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 mt-3 mb-1 uppercase tracking-wider">{children}</h4>
              ),
              p: ({ children }) => <p className="mb-3 text-slate-600 dark:text-slate-300 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-3 text-slate-600 dark:text-slate-300">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-slate-600 dark:text-slate-300">{children}</ol>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-500/60 bg-indigo-50 dark:bg-indigo-950/20 pl-4 py-2 italic text-slate-600 dark:text-slate-300 my-3 rounded-r">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="border-slate-200 dark:border-slate-800 my-4" />,
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-emerald-500 dark:bg-emerald-400 animate-pulse ml-1 align-middle" />
          )}
        </article>
      )}
    </div>
  );
};
