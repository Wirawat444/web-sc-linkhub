import { prisma } from "@/lib/prisma"

export default async function Home() {
  const users = await prisma.user.findMany()

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">CS LinkHub</h1>

      <input
        className="w-full border p-3 rounded-lg mb-6"
        placeholder="Search"
      />

      {users.map(user => (
        <a
          key={user.id}
          href={`/${user.username}`}
          className="block p-4 bg-white rounded-xl shadow mb-3"
        >
          {user.name}
        </a>
      ))}
    </div>
  )
}
