import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar, BookOpen, CheckSquare, Key } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import ResetPasswordButton from "@/components/admin/ResetPasswordButton";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              modules: { orderBy: { order: "asc" } },
            },
          },
        },
        orderBy: { purchasedAt: "desc" },
      },
      progress: {
        include: {
          module: { select: { title: true, type: true, courseId: true } },
        },
      },
    },
  });

  if (!user || user.role !== "STUDENT") notFound();

  const totalModules = user.enrollments.reduce((sum, e) => sum + e.course.modules.length, 0);
  const completedModules = user.progress.length;

  return (
    <div>
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#b76d79] mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Students
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#f5e4e7] flex items-center justify-center text-xl font-bold text-[#b76d79]" style={{ fontFamily: "var(--font-playfair)" }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1c1917]" style={{ fontFamily: "var(--font-playfair)" }}>
              {user.name}
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">{user.email}</p>
          </div>
        </div>
        <ResetPasswordButton userId={user.id} userEmail={user.email} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Joined", value: new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), icon: Calendar, color: "bg-[#f5e4e7] text-[#b76d79]" },
          { label: "Courses Enrolled", value: user.enrollments.length, icon: BookOpen, color: "bg-[#eaebdf] text-[#85896c]" },
          { label: "Modules Completed", value: completedModules, icon: CheckSquare, color: "bg-blue-50 text-blue-500" },
          { label: "Total Modules", value: totalModules, icon: CheckSquare, color: "bg-stone-100 text-stone-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold text-[#1c1917] mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Details card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-[#1c1917] mb-4">Account Details</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail size={14} className="text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 font-medium">Email</p>
                <p className="text-sm text-stone-700">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={14} className="text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 font-medium">Joined</p>
                <p className="text-sm text-stone-700">
                  {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Key size={14} className="text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 font-medium">Password</p>
                <p className="text-sm text-stone-700">••••••••</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-[#1c1917] mb-4">Enrolled Courses</h2>
          {user.enrollments.length === 0 ? (
            <p className="text-sm text-stone-400">Not enrolled in any courses yet.</p>
          ) : (
            <div className="space-y-4">
              {user.enrollments.map((enrollment) => {
                const courseProgress = user.progress.filter(
                  (p) => p.module.courseId === enrollment.courseId
                ).length;
                const courseTotal = enrollment.course.modules.length;
                const pct = courseTotal > 0 ? Math.round((courseProgress / courseTotal) * 100) : 0;

                return (
                  <div key={enrollment.id} className="border border-stone-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-medium text-sm text-[#1c1917]">{enrollment.course.title}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Enrolled {new Date(enrollment.purchasedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          {enrollment.stripeSessionId && (
                            <span className="ml-2 text-stone-300">· Paid via Stripe</span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[#b76d79] bg-[#f5e4e7] px-2 py-0.5 rounded-full flex-shrink-0">
                        {formatPrice(enrollment.course.price)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#b76d79] h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-stone-500 flex-shrink-0">{courseProgress}/{courseTotal} modules</span>
                    </div>

                    {/* Module list */}
                    {enrollment.course.modules.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {enrollment.course.modules.map((mod) => {
                          const done = user.progress.some((p) => p.moduleId === mod.id);
                          return (
                            <div key={mod.id} className="flex items-center gap-2 text-xs text-stone-500">
                              <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center ${done ? "bg-[#b76d79] border-[#b76d79]" : "border-stone-300"}`}>
                                {done && (
                                  <svg viewBox="0 0 10 10" className="w-2 h-2 text-white" fill="none">
                                    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                              <span className={done ? "line-through text-stone-400" : ""}>{mod.title}</span>
                              <span className="text-stone-300 capitalize">({mod.type.toLowerCase()})</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
