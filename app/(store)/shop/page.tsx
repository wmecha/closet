import type { Metadata } from "next";
import { Eyebrow } from "@/components/shawn/eyebrow";
import { CollectionGrid } from "@/components/shawn/collection-grid";
import { getActiveDrop } from "@/lib/store/catalog";
import { isProductAvailable } from "@/lib/store/types";

export const metadata: Metadata = {
  title: "The Edit",
  description:
    "The current SHAWN Apparel drop. One of one pieces, made to be kept.",
};

export default async function ShopPage() {
  const drop = await getActiveDrop();

  if (!drop) {
    return (
      <section className="shawn-section" style={{ textAlign: "center" }}>
        <div className="shawn-narrow">
          <Eyebrow>The next edit</Eyebrow>
          <h1
            className="shawn-serif"
            style={{ fontSize: "var(--fs-display-m)", marginTop: "12px" }}
          >
            In preparation.
          </h1>
          <p className="shawn-body" style={{ marginTop: "16px" }}>
            A new edit arrives roughly every two weeks. Please check back soon.
          </p>
        </div>
      </section>
    );
  }

  const availableCount = drop.products.filter((p) =>
    isProductAvailable(p),
  ).length;

  return (
    <>
      <section
        style={{
          paddingBlock: "clamp(56px, 8vw, 96px)",
          borderBottom: "1px solid var(--line-hairline)",
        }}
      >
        <div className="shawn-container">
          <Eyebrow>The current edit</Eyebrow>
          <h1
            className="shawn-display"
            style={{ fontSize: "var(--fs-display-l)", margin: "16px 0 0" }}
          >
            {drop.title}
          </h1>
          {drop.description ? (
            <p
              className="shawn-body"
              style={{
                marginTop: "20px",
                maxWidth: "56ch",
                fontSize: "var(--fs-body-lg)",
              }}
            >
              {drop.description}
            </p>
          ) : null}
          <p
            style={{
              marginTop: "20px",
              fontSize: "var(--fs-micro)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
            }}
          >
            {availableCount} of {drop.products.length} pieces available
          </p>
        </div>
      </section>

      <section className="shawn-section" style={{ paddingTop: "48px" }}>
        <div className="shawn-container">
          <CollectionGrid products={drop.products} />
        </div>
      </section>
    </>
  );
}
