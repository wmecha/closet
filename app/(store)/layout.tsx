import type { Metadata } from "next";
import { Marcellus, Cormorant_Garamond, Jost } from "next/font/google";
import { CartProvider } from "@/components/shawn/cart-provider";
import { Header } from "@/components/shawn/header";
import { Footer } from "@/components/shawn/footer";
import { getStoreSettings } from "@/lib/store/catalog";
import "./storefront.css";

const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SHAWN Apparel",
    template: "%s | SHAWN",
  },
  description:
    "SHAWN Apparel. A short edit of one of one pieces, found and restored, made to be kept.",
};

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  return (
    <div
      className={`shawn-store ${marcellus.variable} ${cormorant.variable} ${jost.variable}`}
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <CartProvider>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer whatsappNumber={settings.whatsappNumber} />
      </CartProvider>
    </div>
  );
}
