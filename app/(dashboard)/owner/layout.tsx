import { getUserData } from "@/lib/cookie";
import { redirect } from "next/navigation";
import DashboardHeader from "../_components/DashboardHeader";

export const metadata = {
  title: "Owner Dashboard",
  description: "Owner Dashboard",
};

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getUserData();

  if (!userData) {
    redirect("/login");
  }

  if (userData.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (userData.role !== "owner") {
    redirect("/renter/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-blue-50 to-white">
      <DashboardHeader
        userName={userData.fullName}
        userRole={userData.role}
        profilePicture={userData.profilePicture}
      />
      <main>{children}</main>
    </div>
  );
}
