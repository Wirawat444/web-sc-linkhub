"use client"

import { useState, useEffect } from "react"

interface LikeButtonProps {
  targetUserId: string
  initialLikes: number
  isLoggedIn: boolean
}

const sans = "'Helvetica Neue', Arial, sans-serif"

export default function LikeButton({ targetUserId, initialLikes, isLoggedIn }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      fetch(`/api/user/${targetUserId}/like/status`)
        .then(res => res.json())
        .then(data => setIsLiked(data.hasLiked))
        .catch(err => console.error("Error fetching like status:", err))
    }
  }, [targetUserId, isLoggedIn])

  const handleLike = async () => {
    if (!isLoggedIn || isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/user/${targetUserId}/like`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        const newIsLiked = !isLiked
        const newLikes = isLiked ? likes - 1 : likes + 1
        setIsLiked(newIsLiked)
        setLikes(newLikes)
        window.dispatchEvent(new CustomEvent("likeUpdated", {
          detail: { targetUserId, liked: newIsLiked, likesCount: newLikes }
        }))
      }
    } catch (err) {
      console.error("Error toggling like:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // ── not logged in: static pill ──
  if (!isLoggedIn) {
    return (
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "0.6rem 1.25rem",
        borderRadius: 100,
        border: "1px solid #eee",
        background: "#f7f6f3",
        fontFamily: sans,
        fontSize: "0.95rem",
        color: "#888",
        userSelect: "none",
      }}>
        <span style={{ color: "#e57" }}>♥</span>
        <span style={{ fontWeight: 600, color: "#555" }}>{likes}</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      title={isLiked ? "Unlike" : "Like"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "0.6rem 1.25rem",
        borderRadius: 100,
        border: isLiked ? "1px solid #f5c0c0" : "1px solid #e0ddd6",
        background: isLiked ? "#fff0f0" : "#f7f6f3",
        fontFamily: sans,
        fontSize: "0.95rem",
        color: isLiked ? "#c0392b" : "#888",
        cursor: isLoading ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.6 : 1,
        transition: "all 0.15s",
        outline: "none",
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.borderColor = isLiked ? "#e57" : "#bbb"
          e.currentTarget.style.background = isLiked ? "#ffe4e4" : "#eeecea"
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isLiked ? "#f5c0c0" : "#e0ddd6"
        e.currentTarget.style.background = isLiked ? "#fff0f0" : "#f7f6f3"
      }}
    >
      <span style={{
        color: isLiked ? "#e57" : "#bbb",
        fontSize: "1rem",
        transition: "transform 0.1s",
        display: "inline-block",
        transform: isLiked ? "scale(1.2)" : "scale(1)",
      }}>
        {isLiked ? "♥" : "♡"}
      </span>
      <span style={{ fontWeight: 600, color: isLiked ? "#c0392b" : "#555" }}>
        {likes}
      </span>
    </button>
  )
}