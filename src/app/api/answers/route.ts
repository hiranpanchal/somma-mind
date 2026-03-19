import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { answers, moduleId } = await req.json();

  // answers: { questionId: value }
  const upserts = Object.entries(answers).map(([questionId, value]) =>
    prisma.userAnswer.upsert({
      where: { userId_questionId: { userId: session.user.id, questionId } },
      create: {
        userId: session.user.id,
        questionId,
        answer: JSON.stringify(value),
      },
      update: {
        answer: JSON.stringify(value),
      },
    })
  );

  await prisma.$transaction(upserts);

  return NextResponse.json({ ok: true });
}
