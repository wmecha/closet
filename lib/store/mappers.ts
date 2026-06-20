import type { Drop, Order, OrderItem, Product, StoreSettings } from "./types";

type Row = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

export function mapProduct(row: Row): Product {
  return {
    id: asString(row.id),
    dropId: asStringOrNull(row.drop_id),
    title: asString(row.title),
    slug: asString(row.slug),
    description: asString(row.description),
    price: asNumber(row.price),
    currency: asString(row.currency, "KES"),
    size: asStringOrNull(row.size),
    category: asStringOrNull(row.category),
    condition: asStringOrNull(row.condition),
    measurements:
      row.measurements && typeof row.measurements === "object"
        ? (row.measurements as Record<string, string>)
        : {},
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    imageColor: asStringOrNull(row.image_color),
    status: asString(row.status, "available") as Product["status"],
    reservedUntil: asStringOrNull(row.reserved_until),
    soldAt: asStringOrNull(row.sold_at),
  };
}

export function mapDrop(row: Row): Drop {
  return {
    id: asString(row.id),
    title: asString(row.title),
    slug: asString(row.slug),
    description: asString(row.description),
    status: asString(row.status, "draft") as Drop["status"],
    launchDate: asStringOrNull(row.launch_date),
    coverImageUrl: asStringOrNull(row.cover_image_url),
  };
}

export function mapSettings(row: Row | null): StoreSettings {
  return {
    deliveryFee: asNumber(row?.delivery_fee),
    freeDeliveryThreshold:
      typeof row?.free_delivery_threshold === "number"
        ? row.free_delivery_threshold
        : null,
    currencyCode: asString(row?.currency_code, "KES"),
    whatsappNumber: asString(row?.whatsapp_number),
    supportEmail: asString(row?.support_email),
  };
}

export function mapOrderItem(row: Row): OrderItem {
  return {
    id: asString(row.id),
    productId: asString(row.product_id),
    titleSnapshot: asString(row.title_snapshot),
    priceSnapshot: asNumber(row.price_snapshot),
  };
}

export function mapOrder(row: Row): Order {
  return {
    id: asString(row.id),
    customerName: asString(row.customer_name),
    customerEmail: asString(row.customer_email),
    customerPhone: asString(row.customer_phone),
    deliveryLocation: asString(row.delivery_location),
    deliveryNotes: asString(row.delivery_notes),
    subtotal: asNumber(row.subtotal),
    deliveryFee: asNumber(row.delivery_fee),
    total: asNumber(row.total),
    currency: asString(row.currency, "KES"),
    status: asString(row.status, "pending") as Order["status"],
    paystackReference: asStringOrNull(row.paystack_reference),
    paidAt: asStringOrNull(row.paid_at),
    createdAt: asString(row.created_at),
    items: Array.isArray(row.order_items)
      ? (row.order_items as Row[]).map(mapOrderItem)
      : undefined,
  };
}
