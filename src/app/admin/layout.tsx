import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LayoutDashboard, Users, LogOut, ChevronRight } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#e9d8b6] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1c1917] text-white flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-violet-300" style={{ fontFamily: "var(--font-playfair)" }}>
              Somma
            </span>
            <span className="text-xl font-light text-white" style={{ fontFamily: "var(--font-playfair)" }}>
              Mind
            </span>
          </Link>
          <p className="text-xs text-white/40 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/courses", label: "Courses", icon: BookOpen },
            { href: "/admin/users", label: "Students", icon: Users },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
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

      {/* Main */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
