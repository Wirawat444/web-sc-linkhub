"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { HiArrowRight, HiMagnifyingGlass, HiHeart } from "react-icons/hi2"

interface LinkItem {
  id: string
  title: string
  url: string
  description: string | null
}

interface User {
  id: string
  name: string | null
  username: string | null
  email: string | null
  image: string | null
  bio: string | null
  links: LinkItem[]
  likes: number
  createdAt?: string
}

function getUserProfileUrl(user: User): string {
  return user.username ? `/user/${user.username}` : `/user/${user.id}`
}

interface HomeClientProps {
  initialUsers: User[]
  session: any
}

const sans = "'Helvetica Neue', Arial, sans-serif"

export default function HomeClient({ initialUsers, session }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "mostLikes">("newest")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [users, setUsers] = useState(initialUsers)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) setUsers(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    // รับ event ทั้งจากหน้าเดียวกัน และข้ามหน้า (BroadcastChannel)
    const bc = new BroadcastChannel("profile_updates")
    bc.onmessage = () => fetchUsers()

    window.addEventListener("likeUpdated", fetchUsers)
    window.addEventListener("profileUpdated", fetchUsers)

    return () => {
      bc.close()
      window.removeEventListener("likeUpdated", fetchUsers)
      window.removeEventListener("profileUpdated", fetchUsers)
    }
  }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    let filtered = users
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      )
    }
    return [...filtered].sort((a, b) =>
      sortBy === "mostLikes"
        ? (b.likes || 0) - (a.likes || 0)
        : new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
  }, [users, searchQuery, sortBy])

  return (
    <div style={{ fontFamily: sans }}>

      {/* ── TOOLBAR ── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        marginBottom: "2.5rem",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 260px" }}>
          <HiMagnifyingGlass style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)", color: "#aaa", width: 16, height: 16,
          }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators…"
            style={{
              width: "100%",
              paddingLeft: 40,
              paddingRight: 16,
              paddingTop: 10,
              paddingBottom: 10,
              border: "1px solid #e0ddd6",
              borderRadius: 100,
              background: "#fff",
              fontSize: "0.875rem",
              color: "#111",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Sort pills */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {(["newest", "mostLikes"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: 100,
                border: sortBy === s ? "1px solid #111" : "1px solid #e0ddd6",
                background: sortBy === s ? "#111" : "#fff",
                color: sortBy === s ? "#fff" : "#555",
                fontSize: "0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                letterSpacing: "0.01em",
                transition: "all 0.15s",
              }}
            >
              {s === "mostLikes" && <HiHeart style={{ width: 12, height: 12, color: sortBy === s ? "#f9a" : "#f06" }} />}
              {s === "newest" ? "Newest" : "Most liked"}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: "0.4rem", marginLeft: "auto" }}>
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              title={v}
              style={{
                width: 36, height: 36,
                borderRadius: 8,
                border: "1px solid #e0ddd6",
                background: view === v ? "#111" : "#fff",
                color: view === v ? "#fff" : "#888",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                transition: "all 0.15s",
              }}
            >
              {v === "grid" ? "⊞" : "☰"}
            </button>
          ))}
        </div>
      </div>

      {/* ── COUNT ── */}
      <p style={{ fontSize: "0.78rem", color: "#aaa", marginBottom: "1.5rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {filteredUsers.length} creator{filteredUsers.length !== 1 ? "s" : ""}
      </p>

      {/* ── GRID / LIST ── */}
      {filteredUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 0", color: "#bbb", fontSize: "0.9rem" }}>
          {searchQuery ? "No creators found" : "No users yet"}
        </div>
      ) : (
        <div style={
          view === "grid"
            ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }
            : { display: "flex", flexDirection: "column", gap: "0.75rem" }
        }>
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} view={view} />
          ))}
        </div>
      )}
    </div>
  )
}

function getLinkMeta(url: string): { icon: string; color: string; name: string } {
  try {
    const host = new URL(url).hostname.replace("www.", "")
    if (host.includes("youtube.com") || host.includes("youtu.be"))
      return { icon: "▶", color: "#FF0000", name: "YouTube" }
    if (host.includes("facebook.com") || host.includes("fb.com"))
      return { icon: "f", color: "#1877F2", name: "Facebook" }
    if (host.includes("instagram.com"))
      return { icon: "◉", color: "#E1306C", name: "Instagram" }
    if (host.includes("spotify.com"))
      return { icon: "♫", color: "#1DB954", name: "Spotify" }
    if (host.includes("twitter.com") || host.includes("x.com"))
      return { icon: "𝕏", color: "#000", name: "X" }
    if (host.includes("tiktok.com"))
      return { icon: "♪", color: "#010101", name: "TikTok" }
    if (host.includes("github.com"))
      return { icon: "⌥", color: "#333", name: "GitHub" }
    if (host.includes("linkedin.com"))
      return { icon: "in", color: "#0A66C2", name: "LinkedIn" }
    if (host.includes("discord.com") || host.includes("discord.gg"))
      return { icon: "◈", color: "#5865F2", name: "Discord" }
    if (host.includes("twitch.tv"))
      return { icon: "◆", color: "#9146FF", name: "Twitch" }
    // fallback: first letter of domain
    return { icon: host.charAt(0).toUpperCase(), color: "#aaa", name: host }
  } catch {
    return { icon: "↗", color: "#aaa", name: "Link" }
  }
}

