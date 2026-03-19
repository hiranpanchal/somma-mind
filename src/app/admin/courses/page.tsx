import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, BookOpen, Eye, EyeOff, Pencil } from "lucide-react";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { modules: true, enrollments: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1917]" style={{ fontFamily: "var(--font-playfair)" }}>
            Courses
          </h1>
          <p className="text-stone-500 text-sm mt-1">{courses.length} total courses</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-4 py-2 rounded-xl hover:bg-[#9a5864] transition-colors text-sm"
        >
          <PlusCircle size={14} /> New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
          <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-600 font-medium mb-4">No courses yet</p>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#9a5864] transition-colors text-sm"
          >
            <PlusCircle size={14} /> Create your first course
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Course</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Price</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Modules</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Students</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#1c1917]">{course.title}</p>
                    {course.subtitle && <p className="text-xs text-stone-400 mt-0.5">{course.subtitle}</p>}
                  </td>
                  <td className="px-5 py-4 text-stone-600 font-medium">{formatPrice(course.price)}</td>
                  <td className="px-5 py-4 text-stone-500">{course._count.modules}</td>
                  <td className="px-5 py-4 text-stone-500">{course._count.enrollments}</td>
                  <td className="px-5 py-4">
                    {course.published ? (
                      <span className="inline-flex items-center gap-1 bg-[#eaebdf] text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        <Eye size={10} /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-500 text-xs font-medium px-2 py-0.5 rounded-full">
                        <EyeOff size={10} /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="inline-flex items-center gap-1 text-xs text-[#b76d79] hover:text-[#9a5864] font-medium"
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                      <Link
                        href={`/admin/courses/${course.id}/modules`}
                        className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#b76d79] font-medium"
                      >
                        Modules
                      </Link>
                    </div>
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
