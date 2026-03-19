"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";

interface Review {
  id?: string;
  name: string;
  role: string;
  quote: string;
  stars: number;
  published: boolean;
  order: number;
}

export default function ReviewForm({ review, mode }: { review?: Review; mode: "create" | "edit" }) {
  const router = useRouter();
  const [form, setForm] = useState<Review>({
    name: review?.name || "",
    role: review?.role || "",
    quote: review?.quote || "",
    stars: review?.stars ?? 5,
    published: review?.published ?? false,
    order: review?.order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = mode === "create" ? "/api/admin/reviews" : `/api/admin/reviews/${review!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      router.push("/admin/reviews");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${review!.id}`, { method: "DELETE" });
    router.push("/admin/reviews");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 border border-red-200">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="e.g. Sarah M."
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#b76d79]/30 text-sm"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Role / Title</label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="e.g. Wellness Practitioner"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#b76d79]/30 text-sm"
          />
        </div>

        {/* Quote */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Review Quote *</label>
          <textarea
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
            required
            rows={4}
            placeholder="What did they say?"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#b76d79]/30 text-sm resize-none"
          />
        </div>

        {/* Stars */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Star Rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, stars: s })}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={s <= form.stars ? "text-amber-400 fill-amber-400" : "text-stone-300 fill-stone-300"}
                />
              </button>
            ))}
            <span className="ml-2 self-center text-sm text-stone-500">{form.stars} star{form.stars !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Order */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Display Order</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            min={0}
            className="w-24 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#b76d79]/30 text-sm"
          />
          <p className="text-xs text-stone-400 mt-1">Lower numbers appear first in the carousel</p>
        </div>

        {/* Published */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setForm({ ...form, published: !form.published })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.published ? "bg-[#b76d79]" : "bg-stone-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                form.published ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-stone-700">
            {form.published ? "Published — visible on site" : "Draft — hidden from site"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#b76d79] text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-[#9a5864] transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Add Review" : "Save Changes"}
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/reviews")}
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            Cancel
          </button>
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
