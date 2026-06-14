import { notFound } from "next/navigation";
import { ArrowRight, Boxes, ClipboardCheck, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const modules: Record<string, { title: string; milestone: string }> = {
  dashboard: { title: "Dashboard", milestone: "After transactional data" },
  "buying-trips": { title: "Buying Trips", milestone: "Milestone 2" },
  inventory: { title: "Inventory", milestone: "Milestone 3" },
  drops: { title: "Drops", milestone: "Milestone 3" },
  orders: { title: "Orders", milestone: "Milestone 3" },
  payments: { title: "Payments", milestone: "Milestone 3" },
  "market-sales": { title: "Market Sales", milestone: "Milestone 4" },
  customers: { title: "Customers", milestone: "Milestone 3" },
  expenses: { title: "Expenses", milestone: "Milestone 3" },
  reports: { title: "Reports", milestone: "Milestone 4" },
  team: { title: "Team", milestone: "Milestone 2" },
  settings: { title: "Settings", milestone: "Milestone 2" },
};

export default async function ComingNextPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const item = modules[module];
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Badge variant="secondary">{item.milestone}</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {item.title}
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        This module is intentionally deferred until the Stock Buy Planner is
        verified. No placeholder transactions or fake dashboards are shown.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: ClipboardCheck,
            title: "Planner first",
            text: "Approve the financial assumptions before operational records begin.",
          },
          {
            icon: Boxes,
            title: "Real records",
            text: "Later screens will use actual buying, inventory and sales data.",
          },
          {
            icon: ShieldCheck,
            title: "Controlled rollout",
            text: "Authorization, audit logs and reconciliation remain part of each milestone.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="text-primary size-5" />
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              {text}
              <ArrowRight className="mt-4 size-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
