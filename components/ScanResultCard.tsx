"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ShieldAlert, ShieldCheck, ExternalLink } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScanResultCardProps {
  source_url: string;
  similarity: number;
  isLeak: boolean;
  confidence?: number;
}

export default function ScanResultCard({
  source_url,
  similarity,
  isLeak,
  confidence,
}: ScanResultCardProps) {
  const themeColor = isLeak ? "text-red-400" : "text-green-400";
  const barColor = isLeak ? "bg-red-500" : "bg-green-500";
  const glowColor = isLeak ? "shadow-red-500/20" : "shadow-green-500/20";
  const verdictText = isLeak ? "Leak Detected" : "Safe";
  const Icon = isLeak ? ShieldAlert : ShieldCheck;
  const bgBadge = isLeak ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-green-500/10 border-green-500/30 text-green-400";

  return (
    <div className={cn(
      "w-full bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-xl relative",
      glowColor
    )}>
      <div className="px-5 py-4 flex justify-between items-center relative z-10 border-b border-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className={cn("p-1.5 rounded-lg backdrop-blur-sm", bgBadge)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className={cn("text-xs font-bold uppercase tracking-wider", themeColor)}>{verdictText}</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
            <div className="flex items-baseline">
              <span className={cn("text-2xl font-black tabular-nums tracking-tighter", themeColor)}>
                {similarity}
              </span>
              <span className={cn("text-lg font-bold", themeColor)}>%</span>
            </div>
            {confidence !== undefined && (
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mt-1 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700/50">
                Conf: <span className="text-gray-300">{confidence}%</span>
              </span>
            )}
        </div>
      </div>

      <div className="px-5 py-4 relative z-10 flex flex-col sm:flex-row gap-4">
        {/* Thumbnail */}
        <div className="w-full sm:w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-900 border border-gray-700/50 relative group">
          <img src={source_url} alt="Scanned source" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-1">Source URL</span>
          <a 
            href={source_url} 
            target="_blank" 
            rel="noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 truncate flex items-center gap-1 group"
          >
            <span className="truncate">{source_url}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </a>

          {/* Progress Bar */}
          <div className="w-full mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColor)}
              style={{ width: `${similarity}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
