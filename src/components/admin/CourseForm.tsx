"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Save } from "lucide-react";

interface CourseFormData {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  published: boolean;
  order: string;
  slug: string;
}

interface Props {
  initialData?: CourseFormData;
  mode: "create" | "edit";
}

export default function CourseForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CourseFormData>(
    initialData ?? {
      title: "",
      subtitle: "",
      description: "",
      price: "0",
      published: false,
      order: "0",
      slug: "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: mode === "create" ? slugify(title) : prev.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      ...form,
      price: parseFloat(form.price),
      order: parseInt(form.order),
    };

    const res = await fetch(
      mode === "create" ? "/api/admin/courses" : `/api/admin/courses/${form.id}`,
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

    if (mode === "create") {
      router.push(`/admin/courses/${data.id}/modules`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-8 max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Course Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            placeholder="e.g. Foundations of Somatic Healing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">URL Slug *</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm font-mono"
            placeholder="foundations-of-somatic-healing"
          />
          <p className="text-xs text-stone-400 mt-1">Used in the URL: /courses/{form.slug || "..."}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Subtitle</label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            placeholder="A short tagline for this course"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm resize-none"
            placeholder="Describe what students will learn and experience..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Price (USD) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
              placeholder="99.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Display Order</label>
            <input
              type="number"
              min="0"
              value={form.order}
              onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
            className="w-4 h-4 accent-[#b76d79]"
          />
          <div>
            <span className="text-sm font-medium text-stone-700">Publish course</span>
            <p className="text-xs text-stone-400">Make this course visible to students</p>
          </div>
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#9a5864] transition-colors disabled:opacity-60 text-sm"
        >
          <Save size={14} />
          {loading ? "Saving..." : mode === "create" ? "Create & Add Modules" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
