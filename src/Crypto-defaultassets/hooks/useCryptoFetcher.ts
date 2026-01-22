import { useState, useCallback } from "react";
import { CryptoData, CryptoExportData, CoinPaprikaCoin, BinanceSymbol } from "@/Crypto-defaultassets/types/crypto";

// Extended list of stablecoins
const STABLECOINS = [
  "USDT", "USDC", "DAI", "BUSD", "TUSD", "USDP", "USDD", "GUSD", 
  "FRAX", "LUSD", "SUSD", "MIM", "CRVUSD", "GHO", "PYUSD", "FDUSD",
  "XAUT", "PAXG", "EURT", "EUROC", "EURS", "USDJ", "UST", "USTC",
  "CUSD", "SEUR", "CADC", "TRYB", "BIDR", "IDRT", "BRZ", "XSGD",
  "HUSD", "RSR", "FEI", "TRIBE", "RAI", "DOLA", "ALUSD", "OUSD",
  "AGEUR", "JEUR", "PAR", "CEUR", "SAUD", "XIDR", "ZUSD", "USDX",
  "VST", "RUSD", "DUSD", "HAY", "USDN", "USDH", "USDK", "USDQ"
];

// Asset-backed tokens (gold, silver, etc.)
const ASSET_BACKED = [
  "XAUT", "PAXG", "DGX", "PMGT", "AWG", "GLC", "CACHE", "KILO",
  "SLVT", "XAGC", "OILK", "PLTC"
];

const WRAPPED_STAKED_KEYWORDS = [
  "wrapped", "bridged", "wormhole", "peg", "iou", "heco", "bep2",
  "wbtc", "weth", "wbnb", "wmatic", "wavax", "wsol"
];

// Exclude these patterns but keep staked tokens that are actual projects
const EXCLUDE_PATTERNS = [
  "test", "demo", "fake", "scam", "old", "legacy", "v1", "v2"
];

