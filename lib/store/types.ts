export type DropStatus = "draft" | "active" | "archived";

export type ProductStatus = "available" | "reserved" | "sold" | "hidden";

export type StoreOrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "failed"
  | "cancelled"
  | "fulfilled";

export type Measurements = Record<string, string>;

export type Product = {
  id: string;
  dropId: string | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  size: string | null;
  category: string | null;
  condition: string | null;
  measurements: Measurements;
  images: string[];
  imageColor: string | null;
  status: ProductStatus;
  reservedUntil: string | null;
  soldAt: string | null;
};

export type Drop = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: DropStatus;
  launchDate: string | null;
  coverImageUrl: string | null;
};

export type DropWithProducts = Drop & {
  products: Product[];
};

export type StoreSettings = {
  deliveryFee: number;
  freeDeliveryThreshold: number | null;
  currencyCode: string;
  whatsappNumber: string;
  supportEmail: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  titleSnapshot: string;
  priceSnapshot: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryLocation: string;
  deliveryNotes: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  status: StoreOrderStatus;
  paystackReference: string | null;
  paidAt: string | null;
  createdAt: string;
  items?: OrderItem[];
};

/** Whether a product can currently be added to a cart and bought. */
export function isProductAvailable(
  product: Pick<Product, "status" | "reservedUntil">,
  now: Date = new Date(),
): boolean {
  if (product.status === "available") return true;
  if (product.status === "reserved") {
    // A lapsed reservation is effectively available again.
    return Boolean(
      product.reservedUntil && new Date(product.reservedUntil) < now,
    );
  }
  return false;
}
