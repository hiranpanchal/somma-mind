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
  const { title, description, type, order, lessonContent, audioUrl, questions } = await req.json();

  // Update module
  await prisma.module.update({
    where: { id },
    data: {
      title,
      description: description || null,
      type,
      order: parseInt(order),
    },
  });

  // Upsert lesson
  if (lessonContent || audioUrl) {
    await prisma.lesson.upsert({
      where: { moduleId: id },
      create: { moduleId: id, content: lessonContent || null, audioUrl: audioUrl || null },
      update: { content: lessonContent || null, audioUrl: audioUrl || null },
    });
  }

  // Replace questions
  if (questions !== undefined) {
    // Delete all existing questions (cascade deletes options & answers)
    await prisma.question.deleteMany({ where: { moduleId: id } });

    // Re-create
    for (const q of questions) {
      await prisma.question.create({
        data: {
          moduleId: id,
          text: q.text,
          type: q.type,
          order: q.order,
          options: { create: q.options?.map((o: { text: string; isCorrect: boolean }) => ({ text: o.text, isCorrect: o.isCorrect })) ?? [] },
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.module.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
