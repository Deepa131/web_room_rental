"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterData, registerSchema } from "../schema";
import { handleRegister } from "@/lib/actions/auth-action";
import { useEffect } from "react";


interface RegisterFormProps {
  role: "renter" | "owner"; // role must come from parent
}

export default function RegisterForm({ role }: RegisterFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
  setValue("role", role, { shouldValidate: true });
}, [role, setValue]);

  const submit = async (values: RegisterData) => {
    console.log("Submit clicked", values, role);
    setError(null);

    startTransition(async () => {
      try {
        // Include role in the payload for backend
        const payload = { ...values, role };
        const response = await handleRegister(payload);

        if (!response.success) {
          throw new Error(response.message);
        }

        // Navigate to login page after successful registration
        router.push("/login");
      } catch (err: Error | any) {
        setError(err.message || "Registration failed");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="w-full space-y-5">
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          placeholder="Enter full name"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-xs text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("password")}
        />
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
        <input
          type="password"
          placeholder="••••••••"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="h-10 w-full rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60"
      >
        {isSubmitting || pending ? "Creating account..." : "Sign up"}
      </button>

      <p className="text-center text-sm text-gray-700">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-blue-500 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
