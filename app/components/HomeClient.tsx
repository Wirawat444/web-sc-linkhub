"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

interface User {
  id: string
  name: string | null
  username: string | null
  email: string
  image: string | null
}

interface HomeClientProps {
  users: User[]
  session: any
}

export default function HomeClient({ users, session }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users

    const query = searchQuery.toLowerCase()
    return users.filter(
      (user) =>
        (user.name?.toLowerCase().includes(query)) ||
        (user.username?.toLowerCase().includes(query)) ||
        (user.email.toLowerCase().includes(query))
    )
  }, [users, searchQuery])

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
          placeholder="Search creators by name, username, or email..."
        />
      </div>

      {/* Results Info */}
      {searchQuery && (
        <p className="text-gray-600 text-sm">
          Found {filteredUsers.length} creator{filteredUsers.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Users Grid */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {searchQuery ? "No creators found" : "No users yet"}
            </p>
          </div>
        ) : (
          <>
            {!searchQuery && (
              <p className="text-gray-600 text-sm mb-4">
                {filteredUsers.length} creator{filteredUsers.length !== 1 ? "s" : ""}
              </p>
            )}
            {filteredUsers.map((user) => (
              <a
                key={user.id}
                href={`/${user.username}`}
                className="block p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  {user.image && (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
              </a>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
