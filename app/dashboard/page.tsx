"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LinkItem {
  id: string
  title: string
  url: string
}

interface User {
  id: string
  name: string | null
  username: string | null
  email: string
  image: string | null
  bio: string | null
}

const sans = "'Helvetica Neue', Arial, sans-serif"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])

  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileUpdating, setProfileUpdating] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [linkLoading, setLinkLoading] = useState(false)

  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editUrl, setEditUrl] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const loadProfile = async () => {
    try {
      setProfileLoading(true)
      setError("")
      const res = await fetch("/api/user/profile")
      if (!res.ok) throw new Error((await res.json()).message || "Failed to load profile")
      const data = await res.json()
      setUser(data)
      setName(data.name ?? "")
      setUsername(data.username ?? "")
      setBio(data.bio ?? "")
      setPreviewImage(data.image ?? null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const loadLinks = async () => {
    try {
      const res = await fetch("/api/link")
      if (!res.ok) throw new Error("Failed to load links")
      setLinks(await res.json())
    } catch {
      setError("Failed to load links")
    }
  }

  useEffect(() => {
    if (session) { loadProfile(); loadLinks() }
  }, [session])

  const flash = (msg: string, type: "success" | "error" = "success") => {
    if (type === "success") { setSuccess(msg); setTimeout(() => setSuccess(""), 3000) }
    else setError(msg)
  }

  const updateProfile = async () => {
    if (!name.trim() || !username.trim()) return flash("Name and username are required", "error")
    setProfileUpdating(true); setError("")
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Update failed")
      const data = await res.json()
      setUser((p) => p ? { ...p, name: data.name, username: data.username, bio: data.bio } : p)
      flash("Profile updated!")
    } catch (err: any) { flash(err.message, "error") }
    finally { setProfileUpdating(false) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return flash("Please select an image file", "error")

    const reader = new FileReader()
    reader.onloadend = () => setPreviewImage(reader.result as string)
    reader.readAsDataURL(file)

    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/user/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Failed to upload image")
      const data = await res.json()
      setPreviewImage(data.image)
      setUser((p) => p ? { ...p, image: data.image } : p)
      // ✅ แจ้งทุกหน้าที่เปิดอยู่ให้ reload users
      window.dispatchEvent(new Event("profileUpdated"))
      const bc = new BroadcastChannel("profile_updates")
      bc.postMessage("updated")
      bc.close()
      flash("Profile picture updated!")
    } catch (err: any) {
      flash(err.message, "error")
      setPreviewImage(user?.image || null)
    } finally {
      setImageUploading(false)
      e.target.value = ""
    }
  }

  const addLink = async () => {
    if (!title.trim() || !url.trim()) return flash("Please fill in both fields", "error")
    if (links.some((l) => l.url.trim().toLowerCase() === url.trim().toLowerCase()))
      return flash("This URL already exists", "error")
    setLinkLoading(true); setError("")
    try {
      const res = await fetch("/api/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), url: url.trim() }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Failed to add link")
      setTitle(""); setUrl("")
      flash("Link added!")
      await loadLinks()
    } catch (err: any) { flash(err.message, "error") }
    finally { setLinkLoading(false) }
  }

  const updateLink = async (id: string) => {
    try {
      const res = await fetch(`/api/link/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, url: editUrl }),
      })
      if (!res.ok) throw new Error("Failed to update link")
      setEditingLink(null)
      flash("Link updated!")
      await loadLinks()
    } catch { flash("Failed to update link", "error") }
  }

  const deleteLink = async (id: string) => {
    if (!confirm("Delete this link?")) return
    try {
      const res = await fetch(`/api/link/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete link")
      flash("Link deleted!")
      await loadLinks()
    } catch { flash("Failed to delete link", "error") }
  }

  if (status === "loading" || profileLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f7", fontFamily: sans, color: "#aaa", fontSize: "0.875rem" }}>
        Loading…
      </div>
    )
  }

  const initial = (user?.name || "U").charAt(0).toUpperCase()

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f7", fontFamily: sans }}>

      {/* ── NAV ── */}
      <nav style={{
        background: "rgba(249,249,247,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e8e6e0",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#111", fontFamily: "Georgia, serif" }}>
            CS<span style={{ color: "#c0a882" }}>LinkHub</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {user?.username && (
              <a href={`/user/${user.username}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#888", textDecoration: "none" }}>
                ↗ View profile
              </a>
            )}
            <button onClick={() => router.back()} style={{ fontSize: "0.8rem", color: "#555", background: "none", border: "1px solid #ddd", borderRadius: 100, padding: "0.35rem 0.9rem", cursor: "pointer" }}>
              Back
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>

        {/* Page title */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c0a882", marginBottom: "0.5rem" }}>Account</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 400, letterSpacing: "-0.03em", color: "#111", margin: 0, fontFamily: "Georgia, serif" }}>Dashboard</h1>
        </div>

        {/* Toast */}
        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "#c00", display: "flex", justifyContent: "space-between" }}>
            {error}
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#c00", cursor: "pointer" }}>✕</button>
          </div>
        )}
        {success && (
          <div style={{ background: "#f0faf4", border: "1px solid #b2e0c4", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "#1a7a40" }}>
            {success}
          </div>
        )}

        {/* ── PROFILE CARD ── */}
        <Card title="Profile" subtitle="Your public identity">
          {/* Avatar row */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {previewImage ? (
                <img src={previewImage} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#d4c5b0,#b8a89a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: "1.5rem", color: "#fff", fontWeight: 600 }}>
                  {initial}
                </div>
              )}
              {imageUploading && (
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#888" }}>…</div>
              )}
            </div>
            <label style={{ cursor: "pointer" }}>
              <div style={{ border: "1px dashed #ccc", borderRadius: 10, padding: "0.6rem 1.2rem", fontSize: "0.8rem", color: "#888", transition: "border-color 0.15s" }}>
                {imageUploading ? "Uploading…" : "Change photo"}
              </div>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} disabled={imageUploading} />
            </label>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
            </Field>
            <Field label="Username">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#bbb", fontSize: "0.875rem" }}>@</span>
                <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))} placeholder="username" style={{ ...inputStyle, paddingLeft: 28 }} />
              </div>
            </Field>
            <Field label="Bio">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio…" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <button onClick={updateProfile} disabled={profileUpdating} style={primaryBtn}>
              {profileUpdating ? "Saving…" : "Save profile"}
            </button>
          </div>
        </Card>

        {/* ── ADD LINK CARD ── */}
        <Card title="Add link" subtitle="Expand your collection">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Field label="Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. My GitHub" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && addLink()} />
            </Field>
            <Field label="URL">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && addLink()} />
            </Field>
            <button onClick={addLink} disabled={linkLoading} style={primaryBtn}>
              {linkLoading ? "Adding…" : "Add link"}
            </button>
          </div>
        </Card>

        {/* ── LINKS CARD ── */}
        <Card title="Your links" subtitle={`${links.length} link${links.length !== 1 ? "s" : ""}`}>
          {links.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "#bbb", textAlign: "center", padding: "2rem 0" }}>No links yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {links.map((link) => (
                <div key={link.id}>
                  {editingLink === link.id ? (
                    <div style={{ border: "1px solid #e0ddd6", borderRadius: 10, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", background: "#fdfcfa" }}>
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />
                      <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} style={inputStyle} />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => updateLink(link.id)} style={{ ...primaryBtn, flex: 1, padding: "0.5rem" }}>Save</button>
                        <button onClick={() => setEditingLink(null)} style={{ ...ghostBtn, flex: 1, padding: "0.5rem" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ border: "1px solid #eeece8", borderRadius: 10, padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", background: "#fff" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.title}</p>
                        <a href={link.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "#aaa", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {link.url}
                        </a>
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                        <button onClick={() => { setEditingLink(link.id); setEditTitle(link.title); setEditUrl(link.url) }} style={ghostBtn}>Edit</button>
                        <button onClick={() => deleteLink(link.id)} style={{ ...ghostBtn, color: "#e55" }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ── helpers ── */

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: 16, padding: "1.75rem", marginBottom: "1.25rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111", margin: 0, letterSpacing: "-0.01em", fontFamily: "Georgia, serif" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: 2 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", marginBottom: "0.35rem" }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.875rem",
  border: "1px solid #e0ddd6",
  borderRadius: 8,
  fontSize: "0.875rem",
  color: "#111",
  background: "#fdfcfa",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
}

const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: "0.875rem",
  cursor: "pointer",
  letterSpacing: "0.02em",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
}

const ghostBtn: React.CSSProperties = {
  padding: "0.35rem 0.75rem",
  background: "none",
  border: "1px solid #e0ddd6",
  borderRadius: 6,
  fontSize: "0.78rem",
  color: "#777",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
}