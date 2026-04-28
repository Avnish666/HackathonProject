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
  const [scanSourceType, setScanSourceType] = useState<'reddit' | 'url' | 'blog'>('reddit');
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

          {activeTab === 'run-scan' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500 ease-out fill-mode-both">
              {/* Scan Controls */}
              <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-3xl p-6 shadow-xl max-w-3xl mx-auto">
                <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
                  <Search className="w-6 h-6 text-blue-400" />
                  Run External Scan
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <select 
                    value={scanSourceType}
                    onChange={(e: any) => setScanSourceType(e.target.value)}
                    className="bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full md:w-48 p-3"
                  >
                    <option value="reddit">Reddit (r/sports)</option>
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
                        className="bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3"
                      />
                    </div>
                  )}

                  <button 
                    onClick={handleRunScan}
                    disabled={isScanning || ((scanSourceType === 'url' || scanSourceType === 'blog') && !scanInputUrl)}
                    className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isScanning && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isScanning ? "Scanning..." : "Start Scan"}
                  </button>
                </div>
                {scanError && (
                  <p className="text-red-400 text-sm mt-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{scanError}</p>
                )}
              </div>

              {/* Scan Results */}
              {scanData && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 text-center">
                      <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Images Processed</p>
                      <p className="text-4xl font-black text-gray-200 mt-2">{scanData.processed}</p>
                    </div>
                    <div className={cn("border rounded-2xl p-5 text-center transition-colors duration-500", (scanData.leaks ?? scanData.leaksDetected ?? 0) > 0 ? "bg-red-500/10 border-red-500/30" : "bg-gray-900/60 border-gray-800")}>
                      <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Leaks Detected</p>
                      <p className={cn("text-4xl font-black mt-2", (scanData.leaks ?? scanData.leaksDetected ?? 0) > 0 ? "text-red-500" : "text-gray-200")}>{scanData.leaks ?? scanData.leaksDetected ?? 0}</p>
                    </div>
                  </div>

                  {/* List */}
                  {(scanData.matches || scanData.results) && (scanData.matches || scanData.results).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(scanData.matches || scanData.results).map((res: any, idx: number) => (
                        <div key={idx} className="animate-in zoom-in-95 fill-mode-both" style={{ animationDelay: `${idx * 100}ms`}}>
                          <ScanResultCard 
                            source_url={res.source_url}
                            similarity={res.similarity}
                            isLeak={res.isLeak}
                            confidence={res.confidence}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-900/20 rounded-3xl border border-gray-800 border-dashed max-w-3xl mx-auto">
                      <p className="text-gray-500 font-medium">No valid images found or processed from this source.</p>
                    </div>
                  )}
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
            {loadingRecent ? (
              <div className="text-center py-10 bg-gray-900/20 rounded-2xl border border-gray-800 border-dashed flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Loading recent results...</p>
              </div>
            ) : recentError ? (
              <div className="text-center py-10 bg-red-900/20 rounded-2xl border border-red-800 border-dashed">
                <p className="text-red-500 text-sm">{recentError}</p>
                <button 
                  onClick={fetchRecent}
                  className="mt-4 text-xs bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : recentResults.map((result, index) => (
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
            
            {!loadingRecent && !recentError && recentResults.length === 0 && (
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
