import { getUserData } from "@/lib/cookie";
import { redirect } from "next/navigation";
import AdminSidebar from "./_components/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
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

  // Only allow admins to access this
  if (userData.role !== "admin") {
    if (userData.role === "owner") {
      redirect("/owner/dashboard");
    }
    redirect("/renter/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <AdminSidebar 
        userName={userData.fullName}
        profilePicture={userData.profilePicture}
      />
      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
