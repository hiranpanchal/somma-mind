import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import ModuleEditor from "@/components/admin/ModuleEditor";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewModulePage({ params }: Props) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id }, select: { id: true, title: true, modules: { select: { order: true } } } });
  if (!course) notFound();

  const nextOrder = course.modules.length > 0
    ? Math.max(...course.modules.map((m) => m.order)) + 1
    : 0;

  return (
    <div>
      <Link href={`/admin/courses/${id}/modules`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#b76d79] mb-6">
        <ChevronLeft size={14} /> Back to Modules
      </Link>
      <h1 className="text-2xl font-bold text-[#1c1917] mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
        Add Module
      </h1>
      <p className="text-stone-500 text-sm mb-8">Adding to: <strong>{course.title}</strong></p>
      <ModuleEditor mode="create" courseId={id} initialData={{ courseId: id, title: "", description: "", type: "TEXT", order: nextOrder.toString(), lessonContent: "", audioUrl: "", questions: [] }} />
    </div>
  );
}
