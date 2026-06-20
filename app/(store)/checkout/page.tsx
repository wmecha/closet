import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shawn/checkout-form";
import { getStoreSettings } from "@/lib/store/catalog";
import { isStoreBackendConfigured } from "@/lib/supabase/admin";
import { isPaystackConfigured } from "@/lib/paystack";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  const checkoutEnabled = isStoreBackendConfigured() && isPaystackConfigured();

  return (
    <section className="shawn-section">
      <div className="shawn-container">
        <CheckoutForm
          deliveryFee={settings.deliveryFee}
          checkoutEnabled={checkoutEnabled}
          whatsappNumber={settings.whatsappNumber}
        />
      </div>
    </section>
  );
}
