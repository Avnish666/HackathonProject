"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileSearch, ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ResultCardProps {
  suspectImageUrl: string;
  matchedImageUrl?: string | null;
  similarity: number;
  distance?: number | null;
  hash?: string;
}

export default function ResultCard({
  suspectImageUrl,
  matchedImageUrl,
  similarity,
  distance,
  hash,
}: ResultCardProps) {
  // Constraints: >=80% = Leak Detected (green), 50-80% = Possible Match (yellow), <50% = No Match (red)
  let themeColor = "text-red-400";
  let barColor = "bg-red-500";
  let glowColor = "shadow-red-500/20";
  let verdictText = "No Match";
  let Icon = HelpCircle;
  let bgBadge = "bg-red-500/10 border-red-500/30 text-red-500";
  
  if (similarity >= 80) {
    themeColor = "text-green-400";
    barColor = "bg-green-500";
    glowColor = "shadow-green-500/40";
    verdictText = "Leak Detected";
    Icon = ShieldAlert;
    bgBadge = "bg-green-500/10 border-green-500/30 text-green-400";
  } else if (similarity >= 50) {
    themeColor = "text-yellow-400";
    barColor = "bg-yellow-500";
    glowColor = "shadow-yellow-500/20";
    verdictText = "Possible Match";
    Icon = ShieldCheck;
    bgBadge = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
  }

  let confidence = "LOW";
  if (similarity > 85) confidence = "HIGH";
  else if (similarity > 60) confidence = "MEDIUM";

  return (
    <div className={cn(
      "w-full bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-2xl relative",
      glowColor
    )}>
      {/* Decorative gradient header backdrop */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      {/* Header bar */}
      <div className="px-6 py-5 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded-lg backdrop-blur-sm", bgBadge)}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-gray-200 font-semibold text-lg tracking-wide">Analysis Result</h3>
            <p className={cn("text-sm font-bold uppercase tracking-wider", themeColor)}>{verdictText}</p>
          </div>
        </div>
      </div>

      {/* Prominent Similarity Score */}
      <div className="px-8 flex flex-col items-center justify-center -mt-2 pb-6 relative z-10">
        <div className="flex items-baseline space-x-1">
          <span className={cn("text-6xl md:text-7xl font-black tabular-nums tracking-tighter", themeColor)}>
            {similarity}
          </span>
          <span className={cn("text-3xl font-bold", themeColor)}>%</span>
        </div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-[0.2em] mt-1">Similarity Index</p>
        
        {/* Large Progress Bar */}
        <div className="w-full max-w-sm mt-6 h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner relative">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.2)]", barColor)}
            style={{ width: `${similarity}%` }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Images */}
          <div className="flex flex-col space-y-3 bg-black/40 p-3 rounded-2xl border border-gray-800">
            <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider text-center">
              {matchedImageUrl ? "Suspect vs Match" : "Suspected Source"}
            </span>
            <div className="flex w-full h-40 gap-2">
              <div className="w-full h-full rounded-xl overflow-hidden bg-gray-900 border border-gray-700/50 relative">
                <span className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 text-[10px] text-gray-300 rounded z-10 backdrop-blur-sm">Suspect</span>
                <img src={suspectImageUrl} alt="Suspect" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 ease-out" />
              </div>
              {matchedImageUrl && (
                <div className="w-full h-full rounded-xl overflow-hidden bg-gray-900 border border-gray-700/50 relative">
                  <span className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 text-[10px] text-gray-300 rounded z-10 backdrop-blur-sm">Match</span>
                  <img src={matchedImageUrl} alt="Matched" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 ease-out" />
                </div>
              )}
            </div>
          </div>

          {/* Fingerprint Details Card */}
          <div className={cn(
            "flex flex-col space-y-3 p-4 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all duration-500",
            confidence === 'HIGH' ? "bg-green-500/5 border-green-500/30" : "bg-black/40 border-gray-800"
          )}>
            {confidence === 'HIGH' && (
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-50 pointer-events-none animate-pulse duration-[3000ms]" />
            )}
            
            <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider text-center border-b border-gray-800/50 pb-2 relative z-10">Fingerprint Details</span>
            
            <div className="flex flex-col gap-2.5 py-1 relative z-10">
              <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded border border-gray-800/50">
                <span className="text-xs text-gray-400">Hash (64-bit)</span>
                <span className="text-xs font-mono text-gray-200">
                  {hash ? `${hash.slice(0, 16)}...` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded border border-gray-800/50">
                <span className="text-xs text-gray-400">Distance</span>
                <span className="text-xs font-mono text-gray-200">{distance ?? 'N/A'} bits</span>
              </div>
              <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded border border-gray-800/50">
                <span className="text-xs text-gray-400">Similarity</span>
                <span className="text-xs font-bold text-gray-200">{similarity}%</span>
              </div>
              <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded border border-gray-800/50">
                <span className="text-xs text-gray-400">Confidence</span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded tracking-wide",
                  confidence === 'HIGH' ? "text-green-400 bg-green-500/20 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]" :
                  confidence === 'MEDIUM' ? "text-yellow-400 bg-yellow-500/20 border border-yellow-500/30" :
                  "text-red-400 bg-red-500/20 border border-red-500/30"
                )}>
                  {confidence}
                </span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
