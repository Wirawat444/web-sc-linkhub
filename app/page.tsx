import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import Link from "next/link"
import UserMenu from "@/app/components/UserMenu"
import HomeClient from "@/app/components/HomeClient"

export default async function Home() {
  const session = await getAuthSession()
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      links: true,
      _count: { select: { likesReceived: true } },
    },
  })

  const transformedUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    image: user.image,
    bio: user.bio,
    links: user.links,
    likes: user._count.likesReceived,
    createdAt: user.createdAt.toISOString(),
  }))

  return (
    <div className="min-h-screen" style={{ background: "#f9f9f7", fontFamily: "'Georgia', serif" }}>

      {/* ── NAV ── */}
      <nav style={{
        background: "rgba(249,249,247,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e8e6e0",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#111" }}>
              CS<span style={{ color: "#c0a882" }}>LinkHub</span>
            </span>
          </Link>

          {/* Menu */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {session ? (
              <>
                <Link href="/dashboard" style={{ fontSize: "0.875rem", color: "#555", textDecoration: "none", letterSpacing: "0.02em" }}>
                  Dashboard
                </Link>
                <UserMenu />
              </>
            ) : (
              <Link href="/login" style={{
                fontSize: "0.875rem",
                color: "#111",
                textDecoration: "none",
                border: "1px solid #ccc",
                padding: "0.4rem 1.1rem",
                borderRadius: "100px",
                letterSpacing: "0.02em",
              }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 2rem 3.5rem" }}>
        <div style={{ maxWidth: 640 }}>
          {/* eyebrow */}
          <p style={{
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#c0a882",
            marginBottom: "1.25rem",
            fontFamily: "'Helvetica Neue', sans-serif",
          }}>
            Community · Links · Profiles
          </p>

          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#111",
            margin: "0 0 1.5rem",
          }}>
            Share what<br />
            <em style={{ fontStyle: "italic", color: "#c0a882" }}>matters</em> to you.
          </h1>

          <p style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "#777",
            maxWidth: 480,
            fontFamily: "'Helvetica Neue', sans-serif",
            fontWeight: 400,
          }}>
            A quiet corner of the internet where creators collect and share links that spark curiosity, learning, and connection.
          </p>

          {!session && (
            <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
              <Link href="/register" style={{
                display: "inline-block",
                background: "#111",
                color: "#fff",
                padding: "0.65rem 1.5rem",
                borderRadius: "100px",
                fontSize: "0.875rem",
                textDecoration: "none",
                letterSpacing: "0.02em",
                fontFamily: "'Helvetica Neue', sans-serif",
              }}>
                Get started
              </Link>
              <Link href="/login" style={{
                display: "inline-block",
                color: "#555",
                padding: "0.65rem 1.5rem",
                borderRadius: "100px",
                fontSize: "0.875rem",
                textDecoration: "none",
                border: "1px solid #ddd",
                letterSpacing: "0.02em",
                fontFamily: "'Helvetica Neue', sans-serif",
              }}>
                Sign in
              </Link>
            </div>
          )}
        </div>

        {/* thin divider */}
        <div style={{ height: 1, background: "linear-gradient(to right, #e0ddd6, transparent)", marginTop: "4rem" }} />
      </section>

      {/* ── CONTENT ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem 6rem" }}>
        <HomeClient initialUsers={transformedUsers} session={session} />
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid #e8e6e0",
        background: "#f2f0eb",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "3rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}>
          <div>
            <p style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#111", marginBottom: "0.3rem" }}>
              CS<span style={{ color: "#c0a882" }}>LinkHub</span>
            </p>
            <p style={{ fontSize: "0.8rem", color: "#999", fontFamily: "'Helvetica Neue', sans-serif" }}>
              © 2026 CS LinkHub. All rights reserved.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[
              { label: "Home", href: "/" },
              ...(session
                ? [{ label: "Dashboard", href: "/dashboard" }]
                : [
                    { label: "Login", href: "/login" },
                    { label: "Register", href: "/register" },
                  ]),
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{
                fontSize: "0.8rem",
                color: "#888",
                textDecoration: "none",
                fontFamily: "'Helvetica Neue', sans-serif",
                letterSpacing: "0.02em",
              }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
