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
  let themeColor = "text-[#EF4444]";
  let barColor = "bg-[#EF4444]";
  let verdictText = "NO MATCH";
  let Icon = HelpCircle;
  let borderColor = "border-[#1F2937]";
  
  if (similarity >= 80) {
    themeColor = "text-[#22C55E]";
    barColor = "bg-[#22C55E]";
    verdictText = "LEAK DETECTED";
    Icon = ShieldAlert;
    borderColor = "border-[#22C55E]/50";
  } else if (similarity >= 50) {
    themeColor = "text-[#F59E0B]";
    barColor = "bg-[#F59E0B]";
    verdictText = "POSSIBLE MATCH";
    Icon = ShieldCheck;
    borderColor = "border-[#F59E0B]/50";
  }

  let confidence = "LOW";
  if (similarity > 85) confidence = "HIGH";
  else if (similarity > 60) confidence = "MEDIUM";

  return (
    <div className={cn(
      "w-full bg-[#111827] border rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-300 shadow-sm relative flex flex-col",
      borderColor
    )}>

      {/* Header bar */}
      <div className="px-6 py-4 flex justify-between items-center relative z-10 border-b border-[#1F2937] bg-[#0B0F19]/30">
        <div className="flex items-center space-x-3">
          <Icon className={cn("w-5 h-5", themeColor)} />
          <div>
            <h3 className="text-[#E5E7EB] font-semibold text-sm tracking-wide">Analysis Result</h3>
            <p className={cn("text-xs font-bold uppercase tracking-wider", themeColor)}>{verdictText}</p>
          </div>
        </div>
      </div>

      {/* Prominent Similarity Score */}
      <div className="px-8 flex flex-col items-center justify-center py-6 relative z-10">
        <div className="flex items-baseline space-x-1">
          <span className={cn("text-6xl md:text-7xl font-bold tracking-tight tabular-nums", themeColor)}>
            {similarity}
          </span>
          <span className={cn("text-3xl font-semibold", themeColor)}>%</span>
        </div>
        <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider mt-1">Similarity Index</p>
        
        {/* Large Progress Bar */}
        <div className="w-full max-w-sm mt-6 h-2 bg-[#0B0F19] border border-[#1F2937] rounded-full overflow-hidden relative">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColor)}
            style={{ width: `${similarity}%` }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Images */}
          <div className="flex flex-col space-y-3 bg-[#0B0F19] p-4 rounded-xl border border-[#1F2937]">
            <span className="text-xs uppercase text-[#9CA3AF] font-semibold tracking-wider text-center">
              {matchedImageUrl ? "Suspect vs Match" : "Suspected Source"}
            </span>
            <div className="flex w-full h-40 gap-3">
              <div className="w-full h-full rounded-lg overflow-hidden bg-[#111827] border border-[#1F2937] relative">
                <span className="absolute bottom-1 left-1 bg-black/80 px-2 py-0.5 text-[10px] text-[#E5E7EB] rounded font-medium z-10">Suspect</span>
                <img src={suspectImageUrl} alt="Suspect" className="w-full h-full object-cover" />
              </div>
              {matchedImageUrl && (
                <div className="w-full h-full rounded-lg overflow-hidden bg-[#111827] border border-[#1F2937] relative">
                  <span className="absolute bottom-1 right-1 bg-black/80 px-2 py-0.5 text-[10px] text-[#E5E7EB] rounded font-medium z-10">Match</span>
                  <img src={matchedImageUrl} alt="Matched" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Fingerprint Details Card */}
          <div className={cn(
            "flex flex-col space-y-3 p-4 rounded-xl border relative overflow-hidden transition-all duration-300",
            confidence === 'HIGH' ? "bg-[#22C55E]/5 border-[#22C55E]/30" : "bg-[#0B0F19] border-[#1F2937]"
          )}>
            <span className="text-xs uppercase text-[#9CA3AF] font-semibold tracking-wider text-center border-b border-[#1F2937] pb-3 relative z-10">Fingerprint Details</span>
            
            <div className="flex flex-col gap-2 py-1 relative z-10">
              <div className="flex justify-between items-center bg-[#111827] px-3 py-2 rounded border border-[#1F2937]">
                <span className="text-xs text-[#9CA3AF]">Hash (64-bit)</span>
                <span className="text-xs font-mono text-[#E5E7EB]">
                  {hash ? `${hash.slice(0, 16)}...` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#111827] px-3 py-2 rounded border border-[#1F2937]">
                <span className="text-xs text-[#9CA3AF]">Distance</span>
                <span className="text-xs font-mono text-[#E5E7EB]">{distance ?? 'N/A'} bits</span>
              </div>
              <div className="flex justify-between items-center bg-[#111827] px-3 py-2 rounded border border-[#1F2937]">
                <span className="text-xs text-[#9CA3AF]">Similarity</span>
                <span className="text-xs font-bold text-[#E5E7EB]">{similarity}%</span>
              </div>
              <div className="flex justify-between items-center bg-[#111827] px-3 py-2 rounded border border-[#1F2937]">
                <span className="text-xs text-[#9CA3AF]">Confidence</span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded tracking-wide",
                  confidence === 'HIGH' ? "text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20" :
                  confidence === 'MEDIUM' ? "text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20" :
                  "text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20"
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
