"use client";

/** Replaces the root layout when it fails, so it carries its own document and styles and both languages. */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ro">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "1.25rem",
          background: "#f3eadc",
          color: "#21150e",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
        }}
      >
        <title>SIN</title>
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ fontWeight: 400, fontSize: "2.4rem", lineHeight: 1.05, margin: 0 }}>Ceva n-a ieșit din cuptor.</h1>
          <p style={{ fontSize: "1.4rem", lineHeight: 1.2, margin: "0.6rem 0 0", color: "#5b4636" }}>Что-то не испеклось.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "2.5rem",
              border: 0,
              borderRadius: 999,
              padding: "0.95rem 1.6rem",
              background: "#21150e",
              color: "#f3eadc",
              font: "500 0.92rem system-ui, sans-serif",
              cursor: "pointer",
            }}
          >
            Încearcă din nou · Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
