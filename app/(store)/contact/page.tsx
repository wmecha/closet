import type { Metadata } from "next";
import { Eyebrow } from "@/components/shawn/eyebrow";
import { ShawnButton } from "@/components/shawn/button";
import { getStoreSettings } from "@/lib/store/catalog";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach SHAWN Apparel on WhatsApp or email for orders and questions.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const whatsappHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`
    : null;
  const email = settings.supportEmail || "hello@shawn.co.ke";

  return (
    <section className="shawn-section">
      <div className="shawn-narrow">
        <Eyebrow>Contact</Eyebrow>
        <h1
          className="shawn-display"
          style={{ fontSize: "var(--fs-display-l)", margin: "16px 0 0" }}
        >
          We are here to help.
        </h1>
        <p
          className="shawn-body"
          style={{ marginTop: "24px", fontSize: "var(--fs-body-lg)" }}
        >
          Have a question about a piece, your order, or delivery? Reach us on
          WhatsApp for the quickest reply, or send an email and we will get back
          to you.
        </p>

        <div style={{ marginTop: "48px", display: "grid", gap: "24px" }}>
          <div
            style={{
              border: "1px solid var(--line-hairline)",
              background: "var(--surface-card)",
              padding: "32px",
            }}
          >
            <Eyebrow>WhatsApp order support</Eyebrow>
            <h2
              className="shawn-serif"
              style={{ fontSize: "var(--fs-title)", margin: "12px 0 8px" }}
            >
              Order or ask on WhatsApp
            </h2>
            <p className="shawn-body" style={{ marginBottom: "20px" }}>
              Prefer to order by message? Send us the piece you want and we will
              guide you through payment and delivery.
            </p>
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <ShawnButton>Message us on WhatsApp</ShawnButton>
              </a>
            ) : (
              <p className="shawn-body">WhatsApp details coming soon.</p>
            )}
          </div>

          <div
            style={{
              border: "1px solid var(--line-hairline)",
              background: "var(--surface-card)",
              padding: "32px",
            }}
          >
            <Eyebrow>Email</Eyebrow>
            <h2
              className="shawn-serif"
              style={{ fontSize: "var(--fs-title)", margin: "12px 0 8px" }}
            >
              Write to us
            </h2>
            <p className="shawn-body" style={{ marginBottom: "16px" }}>
              For anything that needs a longer note, email us and we will reply
              with care.
            </p>
            <a
              href={`mailto:${email}`}
              style={{
                fontSize: "var(--fs-body-lg)",
                borderBottom: "1px solid var(--shawn-ink)",
                paddingBottom: "4px",
              }}
            >
              {email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
