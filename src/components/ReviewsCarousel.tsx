"use client";

import { useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  stars: number;
}

export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  if (reviews.length === 0) return null;

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {reviews.length > 2 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors shadow-md"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors shadow-md"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex-shrink-0 w-80 bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-left border border-white/20"
          >
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < review.stars ? "text-amber-300 fill-amber-300" : "text-white/20 fill-white/20"}
                />
              ))}
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-6 italic">&ldquo;{review.quote}&rdquo;</p>
            <div>
              <p className="text-white font-semibold text-sm">{review.name}</p>
              {review.role && <p className="text-white/60 text-xs">{review.role}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
