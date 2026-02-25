import { getUserData } from "@/lib/cookie";
import { redirect } from "next/navigation";
import DashboardHeader from "../_components/DashboardHeader";

export const metadata = {
  title: "User Dashboard",
  description: "User Dashboard",
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

  // Redirect admins and owners to their dashboards
  if (userData.role === "admin") {
    redirect("/admin/dashboard");
  }
  if (userData.role === "owner") {
    redirect("/owner/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-blue-50 to-white">
      <DashboardHeader
        userName={userData.fullName}
        userRole={userData.role}
        profilePicture={userData.profilePicture}
      />
      <main className="min-h-[calc(100vh-64px)] bg-transparent">
        {children}
      </main>
    </div>
  );
}
