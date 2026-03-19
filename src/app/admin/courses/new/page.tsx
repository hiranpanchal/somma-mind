import CourseForm from "@/components/admin/CourseForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewCoursePage() {
  return (
    <div>
      <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#b76d79] mb-6">
        <ChevronLeft size={14} /> Back to Courses
      </Link>
      <h1 className="text-2xl font-bold text-[#1c1917] mb-8" style={{ fontFamily: "var(--font-playfair)" }}>
        Create New Course
      </h1>
      <CourseForm mode="create" />
    </div>
  );
}
