import { useState, useCallback } from "react";
import { StockData, StockExportData } from "@/Crypto-defaultassets/types/stocks";
import { US_STOCKS } from "@/Crypto-defaultassets/data/usStocks";
import { EUROPEAN_STOCKS, ASIAN_STOCKS, EMERGING_STOCKS } from "@/Crypto-defaultassets/data/internationalStocks";
import { GLOBAL_ETFS } from "@/Crypto-defaultassets/data/etfs";
import { COMMODITIES } from "@/Crypto-defaultassets/data/commodities";

const BATCH_SIZE = 100;

export function useGlobalStocksFetcher() {
  const [stockList, setStockList] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const generateYahooUrl = (symbol: string): string => {
    const cleanSymbol = symbol.replace(/\./g, "-");
    return `https://finance.yahoo.com/quote/${cleanSymbol}/`;
  };

  const generateStooqUrl = (symbol: string, suffix: string = ".US"): string => {
    const stooqSymbol = symbol.toLowerCase() + suffix.toLowerCase();
    return `https://stooq.com/q/?s=${stooqSymbol}`;
  };

  const processBatch = async (
    items: Array<{ symbol: string; name: string; suffix?: string }>,
    type: "stock" | "ETF" | "raw",
    region: "US" | "Europe" | "Asia" | "Emerging" | "Global",
    startProgress: number,
    endProgress: number
  ): Promise<StockData[]> => {
    const results: StockData[] = [];
    const uniqueSymbols = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const suffix = (item as any).suffix || ".US";
      const symbol = type === "raw" ? item.symbol : `${item.symbol}${suffix}`;
      
      // Skip duplicates
      const baseSymbol = item.symbol.toUpperCase();
      if (uniqueSymbols.has(baseSymbol)) continue;
      uniqueSymbols.add(baseSymbol);

      const yahooUrl = generateYahooUrl(item.symbol);
      const stooqUrl = generateStooqUrl(item.symbol, suffix);

      results.push({
        name: item.name,
        symbol: symbol.toUpperCase(),
        type,
        currency: "USD",
        url: stooqUrl,
        yahooUrl,
        source: "yahoo",
        region
      });

      // Update progress every batch
      if (i % BATCH_SIZE === 0) {
        const batchProgress = startProgress + ((i / items.length) * (endProgress - startProgress));
        setProgress(Math.floor(batchProgress));
        await new Promise(resolve => setTimeout(resolve, 0)); // Allow UI update
      }
    }

    return results;
  };

  const fetchGlobalStocks = useCallback(async () => {
    setLoading(true);
    setProgress(0);
    setStockList([]);

    try {
      const allResults: StockData[] = [];

      // US Stocks (0-20%)
      setStatus("Pobieranie spółek amerykańskich (S&P 500, NASDAQ, Russell)...");
      const usStocks = await processBatch(
        US_STOCKS.slice(0, 2000),
        "stock",
        "US",
        0, 20
      );
      allResults.push(...usStocks);
      setProgress(20);

      // European Stocks (20-40%)
      setStatus("Pobieranie spółek europejskich (FTSE, DAX, CAC, SMI)...");
      const euStocks = await processBatch(
        EUROPEAN_STOCKS,
        "stock",
        "Europe",
        20, 35
      );
      allResults.push(...euStocks);

      // Asian Stocks (35-50%)
      setStatus("Pobieranie spółek azjatyckich (Nikkei, Hang Seng, KOSPI)...");
      const asiaStocks = await processBatch(
        ASIAN_STOCKS,
        "stock",
        "Asia",
        35, 50
      );
      allResults.push(...asiaStocks);

      // Emerging Markets (50-65%)
      setStatus("Pobieranie spółek z rynków wschodzących...");
      const emStocks = await processBatch(
        EMERGING_STOCKS,
        "stock",
        "Emerging",
        50, 65
      );
      allResults.push(...emStocks);
      setProgress(65);

      // ETFs (65-85%)
      setStatus("Pobieranie ETFów globalnych...");
      const etfData = GLOBAL_ETFS.slice(0, 2000).map(e => ({ ...e, suffix: "" }));
      const etfs = await processBatch(
        etfData,
        "ETF",
        "Global",
        65, 85
      );
      allResults.push(...etfs);
      setProgress(85);

      // Commodities (85-100%)
      setStatus("Pobieranie surowców...");
      const commodityData = COMMODITIES.slice(0, 500).map(c => ({ 
        symbol: c.symbol, 
        name: c.name, 
        suffix: "" 
      }));
      const commodities = await processBatch(
        commodityData,
        "raw",
        "Global",
        85, 100
      );
      allResults.push(...commodities);

      setStockList(allResults);
      setStatus(`Pobrano ${allResults.length} aktywów (${usStocks.length} US, ${euStocks.length + asiaStocks.length + emStocks.length} międzynarodowych, ${etfs.length} ETFów, ${commodities.length} surowców)`);
      setProgress(100);

    } catch (error) {
      console.error("Error fetching stocks:", error);
      setStatus("Błąd podczas pobierania danych");
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToJson = useCallback(() => {
    const exportData: StockExportData[] = stockList.map(({ name, symbol, type, currency, url, yahooUrl }) => ({
      name,
      symbol,
      type,
      currency,
      url,
      yahooUrl
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "global_stocks.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [stockList]);

  return {
    stockList,
    loading,
    progress,
    status,
    fetchGlobalStocks,
    exportToJson,
    usCount: stockList.filter(s => s.region === "US" && s.type === "stock").length,
    intlCount: stockList.filter(s => s.region !== "US" && s.region !== "Global" && s.type === "stock").length,
    etfCount: stockList.filter(s => s.type === "ETF").length,
    rawCount: stockList.filter(s => s.type === "raw").length
  };
}
