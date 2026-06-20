import type { CSSProperties, ElementType, ReactNode } from "react";

type EyebrowColor = "accent" | "muted" | "ink" | "light";

const colors: Record<EyebrowColor, string> = {
  accent: "var(--shawn-clay)",
  muted: "var(--shawn-taupe)",
  ink: "var(--shawn-ink)",
  light: "var(--text-on-inverse-soft)",
};

/** SHAWN Eyebrow: small wide-tracked uppercase label above headings. */
export function Eyebrow({
  children,
  color = "accent",
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  color?: EyebrowColor;
  as?: ElementType;
  style?: CSSProperties;
}) {
  return (
    <Tag
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-micro)",
        fontWeight: 500,
        letterSpacing: "var(--tracking-eyebrow)",
        textTransform: "uppercase",
        color: colors[color],
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
