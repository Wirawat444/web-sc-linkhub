import { prisma } from "@/lib/prisma"

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    include: {
      links: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User not found</h1>
          <p className="text-gray-600">
            The profile you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8 text-center">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.name}</h1>
          <p className="text-gray-600 mb-4">@{user.username}</p>
          {user.links.length > 0 && (
            <p className="text-sm text-gray-500">
              {user.links.length} link{user.links.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Links Grid */}
        <div className="space-y-3">
          {user.links.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">No links yet</p>
            </div>
          ) : (
            user.links.map((link: any) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all hover:scale-105 transform"
              >
                <p className="font-bold text-gray-900 text-lg">{link.title}</p>
                <p className="text-sm text-gray-500 truncate mt-1">{link.url}</p>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
