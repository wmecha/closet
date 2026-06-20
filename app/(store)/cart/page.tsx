import type { Metadata } from "next";
import { CartView } from "@/components/shawn/cart-view";
import { getStoreSettings } from "@/lib/store/catalog";

export const metadata: Metadata = {
  title: "Your bag",
};

export default async function CartPage() {
  const settings = await getStoreSettings();
  return (
    <section className="shawn-section">
      <div className="shawn-container">
        <CartView deliveryFee={settings.deliveryFee} />
      </div>
    </section>
  );
}
