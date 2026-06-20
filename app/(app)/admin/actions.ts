"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function parseImages(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseMeasurements(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) out[key.trim()] = rest.join(":").trim();
  }
  return out;
}

function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/drops");
  revalidatePath("/admin/products");
}

export async function createDrop(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const slugInput = String(formData.get("slug") ?? "").trim();
  const launchDate = String(formData.get("launch_date") ?? "").trim();

  await supabase.from("drops").insert({
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    description: String(formData.get("description") ?? "").trim(),
    status: String(formData.get("status") ?? "draft"),
    launch_date: launchDate ? new Date(launchDate).toISOString() : null,
    cover_image_url:
      String(formData.get("cover_image_url") ?? "").trim() || null,
  });

  revalidateStore();
}

export async function updateDropStatus(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;
  await supabase.from("drops").update({ status }).eq("id", id);
  revalidateStore();
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = Number(formData.get("price") ?? 0);
  if (!title || !Number.isFinite(priceRaw) || priceRaw < 0) return;
  const slugInput = String(formData.get("slug") ?? "").trim();
  const dropId = String(formData.get("drop_id") ?? "").trim();

  await supabase.from("products").insert({
    drop_id: dropId || null,
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    description: String(formData.get("description") ?? "").trim(),
    price: Math.round(priceRaw),
    size: String(formData.get("size") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    condition: String(formData.get("condition") ?? "").trim() || null,
    measurements: parseMeasurements(String(formData.get("measurements") ?? "")),
    images: parseImages(String(formData.get("images") ?? "")),
    image_color: String(formData.get("image_color") ?? "").trim() || null,
    status: String(formData.get("status") ?? "available"),
  });

  revalidateStore();
}

export async function updateProductStatus(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;

  const patch: Record<string, unknown> = { status };
  if (status === "sold") {
    patch.sold_at = new Date().toISOString();
    patch.reserved_until = null;
    patch.reserved_order_id = null;
  }
  if (status === "available") {
    patch.sold_at = null;
    patch.reserved_until = null;
    patch.reserved_order_id = null;
  }

  await supabase.from("products").update(patch).eq("id", id);
  revalidateStore();
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
}

export async function updateStoreSettings(formData: FormData) {
  const supabase = await createClient();
  const deliveryFee = Math.max(
    0,
    Math.round(Number(formData.get("delivery_fee") ?? 0)),
  );

  await supabase
    .from("store_settings")
    .update({
      delivery_fee: Number.isFinite(deliveryFee) ? deliveryFee : 0,
      whatsapp_number: String(formData.get("whatsapp_number") ?? "").trim(),
      support_email: String(formData.get("support_email") ?? "").trim(),
    })
    .eq("id", true);

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
