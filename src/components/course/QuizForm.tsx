"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Send } from "lucide-react";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  type: "OPEN_ENDED" | "MULTIPLE_CHOICE";
  options: Option[];
  order: number;
}

interface Props {
  questions: Question[];
  existingAnswers: Record<string, string | string[]>;
  moduleId: string;
  courseId: string;
}

export default function QuizForm({ questions, existingAnswers, moduleId, courseId }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(existingAnswers);
  const [submitted, setSubmitted] = useState(Object.keys(existingAnswers).length === questions.length && questions.length > 0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleOpenEnded(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleMultipleChoice(questionId: string, optionId: string, isCheckbox: boolean) {
    if (isCheckbox) {
      const current = (answers[questionId] as string[]) || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      setAnswers((prev) => ({ ...prev, [questionId]: updated }));
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, moduleId }),
    });

    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
      setSaved(true);
      router.refresh();
    }
  }

  if (saved) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-[#eaebdf] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h3
          className="text-xl font-semibold text-[#1c1917] mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Reflections Saved
        </h3>
        <p className="text-stone-500 text-sm">Your responses have been recorded. Take a moment to sit with what came up for you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-[#fdf0f2] rounded-xl p-4 border border-violet-100">
        <p className="text-sm text-violet-700">
          Take your time with these reflections. There are no right or wrong answers — only your truth.
        </p>
      </div>

      {questions.map((question, index) => (
        <div key={question.id} className="border-b border-stone-100 pb-8 last:border-0">
          <p className="font-semibold text-[#1c1917] mb-4">
            <span className="text-[#b76d79] mr-2">{index + 1}.</span>
            {question.text}
          </p>

          {question.type === "OPEN_ENDED" && (
            <textarea
              value={(answers[question.id] as string) || ""}
              onChange={(e) => handleOpenEnded(question.id, e.target.value)}
              placeholder="Share your reflection here..."
              rows={5}
              disabled={submitted}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent text-sm resize-none transition disabled:opacity-60"
            />
          )}

          {question.type === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              {question.options.map((option) => {
                const selected =
                  Array.isArray(answers[question.id])
                    ? (answers[question.id] as string[]).includes(option.id)
                    : answers[question.id] === option.id;

                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      selected
                        ? "bg-[#fdf0f2] border-[#e8b4bc] text-[#b76d79]"
                        : "bg-stone-50 border-stone-200 text-stone-700 hover:border-[#e8b4bc]"
                    } ${submitted ? "pointer-events-none" : ""}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={selected}
                      onChange={() => handleMultipleChoice(question.id, option.id, false)}
                      disabled={submitted}
                      className="accent-[#b76d79]"
                    />
                    <span className="text-sm">{option.text}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {!submitted && (
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#9a5864] transition-colors disabled:opacity-60"
        >
          <Send size={14} />
          {loading ? "Saving..." : "Submit Reflections"}
        </button>
      )}
    </form>
  );
}
