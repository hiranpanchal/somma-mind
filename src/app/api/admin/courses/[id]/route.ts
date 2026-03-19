import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const course = await prisma.course.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      subtitle: body.subtitle || null,
      description: body.description,
      price: parseFloat(body.price),
      published: body.published,
      order: parseInt(body.order),
    },
  });

  return NextResponse.json(course);
}

export async function DELETE(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.course.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
