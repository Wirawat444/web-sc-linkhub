"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface User {
  id: string
  name: string | null
  username: string | null
  email: string
  image: string | null
  bio: string | null
}

interface UserLink {
  id: string
  title: string
  url: string
}

const sans = "'Helvetica Neue', Arial, sans-serif"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<UserLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session) loadProfile()
  }, [session])

  const loadProfile = async () => {
    try {
      const [profileRes, linksRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/link"),
      ])
      if (profileRes.ok) setUser(await profileRes.json())
      if (linksRes.ok) setLinks(await linksRes.json())
    } catch (err) {
      console.error("Failed to load profile:", err)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f7", fontFamily: sans, color: "#aaa", fontSize: "0.875rem" }}>
        Loading…
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f7", fontFamily: sans }}>
        <p style={{ color: "#aaa", fontSize: "0.875rem" }}>Unable to load profile</p>
      </div>
    )
  }

  const initial = (user.name || "U").charAt(0).toUpperCase()

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f7", fontFamily: sans }}>

      {/* ── NAV ── */}
      <nav style={{
        background: "rgba(249,249,247,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e8e6e0",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#111", fontFamily: "Georgia, serif" }}>
            CS<span style={{ color: "#c0a882" }}>LinkHub</span>
          </Link>
          <button onClick={() => router.back()} style={{ fontSize: "0.8rem", color: "#555", background: "none", border: "1px solid #ddd", borderRadius: 100, padding: "0.35rem 0.9rem", cursor: "pointer", fontFamily: sans }}>
            ← Back
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>

        {/* ── PROFILE CARD ── */}
        <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: 20, padding: "2.5rem 2rem", marginBottom: "1.25rem", textAlign: "center" }}>

          {/* Avatar */}
          <div style={{ marginBottom: "1.25rem" }}>
            {user.image ? (
              <img src={user.image} alt={user.name || ""} style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee", margin: "0 auto" }} />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#d4c5b0,#b8a89a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "2rem", fontWeight: 600, color: "#fff", fontFamily: "Georgia, serif" }}>
                {initial}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 style={{ fontSize: "1.75rem", fontWeight: 400, letterSpacing: "-0.03em", color: "#111", margin: "0 0 0.3rem", fontFamily: "Georgia, serif" }}>
            {user.name}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#c0a882", marginBottom: "0.25rem" }}>
            @{user.username}
          </p>
          <p style={{ fontSize: "0.78rem", color: "#ccc", marginBottom: user.bio ? "1rem" : "1.5rem" }}>
            {user.email}
          </p>
          {user.bio && (
            <p style={{ fontSize: "0.875rem", color: "#777", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 1.5rem" }}>
              {user.bio}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard" style={{
              display: "inline-block",
              background: "#111",
              color: "#fff",
              padding: "0.55rem 1.25rem",
              borderRadius: 100,
              fontSize: "0.8rem",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}>
              Edit profile
            </Link>
            {user.username && (
              <a href={`/user/${user.username}`} target="_blank" rel="noreferrer" style={{
                display: "inline-block",
                color: "#555",
                padding: "0.55rem 1.25rem",
                borderRadius: 100,
                fontSize: "0.8rem",
                textDecoration: "none",
                border: "1px solid #ddd",
                letterSpacing: "0.02em",
              }}>
                Public profile ↗
              </a>
            )}
          </div>
        </div>

        {/* ── LINKS CARD ── */}
        <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: 20, padding: "1.75rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111", margin: 0, letterSpacing: "-0.01em", fontFamily: "Georgia, serif" }}>
              Your links
            </h2>
            <span style={{ fontSize: "0.75rem", color: "#bbb" }}>{links.length} link{links.length !== 1 ? "s" : ""}</span>
          </div>

          {links.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <p style={{ fontSize: "0.875rem", color: "#bbb", marginBottom: "1rem" }}>No links yet</p>
              <Link href="/dashboard" style={{
                display: "inline-block",
                background: "#111",
                color: "#fff",
                padding: "0.55rem 1.25rem",
                borderRadius: 100,
                fontSize: "0.8rem",
                textDecoration: "none",
              }}>
                Add links
              </Link>
            </div>
          ) : (
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
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#ccc"
                    ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#eeece8"
                    ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"
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
          )}
        </div>
      </div>
    </div>
  )
}