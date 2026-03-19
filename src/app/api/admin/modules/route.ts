import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { courseId, title, description, type, order, lessonContent, audioUrl, questions } = await req.json();

  const module = await prisma.module.create({
    data: {
      courseId,
      title,
      description: description || null,
      type,
      order: parseInt(order),
      lesson: (lessonContent || audioUrl)
        ? { create: { content: lessonContent || null, audioUrl: audioUrl || null } }
        : undefined,
      questions: {
        create: questions?.map((q: { text: string; type: string; order: number; options: { text: string; isCorrect: boolean }[] }) => ({
          text: q.text,
          type: q.type,
          order: q.order,
          options: { create: q.options },
        })) ?? [],
      },
    },
  });

  return NextResponse.json(module, { status: 201 });
}
