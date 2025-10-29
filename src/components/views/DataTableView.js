import React, { useState } from 'react';
import { ExportService } from '../../services/export/ExportService';

export const DataTableView = ({ processedData }) => {
  const [downloadFormat, setDownloadFormat] = useState('json');
  const [includeImages, setIncludeImages] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Processed Data Table</h2>
      
      {/* Dataset Download Section */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">Download Dataset</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Format Selector */}
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Export Format:
            </label>
            <div className="space-y-2">
              {['json', 'csv', 'xlsx', 'yaml'].map(format => (
                <label key={format} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={downloadFormat === format}
                    onChange={(e) => setDownloadFormat(e.target.value)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 uppercase">{format}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Include Images Checkbox */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="cursor-pointer"
              />
              <span className="text-sm font-medium text-blue-800">
                Include crack meter images (ZIP)
              </span>
            </label>
            {includeImages && (
              <p className="text-xs text-blue-600 mt-1 ml-6">
                Will download as ZIP with data file + images folder
              </p>
            )}
          </div>
          
          {/* Download Button */}
          <div>
            <button
              onClick={async () => {
                setIsDownloading(true);
                try {
                  await ExportService.downloadDataset(processedData, downloadFormat, includeImages);
                } catch (error) {
                  alert('Failed to download dataset. Please try again.');
                } finally {
                  setIsDownloading(false);
                }
              }}
              disabled={isDownloading}
              className={`w-full px-4 py-2 rounded font-medium transition-colors ${
                isDownloading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isDownloading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Preparing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Dataset
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-2 text-sm text-gray-600">
        <span className="inline-block w-4 h-4 bg-gray-50 border border-gray-300 align-middle mr-1"></span> Raw Data (direct calculations from readings)
        <span className="inline-block w-4 h-4 bg-slate-100 border border-gray-300 align-middle mr-1 ml-4"></span> Normalized Data (consistent across floors for analysis and interpretation)
        <div className="mt-1 text-xs">
          <strong>Note:</strong> Only normalized positions should be used for structural interpretation as they apply corrections for unified analysis across all floors.
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          {/* COPY THE ENTIRE TABLE STRUCTURE FROM ORIGINAL FILE */}
          {/* This includes thead and tbody with all the floor columns */}
          <thead>
            {/* ... */}
          </thead>
          <tbody>
            {/* ... */}
          </tbody>
        </table>
      </div>
    </div>
  );
};