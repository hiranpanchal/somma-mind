import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { BookOpen, ChevronRight } from "lucide-react";

const CONTENT_DEFAULTS: Record<string, string> = {
  hero_banner_image: "",
  hero_title_before: "Transform from",
  hero_title_highlight: "the inside",
  hero_title_after: "out",
  hero_description:
    "A unique blend of hypnotherapy, brainspotting, and somatic healing — designed to help you release deep-seated patterns, heal from past experiences, and create lasting transformation without relying on willpower alone.",
  hero_cta_primary_text: "Explore Courses",
  hero_cta_primary_url: "/courses",
  hero_cta_secondary_text: "Learn More",
  hero_cta_secondary_url: "#about",
  method_title: "The Somaa Method",
  method_subtitle: "Three powerful healing modalities woven together into one transformative journey.",
  method_card_1_title: "Hypnotherapy",
  method_card_1_desc: "Access the subconscious mind to dissolve limiting beliefs and rewrite the stories that keep you stuck — effortlessly.",
  method_card_2_title: "Brainspotting",
  method_card_2_desc: "Locate and process trauma stored in the body using targeted eye positions, releasing what talk therapy often cannot reach.",
  method_card_3_title: "Somatic Healing",
  method_card_3_desc: "Reconnect with your body's innate wisdom to release tension, integrate experiences, and restore natural regulation.",
  method_card_1_image: "",
  method_card_2_image: "",
  method_card_3_image: "",
};

async function getSiteContent() {
  try {
    const rows = await prisma.siteContent.findMany();
    const map: Record<string, string> = { ...CONTENT_DEFAULTS };
    for (const r of rows) if (r.value) map[r.id] = r.value;
    return map;
  } catch {
    return { ...CONTENT_DEFAULTS };
  }
}

async function getPublishedCourses() {
  return prisma.course.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    take: 3,
    include: { _count: { select: { modules: true } } },
  });
}

