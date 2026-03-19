import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import ModuleEditor from "@/components/admin/ModuleEditor";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string; moduleId: string }>;
}

export default async function EditModulePage({ params }: Props) {
  const { id, moduleId } = await params;
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      lesson: true,
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { id: "asc" } } },
      },
    },
  });
  if (!mod || mod.courseId !== id) notFound();

  return (
    <div>
      <Link href={`/admin/courses/${id}/modules`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#b76d79] mb-6">
        <ChevronLeft size={14} /> Back to Modules
      </Link>
      <h1 className="text-2xl font-bold text-[#1c1917] mb-8" style={{ fontFamily: "var(--font-playfair)" }}>
        Edit Module
      </h1>
      <ModuleEditor
        mode="edit"
        courseId={id}
        initialData={{
          id: mod.id,
          courseId: id,
          title: mod.title,
          description: mod.description ?? "",
          type: mod.type,
          order: mod.order.toString(),
          lessonContent: mod.lesson?.content ?? "",
          audioUrl: mod.lesson?.audioUrl ?? "",
          questions: mod.questions.map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            order: q.order,
            options: q.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
          })),
        }}
      />
    </div>
  );
}
