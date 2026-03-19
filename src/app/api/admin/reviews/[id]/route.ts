import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { name, role, quote, stars, published, order } = body;

  const review = await prisma.review.update({
    where: { id },
    data: { name, role: role || null, quote, stars: Number(stars), published: !!published, order: Number(order) || 0 },
  });
  return NextResponse.json(review);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
