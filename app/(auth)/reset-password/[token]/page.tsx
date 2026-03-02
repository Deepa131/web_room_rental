"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { ResetPasswordData, resetPasswordSchema } from "../../schema";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast } from "react-hot-toast";

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
    const response = await handleResetPassword(token, values);
    if (response.success) {
      toast.success("Password updated successfully! Redirecting to login...");
      setMessage("Password updated successfully. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      toast.error(response.message || "Failed to reset password");
      setError(response.message);
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
          <div className="absolute inset-0 bg-black/50 z-1"></div>
          
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-blue-700 text-white text-lg font-bold shadow-md">
                R
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">RentEasy</span>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-gray-900">Reset Password</h1>
            <p className="mb-8 text-sm text-gray-600">
              Create a strong password to secure your account
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
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-gray-300 px-4 pr-10 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-gray-300 px-4 pr-10 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? "Updating..." : "Reset Password"}
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
