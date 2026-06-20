import type { CSSProperties, ReactNode } from "react";

type TagVariant = "outline" | "solid" | "accent" | "bare" | "sold";

const variants: Record<TagVariant, CSSProperties> = {
  outline: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--line-soft)",
  },
  solid: {
    background: "var(--shawn-ink)",
    color: "var(--shawn-ivory)",
    border: "1px solid var(--shawn-ink)",
  },
  accent: {
    background: "transparent",
    color: "var(--shawn-clay)",
    border: "1px solid var(--shawn-clay)",
  },
  bare: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid transparent",
    padding: "4px 0",
  },
  sold: {
    background: "transparent",
    color: "var(--text-tertiary)",
    border: "1px solid var(--line-soft)",
  },
};

/** SHAWN Tag: small uppercase chip for status, category, or filter. */
export function Tag({
  children,
  variant = "outline",
  style,
}: {
  children: ReactNode;
  variant?: TagVariant;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-sans)",
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "var(--tracking-label)",
        textTransform: "uppercase",
        padding: "5px 11px",
        borderRadius: "var(--radius-pill)",
        lineHeight: 1,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
