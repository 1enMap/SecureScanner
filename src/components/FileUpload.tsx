import React, { useCallback, useState } from 'react';
import { Upload, Shield, AlertCircle, CheckCircle2, FileWarning, Loader2, FileIcon } from 'lucide-react';
import { uploadFileForScanning, getScanStatus } from '../services/api';

interface ScanResult {
  fileName: string;
  fileSize: string;
  status: 'clean' | 'suspicious' | 'scanning' | 'error';
  timestamp: string;
  threats?: string[];
  scanId?: string;
}

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pollScanStatus = async (scanId: string, fileName: string, fileSize: string) => {
    try {
      const result = await getScanStatus(scanId);
      
      setScanResults(prev => prev.map(scan => 
        scan.scanId === scanId ? {
          ...scan,
          status: result.results.is_malicious ? 'suspicious' : 'clean',
          threats: result.results.threats_found,
        } : scan
      ));
    } catch (error) {
      setScanResults(prev => prev.map(scan => 
        scan.scanId === scanId ? {
          ...scan,
          status: 'error',
        } : scan
      ));
    }
  };

  const handleFileScan = async (file: File) => {
    setIsScanning(true);
    const timestamp = new Date().toLocaleString();
    
    try {
      const scanResult = await uploadFileForScanning(file);
      
      const newScanResult: ScanResult = {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        status: 'scanning',
        timestamp,
        scanId: scanResult.scan_id,
      };
      
      setScanResults(prev => [newScanResult, ...prev]);
      await pollScanStatus(scanResult.scan_id, file.name, formatFileSize(file.size));
    } catch (error) {
      setScanResults(prev => [{
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        status: 'error',
        timestamp,
      }, ...prev]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files[0]) {
      handleFileScan(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      handleFileScan(files[0]);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <div className="flex flex-col items-center gap-4">
            <div className="hidden sm:block">
              <span className="text-gray-700">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary w-full sm:w-auto"
              disabled={isScanning}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInput}
              disabled={isScanning}
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Files will be scanned for potential security threats
          </p>
        </div>
        
        {isScanning && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-sm font-medium text-gray-700">Processing file...</span>
            </div>
          </div>
        )}
      </div>

      {scanResults.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium flex items-center gap-2 text-gray-900">
              <Shield className="w-5 h-5 text-blue-600" />
              Scan Results
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {scanResults.map((result, index) => (
              <div
                key={index}
                className="p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    result.status === 'scanning' ? 'bg-blue-50' :
                    result.status === 'clean' ? 'bg-green-50' :
                    result.status === 'error' ? 'bg-gray-50' :
                    'bg-red-50'
                  }`}>
                    {result.status === 'scanning' ? (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : result.status === 'clean' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : result.status === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-gray-500" />
                    ) : (
                      <FileWarning className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 truncate">{result.fileName}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                        result.status === 'scanning' ? 'bg-blue-50 text-blue-700' :
                        result.status === 'clean' ? 'bg-green-50 text-green-700' :
                        result.status === 'error' ? 'bg-gray-50 text-gray-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                      <p className="text-sm text-gray-500">
                        {result.fileSize}
                      </p>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <p className="text-sm text-gray-500">
                        {result.timestamp}
                      </p>
                    </div>
                    {result.threats && result.threats.length > 0 && (
                      <div className="mt-2 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">
                          Threats detected:
                        </p>
                        <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                          {result.threats.map((threat, i) => (
                            <li key={i}>{threat}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}