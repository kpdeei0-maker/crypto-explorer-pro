import { CryptoData } from "@/Crypto-defaultassets/types/crypto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CryptoTableProps {
  data: CryptoData[];
}

export function CryptoTable({ data }: CryptoTableProps) {
  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case "binance":
        return "default";
      case "coinpaprika":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <ScrollArea className="h-[500px] rounded-lg border border-border bg-card">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-12 text-muted-foreground">#</TableHead>
            <TableHead className="text-muted-foreground">Nazwa</TableHead>
            <TableHead className="text-muted-foreground">Symbol</TableHead>
            <TableHead className="text-muted-foreground">Typ</TableHead>
            <TableHead className="text-muted-foreground">Źródło</TableHead>
            <TableHead className="text-muted-foreground max-w-[300px]">URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((crypto, index) => (
            <TableRow 
              key={`${crypto.symbol}-${index}`} 
              className="border-border hover:bg-secondary/50"
            >
              <TableCell className="font-mono text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">{crypto.name}</TableCell>
              <TableCell className="font-mono text-primary">
                {crypto.symbol}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={crypto.type === "stablecoin" ? "outline" : "secondary"}
                  className={crypto.type === "stablecoin" ? "border-accent text-accent" : ""}
                >
                  {crypto.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getSourceBadgeVariant(crypto.source)}>
                  {crypto.source}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground max-w-[300px] truncate">
                {crypto.url}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
