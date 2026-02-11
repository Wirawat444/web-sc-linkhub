"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Link {
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
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  
  // Profile form
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileUpdating, setProfileUpdating] = useState(false)
  
  // Link form
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [linkLoading, setLinkLoading] = useState(false)
  
  // Edit mode
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editUrl, setEditUrl] = useState("")
  
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Load user profile
  const loadProfile = async () => {
    try {
      setProfileLoading(true)
      const res = await fetch("/api/user/profile")
      if (!res.ok) throw new Error("Failed to load profile")
      const data = await res.json()
      setUser(data)
      setName(data.name || "")
      setUsername(data.username || "")
      setError("")
    } catch (err) {
      setError("Failed to load profile")
    } finally {
      setProfileLoading(false)
    }
  }

  // Load links
  const loadLinks = async () => {
    try {
      const res = await fetch("/api/link")
      if (!res.ok) throw new Error("Failed to load links")
      const data = await res.json()
      setLinks(data)
    } catch (err) {
      setError("Failed to load links")
    }
  }

  useEffect(() => {
    if (session) {
      loadProfile()
      loadLinks()
    }
  }, [session])

  // Update profile
  const updateProfile = async () => {
    if (!name.trim() || !username.trim()) {
      setError("Name and username are required")
      return
    }

    setProfileUpdating(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username }),
      })
      if (!res.ok) throw new Error("Failed to update profile")
      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
      await loadProfile()
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setProfileUpdating(false)
    }
  }

  // Add link
  const addLink = async () => {
    if (!title.trim() || !url.trim()) {
      setError("Please fill in both fields")
      return
    }

    setLinkLoading(true)
    try {
      const res = await fetch("/api/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      })
      if (!res.ok) throw new Error("Failed to add link")

      setTitle("")
      setUrl("")
      setError("")
      setSuccess("Link added successfully!")
      setTimeout(() => setSuccess(""), 3000)
      await loadLinks()
    } catch (err) {
      setError("Failed to add link")
    } finally {
      setLinkLoading(false)
    }
  }

  // Update link
  const updateLink = async (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) {
      setError("Please fill in both fields")
      return
    }

    try {
      const res = await fetch(`/api/link/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, url: editUrl }),
      })
      if (!res.ok) throw new Error("Failed to update link")

      setEditingLink(null)
      setError("")
      setSuccess("Link updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
      await loadLinks()
    } catch (err) {
      setError("Failed to update link")
    }
  }

  // Delete link
  const deleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return

    try {
      const res = await fetch(`/api/link/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete link")
      setSuccess("Link deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
      await loadLinks()
    } catch (err) {
      setError("Failed to delete link")
    }
  }

  if (status === "loading" || profileLoading) {
    return <div className="max-w-2xl mx-auto p-6 text-center">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* PROFILE SETTINGS */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={profileUpdating}
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
              disabled={profileUpdating}
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="username"
            />
            {username && (
              <p className="text-sm text-gray-500 mt-2">
                Your profile URL: <strong>http://localhost:3000/{username}</strong>
              </p>
            )}
          </div>

          <button
            onClick={updateProfile}
            disabled={profileUpdating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            {profileUpdating ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* ADD LINK */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Add New Link</h2>
        <div className="space-y-3">
          <input
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Link title (e.g., My Portfolio)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={linkLoading}
          />
          <input
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={linkLoading}
          />

          <button
            onClick={addLink}
            disabled={linkLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            {linkLoading ? "Adding..." : "Add Link"}
          </button>
        </div>
      </div>

      {/* LINKS LIST */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Your Links</h2>
        <div className="space-y-3">
          {links.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No links yet. Add your first link above!</p>
            </div>
          ) : (
            links.map((link) => (
              <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                {editingLink === link.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border border-gray-200 p-2 rounded text-sm"
                      placeholder="Link title"
                    />
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full border border-gray-200 p-2 rounded text-sm"
                      placeholder="URL"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateLink(link.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingLink(null)}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-2 rounded text-sm font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{link.title}</p>
                      <p className="text-sm text-gray-500 truncate">{link.url}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingLink(link.id)
                          setEditTitle(link.title)
                          setEditUrl(link.url)
                        }}
                        className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="text-red-600 hover:bg-red-50 px-3 py-2 rounded text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
