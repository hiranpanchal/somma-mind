"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, LayoutDashboard, Users, LogOut,
  CreditCard, Star, Palette, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses",  label: "Courses",   icon: BookOpen },
  { href: "/admin/users",    label: "Students",  icon: Users },
  { href: "/admin/reviews",  label: "Reviews",   icon: Star },
  { href: "/admin/stripe",   label: "Payments",  icon: CreditCard },
  { href: "/admin/design",   label: "Design",    icon: Palette },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const Logo = () => (
    <Link href="/" className="flex items-center gap-1">
      <span className="text-xl font-light text-white" style={{ fontFamily: "var(--font-playfair)" }}>the </span>
      <span className="text-xl font-bold text-[#b76d79]" style={{ fontFamily: "var(--font-playfair)" }}>Somaa</span>
      <span className="text-xl font-light text-white" style={{ fontFamily: "var(--font-playfair)" }}> Mind</span>
    </Link>
  );

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 h-14 bg-[#1c1917] flex items-center justify-between px-4 border-b border-white/10">
        <Logo />
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Backdrop ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#1c1917] text-white flex flex-col
          transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo — desktop only (mobile has it in the top bar) */}
        <div className="hidden md:block p-6 border-b border-white/10">
          <Logo />
          <p className="text-xs text-white/40 mt-1">Admin Panel</p>
        </div>

        {/* Spacer so nav doesn't hide behind the mobile top bar */}
        <div className="h-14 md:hidden flex-shrink-0" />

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={16} />
            Back to Site
          </Link>
        </div>
      </aside>
    </>
  );
}
