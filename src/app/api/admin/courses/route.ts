import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, slug, subtitle, description, price, published, order } = await req.json();

  if (!title || !slug || !description) {
    return NextResponse.json({ error: "Title, slug, and description are required." }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: { title, slug, subtitle: subtitle || null, description, price: parseFloat(price), published, order: parseInt(order) },
  });

  return NextResponse.json(course, { status: 201 });
}
