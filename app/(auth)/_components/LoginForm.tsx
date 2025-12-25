"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const submit = async (values: LoginData) => {
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Login:", values);

      router.push("/dashboard");
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="w-full space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          placeholder="eg. deepa@gmail.com"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-10 w-full rounded-lg border border-gray-300 px-4 pr-10 text-sm text-black placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("password")}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-blue-500"
          />
          <span className="text-gray-700">Remember Me</span>
        </label>

        <Link href="/forgot-password" className="text-blue-500 hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="h-10 w-full rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60"
      >
        {isSubmitting || pending ? "Logging in..." : "Log in"}
      </button>

      <p className="text-center text-sm text-gray-700">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-500 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
