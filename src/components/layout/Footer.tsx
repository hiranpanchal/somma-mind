import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <span
                className="text-2xl font-bold text-[#b76d79]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Somma
              </span>
              <span className="text-2xl font-light text-white" style={{ fontFamily: "var(--font-playfair)" }}>
                {" "}Mind
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Healing through the wisdom of hypnotherapy, brainspotting, and somatic practices.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="/courses" className="text-sm text-stone-400 hover:text-white transition-colors">All Courses</Link></li>
              <li><Link href="/#about" className="text-sm text-stone-400 hover:text-white transition-colors">About Somma</Link></li>
              <li><Link href="/login" className="text-sm text-stone-400 hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="text-sm text-stone-400 hover:text-white transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <p className="text-sm text-stone-400">Questions about your journey?</p>
            <a
              href="mailto:hello@sommamind.com"
              className="text-sm text-[#b76d79] hover:text-white transition-colors mt-1 block"
            >
              hello@sommamind.com
            </a>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-10 pt-6 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} Somma Mind. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
