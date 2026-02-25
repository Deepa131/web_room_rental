"use client";

import Image from "next/image";
import { useState } from "react";
import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
  const [role, setRole] = useState<"renter" | "owner">("renter");

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

            <h1 className="mb-2 text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="mb-8 text-sm text-gray-600">
              Join RentEasy to get started
            </p>

            <div className="mb-6 inline-flex w-full rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setRole("renter")}
                className={`flex-1 rounded-md py-2.5 text-center text-sm font-semibold transition-all ${
                  role === "renter"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Renter
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`flex-1 rounded-md py-2.5 text-center text-sm font-semibold transition-all ${
                  role === "owner"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                House Owner
              </button>
            </div>

            <RegisterForm role={role}/>
          </div>
        </div>
      </div>
    </div>
  );
}
