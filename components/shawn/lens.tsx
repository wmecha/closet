import type { CSSProperties } from "react";

/** The SHAWN "Lens" mark: two nested tilted almond forms. Inherits currentColor. */
export function Lens({
  size = 28,
  style,
}: {
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="SHAWN"
      style={style}
    >
      <g
        transform="rotate(-16 50 50)"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
      >
        <path d="M50 7 C 80 31 80 69 50 93 C 20 69 20 31 50 7 Z" />
        <path d="M50 29 C 64 42 64 58 50 71 C 36 58 36 42 50 29 Z" />
      </g>
    </svg>
  );
}

/** Vertical or horizontal SHAWN lockup: Lens above or beside the wordmark. */
export function Wordmark({
  orientation = "horizontal",
  lensSize = 24,
  division,
  style,
}: {
  orientation?: "horizontal" | "vertical";
  lensSize?: number;
  division?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: orientation === "vertical" ? "column" : "row",
        alignItems: "center",
        gap: orientation === "vertical" ? "10px" : "12px",
        color: "var(--text-primary)",
        ...style,
      }}
    >
      <Lens size={lensSize} />
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          lineHeight: 1,
        }}
      >
        <span
          className="shawn-wordmark"
          style={{ fontSize: "1.15rem", lineHeight: 1 }}
        >
          SHAWN
        </span>
        {division ? (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "9px",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              marginTop: "5px",
            }}
          >
            {division}
          </span>
        ) : null}
      </span>
    </span>
  );
}
