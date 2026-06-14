"use client";

import {
  AlertTriangle,
  Banknote,
  Boxes,
  Gauge,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScenarioResult } from "@/lib/calculations/scenario";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatKes } from "@/lib/format";

const metricIcons = [Banknote, Boxes, TrendingUp, Gauge];

export function ResultsPanel({
  result,
  compact = false,
}: {
  result: ScenarioResult;
  compact?: boolean;
}) {
  const metrics = [
    ["Expected revenue", formatKes(result.revenue.realisedRevenue)],
    ["Planned items", result.inventory.totalItems.toLocaleString()],
    ["Net projected profit", formatKes(result.profit.netProfit)],
    [
      "Break-even sell-through",
      `${result.profit.breakEvenSellThroughPercent}%`,
    ],
  ];
  const channelData = [
    { name: "Online", value: result.revenue.onlineRevenue },
    { name: "Market", value: result.revenue.marketRevenue },
    { name: "Clearance", value: result.revenue.clearanceRevenue },
  ];

  return (
    <div className="space-y-4">
      {result.warnings.map((warning) => (
        <Alert key={warning} variant="destructive">
          <AlertTriangle />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      ))}
      <div
        className={
          compact
            ? "grid gap-3 sm:grid-cols-2"
            : "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        }
      >
        {metrics.map(([label, value], index) => {
          const Icon = metricIcons[index];
          return (
            <Card key={label}>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium">
                    {label}
                  </p>
                  <Icon className="text-primary size-4" />
                </div>
                <p className="mt-2 font-mono text-xl font-semibold tracking-tight">
                  {value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!compact ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue by channel</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                initialDimension={{ width: 560, height: 256 }}
              >
                <BarChart data={channelData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={72} />
                  <ChartTooltip
                    formatter={(value) => formatKes(Number(value))}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-primary)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cash recovery stages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.cashRecovery.map((stage) => (
                <div key={stage.stagePercent}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span>{stage.stagePercent}% of expected sales</span>
                    <span className="font-mono font-medium">
                      {formatKes(stage.cashRecovered)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      Math.floor(
                        (stage.cashRecovered * 100) /
                          Math.max(1, result.capital.totalPlannedCashOutlay),
                      ),
                    )}
                  />
                </div>
              ))}
              <p className="text-muted-foreground text-xs">
                Original planned outlay is recovered at approximately{" "}
                <strong>{result.capitalRecoveryPointPercent}%</strong> of
                expected realised revenue.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financial summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {[
            ["Direct stock cost", result.inventory.directStockCost],
            ["Acquisition costs", result.inventory.acquisitionCosts],
            ["Average purchase cost", result.inventory.averagePurchaseCost],
            ["Average landed cost", result.inventory.averageLandedCost],
            ["Gross profit", result.profit.grossProfit],
            ["Seller commission", result.profit.sellerCommission],
            ["Payment charges", result.profit.paymentCharges],
            ["Break-even revenue", result.profit.breakEvenRevenue],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between border-b py-2 text-sm"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono font-medium">
                {formatKes(Number(value))}
              </span>
            </div>
          ))}
          {[
            ["Gross margin", result.profit.grossMarginPercent],
            ["Net margin", result.profit.netMarginPercent],
            ["Return on capital", result.profit.returnOnCapitalPercent],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between border-b py-2 text-sm"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono font-medium">{value}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-xs">
        These are planning estimates based on entered assumptions, not
        guaranteed business outcomes.
      </p>
    </div>
  );
}
