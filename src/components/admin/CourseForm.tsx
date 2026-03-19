"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Save, Upload, X } from "lucide-react";

interface CourseFormData {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  published: boolean;
  order: string;
  slug: string;
  thumbnail: string;
}

interface Props {
  initialData?: CourseFormData;
  mode: "create" | "edit";
}

// ─── Thumbnail Uploader ───────────────────────────────────────────────────────

function ThumbnailUpload({
  value, onChange,
}: {
  value: string; onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const { url } = await res.json();
    if (url) onChange(url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">
        Course Thumbnail
      </label>

      {value ? (
        <div
          className={`relative rounded-xl overflow-hidden border-2 transition-all ${dragging ? "border-[#b76d79] ring-2 ring-[#b76d79]/20 scale-[1.01]" : "border-stone-200"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <img
            src={value}
            alt="Course thumbnail"
            className={`w-full h-48 object-cover transition-opacity ${dragging ? "opacity-40" : "opacity-100"}`}
          />
          {dragging && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm pointer-events-none">
              <Upload size={24} className="text-[#b76d79] mb-1" />
              <span className="text-sm font-medium text-[#b76d79]">Drop to replace</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-stone-600 hover:text-red-500 p-1.5 rounded-lg shadow transition-colors"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-3 py-1.5 flex items-center justify-between">
            <span className="text-white text-xs truncate">{value.split("/").pop()}</span>
            <label className="cursor-pointer text-white/80 hover:text-white text-xs flex items-center gap-1">
              <Upload size={11} /> Replace
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleInput} disabled={uploading} />
            </label>
          </div>
        </div>
      ) : (
        <div
          className={`relative flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed transition-all cursor-pointer
            ${dragging
              ? "border-[#b76d79] bg-[#fdf0f2] scale-[1.01] ring-2 ring-[#b76d79]/20"
              : uploading
              ? "border-stone-200 bg-stone-50 opacity-60"
              : "border-stone-200 bg-stone-50 hover:border-[#b76d79] hover:bg-[#fdf0f2]"
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleInput} disabled={uploading} />
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-[#b76d79] border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs text-stone-500">Uploading…</span>
            </>
          ) : dragging ? (
            <>
              <Upload size={24} className="text-[#b76d79] mb-2" />
              <span className="text-sm font-medium text-[#b76d79]">Drop image here</span>
            </>
          ) : (
            <>
              <Upload size={20} className="text-stone-400 mb-2" />
              <span className="text-sm text-stone-500">Drop image here</span>
              <span className="text-xs text-stone-400 mt-0.5">or click to browse</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Course Form ──────────────────────────────────────────────────────────────

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
      thumbnail: "",
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
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#b76d79] text-sm"
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
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#b76d79] text-sm font-mono"
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
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#b76d79] text-sm"
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
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#b76d79] text-sm resize-none"
            placeholder="Describe what students will learn and experience..."
          />
        </div>

        <ThumbnailUpload
          value={form.thumbnail}
          onChange={(url) => setForm((prev) => ({ ...prev, thumbnail: url }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Price (GBP) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#b76d79] text-sm"
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
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#b76d79] text-sm"
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
