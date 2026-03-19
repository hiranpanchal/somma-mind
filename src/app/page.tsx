import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { BookOpen, Headphones, Brain, Sparkles, ChevronRight, Star } from "lucide-react";

async function getPublishedCourses() {
  return prisma.course.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    take: 3,
    include: { _count: { select: { modules: true } } },
  });
}

export default async function HomePage() {
  const courses = await getPublishedCourses();

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 px-4"
          style={{ background: "linear-gradient(135deg, #f2f2f2 0%, #d6cec4 50%, #c9a698 100%)" }}
        >
          {/* Left botanical */}
          <svg className="absolute left-0 bottom-0 w-64 h-80 opacity-30 hidden md:block" viewBox="0 0 260 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 320 Q80 260 60 200 Q40 140 80 80 Q100 40 120 20" stroke="#b76d79" strokeWidth="1.5" fill="none"/>
            <path d="M60 200 Q20 190 5 160" stroke="#b76d79" strokeWidth="1" fill="none"/>
            <path d="M70 255 Q30 245 10 230" stroke="#b76d79" strokeWidth="1" fill="none"/>
            <path d="M75 150 Q35 130 15 100" stroke="#b76d79" strokeWidth="1" fill="none"/>
            <path d="M80 80 Q110 60 130 30" stroke="#b76d79" strokeWidth="1" fill="none"/>
            <ellipse cx="5" cy="155" rx="12" ry="22" fill="#b76d79" opacity="0.4" transform="rotate(-20 5 155)"/>
            <ellipse cx="10" cy="228" rx="10" ry="18" fill="#b76d79" opacity="0.4" transform="rotate(15 10 228)"/>
            <ellipse cx="15" cy="95" rx="11" ry="20" fill="#b76d79" opacity="0.35" transform="rotate(-35 15 95)"/>
            <ellipse cx="132" cy="28" rx="9" ry="16" fill="#b76d79" opacity="0.35" transform="rotate(10 132 28)"/>
            <circle cx="120" cy="20" r="5" fill="#b76d79" opacity="0.5"/>
            <circle cx="128" cy="14" r="3" fill="#b76d79" opacity="0.4"/>
            <circle cx="113" cy="12" r="2.5" fill="#b76d79" opacity="0.35"/>
            <circle cx="25" cy="172" r="2" fill="#b76d79" opacity="0.4"/>
            <circle cx="18" cy="185" r="1.5" fill="#b76d79" opacity="0.35"/>
            <circle cx="40" cy="115" r="2" fill="#b76d79" opacity="0.3"/>
          </svg>

          {/* Right botanical */}
          <svg className="absolute right-0 top-0 w-56 h-72 opacity-25 hidden md:block" viewBox="0 0 230 290" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M170 0 Q150 60 160 120 Q175 190 140 260 Q125 290 110 300" stroke="#85896c" strokeWidth="1.5" fill="none"/>
            <path d="M160 120 Q200 110 220 80" stroke="#85896c" strokeWidth="1" fill="none"/>
            <path d="M155 75 Q195 60 215 35" stroke="#85896c" strokeWidth="1" fill="none"/>
            <path d="M148 175 Q190 165 210 145" stroke="#85896c" strokeWidth="1" fill="none"/>
            <path d="M140 230 Q175 220 195 205" stroke="#85896c" strokeWidth="1" fill="none"/>
            <ellipse cx="220" cy="77" rx="11" ry="20" fill="#85896c" opacity="0.45" transform="rotate(25 220 77)"/>
            <ellipse cx="216" cy="32" rx="10" ry="18" fill="#85896c" opacity="0.4" transform="rotate(40 216 32)"/>
            <ellipse cx="212" cy="143" rx="10" ry="18" fill="#85896c" opacity="0.4" transform="rotate(20 212 143)"/>
            <ellipse cx="197" cy="203" rx="9" ry="16" fill="#85896c" opacity="0.35" transform="rotate(30 197 203)"/>
            <circle cx="170" cy="0" r="4" fill="#85896c" opacity="0.5"/>
            <circle cx="178" cy="6" r="2.5" fill="#85896c" opacity="0.4"/>
            <circle cx="200" cy="92" r="2" fill="#85896c" opacity="0.35"/>
            <circle cx="208" cy="158" r="1.5" fill="#85896c" opacity="0.3"/>
          </svg>

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#f5e4e7] text-[#9a5864] text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
              <Sparkles size={12} /> Heal at Your Own Pace
            </div>
            <h1
              className="text-5xl md:text-7xl font-bold text-[#1c1917] mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Transform from
              <span className="text-[#b76d79]"> the inside</span> out
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              A unique blend of hypnotherapy, brainspotting, and somatic healing — designed to help
              you release deep-seated patterns, heal from past experiences, and create lasting
              transformation without relying on willpower alone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="bg-[#b76d79] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#9a5864] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Explore Courses <ChevronRight size={16} />
              </Link>
              <Link
                href="#about"
                className="bg-white text-[#b76d79] font-semibold px-8 py-4 rounded-full border border-[#b76d79] hover:bg-[#fdf0f2] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Modalities */}
        <section id="about" className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2
                className="text-4xl md:text-5xl font-bold text-[#1c1917] mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                The Somaa Method
              </h2>
              <p className="text-stone-600 max-w-xl mx-auto">
                Three powerful healing modalities woven together into one transformative journey.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  color: "bg-[#f5e4e7] text-[#b76d79]",
                  title: "Hypnotherapy",
                  desc: "Access the subconscious mind to dissolve limiting beliefs and rewrite the stories that keep you stuck — effortlessly.",
                },
                {
                  icon: Sparkles,
                  color: "bg-[#eaebdf] text-[#85896c]",
                  title: "Brainspotting",
                  desc: "Locate and process trauma stored in the body using targeted eye positions, releasing what talk therapy often cannot reach.",
                },
                {
                  icon: Headphones,
                  color: "bg-[#eaebdf] text-[#85896c]",
                  title: "Somatic Healing",
                  desc: "Reconnect with your body's innate wisdom to release tension, integrate experiences, and restore natural regulation.",
                },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div
                  key={title}
                  className="bg-[#f2f2f2] rounded-2xl p-8 border border-stone-100 hover:border-[#e8b4bc] hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color}`}>
                    <Icon size={22} />
                  </div>
                  <h3
                    className="text-xl font-semibold text-[#1c1917] mb-3"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Preview */}
        {courses.length > 0 && (
          <section className="py-20 px-4 bg-[#f2f2f2]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-14">
                <h2
                  className="text-4xl md:text-5xl font-bold text-[#1c1917] mb-4"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Begin Your Journey
                </h2>
                <p className="text-stone-600 max-w-xl mx-auto">
                  Self-paced training modules you can return to whenever you need.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#e8b4bc] hover:shadow-lg transition-all duration-200"
                  >
                    <div className="h-48 bg-gradient-to-br from-[#f5e4e7] to-[#eaebdf] flex items-center justify-center">
                      <BookOpen size={40} className="text-[#b76d79] opacity-60" />
                    </div>
                    <div className="p-6">
                      <h3
                        className="text-xl font-semibold text-[#1c1917] mb-2 group-hover:text-[#b76d79] transition-colors"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        {course.title}
                      </h3>
                      {course.subtitle && (
                        <p className="text-sm text-stone-500 mb-3">{course.subtitle}</p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[#b76d79] font-bold text-lg">{formatPrice(course.price)}</span>
                        <span className="text-xs text-stone-400">{course._count.modules} modules</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 text-[#b76d79] font-semibold hover:text-[#9a5864] transition-colors"
                >
                  View all courses <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className="py-20 px-4" style={{ background: "linear-gradient(135deg, #9a5864, #b76d79)" }}>
          <div className="max-w-5xl mx-auto text-center">
            <h2
              className="text-4xl font-bold text-white mb-12"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              What Students Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  quote: "I've tried therapy, journaling, and mindfulness apps — nothing worked like this. the Somaa Mind helped me access a part of myself I'd been running from for years.",
                  name: "Sarah M.",
                  role: "Wellness Practitioner",
                },
                {
                  quote: "The combination of hypnotherapy and somatic work is unlike anything else I've experienced. I finished the first module and felt genuinely lighter.",
                  name: "James T.",
                  role: "Life Coach",
                },
              ].map(({ quote, name, role }) => (
                <div key={name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-left border border-white/20">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-amber-300 fill-amber-300" />
                    ))}
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed mb-6 italic">&ldquo;{quote}&rdquo;</p>
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-white/60 text-xs">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1c1917] mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Ready to begin?
            </h2>
            <p className="text-stone-600 mb-8 leading-relaxed">
              Your transformation doesn&apos;t require willpower or perfect conditions. It just requires a single step.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-[#b76d79] text-white font-semibold px-10 py-4 rounded-full hover:bg-[#9a5864] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Browse Courses <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
