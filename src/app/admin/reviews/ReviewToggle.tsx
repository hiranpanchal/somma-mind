"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewToggle({ id, published }: { id: string; published: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        published ? "bg-[#b76d79]" : "bg-stone-200"
      } disabled:opacity-50`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          published ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
