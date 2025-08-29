
import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import { generateMetadata } from './services/geminiService';
import { MARKETPLACES } from './constants';
import type { StockAsset } from './types';

const App: React.FC = () => {
  const [marketplace, setMarketplace] = useState<string>(MARKETPLACES[0]);
  const [assets, setAssets] = useState<StockAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newAssets: StockAsset[] = files.map(file => ({
      id: file.name,
      file,
      title: '',
      description: '',
      keywords: '',
      marketplace: marketplace,
      status: 'pending',
    }));
    // Filter out duplicates based on ID (filename)
    setAssets(prevAssets => {
      const existingIds = new Set(prevAssets.map(a => a.id));
      const filteredNewAssets = newAssets.filter(a => !existingIds.has(a.id));
      return [...prevAssets, ...filteredNewAssets];
    });
  }, [marketplace]);

  const handleGenerateMetadata = async () => {
    if (!assets.some(a => a.status === 'pending')) {
      alert("All files have been processed. Upload new files to generate metadata.");
      return;
    }
    
    setIsGenerating(true);
    setGlobalError(null);

    const generationPromises = assets.map(async (asset) => {
      if (asset.status !== 'pending') {
        return asset;
      }
      
      try {
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, status: 'loading' } : a));
        const metadata = await generateMetadata(asset.file.name, marketplace);
        return { ...asset, ...metadata, marketplace, status: 'completed' } as StockAsset;
      } catch (error) {
        console.error(`Failed for ${asset.file.name}:`, error);
        return { 
            ...asset, 
            status: 'error', 
            errorMessage: error instanceof Error ? error.message : 'An unknown error occurred' 
        } as StockAsset;
      }
    });

    try {
        const updatedAssets = await Promise.all(generationPromises);
        setAssets(updatedAssets);
    } catch(e) {
        setGlobalError("A critical error occurred during batch processing.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleAssetChange = (id: string, field: keyof StockAsset, value: string) => {
    setAssets(prevAssets => prevAssets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };
  
  const handleExportCSV = () => {
    const itemsToExport = assets.filter(a => a.status === 'completed');
    if (itemsToExport.length === 0) {
      alert("No completed metadata to export.");
      return;
    }

    const headers = ["Filename", "Title", "Description", "Keywords", "Marketplace"];
    const csvRows = [
      headers.join(','),
      ...itemsToExport.map(item => [
        `"${item.file.name.replace(/"/g, '""')}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        `"${item.keywords.replace(/"/g, '""')}"`,
        `"${item.marketplace.replace(/"/g, '""')}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `stock_metadata_${marketplace.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasPendingFiles = assets.some(a => a.status === 'pending');
  const hasCompletedFiles = assets.some(a => a.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            Stock Asset Metadata Generator
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Automate your workflow. Generate titles, descriptions, and keywords in seconds with AI.
          </p>
        </header>

        {globalError && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{globalError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
          <div>
            <label htmlFor="marketplace" className="block text-sm font-medium text-slate-300 mb-2">1. Select Marketplace</label>
            <select
              id="marketplace"
              name="marketplace"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-600 bg-slate-800 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value)}
              disabled={isGenerating}
            >
              {MARKETPLACES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">2. Upload Assets</label>
             <FileUpload onFilesSelected={handleFilesSelected} disabled={isGenerating} />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 my-8">
            <button
                onClick={handleGenerateMetadata}
                disabled={!hasPendingFiles || isGenerating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-900 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
            >
                {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                ) : '✨ Generate Metadata'}
            </button>
            <button
                onClick={handleExportCSV}
                disabled={!hasCompletedFiles || isGenerating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Export CSV
            </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-200 mb-4">3. Review & Export</h2>
          <ResultsTable assets={assets} onAssetChange={handleAssetChange} />
        </div>
      </main>
    </div>
  );
};

export default App;
