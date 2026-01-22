import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatsCard({ title, value, icon: Icon, accent }: StatsCardProps) {
  return (
    <Card className={`p-4 bg-card border-border ${accent ? "glow-primary" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${accent ? "bg-primary/20" : "bg-secondary"}`}>
          <Icon className={`w-5 h-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
}
