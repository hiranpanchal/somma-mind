"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle } from "lucide-react";

interface Props {
  moduleId: string;
  courseId: string;
  isCompleted: boolean;
}

export default function MarkCompleteButton({ moduleId, courseId, isCompleted }: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, completed: !completed }),
    });

    if (res.ok) {
      setCompleted(!completed);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
        completed
          ? "bg-green-50 text-green-700 border-green-200 hover:bg-[#eaebdf]"
          : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-[#fdf0f2] hover:text-[#b76d79] hover:border-[#e8b4bc]"
      } disabled:opacity-60`}
    >
      {completed ? (
        <CheckCircle size={14} className="text-green-600" />
      ) : (
        <Circle size={14} />
      )}
      {loading ? "Saving..." : completed ? "Completed" : "Mark Complete"}
    </button>
  );
}
