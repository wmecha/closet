import type { DropWithProducts, Product, StoreSettings } from "./types";

/**
 * Static catalogue used when Supabase is not configured, so the storefront is
 * viewable immediately as an editorial preview. Mirrors the seed data. Checkout
 * and payment require a real backend and are disabled in this mode.
 */

const dropId = "11111111-1111-1111-1111-111111111111";

function product(
  p: Partial<Product> & Pick<Product, "title" | "slug" | "price">,
): Product {
  return {
    id: p.slug,
    dropId,
    title: p.title,
    slug: p.slug,
    description: p.description ?? "",
    price: p.price,
    currency: "KES",
    size: p.size ?? null,
    category: p.category ?? null,
    condition: p.condition ?? null,
    measurements: p.measurements ?? {},
    images: p.images ?? [],
    imageColor: p.imageColor ?? "#E2D3BC",
    status: p.status ?? "available",
    reservedUntil: null,
    soldAt: p.status === "sold" ? new Date().toISOString() : null,
  };
}

export const SAMPLE_DROP: DropWithProducts = {
  id: dropId,
  title: "The First Edit",
  slug: "the-first-edit",
  description:
    "A short edit of considered pieces, each one of a kind. Found, restored, and made to be kept.",
  status: "active",
  launchDate: new Date().toISOString(),
  coverImageUrl: null,
  products: [
    product({
      title: "Relaxed Wool Trouser in Stone",
      slug: "relaxed-wool-trouser-stone",
      description:
        "Cut for ease in a soft warm wool. A quiet essential, made to last and to layer through the season.",
      price: 4200,
      size: "M",
      category: "Trousers",
      condition: "Excellent, gently worn",
      measurements: { Waist: "78 cm", Inseam: "74 cm", Rise: "30 cm" },
      imageColor: "#C3B6A2",
    }),
    product({
      title: "Ivory Silk Blouse",
      slug: "ivory-silk-blouse",
      description:
        "A fluid silk blouse in warm ivory. Understated, considered, and easy to wear from day into evening.",
      price: 3800,
      size: "S",
      category: "Tops",
      condition: "Excellent, gently worn",
      measurements: { Chest: "96 cm", Length: "62 cm", Sleeve: "58 cm" },
      imageColor: "#EFE6D6",
    }),
    product({
      title: "Espresso Wool Overcoat",
      slug: "espresso-wool-overcoat",
      description:
        "A deep warm brown overcoat with a clean line. Weighted, timeless, and made to be kept for years.",
      price: 9500,
      size: "L",
      category: "Outerwear",
      condition: "Very good, light wear",
      measurements: { Chest: "112 cm", Length: "104 cm", Shoulder: "46 cm" },
      imageColor: "#4A3A2E",
    }),
    product({
      title: "Olive Linen Shirt Dress",
      slug: "olive-linen-shirt-dress",
      description:
        "A soft olive linen dress that moves easily. Relaxed through the body with a considered collar.",
      price: 5200,
      size: "M",
      category: "Dresses",
      condition: "Excellent, gently worn",
      measurements: { Chest: "100 cm", Length: "118 cm", Waist: "Relaxed" },
      imageColor: "#6E6B4E",
    }),
    product({
      title: "Sand Cashmere Knit",
      slug: "sand-cashmere-knit",
      description:
        "A warm sand cashmere knit with a gentle hand. The kind of piece you reach for first.",
      price: 6400,
      size: "S",
      category: "Knitwear",
      condition: "Excellent, gently worn",
      measurements: { Chest: "94 cm", Length: "60 cm", Sleeve: "60 cm" },
      imageColor: "#E2D3BC",
      status: "sold",
    }),
    product({
      title: "Charcoal Tailored Blazer",
      slug: "charcoal-tailored-blazer",
      description:
        "A structured blazer in near black charcoal. Sharp shoulders, soft drape, quietly confident.",
      price: 8800,
      size: "M",
      category: "Outerwear",
      condition: "Very good, light wear",
      measurements: { Chest: "104 cm", Length: "72 cm", Shoulder: "42 cm" },
      imageColor: "#2B2723",
    }),
  ],
};

export const SAMPLE_SETTINGS: StoreSettings = {
  deliveryFee: 350,
  freeDeliveryThreshold: null,
  currencyCode: "KES",
  whatsappNumber: "254700000000",
  supportEmail: "hello@shawn.co.ke",
};
