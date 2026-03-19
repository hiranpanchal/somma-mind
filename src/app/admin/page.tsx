import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BookOpen, Users, GraduationCap, PlusCircle } from "lucide-react";

export default async function AdminDashboard() {
  const [courses, enrollments, users] = await Promise.all([
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
  ]);

  const recentEnrollments = await prisma.enrollment.findMany({
    take: 5,
    orderBy: { purchasedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1917]" style={{ fontFamily: "var(--font-playfair)" }}>
            Admin Dashboard
          </h1>
          <p className="text-stone-500 text-sm mt-1">Manage your courses, modules, and students.</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-4 py-2 rounded-xl hover:bg-[#9a5864] transition-colors text-sm"
        >
          <PlusCircle size={14} /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {[
          { label: "Total Courses", value: courses, icon: BookOpen, color: "bg-[#f5e4e7] text-[#b76d79]" },
          { label: "Total Students", value: users, icon: Users, color: "bg-blue-100 text-blue-600" },
          { label: "Enrollments", value: enrollments, icon: GraduationCap, color: "bg-[#eaebdf] text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-200 p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1c1917]">{value}</p>
              <p className="text-xs text-stone-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <Link
          href="/admin/courses"
          className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-[#e8b4bc] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={18} className="text-[#b76d79]" />
            <h3 className="font-semibold text-[#1c1917] group-hover:text-[#b76d79] transition-colors">Manage Courses</h3>
          </div>
          <p className="text-sm text-stone-500">Create, edit, and publish training courses</p>
        </Link>
        <Link
          href="/admin/users"
          className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-[#e8b4bc] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users size={18} className="text-[#b76d79]" />
            <h3 className="font-semibold text-[#1c1917] group-hover:text-[#b76d79] transition-colors">Manage Students</h3>
          </div>
          <p className="text-sm text-stone-500">View student accounts and manage enrollments</p>
        </Link>
      </div>

      {/* Recent enrollments */}
      <div>
        <h2 className="text-lg font-semibold text-[#1c1917] mb-4">Recent Enrollments</h2>
        {recentEnrollments.length === 0 ? (
          <p className="text-stone-400 text-sm">No enrollments yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-stone-100 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Course</th>
                    <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.map((e) => (
                    <tr key={e.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#1c1917]">{e.user.name}</p>
                        <p className="text-xs text-stone-400">{e.user.email}</p>
                      </td>
                      <td className="px-5 py-3 text-stone-600">{e.course.title}</td>
                      <td className="px-5 py-3 text-stone-400 whitespace-nowrap">{new Date(e.purchasedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
