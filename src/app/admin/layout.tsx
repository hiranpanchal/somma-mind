import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <AdminSidebar />
      {/* pt-14 accounts for the mobile top bar height; md:ml-64 for desktop sidebar */}
      <main className="pt-14 md:pt-0 md:ml-64 p-4 md:p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
