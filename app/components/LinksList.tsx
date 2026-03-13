"use client"

const sans = "'Helvetica Neue', Arial, sans-serif"

interface LinkItem {
  id: string
  title: string
  url: string
}

export default function LinksList({ links }: { links: LinkItem[] }) {
  if (links.length === 0) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: 20, padding: "3rem 2rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "#bbb" }}>No links yet</p>
      </div>
    )
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: 20, padding: "1.75rem 2rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111", margin: 0, letterSpacing: "-0.01em", fontFamily: "Georgia, serif" }}>
          Links
        </h2>
        <span style={{ fontSize: "0.75rem", color: "#bbb" }}>{links.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "0.875rem 1rem",
              border: "1px solid #eeece8",
              borderRadius: 10,
              textDecoration: "none",
              background: "#fdfcfa",
              transition: "border-color 0.15s, box-shadow 0.15s",
              fontFamily: sans,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.borderColor = "#ccc"
              el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.borderColor = "#eeece8"
              el.style.boxShadow = "none"
            }}
          >
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111", margin: "0 0 2px" }}>
              {link.title}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#bbb", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {link.url}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
