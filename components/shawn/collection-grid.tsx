"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./product-card";
import { isProductAvailable, type Product } from "@/lib/store/types";

type AvailabilityFilter = "all" | "available";

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "var(--tracking-label)",
        textTransform: "uppercase",
        padding: "8px 16px",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
        background: active ? "var(--shawn-ink)" : "transparent",
        color: active ? "var(--shawn-ivory)" : "var(--text-secondary)",
        border: `1px solid ${active ? "var(--shawn-ink)" : "var(--line-soft)"}`,
        transition: "all var(--dur-fast) var(--ease-standard)",
      }}
    >
      {children}
    </button>
  );
}

export function CollectionGrid({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<string>("all");
  const [size, setSize] = useState<string>("all");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((p) => p.category).filter(Boolean) as string[]),
      ).sort(),
    [products],
  );
  const sizes = useMemo(
    () =>
      Array.from(
        new Set(products.map((p) => p.size).filter(Boolean) as string[]),
      ).sort(),
    [products],
  );

  const filtered = products.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (size !== "all" && p.size !== size) return false;
    if (availability === "available" && !isProductAvailable(p)) return false;
    return true;
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          marginBottom: "40px",
          paddingBottom: "24px",
          borderBottom: "1px solid var(--line-hairline)",
        }}
      >
        <Pill active={category === "all"} onClick={() => setCategory("all")}>
          All pieces
        </Pill>
        {categories.map((c) => (
          <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Pill>
        ))}
        <span style={{ flex: 1 }} />
        {sizes.length > 1 ? (
          <>
            <Pill active={size === "all"} onClick={() => setSize("all")}>
              All sizes
            </Pill>
            {sizes.map((s) => (
              <Pill key={s} active={size === s} onClick={() => setSize(s)}>
                {s}
              </Pill>
            ))}
          </>
        ) : null}
        <Pill
          active={availability === "available"}
          onClick={() =>
            setAvailability((a) => (a === "available" ? "all" : "available"))
          }
        >
          Available only
        </Pill>
      </div>

      {filtered.length > 0 ? (
        <div className="shawn-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="shawn-body" style={{ paddingBlock: "48px" }}>
          Nothing matches that selection right now.
        </p>
      )}
    </div>
  );
}
