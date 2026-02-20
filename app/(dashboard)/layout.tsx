import { getUserData } from "@/lib/cookie";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getUserData();

  if (!userData) {
    redirect("/login");
  }

  return <>{children}</>;
}