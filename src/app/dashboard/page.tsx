import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { BookOpen, ChevronRight, Trophy } from "lucide-react";

async function getStudentData(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: { select: { id: true } },
        },
      },
    },
    orderBy: { purchasedAt: "desc" },
  });

  const progressItems = await prisma.userProgress.findMany({
    where: { userId },
    select: { moduleId: true },
  });

  const completedModuleIds = new Set(progressItems.map((p) => p.moduleId));

  return enrollments.map((enrollment) => {
    const totalModules = enrollment.course.modules.length;
    const completedModules = enrollment.course.modules.filter((m) =>
      completedModuleIds.has(m.id)
    ).length;
    const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    return { ...enrollment, totalModules, completedModules, progress };
  });
}

export default async function DashboardPage() {
  const session = await auth();
  const enrollments = await getStudentData(session!.user.id);

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#e9d8b6] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Greeting */}
          <div className="mb-10">
            <h1
              className="text-3xl font-bold text-[#1c1917]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Welcome back, {session!.user.name?.split(" ")[0]}
            </h1>
            <p className="text-stone-500 mt-1">Continue your transformation journey.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center">
              <p className="text-3xl font-bold text-[#b76d79]">{enrollments.length}</p>
              <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Courses Enrolled</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center">
              <p className="text-3xl font-bold text-[#b76d79]">
                {enrollments.reduce((acc, e) => acc + e.completedModules, 0)}
              </p>
              <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Modules Completed</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center col-span-2 sm:col-span-1">
              <p className="text-3xl font-bold text-[#b76d79]">
                {enrollments.filter((e) => e.progress === 100).length}
              </p>
              <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Completed</p>
            </div>
          </div>

          {/* Enrolled Courses */}
          {enrollments.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
              <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
              <p className="text-stone-600 font-medium text-lg mb-2">No courses yet</p>
              <p className="text-stone-400 text-sm mb-6">Browse our courses and start your healing journey.</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#9a5864] transition-colors"
              >
                Browse Courses <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-[#1c1917] mb-5">My Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {enrollments.map(({ course, progress, completedModules, totalModules }) => (
                  <Link
                    key={course.id}
                    href={`/dashboard/courses/${course.id}`}
                    className="group bg-white rounded-2xl border border-stone-200 hover:border-[#e8b4bc] hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="h-32 bg-gradient-to-br from-[#f5e4e7] to-[#eaebdf] flex items-center justify-center">
                      {progress === 100 ? (
                        <Trophy size={32} className="text-amber-500" />
                      ) : (
                        <BookOpen size={32} className="text-[#b76d79] opacity-60" />
                      )}
                    </div>
                    <div className="p-5">
                      <h3
                        className="font-semibold text-[#1c1917] group-hover:text-[#b76d79] transition-colors mb-1"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        {course.title}
                      </h3>
                      <p className="text-xs text-stone-400 mb-4">
                        {completedModules}/{totalModules} modules completed
                      </p>

                      {/* Progress bar */}
                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div
                          className="bg-[#b76d79] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-stone-400">{progress}% complete</span>
                        <span className="text-xs text-[#b76d79] font-medium group-hover:underline">
                          {progress === 0 ? "Start" : progress === 100 ? "Review" : "Continue"} →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
