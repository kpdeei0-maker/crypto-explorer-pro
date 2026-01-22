# Crypto URL Generator

Aplikacja webowa do pobierania listy kryptowalut i generowania pliku JSON z URL-ami do API kursów.

## 📋 Opis

Aplikacja pobiera listę najpopularniejszych kryptowalut z CoinPaprika, mapuje je do API Binance (priorytetowo) lub CoinPaprika, i generuje plik JSON w określonym formacie.

### Funkcje:
- **Konfigurowalna liczba kryptowalut** - możesz wybrać ile kryptowalut chcesz pobrać (1-5000)
- **Import istniejącego pliku JSON** - załaduj swój plik i pobierz tylko nowe kryptowaluty (bez duplikatów)
- **Automatyczne mapowanie API** - priorytet dla Binance, fallback do CoinPaprika
- **Filtrowanie** - automatyczne usuwanie wrapped/bridged tokenów
- **Eksport do JSON** - pobierz gotowy plik w wymaganym formacie

## 🖥️ Jak uruchomić na Windows

### Wymagania:
- **Node.js** (wersja 18 lub nowsza) - [Pobierz tutaj](https://nodejs.org/)
- **npm** (instaluje się automatycznie z Node.js)

### Kroki instalacji:

1. **Zainstaluj Node.js**
   - Pobierz instalator z https://nodejs.org/
   - Uruchom instalator i postępuj zgodnie z instrukcjami
   - Zaznacz opcję "Add to PATH" podczas instalacji

2. **Pobierz projekt**
   - Sklonuj repozytorium lub pobierz jako ZIP
   ```bash
   git clone <URL_REPOZYTORIUM>
   ```

3. **Otwórz terminal w folderze projektu**
   - Otwórz folder projektu w Eksploratorze Windows
   - Kliknij prawym przyciskiem myszy w pustym miejscu
   - Wybierz "Otwórz w terminalu" lub "Git Bash Here"
   
   Lub użyj Command Prompt:
   ```bash
   cd C:\sciezka\do\projektu
   ```

4. **Zainstaluj zależności**
   ```bash
   npm install
   ```

5. **Uruchom aplikację**
   ```bash
   npm run dev
   ```

6. **Otwórz przeglądarkę**
   - Aplikacja uruchomi się automatycznie lub
   - Otwórz http://localhost:5173 w przeglądarce

## 📁 Format pliku JSON

```json
[
  {
    "name": "Bitcoin",
    "symbol": "BTC",
    "type": "crypto",
    "currency": "USD",
    "url": "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
  },
  {
    "name": "Tether",
    "symbol": "USDT",
    "type": "stablecoin",
    "currency": "USD",
    "url": "https://api.binance.com/api/v3/ticker/price?symbol=USDTUSDT"
  },
  {
    "name": "Solana",
    "symbol": "SOL-USD",
    "type": "crypto",
    "currency": "USD",
    "url": "https://api.coinpaprika.com/v1/tickers/sol-solana"
  }
]
```

### Pola:
- `name` - Nazwa kryptowaluty
- `symbol` - Symbol (np. BTC, ETH)
- `type` - Typ: "crypto" lub "stablecoin"
- `currency` - Waluta bazowa (zawsze USD)
- `url` - URL do API z kursem

## 🔧 Użycie funkcji importu

1. Kliknij "Wybierz plik JSON"
2. Wybierz swój istniejący plik cryptocurrencies.json
3. Ustaw liczbę kryptowalut do pobrania
4. Kliknij "Pobierz kryptowaluty"
5. Aplikacja pobierze tylko te kryptowaluty, których nie ma w zaimportowanym pliku

## 📂 Struktura plików

```
src/Crypto-defaultassets/
├── components/
│   ├── CryptoTable.tsx    # Tabela z listą kryptowalut
│   └── StatsCard.tsx      # Karta statystyk
├── hooks/
│   └── useCryptoFetcher.ts # Logika pobierania i eksportu
├── pages/
│   └── CryptoGenerator.tsx # Główna strona aplikacji
├── types/
│   └── crypto.ts          # Definicje typów TypeScript
└── README.md              # Ten plik
```

## 🌐 Źródła danych

- **Lista kryptowalut**: [CoinPaprika API](https://api.coinpaprika.com/)
- **Kursy (priorytet)**: [Binance API](https://api.binance.com/)
- **Kursy (fallback)**: [CoinPaprika API](https://api.coinpaprika.com/)

## ⚠️ Uwagi

- Aplikacja wymaga połączenia z internetem
- Binance API może być niedostępne w niektórych regionach (użyj VPN)
- Maksymalna liczba kryptowalut: 5000
- Czas pobierania zależy od liczby kryptowalut i szybkości internetu

## 🛠️ Technologie

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
