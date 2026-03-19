export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import ReviewToggle from "./ReviewToggle";

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const reviews = await prisma.review.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1917]" style={{ fontFamily: "var(--font-playfair)" }}>
            Reviews
          </h1>
          <p className="text-stone-500 text-sm mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""} — up to 10 published at once</p>
        </div>
        <Link
          href="/admin/reviews/new"
          className="inline-flex items-center gap-2 bg-[#b76d79] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#9a5864] transition-colors"
        >
          <Plus size={16} /> Add Review
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center">
          <Star size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 text-sm">No reviews yet. Add your first one.</p>
          <Link href="/admin/reviews/new" className="mt-4 inline-block text-[#b76d79] text-sm font-medium hover:underline">
            Add Review →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="border-b border-stone-100">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider hidden md:table-cell">Quote</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Stars</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Published</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-stone-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#1c1917] text-sm">{review.name}</p>
                    {review.role && <p className="text-stone-400 text-xs">{review.role}</p>}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-stone-500 text-sm line-clamp-2 max-w-xs">{review.quote}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.stars ? "text-amber-400 fill-amber-400" : "text-stone-200 fill-stone-200"}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <ReviewToggle id={review.id} published={review.published} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/reviews/${review.id}`}
                      className="text-xs font-medium text-[#b76d79] hover:text-[#9a5864] transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
