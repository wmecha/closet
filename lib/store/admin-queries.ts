import { createClient } from "@/lib/supabase/server";
import { mapDrop, mapOrder, mapProduct, mapSettings } from "./mappers";
import type { Drop, Order, Product, StoreSettings } from "./types";

/** Admin reads. Run behind authentication; RLS gives operators full access. */

export async function listDrops(): Promise<Drop[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("drops")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapDrop);
}

export async function listProducts(): Promise<
  (Product & { dropTitle: string | null })[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, drops(title)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    ...mapProduct(row),
    dropTitle:
      row.drops && typeof row.drops === "object"
        ? ((row.drops as { title?: string }).title ?? null)
        : null,
  }));
}

export async function listOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map(mapOrder);
}

export async function getStoreSettingsAdmin(): Promise<StoreSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  return mapSettings(data ?? null);
}

export async function getAdminStats(): Promise<{
  activeDrops: number;
  availableProducts: number;
  soldProducts: number;
  paidOrders: number;
  pendingOrders: number;
}> {
  const supabase = await createClient();
  const [drops, available, sold, paid, pending] = await Promise.all([
    supabase
      .from("drops")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "sold"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "awaiting_payment"),
  ]);
  return {
    activeDrops: drops.count ?? 0,
    availableProducts: available.count ?? 0,
    soldProducts: sold.count ?? 0,
    paidOrders: paid.count ?? 0,
    pendingOrders: pending.count ?? 0,
  };
}
