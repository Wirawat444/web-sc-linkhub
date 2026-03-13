"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const sans = "'Helvetica Neue', Arial, sans-serif"

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.875rem",
  border: "1px solid #e0ddd6",
  borderRadius: 8,
  fontSize: "0.875rem",
  color: "#111",
  background: "#fdfcfa",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: sans,
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch {
      setError("Failed to sign in with Google")
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })
      if (!result?.ok || result?.error) {
        setError(result?.error || "Invalid email or password")
        setLoading(false)
        return
      }
      router.push(callbackUrl)
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f9f9f7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      fontFamily: sans,
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#111", fontFamily: "Georgia, serif" }}>
              CS<span style={{ color: "#c0a882" }}>LinkHub</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: 20, padding: "2.25rem 2rem" }}>

          {/* Heading */}
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c0a882", marginBottom: "0.5rem" }}>
              Welcome back
            </p>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 400, letterSpacing: "-0.03em", color: "#111", margin: 0, fontFamily: "Georgia, serif" }}>
              Sign in
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: 8, padding: "0.65rem 0.875rem", marginBottom: "1.25rem", fontSize: "0.8rem", color: "#c00", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {error}
              <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#c00", cursor: "pointer", fontSize: "0.9rem" }}>✕</button>
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              padding: "0.7rem",
              border: "1px solid #e0ddd6",
              borderRadius: 8,
              background: "#fdfcfa",
              color: "#333",
              fontSize: "0.875rem",
              fontFamily: sans,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              marginBottom: "1.5rem",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? "Signing in…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: 1, background: "#eeece8" }} />
            <span style={{ fontSize: "0.72rem", color: "#bbb", letterSpacing: "0.05em", textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#eeece8" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", marginBottom: "0.35rem" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                required
                style={{ ...inputStyle, opacity: loading ? 0.6 : 1 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", marginBottom: "0.35rem" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                required
                style={{ ...inputStyle, opacity: loading ? 0.6 : 1 }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.7rem",
                background: loading ? "#ccc" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "0.875rem",
                fontFamily: sans,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.02em",
                marginTop: "0.25rem",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#aaa", marginTop: "1.5rem" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "#111", fontWeight: 600, textDecoration: "none" }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Back home */}
        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/" style={{ fontSize: "0.78rem", color: "#bbb", textDecoration: "none" }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}