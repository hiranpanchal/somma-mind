import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ReviewForm from "../ReviewForm";

export default async function NewReviewPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div>
      <Link href="/admin/reviews" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#b76d79] mb-6">
        <ChevronLeft size={16} /> Back to Reviews
      </Link>
      <h1 className="text-2xl font-bold text-[#1c1917] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
        Add Review
      </h1>
      <ReviewForm mode="create" />
    </div>
  );
}
