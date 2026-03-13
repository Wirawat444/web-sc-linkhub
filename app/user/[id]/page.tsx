import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import Link from "next/link"
import LikeButton from "../../components/LikeButton"
import LinksList from "../../components/LinksList"

const sans = "'Helvetica Neue', Arial, sans-serif"

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getAuthSession()

  const user = await prisma.user.findFirst({
    where: { OR: [{ username: id }, { id }] },
    include: {
      links: true,
      _count: { select: { likesReceived: true } },
    },
  })

  const likesCount = user?._count?.likesReceived || 0
  const initial = (user?.name || "U").charAt(0).toUpperCase()

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f9f7", fontFamily: sans }}>
        <Nav />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.875rem", color: "#bbb" }}>User not found</p>
          <Link href="/" style={{ display: "inline-block", marginTop: "1rem", fontSize: "0.8rem", color: "#111", textDecoration: "none", border: "1px solid #ddd", padding: "0.4rem 1rem", borderRadius: 100 }}>
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f7", fontFamily: sans }}>
      <Nav />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>

        {/* Back */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#bbb", textDecoration: "none", marginBottom: "2rem" }}>
          ← Back to creators
        </Link>

        {/* ── PROFILE CARD ── */}
        <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: 20, padding: "2rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
            {user.image ? (
              <img src={user.image} alt={user.name || ""} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#d4c5b0,#b8a89a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.75rem", fontWeight: 600, color: "#fff", fontFamily: "Georgia, serif" }}>
                {initial}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 400, letterSpacing: "-0.03em", color: "#111", margin: "0 0 0.2rem", fontFamily: "Georgia, serif" }}>
                {user.name || "Creator"}
              </h1>
              {user.username && <p style={{ fontSize: "0.85rem", color: "#c0a882", margin: "0 0 0.2rem" }}>@{user.username}</p>}
              <p style={{ fontSize: "0.75rem", color: "#ccc", margin: 0 }}>{user.email}</p>
            </div>

            <div style={{ flexShrink: 0 }}>
              <LikeButton
                key={`like-${user.id}`}
                targetUserId={user.id}
                initialLikes={likesCount}
                isLoggedIn={!!session}
              />
            </div>
          </div>

          {user.bio && (
            <p style={{ fontSize: "0.875rem", color: "#777", lineHeight: 1.7, margin: "1.25rem 0 0", paddingTop: "1.25rem", borderTop: "1px solid #f0ede8" }}>
              {user.bio}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #f0ede8" }}>
            <Pill value={user.links.length} label={`link${user.links.length !== 1 ? "s" : ""}`} />
            <Pill icon="♥" value={likesCount} label={`like${likesCount !== 1 ? "s" : ""}`} />
          </div>
        </div>

        {/* ── LINKS — Client Component ── */}
        <LinksList links={user.links} />

      </div>
    </div>
  )
}

function Pill({ icon, value, label }: { icon?: string; value: number; label: string }) {
  return (
    <div style={{ background: "#f7f6f3", border: "1px solid #eee", borderRadius: 100, padding: "0.3rem 0.75rem", fontSize: "0.78rem", color: "#555", display: "flex", alignItems: "center", gap: 4 }}>
      {icon && <span style={{ color: "#e57" }}>{icon}</span>}
      <span style={{ fontWeight: 600 }}>{value}</span>
      <span style={{ color: "#bbb" }}>{label}</span>
    </div>
  )
}

function Nav() {
  return (
    <nav style={{ background: "rgba(249,249,247,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8e6e0", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#111", fontFamily: "Georgia, serif" }}>
          CS<span style={{ color: "#c0a882" }}>LinkHub</span>
        </Link>
      </div>
    </nav>
  )
}