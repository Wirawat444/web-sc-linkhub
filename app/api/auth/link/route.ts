import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  await prisma.link.create({
    data: {
      title: body.title,
      url: body.url,
      order: 0,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
