import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { listOrders } from "@/lib/store/admin-queries";
import { formatKsh } from "@/lib/format";
import { AdminNotConfigured } from "../not-configured";
import { updateOrderStatus } from "../actions";

export const metadata = { title: "Orders" };

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  paid: "default",
  fulfilled: "default",
  awaiting_payment: "secondary",
  pending: "secondary",
  failed: "destructive",
  cancelled: "outline",
};

const fulfilmentOptions = [
  "awaiting_payment",
  "paid",
  "fulfilled",
  "cancelled",
  "failed",
];

export default async function AdminOrdersPage() {
  if (!isSupabaseConfigured()) return <AdminNotConfigured />;
  const orders = await listOrders();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin" className="text-muted-foreground text-sm">
        Back to admin
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Orders</h1>
      <p className="text-muted-foreground mt-2">
        The most recent 100 orders. Payment status is set automatically by
        Paystack verification. Use this to track fulfilment.
      </p>

      <div className="mt-8 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Pieces</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Fulfilment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-muted-foreground text-xs">
                      {order.customerPhone}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {order.deliveryLocation}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {(order.items ?? [])
                      .map((i) => i.titleSnapshot)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell>{formatKsh(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status] ?? "secondary"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {order.paystackReference ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <form
                      action={updateOrderStatus}
                      className="flex items-center justify-end gap-2"
                    >
                      <input type="hidden" name="id" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="border-input bg-background h-8 rounded-md border px-2 text-xs"
                      >
                        {fulfilmentOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" variant="outline">
                        Update
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
