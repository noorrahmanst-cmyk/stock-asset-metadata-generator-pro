
export type AssetStatus = 'pending' | 'loading' | 'completed' | 'error';

export interface StockAsset {
  id: string; // Using filename as a unique ID for simplicity
  file: File;
  title: string;
  description: string;
  keywords: string;
  marketplace: string;
  status: AssetStatus;
  errorMessage?: string;
}
