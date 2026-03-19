import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import EnrollButton from "@/components/course/EnrollButton";
import { BookOpen, Clock, CheckCircle, Headphones, FileText, HelpCircle } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

const moduleTypeIcon = {
  TEXT: FileText,
  AUDIO: Headphones,
  QUIZ: HelpCircle,
};

const moduleTypeLabel = {
  TEXT: "Lesson",
  AUDIO: "Meditation",
  QUIZ: "Reflection",
};

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      modules: { orderBy: { order: "asc" } },
      _count: { select: { modules: true, enrollments: true } },
    },
  });

  if (!course) notFound();

  const isEnrolled = session?.user
    ? !!(await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.user.id, courseId: course.id },
        },
      }))
    : false;

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#f2f2f2]">
        {/* Hero */}
        <section className="bg-white border-b border-stone-100 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
              <div className="lg:col-span-3">
                <p className="text-xs font-semibold text-[#b76d79] uppercase tracking-widest mb-3">
                  the Somaa Mind Training
                </p>
                <h1
                  className="text-3xl md:text-4xl font-bold text-[#1c1917] mb-4 leading-tight"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {course.title}
                </h1>
                {course.subtitle && (
                  <p className="text-xl text-stone-500 mb-5" dangerouslySetInnerHTML={{ __html: course.subtitle }} />
                )}
                <p className="text-stone-600 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: course.description }} />
                <div className="flex items-center gap-6 text-sm text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> {course._count.modules} modules
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={14} /> Self-paced
                  </span>
                </div>
              </div>

              {/* Purchase card */}
              <div className="lg:col-span-2">
                <div className="bg-[#e8e2db] rounded-2xl border border-stone-200 p-6 shadow-sm sticky top-24">
                  <div className="h-40 bg-gradient-to-br from-[#f5e4e7] to-[#eaebdf] rounded-xl flex items-center justify-center mb-5">
                    <BookOpen size={48} className="text-[#b76d79] opacity-50" />
                  </div>
                  <div className="text-3xl font-bold text-[#1c1917] mb-1">
                    {formatPrice(course.price)}
                  </div>
                  <p className="text-stone-500 text-sm mb-5">One-time purchase · Lifetime access</p>

                  {isEnrolled ? (
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="block w-full text-center bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Continue Learning
                    </Link>
                  ) : (
                    <EnrollButton courseId={course.id} price={course.price} title={course.title} />
                  )}

                  <ul className="mt-5 space-y-2">
                    {[
                      "Lifetime access",
                      "Audio meditations included",
                      "Reflection exercises",
                      "Self-paced learning",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-stone-600">
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-2xl font-bold text-[#1c1917] mb-8"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Course Curriculum
            </h2>
            <div className="space-y-3">
              {course.modules.map((mod, index) => {
                const Icon = moduleTypeIcon[mod.type];
                return (
                  <div
                    key={mod.id}
                    className="flex items-center gap-4 bg-white rounded-xl border border-stone-200 px-5 py-4"
                  >
                    <span className="text-xs font-bold text-stone-400 w-5">{index + 1}</span>
                    <div className="w-8 h-8 rounded-lg bg-[#f5e4e7] flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-[#b76d79]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1c1917] text-sm">{mod.title}</p>
                      {mod.description && (
                        <p className="text-xs text-stone-500 mt-0.5" dangerouslySetInnerHTML={{ __html: mod.description ?? "" }} />
                      )}
                    </div>
                    <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      {moduleTypeLabel[mod.type]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
