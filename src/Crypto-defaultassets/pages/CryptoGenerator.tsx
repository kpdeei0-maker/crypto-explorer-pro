import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CryptoTable } from "@/Crypto-defaultassets/components/CryptoTable";
import { StatsCard } from "@/Crypto-defaultassets/components/StatsCard";
import { useCryptoFetcher } from "@/Crypto-defaultassets/hooks/useCryptoFetcher";
import { useGlobalStocksFetcher } from "@/Crypto-defaultassets/hooks/useGlobalStocksFetcher";
import { 
  Download, 
  RefreshCw, 
  Coins, 
  Database, 
  Zap,
  TrendingUp,
  Upload,
  X,
  FileJson,
  Building2,
  Globe,
  BarChart3,
  Gem
} from "lucide-react";

const CryptoGenerator = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    cryptoList,
    loading: cryptoLoading,
    progress: cryptoProgress,
    status: cryptoStatus,
    fetchCryptoData,
    exportToJson: exportCryptoJson,
    importFromJson,
    clearImport,
    importedCount,
    targetCount,
    setTargetCount,
    binanceCount,
    coinpaprikaCount
  } = useCryptoFetcher();

  const {
    stockList,
    loading: stockLoading,
    progress: stockProgress,
    status: stockStatus,
    fetchGlobalStocks,
    exportToJson: exportStocksJson,
    usCount,
    intlCount,
    etfCount,
    rawCount
  } = useGlobalStocksFetcher();

  const loading = cryptoLoading || stockLoading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromJson(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 5000) {
      setTargetCount(value);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Coins className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Crypto URL Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pobierz najpopularniejsze kryptowaluty i stablecoiny z automatycznym 
            mapowaniem do API Binance lub CoinPaprika
          </p>
        </div>

        {/* Settings Card */}
        <Card className="p-6 bg-card border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Count Input */}
            <div className="space-y-2">
              <Label htmlFor="count" className="text-muted-foreground">
                Liczba kryptowalut do pobrania
              </Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={5000}
                value={targetCount}
                onChange={handleCountChange}
                className="bg-background border-border"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Maksymalnie 5000 kryptowalut
              </p>
            </div>

            {/* Import JSON */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                Import istniejącego pliku JSON (opcjonalne)
              </Label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex-1 border-border"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Wybierz plik JSON
                </Button>
                {importedCount > 0 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={clearImport}
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {importedCount > 0 && (
                <p className="text-xs text-accent flex items-center gap-1">
                  <FileJson className="w-3 h-3" />
                  Zaimportowano {importedCount} kryptowalut - duplikaty zostaną pominięte
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            onClick={fetchCryptoData}
            disabled={loading}
            className="glow-primary text-lg px-8"
          >
            {cryptoLoading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Pobieranie...
              </>
            ) : (
              <>
                <Coins className="w-5 h-5 mr-2" />
                Pobierz kryptowaluty
              </>
            )}
          </Button>

          <Button
            size="lg"
            onClick={fetchGlobalStocks}
            disabled={loading}
            variant="secondary"
            className="text-lg px-8"
          >
            {stockLoading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Pobieranie...
              </>
            ) : (
              <>
                <Globe className="w-5 h-5 mr-2" />
                Pobierz spółki globalne
              </>
            )}
          </Button>
          
          {cryptoList.length > 0 && (
            <Button
              size="lg"
              variant="outline"
              onClick={exportCryptoJson}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg px-8"
            >
              <Download className="w-5 h-5 mr-2" />
              Eksportuj Crypto JSON
            </Button>
          )}

          {stockList.length > 0 && (
            <Button
              size="lg"
              variant="outline"
              onClick={exportStocksJson}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8"
            >
              <Download className="w-5 h-5 mr-2" />
              Eksportuj Stocks JSON
            </Button>
          )}
        </div>

        {/* Progress */}
        {cryptoLoading && (
          <Card className="p-6 bg-card border-border">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{cryptoStatus}</span>
                <span className="text-primary font-mono">{cryptoProgress}%</span>
              </div>
              <Progress value={cryptoProgress} className="h-2" />
            </div>
          </Card>
        )}

        {stockLoading && (
          <Card className="p-6 bg-card border-border">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{stockStatus}</span>
                <span className="text-primary font-mono">{stockProgress}%</span>
              </div>
              <Progress value={stockProgress} className="h-2" />
            </div>
          </Card>
        )}

        {/* Crypto Stats */}
        {cryptoList.length > 0 && (
          <>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              Statystyki kryptowalut
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Wszystkie" value={cryptoList.length} icon={Coins} accent />
              <StatsCard title="Binance API" value={binanceCount} icon={Zap} />
              <StatsCard title="CoinPaprika" value={coinpaprikaCount} icon={TrendingUp} />
              <StatsCard title="Stablecoiny" value={cryptoList.filter(c => c.type === "stablecoin").length} icon={Database} />
            </div>
          </>
        )}

        {/* Stock Stats */}
        {stockList.length > 0 && (
          <>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Statystyki spółek globalnych
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Spółki US" value={usCount} icon={Building2} accent />
              <StatsCard title="Spółki międzynarodowe" value={intlCount} icon={Globe} />
              <StatsCard title="ETFy" value={etfCount} icon={BarChart3} />
              <StatsCard title="Surowce" value={rawCount} icon={Gem} />
            </div>
          </>
        )}

        {/* Table */}
        {cryptoList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Lista kryptowalut
            </h2>
            <CryptoTable data={cryptoList} />
          </div>
        )}

        {/* Empty State */}
        {!loading && cryptoList.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <Coins className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Brak danych</h3>
            <p className="text-muted-foreground">
              Kliknij "Pobierz kryptowaluty" aby rozpocząć
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CryptoGenerator;
