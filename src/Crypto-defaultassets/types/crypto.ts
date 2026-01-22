export interface CryptoData {
  name: string;
  symbol: string;
  type: "crypto" | "stablecoin";
  currency: string;
  url: string;
  source: "binance" | "coinlore" | "coinpaprika";
}

export interface CryptoExportData {
  name: string;
  symbol: string;
  type: "crypto" | "stablecoin";
  currency: string;
  url: string;
}

export interface CoinPaprikaCoin {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  is_new: boolean;
  is_active: boolean;
  type: string;
}

export interface BinanceSymbol {
  symbol: string;
  price: string;
}
