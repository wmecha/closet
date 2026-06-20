"use server";

import { headers } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  createOrderAndInitialize,
  type CheckoutResult,
} from "@/lib/store/orders";
import { checkoutInputSchema } from "@/lib/store/schema";
import { isProductAvailable } from "@/lib/store/types";

/**
 * Re-check a single piece before adding it to the bag. Inventory can change
 * between page render and the click, so this is a best-effort guard. The
 * authoritative hold happens server side at checkout.
 */
export async function checkAvailability(
  productId: string,
): Promise<{ available: boolean }> {
  if (!isSupabaseConfigured()) return { available: true };

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("status, reserved_until")
    .eq("id", productId)
    .maybeSingle();

  if (!data) return { available: false };
  return {
    available: isProductAvailable({
      status: data.status,
      reservedUntil: data.reserved_until,
    }),
  };
}

async function resolveAppUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function startCheckout(input: unknown): Promise<CheckoutResult> {
  const parsed = checkoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check your details.",
    };
  }

  const appUrl = await resolveAppUrl();
  return createOrderAndInitialize(parsed.data, appUrl);
}
