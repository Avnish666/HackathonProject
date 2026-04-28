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
  status?: 'LEAK' | 'SUSPICIOUS' | 'SAFE';
}

export default function ScanResultCard({
  source_url,
  similarity,
  isLeak,
  confidence,
  status,
}: ScanResultCardProps) {
  const resolvedStatus = status || (isLeak ? 'LEAK' : 'SAFE');

  let borderColor = "border-[#1F2937]";
  let statusColor = "text-[#22C55E]";
  let verdictText = "SAFE";
  let Icon = ShieldCheck;

  if (resolvedStatus === 'LEAK') {
    borderColor = "border-[#EF4444]/50";
    statusColor = "text-[#EF4444]";
    verdictText = "LEAK DETECTED";
    Icon = ShieldAlert;
  } else if (resolvedStatus === 'SUSPICIOUS') {
    borderColor = "border-[#F59E0B]/50";
    statusColor = "text-[#F59E0B]";
    verdictText = "SUSPICIOUS";
    Icon = ShieldAlert;
  }

  return (
    <div className={cn(
      "w-full bg-[#111827] border rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-sm flex flex-col",
      borderColor
    )}>
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center border-b border-[#1F2937] bg-[#0B0F19]/30">
        <div className="flex items-center space-x-2">
          <Icon className={cn("w-4 h-4", statusColor)} />
          <span className={cn("text-xs font-semibold tracking-wide", statusColor)}>{verdictText}</span>
        </div>
        <div className="text-right flex items-baseline space-x-1">
          <span className={cn("text-2xl font-bold tracking-tight", statusColor)}>{similarity}%</span>
          {confidence !== undefined && (
            <span className="text-[10px] uppercase text-[#9CA3AF] ml-2">
              Conf: {confidence}%
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex gap-4 items-center">
        {/* Thumbnail */}
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-[#0B0F19] border border-[#1F2937] relative">
          <img src={source_url} alt="Source" className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs text-[#9CA3AF] font-medium mb-1 uppercase tracking-wider">Source URL</span>
          <a 
            href={source_url} 
            target="_blank" 
            rel="noreferrer"
            className="text-sm text-[#E5E7EB] hover:text-white truncate flex items-center gap-1 group transition-colors"
          >
            <span className="truncate">{source_url}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[#9CA3AF]" />
          </a>
        </div>
      </div>
    </div>
  );
}
