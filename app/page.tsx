import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import Link from "next/link"
import UserMenu from "@/app/components/UserMenu"
import HomeClient from "@/app/components/HomeClient"

export default async function Home() {
  const session = await getAuthSession()
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-blue-600 whitespace-nowrap">
              LinkHub
            </Link>

            {/* Menu */}
            <div className="flex items-center gap-3 ml-auto">
              {session ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-600 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Dashboard
                  </Link>
                  <UserMenu session={session} />
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">CS LinkHub</h1>
          <p className="text-gray-600">Discover amazing link collections from creators</p>
        </div>

        {/* Search and Users */}
        <HomeClient users={users as any} session={session} />
      </div>
    </div>
  )
}
