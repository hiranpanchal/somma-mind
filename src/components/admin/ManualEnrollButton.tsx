"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface Props {
  userId: string;
  courses: Course[];
  enrolledCourseIds: string[];
}

export default function ManualEnrollButton({ userId, courses, enrolledCourseIds }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const availableCourses = courses.filter((c) => !enrolledCourseIds.includes(c.id));

  function handleOpen() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }
    setOpen((prev) => !prev);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function enroll(courseId: string) {
    setLoading(true);
    await fetch("/api/admin/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, courseId }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  if (availableCourses.length === 0) {
    return <span className="text-xs text-stone-300">All enrolled</span>;
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="inline-flex items-center gap-1 text-xs text-[#b76d79] hover:text-[#9a5864] font-medium"
      >
        <UserPlus size={12} /> Enroll
      </button>
      {open && (
        <div
          className="fixed bg-white rounded-xl border border-stone-200 shadow-lg z-50 min-w-[200px] py-2"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <p className="text-xs font-semibold text-stone-500 px-3 py-1 uppercase tracking-wider">
            Enroll in:
          </p>
          {availableCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => enroll(course.id)}
              disabled={loading}
              className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-[#fdf0f2] hover:text-[#b76d79] transition-colors"
            >
              {course.title}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
