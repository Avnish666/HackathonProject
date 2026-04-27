"use client";

import React, { useState, useEffect } from 'react';
import Tabs, { TabType } from '@/components/Tabs';
import UploadDropzone from '@/components/UploadDropzone';
import ResultCard from '@/components/ResultCard';
import { ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('upload-original');
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [recentResults, setRecentResults] = useState<any[]>([]);

  const fetchRecent = async () => {
    try {
      const res = await fetch('/api/results');
      const data = await res.json();
      if (data.success) {
        // Return latest 5
        setRecentResults(data.data.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to fetch recent results");
    }
  };

  // Fetch recent history initially and whenever an operation successfully occurs
  useEffect(() => {
    fetchRecent();
  }, [uploadSuccess, compareResult]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setUploadSuccess(false);
    setCompareResult(null);
  };

  const handleOriginalUploadSuccess = (response: any) => {
    setUploadSuccess(true);
  };

  const handleCompareSuccess = (response: any) => {
    console.log("Comparison Response:", response);
    setCompareResult(response.data);
  };

  return (
    <main className="min-h-screen bg-black text-gray-200 py-16 px-4 selection:bg-blue-500/30 overflow-hidden relative">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        
        {/* Header Setup */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent pb-2 drop-shadow-2xl">
            TraceGuard
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-base md:text-lg">
            AI-powered Content Leak Detection. Secure your proprietary assets using cryptographic perceptual hashing.
          </p>
        </div>

        {/* Custom Tabs */}
        <Tabs activeTab={activeTab} onChange={handleTabChange} />

        {/* Tab Subviews */}
        <div className="w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
          
          {activeTab === 'upload-original' && (
            <div className="space-y-6">
              <UploadDropzone
                endpoint="/api/upload-original"
                label="Store Authentic Source"
                onUploadSuccess={handleOriginalUploadSuccess}
              />
              {uploadSuccess && (
                <div className="max-w-xl mx-auto flex items-center justify-center space-x-3 text-green-400 bg-green-500/10 border border-green-500/20 p-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.1)] animate-in zoom-in-95 duration-300">
                  <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">Original content digested and Perceptual fingerprint securely stored.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'check-leak' && (
            <div className="space-y-8">
              <UploadDropzone
                endpoint="/api/compare"
                label="Analyze Suspected Leak"
                onUploadSuccess={handleCompareSuccess}
              />
              
              {compareResult && (
                <div className="max-w-3xl mx-auto animate-in zoom-in duration-500 ease-out fill-mode-both">
                  <ResultCard
                    suspectImageUrl={compareResult.suspectedFilePath}
                    matchedImageUrl={compareResult.matchedContentId?.filePath}
                    similarity={compareResult.similarity}
                    distance={compareResult.distance}
                    hash={compareResult.suspectHash}
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Recent Results Section */}
        <div className="mt-20 border-t border-gray-800/50 pt-10 relative z-10">
          <h3 className="text-lg font-semibold text-gray-300 mb-6 tracking-wide flex items-center before:w-8 before:h-px before:bg-gray-700 before:mr-4 after:flex-1 after:h-px after:bg-gray-700 after:ml-4">
            Recent Analysis Log
          </h3>
          
          <div className="space-y-3 max-w-2xl mx-auto">
            {recentResults.map((result, index) => (
              <div 
                key={result._id} 
                className="flex items-center justify-between p-4 bg-gray-900/30 backdrop-blur-sm border border-gray-800/60 rounded-2xl hover:bg-gray-800/50 hover:border-gray-600 transition-all duration-300 group animate-in slide-in-from-bottom border-b-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                
                <div className="flex items-center">
                  {/* Thumbnails */}
                  <div className="flex space-x-2 mr-5 shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/60 border border-gray-700 relative shadow-sm">
                      <img src={result.suspectedFilePath} alt="Suspect" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/60 border border-gray-700 relative shadow-sm">
                      {result.matchedContentId?.filePath ? (
                        <img src={result.matchedContentId.filePath} alt="Match" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600 font-bold text-center p-1">N/A</div>
                      )}
                    </div>
                    {/* Visual linkage */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center z-10 group-hover:rotate-90 transition-transform duration-500">
                      <div className="w-1 h-2 bg-gray-500 rounded-sm" />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-col">
                    <p className="text-gray-300 font-medium text-sm group-hover:text-blue-400 transition-colors">Leak Check Run</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(result.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>

                {/* Similarity Badge */}
                <div className={cn(
                  "px-4 py-1.5 rounded-xl border font-bold text-sm shadow-sm flex items-center ml-4",
                  result.similarity >= 80 ? "bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]" :
                  result.similarity >= 50 ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
                  "bg-red-500/10 border-red-500/30 text-red-500"
                )}>
                  {result.similarity}%
                </div>

              </div>
            ))}
            
            {recentResults.length === 0 && (
              <div className="text-center py-10 bg-gray-900/20 rounded-2xl border border-gray-800 border-dashed">
                <p className="text-gray-500 text-sm">No analysis runs recorded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
