"use client";

import { useMemo, useState } from "react";
import type { PlannerScenario } from "./schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateScenario } from "@/lib/calculations/scenario";
import {
  calculateSensitivity,
  neutralSensitivity,
  scenarioPresets,
  type SensitivityAdjustments,
} from "@/lib/calculations/sensitivity";
import { formatKes } from "@/lib/format";

function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  return (
    <span className={positive ? "text-emerald-700" : "text-destructive"}>
      {positive ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

export function SensitivityPanel({ scenario }: { scenario: PlannerScenario }) {
  const [adjustments, setAdjustments] =
    useState<SensitivityAdjustments>(neutralSensitivity);
  const baseline = useMemo(() => calculateScenario(scenario), [scenario]);
  const simulated = useMemo(
    () => calculateSensitivity(scenario, adjustments),
    [scenario, adjustments],
  );

  function setNumber<K extends keyof SensitivityAdjustments>(
    key: K,
    value: SensitivityAdjustments[K],
  ) {
    setAdjustments((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Derived scenario presets</CardTitle>
          <CardDescription>
            These views adjust a copy of your inputs. Your saved scenario is
            never overwritten.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAdjustments(scenarioPresets.conservative)}
          >
            Conservative
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setAdjustments(scenarioPresets.expected)}
          >
            Expected
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setAdjustments(scenarioPresets.optimistic)}
          >
            Optimistic
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setAdjustments(neutralSensitivity)}
          >
            Reset
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom sensitivity test</CardTitle>
          <CardDescription>
            Stress the assumptions most likely to move during sourcing and
            selling.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Purchase costs", "purchaseCostChangePercent", [0, 5, 10, 20]],
            ["Selling prices", "sellingPriceChangePercent", [0, -5, -10, -20]],
            ["Transport costs", "transportCostChangePercent", [0, 5, 10, 20]],
            [
              "Additional seller cost",
              "commissionChangePercent",
              [0, 5, 10, 20],
            ],
            ["Damaged stock", "damagedStockChangePercent", [0, 2, 5, 10]],
            ["Shift online to market", "marketMixShiftPercent", [0, 5, 10, 20]],
          ].map(([label, key, options]) => (
            <div className="space-y-2" key={String(key)}>
              <Label>{label}</Label>
              <Select
                value={String(
                  adjustments[key as keyof SensitivityAdjustments] ?? 0,
                )}
                onValueChange={(value) =>
                  setNumber(
                    key as keyof SensitivityAdjustments,
                    Number(value) as never,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(options as number[]).map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option > 0 ? "+" : ""}
                      {option}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div className="space-y-2">
            <Label>Sell-through falls to</Label>
            <Select
              value={
                adjustments.sellThroughPercent === null
                  ? "baseline"
                  : String(adjustments.sellThroughPercent)
              }
              onValueChange={(value) =>
                setNumber(
                  "sellThroughPercent",
                  value === "baseline" ? null : Number(value),
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baseline">Baseline</SelectItem>
                {[90, 75, 60, 50].map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {[
          [
            "Revenue",
            formatKes(simulated.revenue.realisedRevenue),
            simulated.revenue.realisedRevenue -
              baseline.revenue.realisedRevenue,
            "",
          ],
          [
            "Gross profit",
            formatKes(simulated.profit.grossProfit),
            simulated.profit.grossProfit - baseline.profit.grossProfit,
            "",
          ],
          [
            "Net profit",
            formatKes(simulated.profit.netProfit),
            simulated.profit.netProfit - baseline.profit.netProfit,
            "",
          ],
          [
            "Net margin",
            `${simulated.profit.netMarginPercent}%`,
            simulated.profit.netMarginPercent -
              baseline.profit.netMarginPercent,
            " pts",
          ],
          [
            "Return on capital",
            `${simulated.profit.returnOnCapitalPercent}%`,
            simulated.profit.returnOnCapitalPercent -
              baseline.profit.returnOnCapitalPercent,
            " pts",
          ],
          [
            "Break-even",
            `${simulated.profit.breakEvenSellThroughPercent}%`,
            simulated.profit.breakEvenSellThroughPercent -
              baseline.profit.breakEvenSellThroughPercent,
            " pts",
          ],
        ].map(([label, value, delta, suffix]) => (
          <Card key={String(label)}>
            <CardContent className="pt-5">
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className="mt-2 font-mono text-lg font-semibold">{value}</p>
              <p className="mt-1 text-xs">
                <Delta value={Number(delta)} suffix={String(suffix)} /> vs
                baseline
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
