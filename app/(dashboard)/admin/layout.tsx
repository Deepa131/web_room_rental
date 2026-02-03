import { getUserData } from "@/lib/cookie";
import { redirect } from "next/navigation";
import DashboardHeader from "../_components/DashboardHeader";

export const metadata = {
  title: "Owner Dashboard",
  description: "House Owner Admin Dashboard",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getUserData();

  if (!userData) {
    redirect("/login");
  }

  // Only allow owners (admins) to access this
  if (userData.role !== "owner") {
    redirect("/renter/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader 
        userName={userData.fullName} 
        userRole={userData.role}
        profilePicture={userData.profilePicture}
      />
      <main>
        {children}
      </main>
    </div>
  );
}
