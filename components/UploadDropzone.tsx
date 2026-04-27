"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UploadDropzoneProps {
  endpoint: '/api/upload-original' | '/api/compare';
  onUploadSuccess: (data: any) => void;
  label: string;
}

export default function UploadDropzone({ endpoint, onUploadSuccess, label }: UploadDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    } else {
      setError('Please select a valid image file. Videos/Documents are not supported.');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image.');
      }

      onUploadSuccess(result);
      clearFile();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred on the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto backdrop-blur-xl bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 shadow-2xl transition-all duration-300 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="text-center mb-6 relative z-10">
        <h2 className="text-xl font-semibold text-gray-100">{label}</h2>
        <p className="text-sm text-gray-400 mt-1">Select or drop a high-res image below</p>
      </div>

      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative z-10 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group text-gray-400 bg-gray-800/30",
            isDragActive 
              ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
              : "border-gray-600 hover:border-gray-400 hover:bg-gray-700/40"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
          />
          <UploadCloud className={cn(
            "w-12 h-12 mb-4 transition-all duration-300", 
            isDragActive ? "scale-110 text-blue-500" : "group-hover:-translate-y-1"
          )} />
          <p className="text-sm font-medium">Click to select or drag and drop</p>
          <p className="text-xs mt-2 text-gray-500">JPG, PNG, WEBP (Max 10MB)</p>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center p-4 border border-gray-700 rounded-xl bg-gray-800/50 shadow-inner">
          <button 
            title="Remove File" 
            onClick={clearFile}
            className="absolute top-2 right-2 p-1.5 bg-gray-900/60 hover:bg-red-500/90 rounded-full text-white transition-colors z-20"
          >
            <X size={16} />
          </button>
          
          <div className="w-full h-48 relative rounded-lg overflow-hidden border border-gray-700 mb-4 bg-gray-900">
            <img 
               src={previewUrl!} 
               alt="Preview" 
               className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="flex items-center w-full justify-between bg-gray-900/60 rounded-lg p-3 border border-gray-800">
             <div className="flex items-center space-x-3 overflow-hidden">
                <ImageIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-300 truncate font-medium">{file.name}</span>
             </div>
          </div>
          
          <button
             onClick={handleUpload}
             disabled={isLoading}
             className={cn(
                "w-full mt-4 flex justify-center items-center py-3 px-4 rounded-lg font-medium transition-all duration-200",
                isLoading 
                ? "bg-blue-600/50 cursor-not-allowed text-white/70"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-500/30 active:scale-[0.98]"
             )}
          >
             {isLoading ? (
               <div className="flex items-center">
                 <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin mr-2" />
                 Processing Analysis...
               </div>
             ) : (
               'Upload & Process'
             )}
          </button>
        </div>
      )}

      {error && (
        <div className="relative z-10 mt-4 flex items-start p-3 text-sm text-red-300 bg-red-950/50 border border-red-900/50 rounded-lg animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