function LinkChip({ link }: { link: LinkItem }) {
  const meta = getLinkMeta(link.url)
  return (
    <div
      title={link.title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "0.3rem 0.6rem",
        borderRadius: 8,
        border: "1px solid #eeece8",
        background: "#fdfcfa",
        fontSize: "0.72rem",
        color: "#555",
        fontFamily: sans,
        maxWidth: 110,
        overflow: "hidden",
      }}
    >
      <span style={{
        width: 18, height: 18, borderRadius: 4,
        background: meta.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: "0.65rem", fontWeight: 700, flexShrink: 0,
      }}>
        {meta.icon}
      </span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {link.title || meta.name}
      </span>
    </div>
  )
}

function UserCard({ user, view }: { user: User; view: "grid" | "list" }) {
  const profileUrl = getUserProfileUrl(user)
  const initial = (user.name || "U").charAt(0).toUpperCase()

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8e6e0",
      borderRadius: 16,
      padding: view === "grid" ? "1.5rem" : "1.25rem 1.5rem",
      display: "flex",
      flexDirection: view === "grid" ? "column" : "row",
      alignItems: view === "grid" ? "flex-start" : "center",
      gap: view === "grid" ? "1rem" : "1.25rem",
      transition: "box-shadow 0.2s, border-color 0.2s",
      cursor: "default",
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.07)"
        ;(e.currentTarget as HTMLDivElement).style.borderColor = "#ccc"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none"
        ;(e.currentTarget as HTMLDivElement).style.borderColor = "#e8e6e0"
      }}
    >
      {/* Avatar */}
      {user.image ? (
        <img src={user.image} alt={user.name || ""} style={{
          width: view === "grid" ? 48 : 44,
          height: view === "grid" ? 48 : 44,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid #eee",
        }} />
      ) : (
        <div style={{
          width: view === "grid" ? 48 : 44,
          height: view === "grid" ? 48 : 44,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #d4c5b0, #b8a89a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 600,
          fontSize: "1.1rem",
          flexShrink: 0,
          fontFamily: "Georgia, serif",
        }}>
          {initial}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link href={profileUrl} style={{
          display: "block",
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "#111",
          textDecoration: "none",
          letterSpacing: "-0.01em",
          marginBottom: 2,
          fontFamily: "Georgia, serif",
        }}>
          {user.name || "Creator"}
        </Link>
        <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: view === "grid" ? 8 : 0, fontFamily: sans }}>
          {user.username ? `@${user.username}` : (user.email ?? "")}
        </p>
        {user.bio && view === "list" && (
          <p style={{ fontSize: "0.8rem", color: "#888", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 360 }}>
            {user.bio}
          </p>
        )}
        {/* Link chips — list view */}
        {view === "list" && user.links.length > 0 && (
          <div style={{ display: "flex", flexWrap: "nowrap", gap: "0.35rem", marginTop: 6, overflowX: "auto" }}>
            {user.links.map((link) => (
              <LinkChip key={link.id} link={link} />
            ))}
          </div>
        )}
        {/* View profile — list only */}
        {view === "list" && (
          <Link href={profileUrl} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: "0.78rem",
            color: "#888",
            textDecoration: "none",
            letterSpacing: "0.03em",
            marginTop: 8,
          }}>
            View profile <HiArrowRight style={{ width: 12, height: 12 }} />
          </Link>
        )}
        {/* Link chips — grid only */}
        {view === "grid" && user.links.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: 6 }}>
            {user.links.slice(0, 4).map((link) => (
              <LinkChip key={link.id} link={link} />
            ))}
            {user.links.length > 4 && (
              <div style={{ padding: "0.3rem 0.5rem", borderRadius: 8, border: "1px solid #eeece8", fontSize: "0.72rem", color: "#bbb", fontFamily: sans }}>
                +{user.links.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
        <StatPill icon={<HiHeart style={{ color: "#e57" }} />} value={user.likes || 0} />
        <StatPill value={user.links.length} label="links" />
      </div>

      {/* CTA — grid only */}
      {view === "grid" && (
        <Link href={profileUrl} style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: "0.78rem",
          color: "#888",
          textDecoration: "none",
          letterSpacing: "0.03em",
          marginTop: 4,
        }}>
          View profile <HiArrowRight style={{ width: 12, height: 12 }} />
        </Link>
      )}
    </div>
  )
}

function StatPill({ icon, value, label }: { icon?: React.ReactNode; value: number; label?: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      background: "#f7f6f3",
      border: "1px solid #eee",
      borderRadius: 100,
      padding: "0.3rem 0.65rem",
      fontSize: "0.78rem",
      color: "#555",
      fontFamily: sans,
      fontWeight: 500,
    }}>
      {icon}
      <span>{value}</span>
      {label && <span style={{ color: "#bbb" }}>{label}</span>}
    </div>
  )
}