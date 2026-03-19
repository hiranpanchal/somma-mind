"use client";

import { useState } from "react";
import { Key, X, Eye, EyeOff } from "lucide-react";

interface Props {
  userId: string;
  userEmail: string;
}

export default function ResetPasswordButton({ userId, userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    setError("");
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
    } else {
      setSuccess(true);
      setPassword("");
      setTimeout(() => { setSuccess(false); setOpen(false); }, 1500);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-white border border-stone-200 text-stone-700 text-sm font-medium px-4 py-2 rounded-xl hover:border-[#b76d79] hover:text-[#b76d79] transition-colors"
      >
        <Key size={14} /> Reset Password
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-[#1c1917]">Reset Password</h3>
                <p className="text-xs text-stone-400 mt-0.5">{userEmail}</p>
              </div>
              <button onClick={() => { setOpen(false); setPassword(""); setError(""); }} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-600" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-stone-700">Password updated successfully</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4 border border-red-200">
                    {error}
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#b76d79]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setOpen(false); setPassword(""); setError(""); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={loading || password.length < 8}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#b76d79] text-white text-sm font-medium hover:bg-[#9a5864] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving…" : "Set Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
