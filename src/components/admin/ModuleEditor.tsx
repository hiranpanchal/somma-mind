"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Save, Trash2, Plus, X, Bold, Italic, List, Quote, Heading2, ImageIcon } from "lucide-react";

interface Question {
  id?: string;
  text: string;
  type: "OPEN_ENDED" | "MULTIPLE_CHOICE";
  order: number;
  options: { id?: string; text: string; isCorrect: boolean }[];
}

interface ModuleData {
  id?: string;
  courseId: string;
  title: string;
  description: string;
  type: "TEXT" | "AUDIO" | "QUIZ";
  order: string;
  lessonContent: string;
  audioUrl: string;
  questions: Question[];
}

interface Props {
  initialData?: ModuleData;
  courseId: string;
  mode: "create" | "edit";
}

export default function ModuleEditor({ initialData, courseId, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ModuleData>(
    initialData ?? {
      courseId,
      title: "",
      description: "",
      type: "TEXT",
      order: "0",
      lessonContent: "",
      audioUrl: "",
      questions: [],
    }
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
    ],
    content: form.lessonContent || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-editor ProseMirror outline-none min-h-[300px] px-4 py-3 text-sm text-stone-800",
      },
    },
  });

  useEffect(() => {
    if (editor && initialData?.lessonContent && editor.getHTML() !== initialData.lessonContent) {
      editor.commands.setContent(initialData.lessonContent);
    }
  }, [editor, initialData?.lessonContent]);

  function addQuestion() {
    setForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "",
          type: "OPEN_ENDED",
          order: prev.questions.length,
          options: [],
        },
      ],
    }));
  }

  function removeQuestion(index: number) {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  }

  function updateQuestion(index: number, updates: Partial<Question>) {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    }));
  }

  function addOption(questionIndex: number) {
    updateQuestion(questionIndex, {
      options: [...form.questions[questionIndex].options, { text: "", isCorrect: false }],
    });
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    updateQuestion(questionIndex, {
      options: form.questions[questionIndex].options.filter((_, i) => i !== optionIndex),
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
    const { url, error: uploadError } = await res.json();

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    } else {
      setError(uploadError || "Image upload failed.");
    }

    e.target.value = "";
  }

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const { url } = await res.json();

    if (url) setForm((prev) => ({ ...prev, audioUrl: url }));
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      ...form,
      lessonContent: editor?.getHTML() || form.lessonContent,
      order: parseInt(form.order),
    };

    const res = await fetch(
      mode === "create" ? "/api/admin/modules" : `/api/admin/modules/${form.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push(`/admin/courses/${courseId}/modules`);
    router.refresh();
  }

  async function handleDelete() {
    if (!form.id || !confirm("Delete this module? This cannot be undone.")) return;
    await fetch(`/api/admin/modules/${form.id}`, { method: "DELETE" });
    router.push(`/admin/courses/${courseId}/modules`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
      )}

      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h2 className="font-semibold text-[#1c1917]">Module Details</h2>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            placeholder="Short summary of this module"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Module Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ModuleData["type"] }))}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            >
              <option value="TEXT">Lesson (Text)</option>
              <option value="AUDIO">Meditation (Audio)</option>
              <option value="QUIZ">Reflection (Quiz)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Order</label>
            <input
              type="number"
              min="0"
              value={form.order}
              onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
          </div>
        </div>
      </div>

      {/* TEXT content */}
      {(form.type === "TEXT" || form.type === "AUDIO") && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-[#1c1917] mb-4">
            {form.type === "AUDIO" ? "Intro Text (optional)" : "Lesson Content"}
          </h2>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-stone-100">
            {[
              { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), label: "Bold" },
              { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), label: "Italic" },
              { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), label: "H2" },
              { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), label: "List" },
              { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), label: "Quote" },
            ].map(({ icon: Icon, action, label }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                title={label}
                className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-[#b76d79] transition-colors"
              >
                <Icon size={15} />
              </button>
            ))}
            <label
              title="Insert Image"
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-[#b76d79] transition-colors cursor-pointer"
            >
              <ImageIcon size={15} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <div className="border border-stone-200 rounded-xl overflow-hidden min-h-[300px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {/* AUDIO upload */}
      {form.type === "AUDIO" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-[#1c1917] mb-4">Audio File</h2>
          <div className="space-y-3">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="text-sm text-stone-600"
            />
            {uploading && <p className="text-xs text-violet-600">Uploading...</p>}
            {form.audioUrl && (
              <div className="bg-[#fdf0f2] rounded-xl p-3">
                <p className="text-xs text-stone-500 mb-2">Current audio:</p>
                <audio controls src={form.audioUrl} className="w-full" />
                <p className="text-xs text-stone-400 mt-1 font-mono truncate">{form.audioUrl}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUIZ questions */}
      {form.type === "QUIZ" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#1c1917]">Reflection Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-1 text-sm text-[#b76d79] hover:text-[#9a5864] font-medium"
            >
              <Plus size={14} /> Add Question
            </button>
          </div>

          {form.questions.length === 0 && (
            <p className="text-stone-400 text-sm text-center py-6">No questions yet. Add your first reflection question.</p>
          )}

          <div className="space-y-6">
            {form.questions.map((question, qi) => (
              <div key={qi} className="border border-stone-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="text-xs font-bold text-stone-400 mt-2">Q{qi + 1}</span>
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                      placeholder="Enter your question..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm resize-none"
                    />
                    <select
                      value={question.type}
                      onChange={(e) =>
                        updateQuestion(qi, {
                          type: e.target.value as Question["type"],
                          options: e.target.value === "OPEN_ENDED" ? [] : question.options,
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                    >
                      <option value="OPEN_ENDED">Open Ended</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    </select>

                    {question.type === "MULTIPLE_CHOICE" && (
                      <div className="space-y-2">
                        {question.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={opt.isCorrect}
                              onChange={(e) => {
                                const opts = [...question.options];
                                opts[oi] = { ...opts[oi], isCorrect: e.target.checked };
                                updateQuestion(qi, { options: opts });
                              }}
                              className="accent-[#b76d79]"
                              title="Mark as correct"
                            />
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const opts = [...question.options];
                                opts[oi] = { ...opts[oi], text: e.target.value };
                                updateQuestion(qi, { options: opts });
                              }}
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(qi, oi)}
                              className="text-stone-400 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(qi)}
                          className="text-xs text-[#b76d79] hover:text-[#9a5864] font-medium"
                        >
                          + Add option
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qi)}
                    className="text-stone-400 hover:text-red-500 transition-colors mt-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#9a5864] transition-colors disabled:opacity-60 text-sm"
        >
          <Save size={14} />
          {loading ? "Saving..." : mode === "create" ? "Create Module" : "Save Changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
          >
            <Trash2 size={14} /> Delete Module
          </button>
        )}
      </div>
    </form>
  );
}
