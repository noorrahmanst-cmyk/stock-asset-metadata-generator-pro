
import React from 'react';
import type { StockAsset } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import FileIcon from './icons/FileIcon';

interface ResultsTableProps {
  assets: StockAsset[];
  onAssetChange: (id: string, field: keyof StockAsset, value: string) => void;
}

const StatusIndicator: React.FC<{ status: StockAsset['status']; error?: string }> = ({ status, error }) => {
  switch (status) {
    case 'loading':
      return <div className="flex items-center justify-center text-sky-400"><SpinnerIcon className="w-5 h-5" /></div>;
    case 'completed':
      return <div className="flex items-center justify-center text-green-400">✓</div>;
    case 'error':
      return <div className="flex items-center justify-center text-red-400" title={error}>!</div>;
    case 'pending':
    default:
      return <div className="flex items-center justify-center text-slate-500">-</div>;
  }
};

const ResultsTable: React.FC<ResultsTableProps> = ({ assets, onAssetChange }) => {
  if (assets.length === 0) {
    return (
      <div className="text-center py-10 px-4 border-2 border-dashed border-slate-700 rounded-lg mt-6">
        <FileIcon className="mx-auto h-12 w-12 text-slate-500" />
        <h3 className="mt-2 text-sm font-semibold text-slate-300">No files selected</h3>
        <p className="mt-1 text-sm text-slate-500">Upload your assets to begin.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow-lg ring-1 ring-slate-800 mt-6">
      <table className="min-w-full divide-y divide-slate-800">
        <thead className="bg-slate-800">
          <tr>
            <th scope="col" className="w-10 px-3 py-3.5 text-center text-sm font-semibold text-slate-300"></th>
            <th scope="col" className="w-1/4 min-w-[200px] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-300 sm:pl-6">Filename</th>
            <th scope="col" className="w-1/4 min-w-[200px] px-3 py-3.5 text-left text-sm font-semibold text-slate-300">Title</th>
            <th scope="col" className="w-1/2 min-w-[300px] px-3 py-3.5 text-left text-sm font-semibold text-slate-300">Description</th>
            <th scope="col" className="w-1/2 min-w-[300px] px-3 py-3.5 text-left text-sm font-semibold text-slate-300">Keywords</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900">
          {assets.map((asset) => (
            <tr key={asset.id} className="hover:bg-slate-800/50 transition-colors">
              <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">
                <StatusIndicator status={asset.status} error={asset.errorMessage} />
              </td>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-300 sm:pl-6 truncate" title={asset.file.name}>{asset.file.name}</td>
              <td className="px-3 py-4 text-sm text-slate-400">
                <input
                  type="text"
                  value={asset.title}
                  onChange={(e) => onAssetChange(asset.id, 'title', e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-md px-2 py-1 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                  disabled={asset.status === 'loading'}
                />
              </td>
              <td className="px-3 py-4 text-sm text-slate-400">
                 <textarea
                  value={asset.description}
                  onChange={(e) => onAssetChange(asset.id, 'description', e.target.value)}
                  className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-md px-2 py-1 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition resize-y"
                  disabled={asset.status === 'loading'}
                  rows={3}
                />
              </td>
              <td className="px-3 py-4 text-sm text-slate-400">
                 <textarea
                  value={asset.keywords}
                  onChange={(e) => onAssetChange(asset.id, 'keywords', e.target.value)}
                  className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-md px-2 py-1 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition resize-y"
                  disabled={asset.status === 'loading'}
                  rows={3}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;

