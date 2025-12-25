"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RegisterData, registerSchema } from "../schema";

export default function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const submit = async (values: RegisterData) => {
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Register:", values);
      router.push("/login");
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="w-full space-y-5">
      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          placeholder="Deepa Paudel"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          placeholder="eg. deepa@gmail.com"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="h-10 w-full rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60"
      >
        {isSubmitting || pending ? "Creating account..." : "Sign up"}
      </button>

      <p className="text-center text-sm text-gray-700">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-500 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
