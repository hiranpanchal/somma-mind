"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-cream border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-light text-charcoal" style={{ fontFamily: "var(--font-playfair)" }}>
              the{" "}
            </span>
            <span className="text-2xl font-bold text-violet-brand" style={{ fontFamily: "var(--font-playfair)" }}>
              Somaa
            </span>
            <span className="text-2xl font-light text-charcoal" style={{ fontFamily: "var(--font-playfair)" }}>
              {" "}Mind
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/courses"
              className="text-sm font-medium text-stone-600 hover:text-violet-brand transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium text-stone-600 hover:text-violet-brand transition-colors"
            >
              About
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-stone-600 hover:text-violet-brand transition-colors"
                >
                  My Courses
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-stone-600 hover:text-violet-brand transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium text-stone-600 hover:text-violet-brand transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-stone-600 hover:text-violet-brand transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-[#b76d79] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#9a5864] transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-stone-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-stone-200 py-4 flex flex-col gap-4">
            <Link href="/courses" className="text-sm font-medium text-stone-600" onClick={() => setMenuOpen(false)}>
              Courses
            </Link>
            <Link href="/#about" className="text-sm font-medium text-stone-600" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-stone-600" onClick={() => setMenuOpen(false)}>
                  My Courses
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="text-sm font-medium text-stone-600" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }}
                  className="text-sm font-medium text-stone-600 text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-stone-600" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-[#b76d79] text-white text-sm font-medium px-4 py-2 rounded-full text-center hover:bg-[#9a5864] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
