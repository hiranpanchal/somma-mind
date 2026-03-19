import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PurchaseSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-[#eaebdf] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1
          className="text-3xl font-bold text-[#1c1917] mb-3"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Enrollment Confirmed
        </h1>
        <p className="text-stone-600 mb-8 leading-relaxed">
          Welcome to your new course. Your journey of transformation begins now. Head to your dashboard to start learning.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#b76d79] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#9a5864] transition-colors"
        >
          Go to My Dashboard
        </Link>
      </div>
    </div>
  );
}
