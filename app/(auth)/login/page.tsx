"use client";

import Image from "next/image";
import { useState } from "react";
import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
  const [role, setRole] = useState<"renter" | "owner">("renter");
  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="grid h-full w-full grid-cols-2">
        <div className="relative h-full w-full overflow-hidden bg-gray-200">
          <Image
            src="/images/image.png"
            alt="RentEasy"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex h-full items-center justify-center bg-white px-8 overflow-y-auto">
          <div className="w-full max-w-sm py-8">
            <div className="mb-8 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-white text-lg font-bold">
                🏠
              </div>
              <span className="text-xl font-bold text-black">RentEasy</span>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-black">Login</h1>
            <p className="mb-6 text-sm text-gray-600">
              Login to your account to continue
            </p>

            <div className="mb-6 inline-flex w-full rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setRole("renter")}
                className={`flex-1 rounded py-2 text-center text-sm font-semibold transition-colors ${
                  role === "renter"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}>
                Renter
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`flex-1 rounded py-2 text-center text-sm font-semibold transition-colors ${
                  role === "owner"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}>
                House Owner
              </button>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
