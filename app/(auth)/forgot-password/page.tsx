"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail } from "lucide-react";
import {
  ForgotPasswordData,
  forgotPasswordSchema,
} from "../schema";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
  });

  const submit = async (values: ForgotPasswordData) => {
    setError(null);
    setMessage(null);

    try {
      const response = await forgotPassword(values);
      if (!response.success) {
        throw new Error(response.message || "Failed to send reset email");
      }
      setMessage("Reset link sent. Check your email.");
    } catch (err: Error | any) {
      setError(err.message || "Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_#fff5e5,_#ffe8cc_40%,_#f3f4f6_100%)] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-amber-100 bg-white/90 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="px-8 pt-8 pb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold text-amber-700">
              <Mail size={14} />
              Password Reset
            </div>
            <h1 className="mt-4 text-3xl font-serif font-bold text-gray-900">
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and we will send a secure reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="px-8 pb-8 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center text-sm text-gray-600">
              Remembered it?{" "}
              <Link href="/login" className="font-semibold text-amber-700 hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
