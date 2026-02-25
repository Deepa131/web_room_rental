"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { ForgotPasswordData, forgotPasswordSchema } from "../schema";
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
    <div className="h-screen w-screen overflow-hidden">
      <div className="grid h-full w-full grid-cols-2">
        <div className="relative h-full w-full overflow-hidden flex flex-col justify-center items-center text-white p-8">
          <Image
            src="/images/image.png"
            alt="RentEasy"
            fill
            className="object-cover absolute inset-0"
            priority
          />
          
          <div className="absolute inset-0 bg-black/50 z-[1]"></div>
          
          <div className="relative z-10 text-center max-w-md">
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-2xl">Welcome to RentEasy</h2>
            <p className="text-lg text-white drop-shadow-2xl">
              Find your perfect room or list your properties with ease
            </p>
          </div>
        </div>

        <div className="flex h-full items-center justify-center bg-gray-50 px-8 overflow-y-auto">
          <div className="w-full max-w-md py-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white text-lg font-bold shadow-md">
                R
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">RentEasy</span>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="mb-8 text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a reset link
            </p>

            <form onSubmit={handleSubmit(submit)} className="w-full space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-sm text-gray-700">
                Remember your password?{" "}
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                  Back to login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
