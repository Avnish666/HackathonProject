"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TabType = 'upload-original' | 'check-leak' | 'run-scan';

interface TabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export default function Tabs({ activeTab, onChange }: TabsProps) {
  return (
    <div className="flex justify-center w-full max-w-md mx-auto mb-10">
      <div className="relative flex p-1.5 bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-700/50 w-full shadow-2xl">
        
        {/* Animated Background Selector */}
        <div 
          className={cn(
            "absolute inset-y-1.5 left-1.5 w-[calc(33.333%-0.375rem)] bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg transition-transform duration-300 ease-spring shadow-[0_0_15px_rgba(59,130,246,0.3)]",
            activeTab === 'upload-original' ? "translate-x-0" :
            activeTab === 'check-leak' ? "translate-x-full" : "translate-x-[200%]"
          )}
        />
        
        {/* Tab 1: Upload Original */}
        <button
          onClick={() => onChange('upload-original')}
          className={cn(
            "relative z-10 w-1/3 py-3 text-sm font-semibold tracking-wide transition-colors duration-300 rounded-lg focus:outline-none",
            activeTab === 'upload-original' ? "text-white" : "text-gray-400 hover:text-gray-200"
          )}
        >
          Upload Original
        </button>

        {/* Tab 2: Check Leak */}
        <button
          onClick={() => onChange('check-leak')}
          className={cn(
            "relative z-10 w-1/3 py-3 text-sm font-semibold tracking-wide transition-colors duration-300 rounded-lg focus:outline-none",
            activeTab === 'check-leak' ? "text-white" : "text-gray-400 hover:text-gray-200"
          )}
        >
          Check Leak
        </button>

        {/* Tab 3: Run Scan */}
        <button
          onClick={() => onChange('run-scan')}
          className={cn(
            "relative z-10 w-1/3 py-3 text-sm font-semibold tracking-wide transition-colors duration-300 rounded-lg focus:outline-none",
            activeTab === 'run-scan' ? "text-white" : "text-gray-400 hover:text-gray-200"
          )}
        >
          Run Scan
        </button>
      </div>
    </div>
  );
}
