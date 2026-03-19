import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reviews = await prisma.review.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, role, quote, stars, published, order } = body;

  if (!name || !quote || stars < 1 || stars > 5)
    return NextResponse.json({ error: "Name, quote and stars (1–5) are required" }, { status: 400 });

  const review = await prisma.review.create({
    data: { name, role: role || null, quote, stars: Number(stars), published: !!published, order: Number(order) || 0 },
  });
  return NextResponse.json(review);
}
