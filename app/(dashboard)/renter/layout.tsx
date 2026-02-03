import { getUserData } from "@/lib/cookie";
import { redirect } from "next/navigation";
import DashboardHeader from "../_components/DashboardHeader";

export const metadata = {
  title: "Renter Dashboard",
  description: "Renter Dashboard",
};

export default async function RenterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getUserData();

  if (!userData) {
    redirect("/login");
  }

  // Only allow renters to access this
  if (userData.role !== "renter") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <DashboardHeader userName={userData.fullName} userRole={userData.role} />
      <main className="min-h-[calc(100vh-64px)] bg-white">
        {children}
      </main>
    </div>
  );
}
