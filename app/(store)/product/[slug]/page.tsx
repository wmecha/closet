import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Eyebrow } from "@/components/shawn/eyebrow";
import { ProductCard } from "@/components/shawn/product-card";
import { ProductDetail } from "@/components/shawn/product-detail";
import {
  getProductBySlug,
  getRelatedProducts,
  getStoreSettings,
} from "@/lib/store/catalog";
import { formatKsh } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Piece not found" };
  return {
    title: product.title,
    description: `${product.title}. ${formatKsh(product.price)}. One of one.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product),
    getStoreSettings(),
  ]);

  return (
    <>
      <div
        className="shawn-container"
        style={{
          paddingTop: "24px",
          fontSize: "var(--fs-micro)",
          letterSpacing: "var(--tracking-label)",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
        }}
      >
        <Link href="/shop">The Edit</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span>{product.title}</span>
      </div>

      <section style={{ paddingBlock: "32px 80px" }}>
        <div className="shawn-container">
          <ProductDetail
            product={product}
            whatsappNumber={settings.whatsappNumber}
          />
        </div>
      </section>

      {related.length > 0 ? (
        <section
          className="shawn-section"
          style={{ background: "var(--surface-raised)", paddingTop: "64px" }}
        >
          <div className="shawn-container">
            <Eyebrow>More from the edit</Eyebrow>
            <div className="shawn-grid" style={{ marginTop: "32px" }}>
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
