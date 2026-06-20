import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { mapDrop, mapProduct, mapSettings } from "./mappers";
import { SAMPLE_DROP, SAMPLE_SETTINGS } from "./sample-data";
import type { DropWithProducts, Product, StoreSettings } from "./types";

/**
 * Public catalogue reads. When Supabase is configured these hit the database
 * with the anon key (row level security only exposes active drops and their
 * visible products). Otherwise the static sample edit is returned so the
 * storefront renders as a preview.
 */

export function isStorefrontLive(): boolean {
  return isSupabaseConfigured();
}

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!isSupabaseConfigured()) return SAMPLE_SETTINGS;
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  return mapSettings(data ?? null);
}

export async function getActiveDrop(): Promise<DropWithProducts | null> {
  if (!isSupabaseConfigured()) return SAMPLE_DROP;

  const supabase = await createClient();
  const { data: drop } = await supabase
    .from("drops")
    .select("*")
    .eq("status", "active")
    .order("sort_order", { ascending: false })
    .order("launch_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!drop) return null;

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("drop_id", drop.id)
    .neq("status", "hidden")
    .order("sort_order", { ascending: true });

  return {
    ...mapDrop(drop),
    products: (products ?? []).map(mapProduct),
  };
}

export async function getDropBySlug(
  slug: string,
): Promise<DropWithProducts | null> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_DROP.slug === slug ? SAMPLE_DROP : null;
  }

  const supabase = await createClient();
  const { data: drop } = await supabase
    .from("drops")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!drop) return null;

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("drop_id", drop.id)
    .neq("status", "hidden")
    .order("sort_order", { ascending: true });

  return {
    ...mapDrop(drop),
    products: (products ?? []).map(mapProduct),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_DROP.products.find((p) => p.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .neq("status", "hidden")
    .maybeSingle();

  return data ? mapProduct(data) : null;
}

export async function getRelatedProducts(
  product: Product,
  limit = 3,
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_DROP.products
      .filter((p) => p.slug !== product.slug)
      .slice(0, limit);
  }
  if (!product.dropId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("drop_id", product.dropId)
    .neq("status", "hidden")
    .neq("id", product.id)
    .limit(limit);

  return (data ?? []).map(mapProduct);
}