async function getPublishedReviews() {
  return prisma.review.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    take: 10,
  });
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [courses, reviews, content] = await Promise.all([
    getPublishedCourses(),
    getPublishedReviews(),
    getSiteContent(),
  ]);

  const c = (key: string) => content[key] ?? CONTENT_DEFAULTS[key] ?? "";

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-24 px-4"
          style={
            c("hero_banner_image")
              ? { backgroundImage: `url(${c("hero_banner_image")})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: "linear-gradient(135deg, #f2f2f2 0%, #d6cec4 50%, #c9a698 100%)" }
          }
        >
          {/* Dark overlay when a banner image is set, to keep text readable */}
          {c("hero_banner_image") && (
            <div className="absolute inset-0 bg-black/35 pointer-events-none" />
          )}
          <svg className="absolute left-0 bottom-0 w-64 h-80 opacity-30 hidden md:block" viewBox="0 0 260 320" fill="none">
            <path d="M60 320 Q80 260 60 200 Q40 140 80 80 Q100 40 120 20" stroke="#b76d79" strokeWidth="1.5" fill="none"/>
            <path d="M60 200 Q20 190 5 160" stroke="#b76d79" strokeWidth="1" fill="none"/>
            <path d="M70 255 Q30 245 10 230" stroke="#b76d79" strokeWidth="1" fill="none"/>
            <path d="M75 150 Q35 130 15 100" stroke="#b76d79" strokeWidth="1" fill="none"/>
            <ellipse cx="5" cy="155" rx="12" ry="22" fill="#b76d79" opacity="0.4" transform="rotate(-20 5 155)"/>
            <ellipse cx="10" cy="228" rx="10" ry="18" fill="#b76d79" opacity="0.4" transform="rotate(15 10 228)"/>
            <circle cx="120" cy="20" r="5" fill="#b76d79" opacity="0.5"/>
          </svg>
          <svg className="absolute right-0 top-0 w-56 h-72 opacity-25 hidden md:block" viewBox="0 0 230 290" fill="none">
            <path d="M170 0 Q150 60 160 120 Q175 190 140 260 Q125 290 110 300" stroke="#85896c" strokeWidth="1.5" fill="none"/>
            <path d="M160 120 Q200 110 220 80" stroke="#85896c" strokeWidth="1" fill="none"/>
            <path d="M148 175 Q190 165 210 145" stroke="#85896c" strokeWidth="1" fill="none"/>
            <ellipse cx="220" cy="77" rx="11" ry="20" fill="#85896c" opacity="0.45" transform="rotate(25 220 77)"/>
            <circle cx="170" cy="0" r="4" fill="#85896c" opacity="0.5"/>
          </svg>

          <div className="relative max-w-4xl mx-auto text-center">
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair)", color: c("hero_banner_image") ? "#ffffff" : "#1c1917" }}
            >
              {c("hero_title_before")}
              <span style={{ color: c("hero_banner_image") ? "#f5c6cc" : "#b76d79" }}> {c("hero_title_highlight")}</span>{" "}
              {c("hero_title_after")}
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ color: c("hero_banner_image") ? "rgba(255,255,255,0.9)" : "#57534e" }}
              dangerouslySetInnerHTML={{ __html: c("hero_description") }}
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={c("hero_cta_primary_url")} className="bg-[#b76d79] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#9a5864] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                {c("hero_cta_primary_text")} <ChevronRight size={16} />
              </Link>
              <Link
                href={c("hero_cta_secondary_url")}
                className="font-semibold px-8 py-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2"
                style={c("hero_banner_image")
                  ? { background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.5)" }
                  : { background: "#ffffff", color: "#b76d79", border: "1px solid #b76d79" }
                }
              >
                {c("hero_cta_secondary_text")}
              </Link>
            </div>
          </div>
        </section>

        {/* Modalities */}
        <section id="about" className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-[#1c1917] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                {c("method_title")}
              </h2>
              <p className="text-stone-600 max-w-xl mx-auto" dangerouslySetInnerHTML={{ __html: c("method_subtitle") }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {([1, 2, 3] as const).map((n) => {
                const img = c(`method_card_${n}_image`);
                return (
                  <div key={n} className="bg-[#f2f2f2] rounded-2xl overflow-hidden border border-stone-100 hover:border-[#e8b4bc] hover:shadow-md transition-all duration-200 flex flex-col">
                    {/* Equal-height image container — always 220px tall */}
                    <div className="w-full h-[220px] bg-gradient-to-br from-[#f5e4e7] to-[#eaebdf] flex-shrink-0">
                      {img ? (
                        <img src={img} alt={c(`method_card_${n}_title`)} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="p-8 flex-1">
                      <h3 className="text-3xl font-bold text-[#1c1917] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                        {c(`method_card_${n}_title`)}
                      </h3>
                      <p className="text-stone-600 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: c(`method_card_${n}_desc`) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Courses Preview */}
        {courses.length > 0 && (
          <section className="py-20 px-4 bg-[#f2f2f2]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-4xl md:text-5xl font-bold text-[#1c1917] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                  Begin Your Journey
                </h2>
                <p className="text-stone-600 max-w-xl mx-auto">Self-paced training modules you can return to whenever you need.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Link key={course.id} href={`/courses/${course.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#e8b4bc] hover:shadow-lg transition-all duration-200">
                    <div className="h-48 bg-gradient-to-br from-[#f5e4e7] to-[#eaebdf] flex items-center justify-center">
                      <BookOpen size={40} className="text-[#b76d79] opacity-60" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-[#1c1917] mb-2 group-hover:text-[#b76d79] transition-colors" style={{ fontFamily: "var(--font-playfair)" }}>
                        {course.title}
                      </h3>
                      {course.subtitle && <p className="text-sm text-stone-500 mb-3">{course.subtitle}</p>}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[#b76d79] font-bold text-lg">{formatPrice(course.price)}</span>
                        <span className="text-xs text-stone-400">{course._count.modules} modules</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/courses" className="inline-flex items-center gap-2 text-[#b76d79] font-semibold hover:text-[#9a5864] transition-colors">
                  View all courses <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {reviews.length > 0 && (
          <section className="py-20 px-4" style={{ background: "linear-gradient(135deg, #9a5864, #b76d79)" }}>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-12 text-center" style={{ fontFamily: "var(--font-playfair)" }}>
                What Students Say
              </h2>
              <ReviewsCarousel reviews={reviews} />
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-20 px-4 bg-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1c1917] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Ready to begin?
            </h2>
            <p className="text-stone-600 mb-8 leading-relaxed">
              Your transformation doesn&apos;t require willpower or perfect conditions. It just requires a single step.
            </p>
            <Link href="/courses" className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-10 py-4 rounded-full hover:bg-[#9a5864] transition-all duration-200 shadow-lg hover:shadow-xl">
              Browse Courses <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
