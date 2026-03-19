import { prisma } from "@/lib/db";
import ManualEnrollButton from "@/components/admin/ManualEnrollButton";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: { include: { course: { select: { title: true } } } },
      _count: { select: { progress: true } },
    },
  });

  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { id: true, title: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1917]" style={{ fontFamily: "var(--font-playfair)" }}>
            Students
          </h1>
          <p className="text-stone-500 text-sm mt-1">{users.length} registered students</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
          <Users size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500">No students registered yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Enrolled Courses</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Modules Done</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#1c1917]">{user.name}</p>
                    <p className="text-xs text-stone-400">{user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.enrollments.length === 0 ? (
                        <span className="text-stone-400 text-xs">None</span>
                      ) : (
                        user.enrollments.map((e) => (
                          <span key={e.id} className="bg-[#f5e4e7] text-violet-700 text-xs px-2 py-0.5 rounded-full">
                            {e.course.title}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-stone-500">{user._count.progress}</td>
                  <td className="px-5 py-4 text-stone-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <ManualEnrollButton
                      userId={user.id}
                      courses={courses}
                      enrolledCourseIds={user.enrollments.map((e) => e.courseId)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
