"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/use-count-up";

interface KpiCardProps {
  label: string;
  value: number;
}

export function KpiCard({ label, value }: KpiCardProps) {
  const animated = useCountUp(value);

  return (
    <Card className="transition-colors hover:border-border/80">
      <CardContent className="p-4 pt-4">
        <div className="font-mono text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
          {animated.toLocaleString("pt-BR")}
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}
