"use client";

import Image from "next/image";
import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="grid h-full w-full grid-cols-2">
        <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex flex-col justify-center items-center text-white p-8">
          <Image
            src="/images/image.png"
            alt="RentEasy"
            fill
            className="object-cover absolute inset-0"
            priority
          />
          <div className="relative z-10 text-center max-w-md">
            <h2 className="text-4xl font-bold mb-4">Welcome to RentEasy</h2>
            <p className="text-lg text-blue-100">
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

            <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="mb-8 text-sm text-gray-600">
              Sign in to your account to continue
            </p>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
