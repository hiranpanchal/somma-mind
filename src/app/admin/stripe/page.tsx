import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  CreditCard,
  TrendingUp,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  if (status === "complete" || status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        <CheckCircle size={10} /> Paid
      </span>
    );
  }
  if (status === "expired" || status === "canceled") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
        <XCircle size={10} /> {status === "expired" ? "Expired" : "Cancelled"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <Clock size={10} /> Pending
    </span>
  );
}

export default async function AdminStripePage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

  let sessions: any[] = [];
  let totalRevenue = 0;
  let paidCount = 0;
  let stripeError = "";

  if (stripeConfigured) {
    try {
      const result = await stripe.checkout.sessions.list({
        limit: 50,
        expand: ["data.line_items"],
      });
      sessions = result.data;
      const paid = sessions.filter((s) => s.payment_status === "paid");
      paidCount = paid.length;
      totalRevenue = paid.reduce((sum, s) => sum + (s.amount_total ?? 0), 0) / 100;
    } catch (e: any) {
      stripeError = e.message ?? "Failed to connect to Stripe";
    }
  }

  // Enrollments from DB with Stripe session IDs
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { purchasedAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, price: true } },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold text-[#1c1917]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Payments
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Stripe payment overview and transaction history.
          </p>
        </div>
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#1c1917] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-stone-800 transition-colors"
        >
          <ExternalLink size={14} /> Open Stripe Dashboard
        </a>
      </div>

      {/* Stripe not configured */}
      {!stripeConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex gap-3">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Stripe keys not configured</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Add <code className="bg-amber-100 px-1 rounded">STRIPE_SECRET_KEY</code>,{" "}
              <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>, and{" "}
              <code className="bg-amber-100 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> to your Railway environment variables.
            </p>
          </div>
        </div>
      )}

      {/* Stripe API error */}
      {stripeError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Stripe connection error</p>
            <p className="text-red-700 text-sm mt-0.5">{stripeError}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#f5e4e7] flex items-center justify-center">
            <TrendingUp size={20} className="text-[#b76d79]" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Total Revenue</p>
            <p className="text-2xl font-bold text-[#1c1917] mt-0.5">{formatPrice(totalRevenue)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eaebdf] flex items-center justify-center">
            <CheckCircle size={20} className="text-[#85896c]" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Paid Orders</p>
            <p className="text-2xl font-bold text-[#1c1917] mt-0.5">{paidCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <CreditCard size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Enrollments</p>
            <p className="text-2xl font-bold text-[#1c1917] mt-0.5">{enrollments.length}</p>
          </div>
        </div>
      </div>

      {/* Stripe Setup Instructions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#1c1917] mb-4 flex items-center gap-2">
          <CreditCard size={16} className="text-[#b76d79]" /> Stripe Setup
        </h2>
        <ol className="space-y-3 text-sm text-stone-600">
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-[#f5e4e7] text-[#b76d79] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <span>Go to <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-[#b76d79] underline">Stripe API Keys</a> and copy your secret + publishable keys.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-[#f5e4e7] text-[#b76d79] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <span>In Railway, set <code className="bg-stone-100 px-1 rounded">STRIPE_SECRET_KEY</code> and <code className="bg-stone-100 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-[#f5e4e7] text-[#b76d79] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <span>In <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-[#b76d79] underline">Stripe Webhooks</a>, add endpoint: <code className="bg-stone-100 px-1 rounded">https://your-domain.up.railway.app/api/stripe/webhook</code> — listen for <code className="bg-stone-100 px-1 rounded">checkout.session.completed</code>.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-[#f5e4e7] text-[#b76d79] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
            <span>Copy the webhook signing secret into Railway as <code className="bg-stone-100 px-1 rounded">STRIPE_WEBHOOK_SECRET</code>.</span>
          </li>
        </ol>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-[#1c1917]">Recent Transactions</h2>
        </div>

        {sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Course</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5 text-stone-700">{s.customer_email ?? "—"}</td>
                    <td className="px-5 py-3.5 text-stone-600 text-xs">
                      {s.metadata?.courseId
                        ? enrollments.find((e) => e.stripeSessionId === s.id)?.course.title ?? s.metadata.courseId
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#1c1917]">
                      {s.amount_total != null ? formatPrice(s.amount_total / 100) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={s.status === "complete" ? "complete" : s.payment_status ?? s.status} />
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 text-xs">
                      {new Date(s.created * 1000).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <a
                        href={`https://dashboard.stripe.com/payments/${s.payment_intent}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#b76d79] hover:text-[#9a5864] text-xs inline-flex items-center gap-1"
                      >
                        View <ExternalLink size={10} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <CreditCard size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">
              {stripeConfigured
                ? "No transactions yet. Share your courses to start accepting payments."
                : "Configure Stripe to see transactions here."}
            </p>
          </div>
        )}
      </div>

      {/* DB Enrollments fallback */}
      {enrollments.length > 0 && sessions.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-[#1c1917]">Enrolled Students</h2>
            <p className="text-xs text-stone-400 mt-0.5">From database — connect Stripe to see payment details</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Student</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Course</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Price</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-stone-800">{e.user.name ?? "—"}</p>
                      <p className="text-stone-400 text-xs">{e.user.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">{e.course.title}</td>
                    <td className="px-5 py-3.5 font-medium text-[#1c1917]">{formatPrice(e.course.price)}</td>
                    <td className="px-5 py-3.5 text-stone-500 text-xs">
                      {new Date(e.purchasedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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
