import Link from "next/link";
import { Eyebrow } from "@/components/shawn/eyebrow";
import { ProductCard } from "@/components/shawn/product-card";
import { ShawnButton } from "@/components/shawn/button";
import { getActiveDrop, getStoreSettings } from "@/lib/store/catalog";

export default async function HomePage() {
  const [drop, settings] = await Promise.all([
    getActiveDrop(),
    getStoreSettings(),
  ]);

  const featured = drop?.products.slice(0, 4) ?? [];
  const whatsappHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: "var(--surface-inverse)",
          color: "var(--text-on-inverse)",
        }}
      >
        <div
          className="shawn-container"
          style={{
            minHeight: "min(82vh, 760px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingBlock: "clamp(80px, 12vw, 160px)",
          }}
        >
          <Eyebrow color="light">SHAWN Apparel</Eyebrow>
          <h1
            className="shawn-display"
            style={{
              fontSize: "var(--fs-display-xl)",
              margin: "24px 0 0",
              maxWidth: "16ch",
            }}
          >
            The considered wardrobe.
          </h1>
          <p
            style={{
              marginTop: "28px",
              maxWidth: "46ch",
              color: "var(--text-on-inverse-soft)",
              fontSize: "var(--fs-body-lg)",
              lineHeight: "var(--leading-body)",
            }}
          >
            A short edit of pieces made to be kept. Each one is found, restored,
            and one of a kind. When it is gone, it is gone.
          </p>
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/shop">
              <ShawnButton
                size="lg"
                style={{
                  background: "var(--shawn-ivory)",
                  color: "var(--shawn-ink)",
                  borderColor: "var(--shawn-ivory)",
                }}
              >
                Shop the edit
              </ShawnButton>
            </Link>
            <Link href="/about">
              <ShawnButton
                size="lg"
                variant="secondary"
                style={{
                  color: "var(--shawn-ivory)",
                  borderColor: "var(--line-on-inverse)",
                }}
              >
                About SHAWN
              </ShawnButton>
            </Link>
          </div>
        </div>
      </section>

      {/* One of one explanation */}
      <section className="shawn-section">
        <div
          className="shawn-narrow"
          style={{ textAlign: "center", maxWidth: "60ch" }}
        >
          <Eyebrow>One of one</Eyebrow>
          <p
            className="shawn-editorial"
            style={{
              fontSize: "var(--fs-display-m)",
              marginTop: "24px",
              color: "var(--text-primary)",
            }}
          >
            We edit so you do not have to. Every piece in the collection is a
            single unit, chosen for its quality and its quiet character.
          </p>
        </div>
      </section>

      {/* Current drop */}
      {drop && featured.length > 0 ? (
        <section
          className="shawn-section"
          style={{ background: "var(--surface-raised)", paddingTop: 0 }}
        >
          <div className="shawn-container">
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                paddingTop: "clamp(48px, 7vw, 96px)",
                marginBottom: "40px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <Eyebrow>The current edit</Eyebrow>
                <h2
                  className="shawn-serif"
                  style={{ fontSize: "var(--fs-display-m)", marginTop: "12px" }}
                >
                  {drop.title}
                </h2>
              </div>
              <Link
                href="/shop"
                style={{
                  fontSize: "var(--fs-micro)",
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase",
                  borderBottom: "1px solid var(--shawn-ink)",
                  paddingBottom: "4px",
                }}
              >
                View all
              </Link>
            </div>
            <div className="shawn-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="shawn-section" style={{ textAlign: "center" }}>
          <div className="shawn-narrow">
            <Eyebrow>The next edit</Eyebrow>
            <h2
              className="shawn-serif"
              style={{ fontSize: "var(--fs-display-m)", marginTop: "12px" }}
            >
              In preparation.
            </h2>
            <p className="shawn-body" style={{ marginTop: "16px" }}>
              A new edit arrives soon. Join the list for first access.
            </p>
          </div>
        </section>
      )}

      {/* Editorial split */}
      <section
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
        className="shawn-split"
      >
        <div
          style={{
            background: "var(--shawn-sand)",
            minHeight: "clamp(360px, 42vw, 560px)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(40px, 7vw, 96px)",
          }}
        >
          <Eyebrow>Made to be kept</Eyebrow>
          <h2
            className="shawn-serif"
            style={{ fontSize: "var(--fs-display-m)", margin: "16px 0 0" }}
          >
            Found, restored, and ready for its next chapter.
          </h2>
          <p
            className="shawn-body"
            style={{ marginTop: "20px", maxWidth: "44ch" }}
          >
            Each piece is sourced with care and prepared to a standard we would
            keep for ourselves. You see its measurements, its condition, and its
            story before you decide.
          </p>
          <div style={{ marginTop: "32px" }}>
            <Link href="/shop">
              <ShawnButton variant="secondary">Explore the edit</ShawnButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section className="shawn-section">
        <div
          className="shawn-container shawn-trio"
          style={{
            display: "grid",
            gap: "40px",
            gridTemplateColumns: "repeat(3, 1fr)",
          }}
        >
          {[
            {
              title: "Secure payment",
              body: "Pay safely with card or mobile money through Paystack. Your order is confirmed the moment payment clears.",
            },
            {
              title: "Considered delivery",
              body: "We deliver across Kenya. Delivery is calculated at checkout and your piece is sent with care.",
            },
            {
              title: "Here to help",
              body: whatsappHref
                ? "Prefer to order by message? Reach us on WhatsApp and we will guide you through it."
                : "Questions about a piece? Reach us any time and we will help you choose well.",
            },
          ].map((item) => (
            <div key={item.title}>
              <hr
                className="shawn-hairline"
                style={{
                  marginBottom: "20px",
                  borderColor: "var(--line-soft)",
                }}
              />
              <h3
                className="shawn-serif"
                style={{ fontSize: "var(--fs-title)", marginBottom: "10px" }}
              >
                {item.title}
              </h3>
              <p className="shawn-body" style={{ fontSize: "var(--fs-body)" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote band */}
      <section
        style={{
          background: "var(--surface-inverse)",
          color: "var(--text-on-inverse)",
          paddingBlock: "clamp(64px, 10vw, 140px)",
        }}
      >
        <div className="shawn-narrow" style={{ textAlign: "center" }}>
          <p
            className="shawn-editorial"
            style={{
              fontSize: "var(--fs-display-m)",
              color: "var(--text-on-inverse)",
            }}
          >
            Quality over quantity. Design over trend. A wardrobe chosen with
            intention.
          </p>
        </div>
      </section>
    </>
  );
}
