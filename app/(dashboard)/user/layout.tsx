import { getUserData } from "@/lib/cookie";
import { redirect } from "next/navigation";
import DashboardHeader from "../_components/DashboardHeader";

export const metadata = {
  title: "User Dashboard",
  description: "User Dashboard",
};

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getUserData();

  if (!userData) {
    redirect("/login");
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
