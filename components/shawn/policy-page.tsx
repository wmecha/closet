import { Eyebrow } from "./eyebrow";

export type PolicySection = {
  heading: string;
  paragraphs: string[];
};

export function PolicyPage({
  eyebrow,
  title,
  intro,
  sections,
  updated,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  sections: PolicySection[];
  updated?: string;
}) {
  return (
    <section className="shawn-section">
      <div className="shawn-narrow">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1
          className="shawn-display"
          style={{ fontSize: "var(--fs-display-l)", margin: "16px 0 0" }}
        >
          {title}
        </h1>
        {intro ? (
          <p
            className="shawn-body"
            style={{ marginTop: "24px", fontSize: "var(--fs-body-lg)" }}
          >
            {intro}
          </p>
        ) : null}

        <div style={{ marginTop: "48px", display: "grid", gap: "40px" }}>
          {sections.map((section) => (
            <div key={section.heading}>
              <h2
                className="shawn-serif"
                style={{ fontSize: "var(--fs-title)", marginBottom: "12px" }}
              >
                {section.heading}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="shawn-body"
                  style={{ marginTop: i === 0 ? 0 : "12px" }}
                >
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>

        {updated ? (
          <p
            style={{
              marginTop: "48px",
              fontSize: "var(--fs-caption)",
              color: "var(--text-tertiary)",
            }}
          >
            Last updated {updated}.
          </p>
        ) : null}
      </div>
    </section>
  );
}
