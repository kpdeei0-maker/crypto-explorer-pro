export interface StockData {
  name: string;
  symbol: string;
  type: "stock" | "ETF" | "raw";
  currency: string;
  url: string;
  yahooUrl: string;
  source: "yahoo" | "stooq";
  region: "US" | "Europe" | "Asia" | "Emerging" | "Global";
}

export interface StockExportData {
  name: string;
  symbol: string;
  type: "stock" | "ETF" | "raw";
  currency: string;
  url: string;
  yahooUrl: string;
}

export interface FetchProgress {
  current: number;
  total: number;
  category: string;
}
