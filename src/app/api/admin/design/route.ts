import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await prisma.siteContent.findMany();
  const content: Record<string, string> = {};
  for (const row of rows) content[row.id] = row.value;
  return NextResponse.json(content);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updates: Record<string, string> = await req.json();

  await Promise.all(
    Object.entries(updates).map(([id, value]) =>
      prisma.siteContent.upsert({
        where: { id },
        update: { value },
        create: { id, value },
      })
    )
  );

  return NextResponse.json({ success: true });
}
