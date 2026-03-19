import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { BookOpen, Clock } from "lucide-react";

async function getCourses() {
  return prisma.course.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: { _count: { select: { modules: true } } },
  });
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#e9d8b6]">
        {/* Hero */}
        <section className="bg-white border-b border-stone-100 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl md:text-5xl font-bold text-[#1c1917] mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Training Courses
            </h1>
            <p className="text-stone-600 text-lg max-w-xl mx-auto">
              Deep-dive programs combining hypnotherapy, brainspotting, and somatic healing techniques.
            </p>
          </div>
        </section>

        {/* Course Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {courses.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
                <p className="text-stone-500 text-lg">New courses coming soon.</p>
                <p className="text-stone-400 text-sm mt-2">Check back shortly or sign up to be notified.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#e8b4bc] hover:shadow-xl transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <div className="h-52 bg-gradient-to-br from-[#f5e4e7] via-[#f0edea] to-[#eaebdf] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#b76d79]/10 to-[#9a5864]/20" />
                      <BookOpen size={48} className="text-[#b76d79] opacity-50 relative z-10" />
                    </div>

                    <div className="p-6">
                      <h2
                        className="text-xl font-semibold text-[#1c1917] mb-2 group-hover:text-[#b76d79] transition-colors leading-snug"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        {course.title}
                      </h2>
                      {course.subtitle && (
                        <p className="text-sm text-stone-500 mb-3">{course.subtitle}</p>
                      )}
                      <p className="text-sm text-stone-600 leading-relaxed line-clamp-2 mb-5">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                        <span className="text-[#b76d79] font-bold text-xl">{formatPrice(course.price)}</span>
                        <div className="flex items-center gap-1 text-xs text-stone-400">
                          <Clock size={12} />
                          {course._count.modules} modules
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
