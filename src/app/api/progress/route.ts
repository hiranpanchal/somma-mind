import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleId, completed } = await req.json();

  if (completed) {
    await prisma.userProgress.upsert({
      where: { userId_moduleId: { userId: session.user.id, moduleId } },
      create: { userId: session.user.id, moduleId },
      update: {},
    });
  } else {
    await prisma.userProgress.deleteMany({
      where: { userId: session.user.id, moduleId },
    });
  }

  return NextResponse.json({ ok: true });
}
