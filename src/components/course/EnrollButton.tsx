"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";

interface Props {
  courseId: string;
  price: number;
  title: string;
}

export default function EnrollButton({ courseId, price, title }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (!session) {
      router.push(`/login?callbackUrl=/courses`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#b76d79] text-white font-semibold py-3.5 rounded-xl hover:bg-[#9a5864] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <ShoppingCart size={16} />
        {loading ? "Redirecting to checkout…" : `Enrol — ${price === 0 ? "Free" : `£${price}`}`}
      </button>
      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
