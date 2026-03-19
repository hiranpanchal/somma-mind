import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import CourseForm from "@/components/admin/CourseForm";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

  return (
    <div>
      <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#b76d79] mb-6">
        <ChevronLeft size={14} /> Back to Courses
      </Link>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1c1917]" style={{ fontFamily: "var(--font-playfair)" }}>
          Edit Course
        </h1>
        <Link
          href={`/admin/courses/${id}/modules`}
          className="inline-flex items-center gap-2 bg-stone-100 text-stone-700 font-semibold px-4 py-2 rounded-xl hover:bg-stone-200 transition-colors text-sm"
        >
          Manage Modules →
        </Link>
      </div>
      <CourseForm
        mode="edit"
        initialData={{
          id: course.id,
          title: course.title,
          subtitle: course.subtitle ?? "",
          description: course.description,
          price: course.price.toString(),
          published: course.published,
          order: course.order.toString(),
          slug: course.slug,
          thumbnail: course.thumbnail ?? "",
        }}
      />
    </div>
  );
}
