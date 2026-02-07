"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import {
  ResetPasswordData,
  resetPasswordSchema,
} from "../../schema";
import { resetPassword } from "@/lib/api/auth";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
  });

  const submit = async (values: ResetPasswordData) => {
    setError(null);
    setMessage(null);

    try {
      const response = await resetPassword(token, values);
      if (!response.success) {
        throw new Error(response.message || "Reset failed");
      }

      setMessage("Password updated. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: Error | any) {
      setError(err.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[conic-gradient(at_top,_#fef3c7,_#e0f2fe,_#fef3c7)] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl border border-sky-100 bg-white/95 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="px-8 pt-8 pb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-xs font-semibold text-sky-700">
              <ShieldCheck size={14} />
              Secure Reset
            </div>
            <h1 className="mt-4 text-3xl font-serif font-bold text-gray-900">
              Set a new password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Choose a strong password to keep your account safe.
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
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-xs text-sky-700">
              Tip: Use a mix of letters, numbers, and symbols.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>

            <div className="text-center text-sm text-gray-600">
              <Link href="/login" className="font-semibold text-sky-700 hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
