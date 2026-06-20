import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/shawn/eyebrow";
import { ShawnButton } from "@/components/shawn/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "SHAWN is a modern lifestyle brand. Curated modern living, opening with apparel.",
};

const pillars = [
  { title: "Confidence", body: "Quiet, never loud. We let the pieces speak." },
  {
    title: "Taste",
    body: "A discerning point of view. We edit so you do not have to.",
  },
  {
    title: "Elegance",
    body: "Restraint, proportion, and warmth in everything.",
  },
  {
    title: "Curation",
    body: "A tightly chosen collection beats an endless catalogue.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section
        style={{
          background: "var(--surface-inverse)",
          color: "var(--text-on-inverse)",
          paddingBlock: "clamp(80px, 12vw, 160px)",
        }}
      >
        <div className="shawn-narrow" style={{ textAlign: "center" }}>
          <Eyebrow color="light">About SHAWN</Eyebrow>
          <p
            className="shawn-editorial"
            style={{
              fontSize: "var(--fs-display-m)",
              marginTop: "24px",
              color: "var(--text-on-inverse)",
            }}
          >
            SHAWN sells a carefully curated lifestyle, not products. Fashion is
            the opening chapter, not the whole book.
          </p>
        </div>
      </section>

      <section className="shawn-section">
        <div className="shawn-narrow">
          <Eyebrow>The idea</Eyebrow>
          <h2
            className="shawn-serif"
            style={{ fontSize: "var(--fs-display-m)", margin: "16px 0 24px" }}
          >
            Curated modern living.
          </h2>
          <p className="shawn-body" style={{ fontSize: "var(--fs-body-lg)" }}>
            SHAWN Apparel is the first business unit of SHAWN, a modern
            lifestyle house. We bring together pieces that are considered, calm,
            and quietly luxurious. Everything is one of one, found and restored,
            and chosen to last beyond a single season.
          </p>
          <p
            className="shawn-body"
            style={{ marginTop: "16px", fontSize: "var(--fs-body-lg)" }}
          >
            We believe in quality over quantity and design over trend. A short
            edit, refreshed roughly every two weeks, so each visit feels
            considered rather than overwhelming.
          </p>
        </div>
      </section>

      <section
        className="shawn-section"
        style={{ background: "var(--surface-raised)" }}
      >
        <div className="shawn-container">
          <Eyebrow>What we value</Eyebrow>
          <div
            className="shawn-trio"
            style={{
              marginTop: "32px",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "32px",
            }}
          >
            {pillars.map((p) => (
              <div key={p.title}>
                <hr
                  className="shawn-hairline"
                  style={{
                    marginBottom: "16px",
                    borderColor: "var(--line-soft)",
                  }}
                />
                <h3
                  className="shawn-serif"
                  style={{ fontSize: "var(--fs-title)", marginBottom: "8px" }}
                >
                  {p.title}
                </h3>
                <p
                  className="shawn-body"
                  style={{ fontSize: "var(--fs-body)" }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shawn-section" style={{ textAlign: "center" }}>
        <div className="shawn-narrow">
          <Eyebrow>The collection</Eyebrow>
          <h2
            className="shawn-serif"
            style={{ fontSize: "var(--fs-display-m)", margin: "16px 0 24px" }}
          >
            See the current edit.
          </h2>
          <Link href="/shop">
            <ShawnButton size="lg">Shop the edit</ShawnButton>
          </Link>
        </div>
      </section>
    </>
  );
}
