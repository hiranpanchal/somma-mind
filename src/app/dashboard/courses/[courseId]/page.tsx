import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CheckCircle, Circle, Headphones, FileText, HelpCircle, ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ courseId: string }>;
}

const typeIcon = { TEXT: FileText, AUDIO: Headphones, QUIZ: HelpCircle };
const typeLabel = { TEXT: "Lesson", AUDIO: "Meditation", QUIZ: "Reflection" };

export default async function CourseSyllabusPage({ params }: Props) {
  const { courseId } = await params;
  const session = await auth();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session!.user.id, courseId } },
  });
  if (!enrollment) redirect("/dashboard");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { orderBy: { order: "asc" } } },
  });
  if (!course) notFound();

  const progress = await prisma.userProgress.findMany({
    where: { userId: session!.user.id, module: { courseId } },
    select: { moduleId: true },
  });
  const completedIds = new Set(progress.map((p) => p.moduleId));

  const completedCount = course.modules.filter((m) => completedIds.has(m.id)).length;
  const progressPercent =
    course.modules.length > 0
      ? Math.round((completedCount / course.modules.length) * 100)
      : 0;

  // Find first incomplete module
  const firstIncomplete = course.modules.find((m) => !completedIds.has(m.id));

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#f2f2f2] py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#b76d79] mb-6">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-6">
            <h1
              className="text-2xl font-bold text-[#1c1917] mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {course.title}
            </h1>
            <p className="text-stone-500 text-sm mb-5">{completedCount}/{course.modules.length} modules completed</p>

            <div className="w-full bg-stone-100 rounded-full h-2.5 mb-5">
              <div
                className="bg-[#b76d79] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {firstIncomplete && (
              <Link
                href={`/dashboard/courses/${courseId}/modules/${firstIncomplete.id}`}
                className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#9a5864] transition-colors text-sm"
              >
                {completedCount === 0 ? "Start Course" : "Continue Where You Left Off"} →
              </Link>
            )}
            {progressPercent === 100 && (
              <p className="text-green-600 font-medium text-sm flex items-center gap-2">
                <CheckCircle size={16} /> Course Complete — Congratulations!
              </p>
            )}
          </div>

          <h2 className="text-lg font-semibold text-[#1c1917] mb-4">Course Modules</h2>
          <div className="space-y-2">
            {course.modules.map((mod, index) => {
              const Icon = typeIcon[mod.type];
              const completed = completedIds.has(mod.id);
              return (
                <Link
                  key={mod.id}
                  href={`/dashboard/courses/${courseId}/modules/${mod.id}`}
                  className="flex items-center gap-4 bg-white rounded-xl border border-stone-200 hover:border-[#e8b4bc] hover:shadow-sm px-5 py-4 transition-all group"
                >
                  <span className="text-xs font-bold text-stone-400 w-5">{index + 1}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${completed ? "bg-[#eaebdf]" : "bg-[#f5e4e7]"}`}>
                    {completed ? (
                      <CheckCircle size={14} className="text-green-600" />
                    ) : (
                      <Icon size={14} className="text-[#b76d79]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${completed ? "text-stone-500 line-through" : "text-[#1c1917] group-hover:text-[#b76d79]"} transition-colors`}>
                      {mod.title}
                    </p>
                    {mod.description && (
                      <p className="text-xs text-stone-400 mt-0.5">{mod.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    {typeLabel[mod.type]}
                  </span>
                  {completed ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <Circle size={14} className="text-stone-300" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
