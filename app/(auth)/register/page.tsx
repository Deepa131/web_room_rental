"use client";

import Image from "next/image";
import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
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

            <h1 className="mb-2 text-3xl font-bold text-black">
              Register
            </h1>
            <p className="mb-6 text-sm text-gray-600">
              Create an account to continue
            </p>

            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
