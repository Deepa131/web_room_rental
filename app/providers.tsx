"use client";

import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "green",
              secondary: "white",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "red",
              secondary: "white",
            },
          },
        }}
      />
    </>
  );
}
