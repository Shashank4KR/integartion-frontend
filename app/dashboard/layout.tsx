import DashboardSessionGuard from "@/components/shared/layout/DashboardSessionGuard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardSessionGuard>{children}</DashboardSessionGuard>;
}