export function useCryptoFetcher() {
  const [cryptoList, setCryptoList] = useState<CryptoData[]>([]);
  const [importedList, setImportedList] = useState<CryptoExportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [binanceSymbols, setBinanceSymbols] = useState<Set<string>>(new Set());
  const [targetCount, setTargetCount] = useState(1000);

  const isWrappedOrBridged = (name: string, symbol: string): boolean => {
    const lowerName = name.toLowerCase();
    const lowerSymbol = symbol.toLowerCase();
    
    if (lowerName.startsWith("wrapped ") || lowerName.includes(" wrapped")) return true;
    if (lowerName.startsWith("bridged ")) return true;
    if (WRAPPED_STAKED_KEYWORDS.some(kw => lowerSymbol === kw)) return true;
    if (lowerName.includes("wormhole") || lowerName.includes("(portal)")) return true;
    if (EXCLUDE_PATTERNS.some(p => lowerName.includes(p))) return true;
    
    return false;
  };

  const normalizeSymbol = (symbol: string): string => {
    return symbol.replace(/-USD$/i, "").toUpperCase();
  };

  const fetchBinanceSymbols = async (): Promise<Set<string>> => {
    try {
      setStatus("Pobieranie symboli z Binance...");
      const response = await fetch("https://api.binance.com/api/v3/ticker/price");
      const data: BinanceSymbol[] = await response.json();
      
      const symbols = new Set<string>();
      data.forEach(item => {
        if (item.symbol.endsWith("USDT")) {
          symbols.add(item.symbol.replace("USDT", ""));
        }
      });
      
      setBinanceSymbols(symbols);
      return symbols;
    } catch (error) {
      console.error("Error fetching Binance symbols:", error);
      return new Set();
    }
  };

  const fetchCoinPaprikaCoins = async (count: number): Promise<CoinPaprikaCoin[]> => {
    setStatus("Pobieranie listy kryptowalut z CoinPaprika...");
    const response = await fetch("https://api.coinpaprika.com/v1/coins");
    const data: CoinPaprikaCoin[] = await response.json();
    
    return data
      .filter(coin => coin.is_active)
      .filter(coin => coin.type === "coin" || coin.type === "token")
      .filter(coin => !isWrappedOrBridged(coin.name, coin.symbol))
      .slice(0, count + 500);
  };

  const generateCryptoUrl = (
    symbol: string, 
    coinId: string, 
    binanceSet: Set<string>
  ): { url: string; source: "binance" | "coinlore" | "coinpaprika" } => {
    const upperSymbol = symbol.toUpperCase();
    
    if (binanceSet.has(upperSymbol)) {
      return {
        url: `https://api.binance.com/api/v3/ticker/price?symbol=${upperSymbol}USDT`,
        source: "binance"
      };
    }
    
    return {
      url: `https://api.coinpaprika.com/v1/tickers/${coinId}`,
      source: "coinpaprika"
    };
  };

  const fetchCryptoData = useCallback(async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      // Create set of imported symbols for deduplication
      const importedSymbols = new Set<string>();
      importedList.forEach(item => {
        importedSymbols.add(normalizeSymbol(item.symbol));
      });
      
      console.log(`Imported ${importedSymbols.size} symbols for deduplication:`, [...importedSymbols].slice(0, 10));
      
      const binanceSet = await fetchBinanceSymbols();
      setProgress(20);
      
      // Calculate how many new cryptos we need
      const neededCount = targetCount - importedList.length;
      
      if (neededCount <= 0) {
        // Already have enough from import
        const resultsFromImport: CryptoData[] = importedList.map(item => {
          let source: "binance" | "coinlore" | "coinpaprika" = "coinpaprika";
          if (item.url.includes("binance.com")) source = "binance";
          else if (item.url.includes("coinlore.com")) source = "coinlore";
          
          return {
            name: item.name,
            symbol: item.symbol,
            type: item.type,
            currency: item.currency,
            url: item.url,
            source
          };
        });
        
        setCryptoList(resultsFromImport.slice(0, targetCount));
        setStatus(`Masz już ${importedList.length} kryptowalut z importu (docelowo: ${targetCount})`);
        setProgress(100);
        setLoading(false);
        return;
      }
      
      const coins = await fetchCoinPaprikaCoins(neededCount);
      setProgress(50);
      
      setStatus("Mapowanie URL-i API (pomijam duplikaty z importu)...");
      
      const results: CryptoData[] = [];
      const uniqueSymbols = new Set<string>(importedSymbols); // Start with imported symbols
      let addedCount = 0;
      
      for (let i = 0; i < coins.length && addedCount < neededCount; i++) {
        const coin = coins[i];
        const upperSymbol = coin.symbol.toUpperCase();
        
        // Skip if already in imported list or already added
        if (uniqueSymbols.has(upperSymbol)) {
          continue;
        }
        uniqueSymbols.add(upperSymbol);
        
        const { url, source } = generateCryptoUrl(coin.symbol, coin.id, binanceSet);
        const isStablecoin = STABLECOINS.includes(upperSymbol) || ASSET_BACKED.includes(upperSymbol);
        
        results.push({
          name: coin.name,
          symbol: source === "binance" ? upperSymbol : `${upperSymbol}-USD`,
          type: isStablecoin ? "stablecoin" : "crypto",
          currency: "USD",
          url,
          source
        });
        
        addedCount++;
        setProgress(50 + Math.floor((addedCount / neededCount) * 50));
      }
      
      // Only set the NEW cryptocurrencies (not the imported ones)
      setCryptoList(results);
      setStatus(`Pobrano ${results.length} NOWYCH kryptowalut (pominięto ${importedSymbols.size} z importu)`);
      setProgress(100);
      
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      setStatus("Błąd podczas pobierania danych");
    } finally {
      setLoading(false);
    }
  }, [targetCount, importedList]);

  const importFromJson = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: CryptoExportData[] = JSON.parse(content);
        
        // Validate structure
        if (!Array.isArray(data)) {
          throw new Error("Invalid JSON format - expected array");
        }
        
        const validData = data.filter(item => 
          item.name && item.symbol && item.type && item.currency && item.url
        );
        
        setImportedList(validData);
        setStatus(`Zaimportowano ${validData.length} kryptowalut z pliku`);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setStatus("Błąd podczas parsowania pliku JSON");
      }
    };
    reader.readAsText(file);
  }, []);

  const clearImport = useCallback(() => {
    setImportedList([]);
    setStatus("Wyczyszczono zaimportowane dane");
  }, []);

  const exportToJson = useCallback(() => {
    const exportData: CryptoExportData[] = cryptoList.map(({ name, symbol, type, currency, url }) => ({
      name,
      symbol,
      type,
      currency,
      url
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: "application/json" 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cryptocurrencies.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [cryptoList]);

  return {
    cryptoList,
    loading,
    progress,
    status,
    fetchCryptoData,
    exportToJson,
    importFromJson,
    clearImport,
    importedCount: importedList.length,
    targetCount,
    setTargetCount,
    binanceCount: cryptoList.filter(c => c.source === "binance").length,
    coinpaprikaCount: cryptoList.filter(c => c.source === "coinpaprika").length
  };
}
