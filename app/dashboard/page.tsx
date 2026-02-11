"use client"

import { useState } from "react"

export default function Dashboard() {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  async function addLink() {
    await fetch("/api/link", {
      method: "POST",
      body: JSON.stringify({ title, url }),
    })
    location.reload()
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <input
        className="border p-2 w-full mt-4"
        placeholder="Title"
        onChange={e => setTitle(e.target.value)}
      />

      <input
        className="border p-2 w-full mt-2"
        placeholder="URL"
        onChange={e => setUrl(e.target.value)}
      />

      <button
        onClick={addLink}
        className="bg-black text-white px-4 py-2 mt-3 rounded"
      >
        Add Link
      </button>
    </div>
  )
}
