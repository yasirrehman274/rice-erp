import DashboardShell from "@/components/layout/DashboardShell";

export default function ReportsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
