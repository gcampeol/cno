"use client";

import { useMemo } from "react";

import { computeKpis } from "@/lib/aggregations";
import { mockObras } from "@/lib/mock-data";
import { KpiCard } from "@/components/kpi-card";

export function KpiRow() {
  const kpis = useMemo(() => computeKpis(mockObras), []);

  const cards = [
    { label: "Obras", value: kpis.obras },
    { label: "Metragem (m²)", value: kpis.metragemTotal },
    { label: "Responsáveis PJ", value: kpis.responsaveisPJ },
    { label: "Responsáveis PF", value: kpis.responsaveisPF },
    { label: "Obras ativas", value: kpis.obrasAtivas },
    { label: "Obras novas (12m)", value: kpis.obrasNovas },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <KpiCard key={card.label} label={card.label} value={card.value} />
      ))}
    </div>
  );
}
