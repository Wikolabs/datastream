export default function Page() {
  const steps = [
    { label: "SOURCE", desc: "40+ connecteurs", color: "#134e4a" },
    { label: "EXTRACT", desc: "Ingestion auto", color: "#0f766e" },
    { label: "TRANSFORM", desc: "Règles SQL/Python", color: "#0d9488" },
    { label: "VALIDATE", desc: "Qualité enforced", color: "#14b8a6" },
    { label: "LOAD", desc: "DWH / Data lake", color: "#2dd4bf" },
    { label: "DASHBOARD", desc: "Métriques live", color: "#5eead4" },
  ];

  return (
    <main style={{ color: "#042f2e", fontFamily: "var(--font-body)" }}>
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.1rem 2.5rem",
          borderBottom: "1px solid #99f6e4",
          backgroundColor: "#f0fdfa",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#134e4a",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          DataStream
        </span>
        <button data-cal-link="wikolabs-team/30min" data-cal-namespace="wk30min" data-cal-config='{"layout":"month_view"}' type="button"
            style={{
            border: "1.5px solid #134e4a",
            color: "#134e4a",
            padding: "0.5rem 1.25rem",
            textDecoration: "none",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
          $ ./request-demo
        </button>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: "780px",
          margin: "0 auto",
          padding: "5rem 2rem 3rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "#0f766e",
            marginBottom: "1.5rem",
            letterSpacing: "0.05em",
          }}
        >
          <span style={{ color: "#14b8a6" }}>▶</span> v3.1.0 — pipeline stable — uptime 99.97%
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            lineHeight: 1.2,
            fontWeight: 700,
            marginBottom: "1.25rem",
            color: "#042f2e",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Vos données.
          <br />Propres. En temps réel.
          <br />Sans équipe data.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "#134e4a",
            lineHeight: 1.8,
            marginBottom: "2.5rem",
            maxWidth: "540px",
          }}
        >
          // DataStream orchestre votre pipeline de bout en bout —<br />
          // ingestion → transformation → validation → livraison<br />
          // Sans coder. Sans recruter. Sans payer une équipe data.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button data-cal-link="wikolabs-team/30min" data-cal-namespace="wk30min" data-cal-config='{"layout":"month_view"}' type="button"
            style={{
              backgroundColor: "#134e4a",
              color: "#f0fdfa",
              padding: "0.85rem 2rem",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
            📅 Réserver un créneau →
          </button>
          <a
            href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20DataStream%20avec%20Wikolabs."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#25d366",
              color: "#fff",
              padding: "0.85rem 2rem",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            💬 WhatsApp →
          </a>
        </div>
      </section>

      {/* Pipeline diagram */}
      <section style={{ backgroundColor: "#042f2e", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "#5eead4",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "2rem",
            }}
          >
            // architecture pipeline — flux actif
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0",
            }}
          >
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    backgroundColor: step.color,
                    padding: "1rem 1.25rem",
                    minWidth: "100px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "#f0fdfa",
                      letterSpacing: "0.1em",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {step.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "#ccfbf1" }}>
                    {step.desc}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: "32px",
                      height: "2px",
                      backgroundColor: "#5eead4",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: "-1px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 0,
                        height: 0,
                        borderTop: "5px solid transparent",
                        borderBottom: "5px solid transparent",
                        borderLeft: "8px solid #5eead4",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "2rem",
              padding: "1rem 1.5rem",
              backgroundColor: "#0d1f1f",
              borderLeft: "3px solid #14b8a6",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              color: "#5eead4",
              lineHeight: 1.8,
            }}
          >
            <span style={{ color: "#14b8a6" }}>✓</span> 3 sources connectées &nbsp;|&nbsp;
            <span style={{ color: "#14b8a6" }}>✓</span> 12 règles de transformation actives &nbsp;|&nbsp;
            <span style={{ color: "#14b8a6" }}>✓</span> 0 erreurs de qualité &nbsp;|&nbsp;
            <span style={{ color: "#2dd4bf" }}>⟳</span> Dernier run: 2s ago
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#042f2e",
              marginBottom: "2.5rem",
            }}
          >
            // features[]
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {[
              { key: "connectors", title: "40+ connecteurs", desc: "PostgreSQL, Snowflake, BigQuery, S3, Salesforce, HubSpot, Stripe — out of the box." },
              { key: "quality", title: "Monitoring qualité", desc: "Règles de validation déclaratives. Alertes Slack/PagerDuty si un dataset dérive." },
              { key: "orchestration", title: "Orchestration Airflow", desc: "DAGs auto-générés depuis votre config YAML. Scheduling, retry, backfill inclus." },
            ].map((f) => (
              <div
                key={f.key}
                style={{
                  borderTop: "2px solid #134e4a",
                  paddingTop: "1.25rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.7rem",
                    color: "#0f766e",
                    marginBottom: "0.5rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  const {f.key} =
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.6rem",
                    color: "#042f2e",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#134e4a", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          backgroundColor: "#134e4a",
          textAlign: "center",
          padding: "4rem 2rem",
          color: "#f0fdfa",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "1rem",
          }}
        >
          Votre pipeline en production aujourd'hui
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#99f6e4", marginBottom: "2rem", fontFamily: "var(--font-body)" }}>
          // setup &lt; 30min. no DevOps required. free tier available.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button data-cal-link="wikolabs-team/30min" data-cal-namespace="wk30min" data-cal-config='{"layout":"month_view"}' type="button"
            style={{
              backgroundColor: "#f0fdfa",
              color: "#134e4a",
              padding: "0.85rem 2.5rem",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "var(--font-body)",
            }}>
            📅 Réserver un créneau →
          </button>
          <a
            href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20DataStream%20avec%20Wikolabs."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#25d366",
              color: "#fff",
              padding: "0.85rem 2.5rem",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "var(--font-body)",
            }}
          >
            💬 WhatsApp →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #99f6e4",
          textAlign: "center",
          padding: "1.5rem",
          fontSize: "0.75rem",
          color: "#0f766e",
          fontFamily: "var(--font-body)",
        }}
      >
        © 2025 DataStream — Un produit Wikolabs
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "0.5rem", fontSize: "0.8rem" }}>
          <a href="mailto:team@wikolabs.com" style={{ textDecoration: "none", color: "inherit" }}>team@wikolabs.com</a>
          <span>·</span>
          <a href="tel:+261386626100" style={{ textDecoration: "none", color: "inherit" }}>+261 38 66 261 00</a>
          <span>·</span>
          <button data-cal-link="wikolabs-team/30min" data-cal-namespace="wk30min" data-cal-config='{"layout":"month_view"}' type="button" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>Prendre RDV</button>
        </div>
      </footer>
    </main>
  );
}
