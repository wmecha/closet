"use client";

import { useMemo, useState } from "react";
import type { PlannerScenario } from "./schema";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { compareScenarios } from "@/lib/calculations/comparison";
import { cn } from "@/lib/utils";
import { formatKes } from "@/lib/format";

export function ComparisonPanel({
  scenarios,
}: {
  scenarios: PlannerScenario[];
}) {
  const candidates = scenarios.filter(
    (scenario) => scenario.status !== "archived",
  );
  const [selected, setSelected] = useState<string[]>(
    candidates.slice(0, 2).map((scenario) => scenario.id),
  );
  const comparison = useMemo(
    () =>
      compareScenarios(
        candidates.filter((scenario) => selected.includes(scenario.id)),
      ),
    [candidates, selected],
  );

  function toggle(id: string, checked: boolean) {
    setSelected((current) => {
      if (!checked) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  }

  const metrics = [
    [
      "Starting capital",
      (row: (typeof comparison.rows)[number]) =>
        formatKes(row.scenario.totalCapital),
    ],
    [
      "Stock budget",
      (row: (typeof comparison.rows)[number]) =>
        formatKes(row.scenario.plannedStockBudget),
    ],
    [
      "Operating expenses",
      (row: (typeof comparison.rows)[number]) =>
        formatKes(row.result.capital.operatingExpenses),
    ],
    [
      "Number of items",
      (row: (typeof comparison.rows)[number]) =>
        row.result.inventory.totalItems,
    ],
    [
      "Average buying cost",
      (row: (typeof comparison.rows)[number]) =>
        formatKes(row.result.inventory.averagePurchaseCost),
    ],
    [
      "Average landed cost",
      (row: (typeof comparison.rows)[number]) =>
        formatKes(row.result.inventory.averageLandedCost),
    ],
    [
      "Expected revenue",
      (row: (typeof comparison.rows)[number]) =>
        formatKes(row.result.revenue.realisedRevenue),
    ],
    [
      "Expected profit",
      (row: (typeof comparison.rows)[number]) =>
        formatKes(row.result.profit.netProfit),
    ],
    [
      "Net margin",
      (row: (typeof comparison.rows)[number]) =>
        `${row.result.profit.netMarginPercent}%`,
    ],
    [
      "Break-even sell-through",
      (row: (typeof comparison.rows)[number]) =>
        `${row.result.profit.breakEvenSellThroughPercent}%`,
    ],
    [
      "Expected unsold",
      (row: (typeof comparison.rows)[number]) =>
        row.result.inventory.unsoldItems,
    ],
    [
      "Expected damaged",
      (row: (typeof comparison.rows)[number]) =>
        row.result.inventory.damagedItems,
    ],
    [
      "Online / market mix",
      (row: (typeof comparison.rows)[number]) =>
        `${formatKes(row.result.revenue.onlineRevenue)} / ${formatKes(row.result.revenue.marketRevenue)}`,
    ],
    [
      "Cash-recovery point",
      (row: (typeof comparison.rows)[number]) =>
        `${row.result.capitalRecoveryPointPercent}%`,
    ],
  ] as const;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select up to four scenarios</CardTitle>
          <CardDescription>
            Comparison highlights relative strengths; it does not predict
            guaranteed success.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {candidates.map((scenario) => (
            <label
              key={scenario.id}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <Checkbox
                checked={selected.includes(scenario.id)}
                onCheckedChange={(value) => toggle(scenario.id, value === true)}
                disabled={
                  !selected.includes(scenario.id) && selected.length >= 4
                }
              />
              {scenario.name}
            </label>
          ))}
          {candidates.length < 2 ? (
            <p className="text-muted-foreground text-sm">
              Duplicate or create another scenario to compare alternatives.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {comparison.rows.length ? (
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-52">Metric</TableHead>
                  {comparison.rows.map((row) => (
                    <TableHead key={row.scenario.id} className="min-w-48">
                      {row.scenario.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map(([label, selector]) => (
                  <TableRow key={label}>
                    <TableCell className="font-medium">{label}</TableCell>
                    {comparison.rows.map((row) => {
                      const highlight =
                        (label === "Expected profit" &&
                          row.result.profit.netProfit ===
                            comparison.highlights.highestProfit) ||
                        (label === "Break-even sell-through" &&
                          row.result.profit.breakEvenSellThroughPercent ===
                            comparison.highlights.lowestBreakEven) ||
                        (label === "Starting capital" &&
                          row.scenario.totalCapital ===
                            comparison.highlights.lowestCapital) ||
                        (label === "Net margin" &&
                          row.result.profit.returnOnCapitalPercent ===
                            comparison.highlights.highestReturn);
                      return (
                        <TableCell
                          key={row.scenario.id}
                          className={cn(
                            "font-mono",
                            highlight &&
                              "bg-emerald-50 font-semibold text-emerald-800",
                          )}
                        >
                          {selector(row)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
