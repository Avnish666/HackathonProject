"use client";

import React, { useState, useEffect } from 'react';
import Tabs, { TabType } from '@/components/Tabs';
import UploadDropzone from '@/components/UploadDropzone';
import ResultCard from '@/components/ResultCard';
import ScanResultCard from '@/components/ScanResultCard';
import { ShieldCheck, Loader2, Search, Link as LinkIcon, Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('upload-original');
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  // Scan states
  const [scanSourceType, setScanSourceType] = useState<'unsplash' | 'url' | 'blog'>('unsplash');
  const [scanInputUrl, setScanInputUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanData, setScanData] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const fetchRecent = async () => {
    setLoadingRecent(true);
    setRecentError(null);
    try {
      const res = await fetch('/api/results');
      console.log('Results Fetch Status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Results Fetch Data:', data);

      if (data.success) {
        // Return latest 5
        setRecentResults(data.data.slice(0, 5));
      } else if (Array.isArray(data)) {
        setRecentResults(data.slice(0, 5));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setRecentError("Failed to fetch recent results");
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch recent history initially and whenever an operation successfully occurs
  useEffect(() => {
    if (mounted) {
      fetchRecent();
    }
  }, [mounted, uploadSuccess, compareResult]);

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

  const handleRunScan = async () => {
    setIsScanning(true);
    setScanData(null);
    setScanError(null);

    try {
      const payload: any = { source_type: scanSourceType };
      if (scanSourceType === 'url') {
        payload.urls = [scanInputUrl];
      } else if (scanSourceType === 'blog') {
        payload.blog_url = scanInputUrl;
      }

      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to run scan');
      }
      
      setScanData(data);
      fetchRecent();
    } catch (err: any) {
      setScanError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#E5E7EB] py-12 px-4 selection:bg-gray-700 overflow-hidden font-sans">
      <div className="max-w-[1100px] mx-auto space-y-12 relative z-10">
        
        {/* Header Setup */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white pb-1">
            TraceGuard
          </h1>
          <p className="text-[#9CA3AF] max-w-lg mx-auto text-base">
            High-precision content leak detection. Secure your assets using cryptographic perceptual hashing.
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

          {activeTab === 'run-scan' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500 ease-out fill-mode-both">
              {/* Scan Controls */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-sm max-w-[1100px] mx-auto">
                <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#9CA3AF]" />
                  Run External Scan
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <select 
                    value={scanSourceType}
                    onChange={(e: any) => setScanSourceType(e.target.value)}
                    className="bg-[#0B0F19] border border-[#1F2937] text-[#E5E7EB] text-sm rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500 block w-full md:w-48 p-2.5 outline-none"
                  >
                    <option value="unsplash">Unsplash API</option>
                    <option value="url">Direct URLs</option>
                    <option value="blog">Blog Scraping</option>
                  </select>

                  {(scanSourceType === 'url' || scanSourceType === 'blog') && (
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        {scanSourceType === 'url' ? <LinkIcon className="w-5 h-5 text-gray-500"/> : <Globe className="w-5 h-5 text-gray-500"/>}
                      </div>
                      <input 
                        type="text" 
                        value={scanInputUrl}
                        onChange={(e) => setScanInputUrl(e.target.value)}
                        placeholder={scanSourceType === 'url' ? "https://example.com/image.jpg" : "https://example-sports-blog.com"}
                        className="bg-[#0B0F19] border border-[#1F2937] text-[#E5E7EB] text-sm rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 p-2.5 outline-none"
                      />
                    </div>
                  )}

                  <button 
                    onClick={handleRunScan}
                    disabled={isScanning || ((scanSourceType === 'url' || scanSourceType === 'blog') && !scanInputUrl)}
                    className="flex-shrink-0 bg-white hover:bg-gray-100 text-black font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isScanning && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isScanning ? "Scanning..." : "Start Scan"}
                  </button>
                </div>
                {scanError && (
                  <p className="text-[#EF4444] text-sm mt-4 bg-[#EF4444]/10 p-3 rounded-lg border border-[#EF4444]/20">{scanError}</p>
                )}
              </div>

              {/* Scan Results */}
              {scanData && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4 max-w-[1100px] mx-auto">
                    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col justify-center items-start shadow-sm">
                      <p className="text-[#9CA3AF] text-xs uppercase tracking-wider font-semibold">Images Processed</p>
                      <p className="text-3xl font-semibold text-white mt-1">{scanData.processed}</p>
                    </div>
                    <div className={cn("rounded-xl p-5 border transition-colors flex flex-col justify-center items-start shadow-sm", (scanData.leaks ?? scanData.leaksDetected ?? 0) > 0 ? "bg-[#EF4444]/10 border-[#EF4444]/30" : "bg-[#111827] border-[#1F2937]")}>
                      <p className="text-[#9CA3AF] text-xs uppercase tracking-wider font-semibold">Leaks Detected</p>
                      <p className={cn("text-3xl font-semibold mt-1", (scanData.leaks ?? scanData.leaksDetected ?? 0) > 0 ? "text-[#EF4444]" : "text-white")}>{scanData.leaks ?? scanData.leaksDetected ?? 0}</p>
                    </div>
                  </div>

                  {/* List */}
                  {(scanData.matches || scanData.results) && (scanData.matches || scanData.results).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1100px] mx-auto">
                      {(scanData.matches || scanData.results).map((res: any, idx: number) => (
                        <div key={idx} className="animate-in fade-in fill-mode-both" style={{ animationDelay: `${idx * 50}ms`}}>
                          <ScanResultCard 
                            source_url={res.source_url}
                            similarity={res.similarity}
                            isLeak={res.isLeak}
                            confidence={res.confidence}
                            status={res.status}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-[#111827] rounded-xl border border-[#1F2937] border-dashed max-w-[1100px] mx-auto">
                      <p className="text-[#9CA3AF] font-medium text-sm">No valid images found or processed from this source.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Recent Results Section */}
        <div className="mt-16 pt-10 relative z-10">
          <h3 className="text-lg font-semibold text-white mb-6">
            Recent Analysis Log
          </h3>
          
          <div className="space-y-3">
            {loadingRecent ? (
              <div className="text-center py-10 bg-[#111827] rounded-xl border border-[#1F2937] border-dashed flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#9CA3AF] animate-spin mb-3" />
                <p className="text-[#9CA3AF] text-sm">Loading recent results...</p>
              </div>
            ) : recentError ? (
              <div className="text-center py-10 bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/30 border-dashed">
                <p className="text-[#EF4444] text-sm">{recentError}</p>
                <button 
                  onClick={fetchRecent}
                  className="mt-3 text-xs bg-[#EF4444]/20 text-[#EF4444] px-4 py-2 rounded-lg hover:bg-[#EF4444]/30 transition-colors font-medium"
                >
                  Retry
                </button>
              </div>
            ) : recentResults.map((result, index) => (
              <div 
                key={result._id} 
                className="flex items-center justify-between p-4 bg-[#111827] border border-[#1F2937] rounded-xl hover:border-gray-600 transition-all duration-300 group animate-in fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                
                <div className="flex items-center">
                  {/* Thumbnails */}
                  <div className="flex space-x-2 mr-5 shrink-0 relative group-hover:scale-[1.02] transition-transform duration-300">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#0B0F19] border border-[#1F2937] relative">
                      <img src={result.suspectedFilePath} alt="Suspect" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#0B0F19] border border-[#1F2937] relative">
                      {result.matchedContentId?.filePath ? (
                        <img src={result.matchedContentId.filePath} alt="Match" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-[#9CA3AF] font-semibold text-center p-1">N/A</div>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-col">
                    <p className="text-[#E5E7EB] font-medium text-sm group-hover:text-white transition-colors">Leak Check Run</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{new Date(result.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>

                {/* Similarity Badge */}
                <div className={cn(
                  "px-3 py-1 rounded-md border font-semibold text-xs shadow-sm flex items-center ml-4",
                  result.similarity >= 85 ? "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]" :
                  result.similarity >= 60 ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]" :
                  "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]"
                )}>
                  {result.similarity}%
                </div>

              </div>
            ))}
            
            {!loadingRecent && !recentError && recentResults.length === 0 && (
              <div className="text-center py-10 bg-[#111827] rounded-xl border border-[#1F2937] border-dashed">
                <p className="text-[#9CA3AF] text-sm">No analysis runs recorded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
