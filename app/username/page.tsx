import { prisma } from "@/lib/prisma"

export default async function Profile({ params }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: { links: true },
  })

  if (!user) return <div>User not found</div>

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <img
        src={user.image || "/avatar.png"}
        className="w-24 h-24 rounded-full mx-auto"
      />
      <h2 className="text-2xl font-bold mt-3">{user.name}</h2>

      <div className="mt-6 space-y-3">
        {user.links.map(link => (
          <a
            key={link.id}
            href={link.url}
            className="block bg-white p-3 rounded-xl shadow"
          >
            {link.title}
          </a>
        ))}
      </div>
    </div>
  )
}
