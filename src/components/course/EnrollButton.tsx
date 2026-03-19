"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
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

  async function handleClick() {
    if (!session) {
      router.push(`/login?callbackUrl=/courses`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const { url } = await res.json();
      if (url) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        window.location.href = url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-[#b76d79] text-white font-semibold py-3.5 rounded-xl hover:bg-[#9a5864] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <ShoppingCart size={16} />
      {loading ? "Redirecting..." : `Enroll — ${price === 0 ? "Free" : `£${price}`}`}
    </button>
  );
}
