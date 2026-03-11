"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { LoadingButton } from "@/app/components/LoadingButton";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("shadow@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Login failed");
      }
      toast.success("Logged in");
      window.location.href = "/admin";
    } catch (e: any) {
      toast.error(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-start justify-center py-6">
      <div className="w-full max-w-none rounded-none border border-border bg-card px-4 py-6 shadow-card sm:max-w-md sm:rounded-3xl sm:px-6 sm:py-7">
        <h1 className="text-base font-semibold text-emerald-400 sm:text-lg">
          Admin Login
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Sign in to access the treasury dashboard.
        </p>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">
              Username (email)
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="shadow@gmail.com"
              className="w-full rounded-xl border border-emerald-800/40 bg-black/40 px-3 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-emerald-800/40 bg-black/40 px-3 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="pt-1">
            <LoadingButton loading={loading} onClick={submit} variant="primary">
              Login
            </LoadingButton>
          </div>
        </div>
      </div>
    </main>
  );
}

