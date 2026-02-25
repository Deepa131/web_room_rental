"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";
import { Eye, EyeOff } from "lucide-react";
import { handleLogin } from "@/lib/actions/auth-action";

export default function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const submit = async (values: LoginData) => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await handleLogin(values);
        if (!response.success) {
          throw new Error(response.message);
        }
        
        // Store token and user data in localStorage for axios interceptor and profile page
        if (typeof window !== 'undefined' && response.token) {
          localStorage.setItem('auth_token', response.token);
          console.log('Token stored in localStorage from login response');
        }
        
        // Store user data in localStorage so profile page can access it
        if (typeof window !== 'undefined' && response.data) {
          localStorage.setItem('user_data', JSON.stringify(response.data));
          console.log('User data stored in localStorage from login response');
        }
        
        // Redirect to appropriate dashboard based on user role
        const userRole = response.data?.role;
        if (userRole === "admin") {
          router.push("/admin/dashboard");
        } else if (userRole === "owner") {
          router.push("/owner/dashboard");
        } else {
          router.push("/renter/dashboard");
        }
      } catch (err: any) {
        setError(err.message || "Login failed");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="w-full space-y-5">
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("email")}/>
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
            className="h-10 w-full rounded-lg border border-gray-300 px-4 pr-10 text-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("password")}/>

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end text-sm">
        <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="h-10 w-full rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
        {isSubmitting || pending ? "Logging in..." : "Log In"}
      </button>

      <p className="text-center text-sm text-gray-700">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:text-blue-700">
          Create account
        </Link>
      </p>
    </form>
  );
}
