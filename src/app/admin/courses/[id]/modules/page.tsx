import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ChevronLeft, PlusCircle, Pencil, FileText, Headphones, HelpCircle } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const typeIcon = { TEXT: FileText, AUDIO: Headphones, QUIZ: HelpCircle };
const typeColor = {
  TEXT: "bg-blue-100 text-blue-600",
  AUDIO: "bg-[#f5e4e7] text-[#b76d79]",
  QUIZ: "bg-[#eaebdf] text-amber-600",
};

export default async function AdminModulesPage({ params }: Props) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { modules: { orderBy: { order: "asc" } } },
  });
  if (!course) notFound();

  return (
    <div>
      <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#b76d79] mb-6">
        <ChevronLeft size={14} /> Back to Courses
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1917]" style={{ fontFamily: "var(--font-playfair)" }}>
            {course.title}
          </h1>
          <p className="text-stone-500 text-sm mt-1">{course.modules.length} modules</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/courses/${id}`}
            className="inline-flex items-center gap-2 bg-stone-100 text-stone-700 font-semibold px-4 py-2 rounded-xl hover:bg-stone-200 transition-colors text-sm"
          >
            <Pencil size={12} /> Edit Course
          </Link>
          <Link
            href={`/admin/courses/${id}/modules/new`}
            className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-4 py-2 rounded-xl hover:bg-[#9a5864] transition-colors text-sm"
          >
            <PlusCircle size={14} /> Add Module
          </Link>
        </div>
      </div>

      {course.modules.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-500 mb-4">No modules yet. Add your first module to get started.</p>
          <Link
            href={`/admin/courses/${id}/modules/new`}
            className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#9a5864] transition-colors text-sm"
          >
            <PlusCircle size={14} /> Add First Module
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {course.modules.map((mod, index) => {
            const Icon = typeIcon[mod.type];
            const colorClass = typeColor[mod.type];
            return (
              <div
                key={mod.id}
                className="flex items-center gap-4 bg-white rounded-xl border border-stone-200 px-5 py-4"
              >
                <span className="text-xs font-bold text-stone-400 w-5">{index + 1}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#1c1917] text-sm">{mod.title}</p>
                  {mod.description && (
                    <p className="text-xs text-stone-400 mt-0.5">{mod.description}</p>
                  )}
                </div>
                <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                  {mod.type}
                </span>
                <Link
                  href={`/admin/courses/${id}/modules/${mod.id}`}
                  className="inline-flex items-center gap-1 text-xs text-[#b76d79] hover:text-[#9a5864] font-medium"
                >
                  <Pencil size={11} /> Edit
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
