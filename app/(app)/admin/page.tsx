import Link from "next/link";
import { Boxes, PackageCheck, ShoppingBag, Tags, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAdminStats } from "@/lib/store/admin-queries";
import { AdminNotConfigured } from "./not-configured";

export const metadata = { title: "Store admin" };

export default async function AdminHomePage() {
  if (!isSupabaseConfigured()) {
    return <AdminNotConfigured />;
  }

  const stats = await getAdminStats();

  const tiles = [
    { label: "Active drops", value: stats.activeDrops, icon: Tags },
    { label: "Available pieces", value: stats.availableProducts, icon: Boxes },
    { label: "Sold pieces", value: stats.soldProducts, icon: PackageCheck },
    { label: "Paid orders", value: stats.paidOrders, icon: ShoppingBag },
    { label: "Awaiting payment", value: stats.pendingOrders, icon: Truck },
  ];

  const links = [
    {
      href: "/admin/drops",
      title: "Drops",
      text: "Create, activate, and archive drops.",
    },
    {
      href: "/admin/products",
      title: "Products",
      text: "Add pieces, set images, mark sold.",
    },
    {
      href: "/admin/orders",
      title: "Orders",
      text: "View orders and update fulfilment.",
    },
    {
      href: "/admin/settings",
      title: "Settings",
      text: "Delivery fee and support contacts.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Badge variant="secondary">SHAWN Apparel</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Store admin
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Manage the storefront: drops, one of one products, and orders.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <Icon className="text-primary size-5" />
              <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              {label}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="text-base">{link.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {link.text}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
