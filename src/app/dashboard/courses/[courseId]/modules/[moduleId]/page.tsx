import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import MarkCompleteButton from "@/components/course/MarkCompleteButton";
import AudioPlayer from "@/components/course/AudioPlayer";
import QuizForm from "@/components/course/QuizForm";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function ModuleViewerPage({ params }: Props) {
  const { courseId, moduleId } = await params;
  const session = await auth();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session!.user.id, courseId } },
  });
  if (!enrollment) redirect("/dashboard");

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      lesson: true,
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
      course: { select: { id: true, title: true } },
    },
  });
  if (!mod || mod.courseId !== courseId) notFound();

  // Get all modules for navigation
  const allModules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: { id: true, title: true, order: true },
  });

  const currentIndex = allModules.findIndex((m) => m.id === moduleId);
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

  const isCompleted = !!(await prisma.userProgress.findUnique({
    where: { userId_moduleId: { userId: session!.user.id, moduleId } },
  }));

  const existingAnswers = await prisma.userAnswer.findMany({
    where: {
      userId: session!.user.id,
      questionId: { in: mod.questions.map((q) => q.id) },
    },
  });

  const answersMap = Object.fromEntries(
    existingAnswers.map((a) => [a.questionId, JSON.parse(a.answer)])
  );

  return (
    <>
      <Header />
      <div className="flex-1 min-h-screen bg-[#e9d8b6]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
            <Link href="/dashboard" className="hover:text-[#b76d79] transition-colors">Dashboard</Link>
            <ChevronRight size={14} />
            <Link href={`/dashboard/courses/${courseId}`} className="hover:text-[#b76d79] transition-colors">
              {mod.course.title}
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#1c1917] font-medium">{mod.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar: Module list */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-2xl border border-stone-200 p-4 sticky top-24">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 px-1">
                  Course Modules
                </p>
                <div className="space-y-1">
                  {allModules.map((m, i) => (
                    <Link
                      key={m.id}
                      href={`/dashboard/courses/${courseId}/modules/${m.id}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        m.id === moduleId
                          ? "bg-[#f5e4e7] text-[#b76d79] font-medium"
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <span className="text-xs text-stone-400 w-4">{i + 1}</span>
                      <span className="line-clamp-1">{m.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-white rounded-2xl border border-stone-200 p-8">
                <div className="mb-6">
                  <p className="text-xs font-semibold text-[#b76d79] uppercase tracking-widest mb-2">
                    {mod.type === "TEXT" ? "Lesson" : mod.type === "AUDIO" ? "Meditation" : "Reflection"}
                  </p>
                  <h1
                    className="text-2xl md:text-3xl font-bold text-[#1c1917]"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {mod.title}
                  </h1>
                  {mod.description && (
                    <p className="text-stone-500 mt-2">{mod.description}</p>
                  )}
                </div>

                {/* TEXT content */}
                {mod.type === "TEXT" && mod.lesson?.content && (
                  <div
                    className="prose-somma max-w-none"
                    dangerouslySetInnerHTML={{ __html: mod.lesson.content }}
                  />
                )}

                {/* AUDIO content */}
                {mod.type === "AUDIO" && (
                  <div>
                    {mod.lesson?.content && (
                      <div
                        className="prose-somma max-w-none mb-8"
                        dangerouslySetInnerHTML={{ __html: mod.lesson.content }}
                      />
                    )}
                    {mod.lesson?.audioUrl && (
                      <AudioPlayer src={mod.lesson.audioUrl} title={mod.title} />
                    )}
                  </div>
                )}

                {/* QUIZ content */}
                {mod.type === "QUIZ" && (
                  <QuizForm
                    questions={mod.questions}
                    existingAnswers={answersMap}
                    moduleId={moduleId}
                    courseId={courseId}
                  />
                )}
              </div>

              {/* Complete + Navigation */}
              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  {prevModule && (
                    <Link
                      href={`/dashboard/courses/${courseId}/modules/${prevModule.id}`}
                      className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#b76d79] transition-colors"
                    >
                      <ChevronLeft size={14} /> Previous
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <MarkCompleteButton
                    moduleId={moduleId}
                    courseId={courseId}
                    isCompleted={isCompleted}
                  />
                  {nextModule && (
                    <Link
                      href={`/dashboard/courses/${courseId}/modules/${nextModule.id}`}
                      className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#9a5864] transition-colors text-sm"
                    >
                      Next <ChevronRight size={14} />
                    </Link>
                  )}
                  {!nextModule && !isCompleted && (
                    <span className="text-xs text-stone-400">Last module — mark complete to finish!</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
